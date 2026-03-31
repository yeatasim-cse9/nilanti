import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Phone, MapPin, Clock, Eye, Trash2, RefreshCw, ArrowRightLeft, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { OrderDialog } from "@/components/admin/dialogs/OrderDialog";

interface CartItem {
  productId: string;
  name_bn: string;
  quantity: number;
  price: number;
  variant_name_bn?: string;
}

interface IncompleteOrder {
  id: string;
  session_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_area: string | null;
  delivery_zone_id: string | null;
  cart_data: CartItem[] | null;
  last_updated_at: string;
  created_at: string;
  is_converted: boolean;
  converted_order_id: string | null;
}

interface RecoveryStats {
  total: number;
  converted: number;
  pending: number;
  conversionRate: number;
  recoveredRevenue: number;
  potentialRevenue: number;
}

const AdminIncompleteOrders = () => {
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);
  const [allOrders, setAllOrders] = useState<IncompleteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IncompleteOrder | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [orderToConvert, setOrderToConvert] = useState<IncompleteOrder | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "incomplete_orders"),
        orderBy("last_updated_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IncompleteOrder[];
      setAllOrders(allData);
      setOrders(allData.filter(o => !o.is_converted));
    } catch (error) {
      console.error("Error fetching incomplete orders:", error);
      toast({ title: "ডাটা লোড করতে সমস্যা হয়েছে", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "incomplete_orders"),
      orderBy("last_updated_at", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as IncompleteOrder[];
      setAllOrders(allData);
      setOrders(allData.filter(o => !o.is_converted));
      setLoading(false);
    }, (error) => {
      console.error("Realtime error:", error);
      // Only toast if it's not a permission error or similar initial load thing
      if (allOrders.length > 0) {
        toast({ title: "রিয়েল-টাইম আপডেটে সমস্যা হয়েছে", variant: "destructive" });
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, "incomplete_orders", id));
      toast({ title: "সফলভাবে ডিলিট হয়েছে" });
      // The onSnapshot will handle local state update
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "ডিলিট করতে সমস্যা হয়েছে", variant: "destructive" });
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  const getCartTotal = (cartData: CartItem[] | null) => {
    if (!cartData || cartData.length === 0) return 0;
    return cartData.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCompletionPercentage = (order: IncompleteOrder) => {
    const fields = [
      order.customer_name,
      order.customer_phone,
      order.shipping_address,
      order.shipping_city,
      order.cart_data && order.cart_data.length > 0,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  // Calculate recovery stats
  const recoveryStats: RecoveryStats = {
    total: allOrders.length,
    converted: allOrders.filter(o => o.is_converted).length,
    pending: allOrders.filter(o => !o.is_converted).length,
    conversionRate: allOrders.length > 0 
      ? Math.round((allOrders.filter(o => o.is_converted).length / allOrders.length) * 100) 
      : 0,
    recoveredRevenue: allOrders
      .filter(o => o.is_converted)
      .reduce((sum, o) => sum + getCartTotal(o.cart_data), 0),
    potentialRevenue: allOrders
      .filter(o => !o.is_converted)
      .reduce((sum, o) => sum + getCartTotal(o.cart_data), 0),
  };

  const handleConvertToOrder = (order: IncompleteOrder) => {
    setOrderToConvert(order);
    setConvertDialogOpen(true);
  };

  const handleOrderDialogClose = (open: boolean) => {
    setConvertDialogOpen(open);
    if (!open) {
      setOrderToConvert(null);
    }
  };

  // Called when an order is successfully converted
  const handleOrderConverted = useCallback((incompleteOrderId: string, newOrderId: string) => {
    // Optimistically remove from the orders list
    setOrders(prev => prev.filter(o => o.id !== incompleteOrderId));
    
    // Update allOrders to reflect the conversion for stats
    setAllOrders(prev => prev.map(o => 
      o.id === incompleteOrderId 
        ? { ...o, is_converted: true, converted_order_id: newOrderId }
        : o
    ));
    
    toast({
      title: "অর্ডার সফলভাবে রূপান্তরিত",
      description: "অর্ডার লিস্টে দেখুন",
    });
    
    // Close dialog
    setConvertDialogOpen(false);
    setOrderToConvert(null);
  }, [toast]);

  // Create pre-filled order data for conversion
  const getConversionOrderData = (incompleteOrder: IncompleteOrder) => {
    if (!incompleteOrder) return null;
    
    // Transform cart_data to order items format
    const orderItems = incompleteOrder.cart_data?.map(item => ({
      product_id: item.productId,
      product_name: item.name_bn,
      variant_name: item.variant_name_bn || null,
      quantity: item.quantity,
      unit_price: item.price,
      total_price: item.price * item.quantity,
    })) || [];

    return {
      customer_name: incompleteOrder.customer_name || "",
      customer_phone: incompleteOrder.customer_phone || "",
      customer_email: incompleteOrder.customer_email || "",
      shipping_address: incompleteOrder.shipping_address || "",
      shipping_city: incompleteOrder.shipping_city || "",
      shipping_area: incompleteOrder.shipping_area || "",
      delivery_zone_id: incompleteOrder.delivery_zone_id,
      order_items: orderItems,
      subtotal: getCartTotal(incompleteOrder.cart_data),
      // Will be set to mark as converted after order creation
      _incomplete_order_id: incompleteOrder.id,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">অসম্পূর্ণ অর্ডার</h1>
          <p className="text-muted-foreground">
            রিয়েল-টাইম চেকআউট ট্র্যাকিং ও রিকভারি
          </p>
        </div>
        <Button variant="outline" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Cards - Recovery Report */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recoveryStats.pending}</p>
                <p className="text-sm text-muted-foreground">অসম্পূর্ণ অর্ডার</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recoveryStats.converted}</p>
                <p className="text-sm text-muted-foreground">রূপান্তরিত অর্ডার</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recoveryStats.conversionRate}%</p>
                <p className="text-sm text-muted-foreground">রূপান্তর হার</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(recoveryStats.recoveredRevenue)}</p>
                <p className="text-sm text-muted-foreground">উদ্ধারকৃত বিক্রি</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Potential Revenue Card */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">সম্ভাব্য বিক্রি (অসম্পূর্ণ)</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{formatPrice(recoveryStats.potentialRevenue)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ফোন নম্বর আছে</p>
              <p className="text-lg font-semibold">{orders.filter(o => o.customer_phone).length} টি</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>অসম্পূর্ণ চেকআউট লিস্ট</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              কোনো অসম্পূর্ণ অর্ডার নেই
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <Table className="table-responsive-stack">
                <TableHeader className="bg-slate-50/80 hidden md:table-header-group">
                  <TableRow className="border-slate-100">
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">কাস্টমার</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">ফোন</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">ঠিকানা</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">কার্ট মূল্য</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">সম্পূর্ণতা</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-700">সময়</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-normal text-slate-700 pr-6">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <TableCell data-label="কাস্টমার">
                        <div className="flex flex-col md:text-left text-right">
                          <span className="font-black text-slate-800">
                            {order.customer_name || "—"}
                          </span>
                          {order.customer_email && (
                            <p className="text-xs text-muted-foreground font-mono">
                              {order.customer_email}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-label="ফোন">
                        <div className="flex justify-end md:justify-start">
                          {order.customer_phone ? (
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="text-primary hover:underline font-black text-sm"
                            >
                              {order.customer_phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-label="ঠিকানা">
                        <div className="md:max-w-[150px] truncate md:text-left text-right font-medium text-slate-600">
                          {order.shipping_address || order.shipping_city || "—"}
                        </div>
                      </TableCell>
                      <TableCell data-label="কার্ট মূল্য">
                        <div className="flex flex-col md:text-left text-right">
                          {order.cart_data && order.cart_data.length > 0 ? (
                            <>
                              <span className="font-black text-primary">
                                {formatPrice(getCartTotal(order.cart_data))}
                              </span>
                              <p className="text-[10px] font-black uppercase text-slate-400">
                                {order.cart_data.length} টি পণ্য
                              </p>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell data-label="সম্পূর্ণতা">
                        <div className="flex justify-end md:justify-start">
                          <Badge
                            className={`rounded-full font-black text-[10px] uppercase ${
                              getCompletionPercentage(order) > 60
                                ? "bg-emerald-100 text-emerald-700 border-none"
                                : "bg-amber-100 text-amber-700 border-none"
                            }`}
                          >
                            {getCompletionPercentage(order)}% FILLED
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell data-label="সময়">
                        <div className="flex items-center justify-end md:justify-start gap-1 text-[11px] font-bold text-slate-500 bg-slate-100/50 w-fit px-2 py-0.5 rounded-md ml-auto md:ml-0">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDistanceToNow(new Date(order.last_updated_at), {
                            addSuffix: true,
                            locale: bn,
                          })}
                        </div>
                      </TableCell>
                      <TableCell data-label="অ্যাকশন" className="text-right md:pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 min-h-[44px] px-4 rounded-xl gap-2 font-black text-[10px] uppercase border-primary/20 text-primary hover:bg-primary/5 transition-all"
                            onClick={() => handleConvertToOrder(order)}
                            title="অর্ডারে রূপান্তর করুন"
                          >
                            <ArrowRightLeft className="h-4 w-4" />
                            অর্ডার করুন
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-slate-100"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-rose-50 group"
                              >
                                <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[32px] border-primary/10 shadow-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black uppercase tracking-tight text-slate-800">ডিলিট করতে চান?</AlertDialogTitle>
                                <AlertDialogDescription className="font-bold text-slate-500">
                                  এই অসম্পূর্ণ অর্ডার ডিলিট করা হবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel className="rounded-2xl font-bold">না</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteOrder(order.id)}
                                  className="bg-rose-500 hover:bg-rose-600 rounded-2xl font-bold"
                                >
                                  হ্যাঁ, ডিলিট করুন
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>অসম্পূর্ণ অর্ডার বিস্তারিত</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">নাম</p>
                  <p className="font-medium">{selectedOrder.customer_name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ফোন</p>
                  <p className="font-medium">{selectedOrder.customer_phone || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ইমেইল</p>
                  <p className="font-medium">{selectedOrder.customer_email || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">শহর</p>
                  <p className="font-medium">{selectedOrder.shipping_city || "—"}</p>
                </div>
              </div>

              {selectedOrder.shipping_address && (
                <div>
                  <p className="text-sm text-muted-foreground">ঠিকানা</p>
                  <p className="font-medium">{selectedOrder.shipping_address}</p>
                </div>
              )}

              {selectedOrder.cart_data && selectedOrder.cart_data.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">কার্টের পণ্য</p>
                  <div className="space-y-2">
                    {selectedOrder.cart_data.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-2 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name_bn}</p>
                          {item.variant_name_bn && (
                            <p className="text-xs text-muted-foreground">
                              {item.variant_name_bn}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-bold">মোট:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(getCartTotal(selectedOrder.cart_data))}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  সর্বশেষ আপডেট:{" "}
                  {format(new Date(selectedOrder.last_updated_at), "dd MMM yyyy, hh:mm a", {
                    locale: bn,
                  })}
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedOrder(null);
                    handleConvertToOrder(selectedOrder);
                  }}
                  className="gap-1"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  অর্ডারে রূপান্তর করুন
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Conversion Dialog */}
      <OrderDialog
        open={convertDialogOpen}
        onOpenChange={handleOrderDialogClose}
        prefilledData={orderToConvert ? getConversionOrderData(orderToConvert) : undefined}
        incompleteOrderId={orderToConvert?.id}
        onConverted={handleOrderConverted}
      />
    </div>
  );
};

export default AdminIncompleteOrders;