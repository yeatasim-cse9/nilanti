import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection } from "firebase/firestore";
import { toast } from "sonner";
import {
  createSteadfastOrder,
  createBulkSteadfastOrders,
  checkSteadfastStatus,
  getSteadfastBalance,
  createReturnRequest,
  getReturnRequests,
  getReturnRequest,
  getPayments,
  getPaymentById,
  getPoliceStations,
  type CreateOrderPayload,
  type BulkOrderItem,
  type CreateReturnPayload,
  type SteadfastConsignment,
  type DeliveryStatus,
  DELIVERY_STATUSES,
} from "@/lib/steadfast";

// ─── Order Interface ──────────────────────────────────────────────────────────

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_area?: string;
  shipping_city: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  [key: string]: any;
}

// ─── Helper: Normalize BD phone to 11 digits ─────────────────────────────────

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  const digitsOnly = phone.replace(/\D/g, "");
  // Remove +88 country code prefix
  if (digitsOnly.length === 13 && digitsOnly.startsWith("88")) {
    return digitsOnly.slice(2);
  }
  return digitsOnly;
}

// ─── 1. Send Single Order to Steadfast ────────────────────────────────────────

export const useSendToSteadfast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload_params: any) => {
      // Handle both: direct order object OR { orderId, orderData } wrapper
      const order: Order = "orderData" in payload_params ? payload_params.orderData : payload_params;
      const orderId: string = "orderId" in payload_params ? payload_params.orderId : payload_params.id;

      console.log("[useSendToSteadfast] order:", order.order_number, "phone:", order.customer_phone);

      // Validate phone
      const normalizedPhone = normalizePhone(order.customer_phone);
      if (normalizedPhone.length !== 11) {
        throw new Error(
          `Order #${order.order_number || orderId}: ফোন নম্বর ভুল — ১১ ডিজিট দরকার, পাওয়া গেছে ${normalizedPhone.length}। ফোন: "${order.customer_phone || "N/A"}"`
        );
      }

      // Build address
      const fullAddress = [order.shipping_address, order.shipping_area, order.shipping_city]
        .filter(Boolean)
        .join(", ");

      // COD amount: only charge if payment method is COD and not already paid
      const codAmount =
        order.payment_method === "cod" && order.payment_status !== "paid"
          ? Number(order.total_amount)
          : 0;

      const payload: CreateOrderPayload = {
        invoice: "INV" + (order.order_number || orderId).replace(/[^a-zA-Z0-9_-]/g, ""),
        recipient_name: order.customer_name,
        recipient_phone: normalizedPhone,
        recipient_address: fullAddress,
        cod_amount: codAmount,
        note: order.notes || "",
      };

      const result = await createSteadfastOrder(payload);

      if (result.status === 200 && result.consignment) {
        // Update order in Firestore
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          steadfast_consignment_id: result.consignment.consignment_id,
          steadfast_tracking_code: result.consignment.tracking_code,
          steadfast_status: result.consignment.status || "in_review",
          courier_sent_at: new Date().toISOString(),
          order_status: "shipped",
        });

        // Track in order_tracking collection
        await addDoc(collection(db, "order_tracking"), {
          order_id: orderId,
          status: "shipped",
          courier_name: "Steadfast Courier",
          tracking_number: result.consignment.consignment_id,
          tracking_url: `https://steadfast.com.bd/t/${result.consignment.tracking_code}`,
          notes: `Steadfast consignment created. Invoice: ${payload.invoice}`,
          created_at: new Date().toISOString(),
        });

        return { success: true, consignment: result.consignment, message: "Order sent successfully" };
      } else {
        throw new Error(result.message || "Steadfast consignment তৈরি করা যায়নি");
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`অর্ডার স্টেডফাস্ট-এ পাঠানো হয়েছে! ট্র্যাকিং: ${data.consignment.consignment_id}`);
    },
    onError: (error: Error) => {
      console.error("Steadfast error:", error);
      toast.error(`স্টেডফাস্ট এরর: ${error.message}`);
    },
  });
};

// ─── 2. Bulk Send Orders to Steadfast ─────────────────────────────────────────

export const useBulkSendToSteadfast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orders: Order[]) => {
      const items: BulkOrderItem[] = orders
        .filter((order) => {
          const phone = normalizePhone(order.customer_phone);
          if (phone.length !== 11) {
            console.warn(`Skipping order ${order.order_number}: invalid phone "${order.customer_phone}"`);
            return false;
          }
          return true;
        })
        .map((order) => ({
          invoice: "INV" + (order.order_number || order.id).replace(/[^a-zA-Z0-9_-]/g, ""),
          recipient_name: order.customer_name,
          recipient_phone: normalizePhone(order.customer_phone),
          recipient_address: [order.shipping_address, order.shipping_area, order.shipping_city]
            .filter(Boolean)
            .join(", "),
          cod_amount:
            order.payment_method === "cod" && order.payment_status !== "paid"
              ? Number(order.total_amount)
              : 0,
          note: order.notes || "",
        }));

      if (items.length === 0) {
        throw new Error("কোনো বৈধ অর্ডার পাওয়া যায়নি (ফোন নম্বর চেক করুন)");
      }

      const results = await createBulkSteadfastOrders(items);

      // Update successful consignments in Firestore
      let successCount = 0;
      for (const result of results) {
        if (result.status === "success" && result.consignment_id) {
          const matchingOrder = orders.find(
            (o) => "INV" + (o.order_number || o.id).replace(/[^a-zA-Z0-9_-]/g, "") === result.invoice
          );
          if (matchingOrder) {
            const orderRef = doc(db, "orders", matchingOrder.id);
            await updateDoc(orderRef, {
              steadfast_consignment_id: result.consignment_id,
              steadfast_tracking_code: result.tracking_code,
              steadfast_status: "in_review",
              courier_sent_at: new Date().toISOString(),
              order_status: "shipped",
            });
            successCount++;
          }
        }
      }

      return { results, successCount, totalSent: items.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`${data.successCount}/${data.totalSent} অর্ডার স্টেডফাস্ট-এ সফলভাবে পাঠানো হয়েছে`);
    },
    onError: (error: Error) => {
      console.error("Bulk Steadfast error:", error);
      toast.error(`বাল্ক অর্ডার এরর: ${error.message}`);
    },
  });
};

// ─── 3. Check Delivery Status ─────────────────────────────────────────────────

export const useCheckSteadfastStatus = () => {
  return useMutation({
    mutationFn: async ({
      consignmentId,
      invoiceNumber,
      trackingCode,
    }: {
      consignmentId?: string;
      invoiceNumber?: string;
      trackingCode?: string;
    }) => {
      let result;
      if (consignmentId) {
        result = await checkSteadfastStatus(consignmentId, "cid");
      } else if (invoiceNumber) {
        result = await checkSteadfastStatus(invoiceNumber, "invoice");
      } else if (trackingCode) {
        result = await checkSteadfastStatus(trackingCode, "trackingcode");
      } else {
        throw new Error("consignment ID, invoice, বা tracking code দিতে হবে");
      }

      if (result.status === 200) {
        return {
          success: true,
          delivery_status: (result.delivery_status || "unknown") as DeliveryStatus,
          description: DELIVERY_STATUSES[(result.delivery_status || "unknown") as DeliveryStatus] || "অজানা স্ট্যাটাস",
        };
      } else {
        throw new Error(result.message || "স্ট্যাটাস চেক করা যায়নি");
      }
    },
    onError: (error: Error) => {
      toast.error(`স্ট্যাটাস চেক এরর: ${error.message}`);
    },
  });
};

// ─── 4. Steadfast Balance ─────────────────────────────────────────────────────

export const useSteadfastBalance = () => {
  return useQuery({
    queryKey: ["steadfast-balance"],
    queryFn: async () => {
      try {
        const result = await getSteadfastBalance();
        if (result.status === 200) {
          return result.current_balance as number;
        }
        return null;
      } catch (error) {
        console.error("Steadfast balance error:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// ─── 5. Return Requests ───────────────────────────────────────────────────────

export const useCreateReturnRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReturnPayload) => {
      return createReturnRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["steadfast-returns"] });
      toast.success("রিটার্ন রিকোয়েস্ট তৈরি হয়েছে");
    },
    onError: (error: Error) => {
      toast.error(`রিটার্ন রিকোয়েস্ট এরর: ${error.message}`);
    },
  });
};

export const useSteadfastReturns = () => {
  return useQuery({
    queryKey: ["steadfast-returns"],
    queryFn: async () => {
      try {
        return await getReturnRequests();
      } catch (error) {
        console.error("Steadfast returns error:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useSteadfastReturnDetail = (id: number | null) => {
  return useQuery({
    queryKey: ["steadfast-return", id],
    queryFn: async () => {
      if (!id) return null;
      return getReturnRequest(id);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// ─── 6. Payments ──────────────────────────────────────────────────────────────

export const useSteadfastPayments = () => {
  return useQuery({
    queryKey: ["steadfast-payments"],
    queryFn: async () => {
      try {
        return await getPayments();
      } catch (error) {
        console.error("Steadfast payments error:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

export const useSteadfastPaymentDetail = (paymentId: number | null) => {
  return useQuery({
    queryKey: ["steadfast-payment", paymentId],
    queryFn: async () => {
      if (!paymentId) return null;
      return getPaymentById(paymentId);
    },
    enabled: !!paymentId,
    staleTime: 2 * 60 * 1000,
  });
};

// ─── 7. Police Stations ──────────────────────────────────────────────────────

export const useSteadfastPoliceStations = () => {
  return useQuery({
    queryKey: ["steadfast-police-stations"],
    queryFn: async () => {
      try {
        return await getPoliceStations();
      } catch (error) {
        console.error("Steadfast police stations error:", error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (this data rarely changes)
    retry: false,
  });
};