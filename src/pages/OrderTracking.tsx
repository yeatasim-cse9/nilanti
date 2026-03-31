import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, 
  ExternalLink, Calendar, CreditCard, Download, ArrowLeft,
  AlertCircle, XCircle, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

interface OrderData {
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
  total_amount: number;
  delivery_charge: number | null;
  subtotal: number;
  discount_amount: number | null;
  created_at: string;
  steadfast_tracking_code: string | null;
  steadfast_status: string | null;
  notes: string | null;
  order_items: Array<{
    product_name: string;
    variant_name: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const OrderTracking = () => {
  const [searchParams] = useSearchParams();
  const [trackingInput, setTrackingInput] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const { downloadInvoice } = useInvoiceDownload();

  // Auto-search if order number is in URL
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setTrackingInput(orderParam);
      handleTrack(orderParam);
    }
  }, [searchParams]);

  const getStatusStep = (status: string) => {
    const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
    return steps.indexOf(status);
  };

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: "অর্ডার করা হয়েছে", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    confirmed: { label: "কনফার্ম হয়েছে", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
    processing: { label: "প্রসেসিং চলছে", color: "bg-orange-100 text-orange-700", icon: Package },
    shipped: { label: "শিপ করা হয়েছে", color: "bg-indigo-100 text-indigo-700", icon: Truck },
    delivered: { label: "ডেলিভারি সম্পন্ন", color: "bg-green-100 text-green-700", icon: CheckCircle },
    cancelled: { label: "বাতিল", color: "bg-red-100 text-red-700", icon: XCircle },
    refunded: { label: "রিফান্ড হয়েছে", color: "bg-purple-100 text-purple-700", icon: RefreshCw },
  };

  const paymentMethodLabels: Record<string, string> = {
    cod: "ক্যাশ অন ডেলিভারি",
    bkash: "বিকাশ",
    nagad: "নগদ",
    uddoktapay: "অনলাইন পেমেন্ট",
  };

  const handleTrack = async (searchValue?: string) => {
    const searchVal = searchValue || trackingInput;
    if (!searchVal.trim()) {
      setError("অর্ডার নম্বর বা ফোন নম্বর লিখুন");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      const rawQuery = searchVal.trim();
      const phoneQuery = rawQuery.startsWith("#") ? rawQuery.slice(1) : rawQuery;
      const orderNumberWithHash = rawQuery.startsWith("#") ? rawQuery : `#${rawQuery}`;

      // Try: order number first
      let q = query(
        collection(db, "orders"),
        where("order_number", "==", orderNumberWithHash),
        limit(1)
      );
      let querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Fallback: search by phone number (fetch all and sort in memory to avoid index issues)
        q = query(
          collection(db, "orders"),
          where("customer_phone", "==", phoneQuery)
        );
        querySnapshot = await getDocs(q);
      }

      if (querySnapshot.empty) {
        setError("অর্ডার পাওয়া যায়নি। সঠিক অর্ডার নম্বর বা ফোন নম্বর দিন।");
        return;
      }

      // Sort in memory if multiple orders found by phone
      const docs = querySnapshot.docs.sort((a, b) => {
        const dateA = a.data().created_at || "";
        const dateB = b.data().created_at || "";
        return dateB.localeCompare(dateA);
      });
      
      const orderDoc = docs[0];
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
        order_status: orderData.order_status || orderData.status || 'pending',
        order_items: orderItems,
      } as OrderData);
    } catch (err) {
      console.error("Tracking error:", err);
      setError("কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  const steps = [
    { key: "pending", label: "অর্ডার করা", icon: Clock },
    { key: "confirmed", label: "কনফার্ম", icon: CheckCircle },
    { key: "processing", label: "প্রসেসিং", icon: Package },
    { key: "shipped", label: "শিপিং", icon: Truck },
    { key: "delivered", label: "ডেলিভারি", icon: MapPin },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header cartCount={0} />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              অর্ডার ট্র্যাকিং
            </h1>
            <p className="text-muted-foreground">
              আপনার অর্ডার নম্বর বা ফোন নম্বর দিয়ে অর্ডারের অবস্থা দেখুন
            </p>
          </div>

          {/* Search Box */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="অর্ডার নম্বর বা ফোন নম্বর (যেমন: #10001 বা 01712345678)"
                    className="pl-11 h-12 text-base"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  />
                </div>
                <Button onClick={() => handleTrack()} disabled={loading} size="lg" className="h-12 px-8">
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      খোঁজা হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      ট্র্যাক করুন
                    </>
                  )}
                </Button>
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mt-4 p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Not Found */}
          {searched && !loading && !order && !error && (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">কোনো অর্ডার পাওয়া যায়নি</h3>
                <p className="text-muted-foreground mb-4">
                  দয়া করে সঠিক অর্ডার নম্বর বা ফোন নম্বর দিয়ে আবার চেষ্টা করুন
                </p>
                <Link to="/contact">
                  <Button variant="outline">সাহায্যের জন্য যোগাযোগ করুন</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {order && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Order Header */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">অর্ডার নম্বর</p>
                      <p className="text-2xl font-bold text-primary font-mono">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.created_at), "dd MMMM, yyyy - hh:mm a", { locale: bn })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={statusConfig[order.order_status]?.color || "bg-gray-100 text-gray-700"}>
                        {statusConfig[order.order_status]?.label || order.order_status}
                      </Badge>
                      <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                        {order.payment_status === "paid" ? "পরিশোধিত" : 
                         order.payment_status === "partial" ? "আংশিক" : "বকেয়া"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Timeline */}
              {order.order_status !== "cancelled" && order.order_status !== "refunded" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">অর্ডার স্ট্যাটাস</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute top-5 left-5 right-5 h-0.5 bg-muted hidden md:block" />
                      <div 
                        className="absolute top-5 left-5 h-0.5 bg-primary hidden md:block transition-all duration-500" 
                        style={{ width: `${Math.max(0, (getStatusStep(order.order_status) / 4) * 100)}%` }} 
                      />
                      
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-0">
                        {steps.map((step, idx) => {
                          const currentStep = getStatusStep(order.order_status);
                          const isCompleted = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          const Icon = step.icon;

                          return (
                            <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 relative z-10">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                  isCompleted
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                } ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="md:text-center">
                                <span className={`text-sm font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                                  {step.label}
                                </span>
                                {isCurrent && (
                                  <p className="text-xs text-muted-foreground">বর্তমান অবস্থা</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Steadfast Tracking */}
                    {order.steadfast_tracking_code && (
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-blue-900 dark:text-blue-100">Steadfast Courier</p>
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                ট্র্যাকিং কোড: <span className="font-mono">{order.steadfast_tracking_code}</span>
                              </p>
                            </div>
                          </div>
                          <a
                            href={`https://steadfast.com.bd/t/${order.steadfast_tracking_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-100">
                              <ExternalLink className="h-4 w-4" />
                              কুরিয়ার ট্র্যাক
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Cancelled/Refunded Notice */}
              {(order.order_status === "cancelled" || order.order_status === "refunded") && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3 text-destructive">
                      <XCircle className="h-6 w-6" />
                      <div>
                        <p className="font-semibold">
                          {order.order_status === "cancelled" ? "এই অর্ডার বাতিল করা হয়েছে" : "এই অর্ডার রিফান্ড করা হয়েছে"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Delivery Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      ডেলিভারি তথ্য
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium text-foreground">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.shipping_address}
                        {order.shipping_area && `, ${order.shipping_area}`}
                        , {order.shipping_city}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer_phone}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        {paymentMethodLabels[order.payment_method] || order.payment_method}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      অর্ডার সামারি
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.order_items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            {item.variant_name && (
                              <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                            )}
                            <p className="text-muted-foreground">{item.quantity} x {formatPrice(item.unit_price)}</p>
                          </div>
                          <p className="font-medium">{formatPrice(item.total_price)}</p>
                        </div>
                      ))}

                      <Separator />

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
                          <span className="text-muted-foreground">ডেলিভারি</span>
                          <span>{formatPrice(order.delivery_charge || 0)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                          <span>মোট</span>
                          <span className="text-primary">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center sm:text-left">
                      সমস্যায় কল করুন: <strong>+880 1XXX-XXXXXX</strong>
                    </p>
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={() => downloadInvoice(order.order_number)}
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        ইনভয়েস
                      </Button>
                      <Link to="/shop">
                        <Button className="gap-2">
                          আরো কেনাকাটা
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Back to Home */}
          {!order && !loading && (
            <div className="text-center mt-8">
              <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                হোম পেজে ফিরে যান
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
