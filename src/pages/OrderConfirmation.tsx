import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle, Package, Download, ArrowRight, Truck, MapPin, Phone, Calendar, CreditCard, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface OrderDetails {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_area: string | null;
  order_status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_charge: number | null;
  discount_amount: number | null;
  total_amount: number;
  created_at: string;
  notes: string | null;
  order_items: Array<{
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const { downloadInvoice } = useInvoiceDownload();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Add # prefix if not present for database query
  const orderNumberWithHash = orderNumber?.startsWith('#') ? orderNumber : `#${orderNumber}`;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("order_number", "==", orderNumberWithHash),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const orderDoc = querySnapshot.docs[0];
          const orderData = orderDoc.data();

          // Fetch order items
          const itemsQ = query(
            collection(db, "order_items"),
            where("order_id", "==", orderDoc.id)
          );
          const itemsSnapshot = await getDocs(itemsQ);
          const orderItems = itemsSnapshot.docs.map(doc => doc.data());

          setOrder({
            id: orderDoc.id,
            ...orderData,
            created_at: orderData.created_at instanceof Timestamp 
              ? orderData.created_at.toDate().toISOString() 
              : orderData.created_at,
            order_items: orderItems,
          } as OrderDetails);
        }
      } catch (error) {
        console.error("Fetch order error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const copyOrderNumber = () => {
    if (orderNumber) {
      navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      toast({ title: "কপি হয়েছে!", description: "অর্ডার নম্বর কপি করা হয়েছে" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  const paymentMethodLabels: Record<string, string> = {
    cod: "ক্যাশ অন ডেলিভারি",
    bkash: "বিকাশ",
    nagad: "নগদ",
    uddoktapay: "অনলাইন পেমেন্ট",
  };

  const steps = [
    { key: "pending", label: "অর্ডার গৃহীত", icon: CheckCircle },
    { key: "confirmed", label: "নিশ্চিত", icon: CheckCircle },
    { key: "processing", label: "প্রসেসিং", icon: Package },
    { key: "shipped", label: "শিপড", icon: Truck },
    { key: "delivered", label: "ডেলিভারি", icon: MapPin },
  ];

  const getStatusStep = (status: string): number => {
    const statusMap: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    };
    return statusMap[status] ?? 0;
  };

  const currentStep = order ? getStatusStep(order.order_status) : 0;
  const progressWidth = order ? `${(currentStep / (steps.length - 1)) * 100}%` : "0%";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header cartCount={0} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              অর্ডার সফল হয়েছে! 🎉
            </h1>
            <p className="text-muted-foreground">
              আপনার অর্ডার আমরা পেয়েছি এবং শীঘ্রই প্রসেস করা হবে।
            </p>
          </div>

          {/* Order Number Card */}
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground mb-1">অর্ডার নম্বর</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl md:text-3xl font-bold text-primary font-mono">
                      {orderNumberWithHash}
                    </span>
                    <Button variant="ghost" size="icon" onClick={copyOrderNumber}>
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                    onClick={() => orderNumber && downloadInvoice(orderNumber)}
                  >
                    <Download className="h-4 w-4" />
                    ইনভয়েস
                  </Button>
                  <Link to={`/track-order?order=${orderNumber}`}>
                    <Button size="sm" className="gap-2">
                      <Package className="h-4 w-4" />
                      ট্র্যাক করুন
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Timeline */}
          <Card className="mb-6">
            <CardContent className="py-6">
              <h3 className="font-semibold text-foreground mb-6 text-center">অর্ডার স্ট্যাটাস</h3>
              <div className="flex items-center justify-between max-w-lg mx-auto relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" />
                <div 
                  className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500" 
                  style={{ width: progressWidth }} 
                />
                
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-col items-center relative z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                            : "bg-muted text-muted-foreground"
                        } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-xs mt-2 text-center max-w-[60px] ${isCompleted ? "font-medium text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardContent className="py-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  অর্ডারের পণ্য
                </h3>
                
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : order?.order_items?.length ? (
                  <div className="space-y-3">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start py-3 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product_name}</p>
                          {item.variant_name && (
                            <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatPrice(item.unit_price)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(item.total_price)}</p>
                      </div>
                    ))}

                    <Separator className="my-3" />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">সাবটোটাল</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      {order.discount_amount && order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>ডিসকাউন্ট</span>
                          <span>-{formatPrice(order.discount_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ডেলিভারি চার্জ</span>
                        <span>{formatPrice(order.delivery_charge || 0)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg pt-2">
                        <span>মোট</span>
                        <span className="text-primary">{formatPrice(order.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">পণ্য তথ্য লোড হচ্ছে...</p>
                )}
              </CardContent>
            </Card>

            {/* Delivery & Payment Info */}
            <div className="space-y-6">
              {/* Delivery Address */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    ডেলিভারি ঠিকানা
                  </h3>
                  
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                    </div>
                  ) : order && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.customer_name}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                          {order.shipping_address}
                          {order.shipping_area && `, ${order.shipping_area}`}
                          , {order.shipping_city}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{order.customer_phone}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent className="py-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    পেমেন্ট তথ্য
                  </h3>
                  
                  {loading ? (
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  ) : order && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">পেমেন্ট মেথড</span>
                        <span className="font-medium">
                          {paymentMethodLabels[order.payment_method] || order.payment_method}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">পেমেন্ট স্ট্যাটাস</span>
                        <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                          {order.payment_status === "paid" ? "পরিশোধিত" : 
                           order.payment_status === "partial" ? "আংশিক পরিশোধিত" : "বকেয়া"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">অর্ডারের তারিখ</span>
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {order && format(new Date(order.created_at), "dd MMMM, yyyy", { locale: bn })}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info & Actions */}
          <Card className="mt-6">
            <CardContent className="py-6">
              <div className="text-center space-y-4">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>📧 অর্ডারের আপডেট আপনার ফোনে SMS এর মাধ্যমে জানানো হবে।</p>
                  <p>📞 যেকোনো সমস্যায় কল করুন: <strong>+880 1XXX-XXXXXX</strong></p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <Link to="/shop">
                    <Button className="gap-2 w-full sm:w-auto">
                      আরো কেনাকাটা করুন
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;
