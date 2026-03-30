import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUddoktaPay } from "@/hooks/useUddoktaPay";
import { useCart } from "@/contexts/CartContext";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { trackPurchase } from "@/lib/tracking";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyPayment, isLoading } = useUddoktaPay("client");
  const { clearCart, getItemCount } = useCart();
  
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  const invoiceId = searchParams.get("invoice_id");

  // Auto-redirect countdown after successful payment
  useEffect(() => {
    if (status === "success" && orderNumber) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate(`/order-confirmation/${orderNumber.replace('#', '')}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, orderNumber, navigate]);

  useEffect(() => {
    const verifyAndComplete = async () => {
      if (!invoiceId) {
        setStatus("failed");
        return;
      }

      try {
        const result = await verifyPayment(invoiceId);
        
        if (result.success && result.data?.status === "COMPLETED") {
          setPaymentData(result.data);
          
          // Get pending order from localStorage and complete it
          const pendingOrder = localStorage.getItem("pending_order");
          if (pendingOrder) {
            const orderData = JSON.parse(pendingOrder);
            
            // Create order in database
            const orderInsertData = {
              order_number: orderData.orderNumber,
              customer_name: orderData.customerName,
              customer_phone: orderData.customerPhone,
              customer_email: orderData.customerEmail || null,
              shipping_address: orderData.shippingAddress,
              shipping_city: orderData.shippingCity,
              shipping_area: orderData.shippingArea || null,
              delivery_zone_id: orderData.deliveryZoneId || null,
              delivery_charge: orderData.deliveryCharge,
              subtotal: orderData.subtotal,
              discount_amount: orderData.discountAmount,
              total_amount: orderData.totalAmount,
              payment_method: "uddoktapay",
              payment_status: "paid",
              order_status: "confirmed",
              transaction_id: result.data.transaction_id,
              notes: orderData.notes || null,
              coupon_code: orderData.couponCode || null,
              user_id: orderData.userId || null,
              created_at: new Date().toISOString(),
            };
            
            const orderRef = await addDoc(collection(db, "orders"), orderInsertData);

            if (orderRef) {
              const currentOrderNumber = orderData.orderNumber;
              setOrderNumber(currentOrderNumber);
              
              // Create order items
              if (orderData.items && orderData.items.length > 0) {
                const orderItemsCollection = collection(db, "order_items");
                for (const item of orderData.items) {
                  await addDoc(orderItemsCollection, {
                    order_id: orderRef.id,
                    product_id: item.productId,
                    product_name: item.name,
                    variant_name: item.variantName || null,
                    quantity: item.quantity,
                    unit_price: item.price,
                    total_price: item.price * item.quantity,
                  });
                }
              }
              
              // Track Purchase event with hashed customer data
              trackPurchase({
                content_ids: orderData.items.map((item: any) => item.productId),
                contents: orderData.items.map((item: any) => ({ id: item.productId, quantity: item.quantity, item_price: item.price })),
                num_items: orderData.items.reduce((sum: number, item: any) => sum + item.quantity, 0),
                value: orderData.totalAmount,
                currency: 'BDT',
                customer_name: orderData.customerName,
                customer_phone: orderData.customerPhone,
                customer_email: orderData.customerEmail || undefined,
                
                customer_city: orderData.shippingCity,
                order_id: currentOrderNumber,
              });

              // Clear pending order and cart
              localStorage.removeItem("pending_order");
              clearCart();
            }
          }
          
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    verifyAndComplete();
  }, [invoiceId]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="container max-w-md">
          <div className="bg-card rounded-xl p-8 border border-border text-center">
            {status === "loading" && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                <h1 className="text-xl font-bold text-foreground mb-2">
                  পেমেন্ট যাচাই করা হচ্ছে...
                </h1>
                <p className="text-muted-foreground">
                  অনুগ্রহ করে অপেক্ষা করুন
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  পেমেন্ট সফল হয়েছে!
                </h1>
                <p className="text-muted-foreground mb-2">
                  আপনার অর্ডার নিশ্চিত করা হয়েছে
                </p>
                <p className="text-sm text-primary font-medium mb-4">
                  {countdown} সেকেন্ডে অর্ডার পেজে নিয়ে যাওয়া হবে...
                </p>
                
                {orderNumber && (
                  <div className="bg-primary/10 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground">অর্ডার নম্বর</p>
                    <p className="text-xl font-bold text-primary">{orderNumber}</p>
                  </div>
                )}

                {paymentData && (
                  <div className="text-left space-y-2 mb-6 bg-muted/50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                      <span className="font-medium capitalize">{paymentData.payment_method}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ট্রানজেকশন আইডি</span>
                      <span className="font-medium">{paymentData.transaction_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">পরিমাণ</span>
                      <span className="font-medium">৳{paymentData.amount}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button onClick={() => navigate("/")} className="w-full">
                    <Package className="h-4 w-4 mr-2" />
                    কেনাকাটা চালিয়ে যান
                  </Button>
                  {orderNumber && (
                    <Link to={`/order-confirmation/${orderNumber.replace('#', '')}`}>
                      <Button variant="outline" className="w-full">
                        অর্ডার বিস্তারিত দেখুন
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  পেমেন্ট ব্যর্থ হয়েছে
                </h1>
                <p className="text-muted-foreground mb-6">
                  আপনার পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন।
                </p>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => navigate("/checkout")} className="w-full">
                    আবার চেষ্টা করুন
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                    হোমে ফিরে যান
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
