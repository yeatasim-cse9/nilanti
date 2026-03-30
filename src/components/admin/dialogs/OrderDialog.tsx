import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts, useDeliveryZones, useCreateOrder, useUpdateOrder } from "@/hooks/useAdminData";
import { Trash2, Plus } from "lucide-react";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/types/firestore";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PrefilledOrderData {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_area?: string;
  delivery_zone_id?: string | null;
  order_items?: { product_id: string; product_name: string; quantity: number; unit_price: number; total_price: number; variant_name?: string | null }[];
  subtotal?: number;
}

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: any;
  incompleteOrderId?: string;
  prefilledData?: PrefilledOrderData;
  onConverted?: (incompleteOrderId: string, newOrderId: string) => void;
}

export const OrderDialog = ({ open, onOpenChange, order, incompleteOrderId, prefilledData, onConverted }: OrderDialogProps) => {
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const { data: deliveryZones } = useDeliveryZones();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    shipping_city: "",
    shipping_area: "",
    delivery_zone_id: "",
    payment_method: "cod" as PaymentMethod,
    payment_status: "unpaid" as PaymentStatus,
    order_status: "pending" as OrderStatus,
    notes: "",
  });

  const [orderItems, setOrderItems] = useState<{ product_id: string; quantity: number; price: number; name: string }[]>([]);

  useEffect(() => {
    if (order) {
      setForm({
        customer_name: order.customer_name || "",
        customer_phone: order.customer_phone || "",
        customer_email: order.customer_email || "",
        shipping_address: order.shipping_address || "",
        shipping_city: order.shipping_city || "",
        shipping_area: order.shipping_area || "",
        delivery_zone_id: order.delivery_zone_id || "",
        payment_method: order.payment_method || "cod",
        payment_status: order.payment_status || "unpaid",
        order_status: order.order_status || "pending",
        notes: order.notes || "",
      });
    } else if (prefilledData) {
      setForm({
        customer_name: prefilledData.customer_name || "",
        customer_phone: prefilledData.customer_phone || "",
        customer_email: prefilledData.customer_email || "",
        shipping_address: prefilledData.shipping_address || "",
        shipping_city: prefilledData.shipping_city || "",
        shipping_area: prefilledData.shipping_area || "",
        delivery_zone_id: prefilledData.delivery_zone_id || "",
        payment_method: "cod",
        payment_status: "unpaid",
        order_status: "pending",
        notes: "",
      });
      if (prefilledData.order_items && prefilledData.order_items.length > 0) {
        setOrderItems(prefilledData.order_items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price,
          name: item.product_name,
        })));
      } else {
        setOrderItems([]);
      }
    } else {
      setForm({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        shipping_address: "",
        shipping_city: "",
        shipping_area: "",
        delivery_zone_id: "",
        payment_method: "cod",
        payment_status: "unpaid",
        order_status: "pending",
        notes: "",
      });
      setOrderItems([]);
    }
  }, [order, prefilledData, open]);

  const addItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1, price: 0, name: "" }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    if (field === "product_id") {
      const product = (products as any[])?.find((p: any) => p.id === value);
      if (product) {
        updated[index] = {
          ...updated[index],
          product_id: value,
          price: product.sale_price || product.base_price,
          name: product.name_bn,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setOrderItems(updated);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedZone = (deliveryZones as any[])?.find((z: any) => z.id === form.delivery_zone_id);
  const deliveryCharge = selectedZone?.charge || 0;
  const total = subtotal + Number(deliveryCharge);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order && orderItems.length === 0) {
      toast.error("অন্তত একটি পণ্য যোগ করুন");
      return;
    }
    setLoading(true);

    try {
      if (order) {
        await updateOrder.mutateAsync({
          id: order.id,
          order_status: form.order_status,
          payment_status: form.payment_status,
          notes: form.notes,
        });
      } else {
        const orderData = {
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_email: form.customer_email || null,
          shipping_address: form.shipping_address,
          shipping_city: form.shipping_city,
          shipping_area: form.shipping_area || null,
          delivery_zone_id: form.delivery_zone_id || null,
          delivery_charge: deliveryCharge,
          subtotal: subtotal,
          total_amount: total,
          payment_method: form.payment_method,
          payment_status: form.payment_status,
          order_status: form.order_status,
          notes: form.notes || null,
        };

        const result = await createOrder.mutateAsync({
          orderData,
          items: orderItems.map(item => ({
            product_id: item.product_id,
            product_name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            total_price: item.price * item.quantity,
          }))
        });

        // Mark incomplete order as converted if applicable
        if (incompleteOrderId && result.id) {
          try {
            const incRef = doc(db, "incomplete_orders", incompleteOrderId);
            await updateDoc(incRef, {
              is_converted: true,
              converted_order_id: result.id
            });
            onConverted?.(incompleteOrderId, result.id);
          } catch (err) {
            console.error("Failed to mark incomplete order converted:", err);
          }
        }
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{order ? "অর্ডার আপডেট করুন" : "নতুন অর্ডার তৈরি করুন"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>কাস্টমারের নাম *</Label>
              <Input
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                required
                disabled={!!order}
              />
            </div>
            <div className="space-y-2">
              <Label>ফোন নম্বর *</Label>
              <Input
                value={form.customer_phone}
                onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                required
                disabled={!!order}
              />
            </div>
          </div>

          {!order && (
            <>
              <div className="space-y-2">
                <Label>ইমেইল</Label>
                <Input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>শহর *</Label>
                  <Input
                    value={form.shipping_city}
                    onChange={(e) => setForm({ ...form, shipping_city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>এলাকা</Label>
                  <Input
                    value={form.shipping_area}
                    onChange={(e) => setForm({ ...form, shipping_area: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>সম্পূর্ণ ঠিকানা *</Label>
                <Textarea
                  value={form.shipping_address}
                  onChange={(e) => setForm({ ...form, shipping_address: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ডেলিভারি জোন</Label>
                <Select value={form.delivery_zone_id} onValueChange={(v) => setForm({ ...form, delivery_zone_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="জোন বাছাই করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryZones?.map((zone: any) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name_bn} - ৳{zone.charge}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>পণ্য সমূহ</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" /> পণ্য যোগ করুন
                  </Button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Select value={item.product_id} onValueChange={(v) => updateItem(index, "product_id", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="পণ্য বাছাই করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name_bn} - ৳{p.sale_price || p.base_price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="w-24 text-right font-medium">৳{(item.price * item.quantity).toLocaleString()}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>সাবটোটাল:</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>৳{Number(deliveryCharge).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>মোট:</span>
                  <span>৳{total.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}

          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>অর্ডার স্ট্যাটাস</Label>
              <Select value={form.order_status} onValueChange={(v) => setForm({ ...form, order_status: v as OrderStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">পেন্ডিং</SelectItem>
                  <SelectItem value="confirmed">কনফার্মড</SelectItem>
                  <SelectItem value="processing">প্রসেসিং</SelectItem>
                  <SelectItem value="shipped">শিপড</SelectItem>
                  <SelectItem value="delivered">ডেলিভার্ড</SelectItem>
                  <SelectItem value="cancelled">বাতিল</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>পেমেন্ট স্ট্যাটাস</Label>
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v as PaymentStatus })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">আনপেইড</SelectItem>
                  <SelectItem value="partial">আংশিক</SelectItem>
                  <SelectItem value="paid">পেইড</SelectItem>
                  <SelectItem value="refunded">রিফান্ড</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>নোট</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              বাতিল
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
