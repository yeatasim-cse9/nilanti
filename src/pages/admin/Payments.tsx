import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Search, MapPin, Receipt, CheckCircle2, Copy, Wallet, CreditCard, Banknote, ShieldAlert, FileText, ArrowLeftRight, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { useOrders, useUpdateOrder, AdminOrder } from "@/hooks/useAdminData";
import { useCourierCheck } from "@/hooks/useBDCourier";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CollectPaymentDialog } from "@/components/admin/payments/CollectPaymentDialog";
import { CourierTrackingDialog } from "@/components/admin/payments/CourierTrackingDialog";
import { PaymentDetailDialog } from "@/components/admin/payments/PaymentDetailDialog";
import { RefundDialog } from "@/components/admin/payments/RefundDialog";

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    collect: boolean;
    refund: boolean;
    details: boolean;
    tracking: boolean;
  }>({
    collect: false,
    refund: false,
    details: false,
    tracking: false,
  });

  const { data: activeOrdersList = [], isLoading } = useOrders();
  const updateOrder = useUpdateOrder();
  const { mutateAsync: checkCourierRisk, isPending: isChecking } = useCourierCheck();

  const statistics = useMemo(() => {
    return activeOrdersList.reduce(
      (acc, order) => {
        if (order.status !== "cancelled") {
          const totalAmount = order.total_amount || 0;
          const paidAmount = order.payment_status === "paid" ? totalAmount : (order.advance_payment || order.paid_amount || 0);
          const dueAmount = totalAmount - paidAmount;

          acc.totalSales += totalAmount;
          acc.totalCollected += paidAmount;
          acc.totalDue += dueAmount;
          if (dueAmount > 0) acc.unpaidOrdersCount++;
          
          if (order.steadfast_consignment_id && order.status !== "delivered") {
            acc.courierDue += dueAmount;
          }
        }
        return acc;
      },
      { totalSales: 0, totalCollected: 0, totalDue: 0, unpaidOrdersCount: 0, courierDue: 0 }
    );
  }, [activeOrdersList]);

  const filteredOrders = useMemo(() => {
    return activeOrdersList.filter(order => {
      const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer_phone?.includes(searchQuery) ||
                          order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = paymentFilter === "all" || order.payment_status === paymentFilter;
      return matchSearch && matchFilter;
    }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [activeOrdersList, searchQuery, paymentFilter]);

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Paid</Badge>;
      case 'partial': return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Partial</Badge>;
      case 'unpaid': return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Unpaid</Badge>;
      case 'refunded': return <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">Refunded</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleFraudCheck = async (order: AdminOrder) => {
    if (!order.customer_phone) {
      toast.error('ফোন নম্বর পাওয়া যায়নি');
      return;
    }
    
    try {
      const data = await checkCourierRisk(order.customer_phone);
      if (data && data.status !== 'error') {
        const calculateRisk = (summary: any) => {
           if (!summary) return 'low';
           if (summary.total_parcel < 2) return 'low'; // Not enough data
           if (summary.success_ratio < 60) return 'high';
           if (summary.success_ratio < 85) return 'medium';
           return 'low';
        };
        const risk_level = calculateRisk(data.summary);
        const riskText = risk_level === 'high' ? 'High Risk' : 
                         risk_level === 'medium' ? 'Medium Risk' : 'Low Risk';
        toast.success(`ফ্রড সতর্কবার্তা: ${riskText}\nসাকসেস রেট: ${data.summary?.success_ratio || 0}%`);
        
        // Optionally update the order with the fraud status
        updateOrder.mutate({
          id: order.id,
          fraud_risk: risk_level
        });
      } else if (data && data.error) {
         toast.error(`Error: ${data.error}`);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const openDialog = (type: keyof typeof dialogConfig, order: AdminOrder) => {
    setSelectedOrder(order);
    setDialogConfig(prev => ({ ...prev, [type]: true }));
  };

  const closeDialogs = () => {
    setDialogConfig({ collect: false, refund: false, details: false, tracking: false });
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
          অর্থ ও কালেকশন
        </h1>
        <p className="text-muted-foreground mt-1">পেমেন্ট, কালেকশন, রিফান্ড এবং ফ্রড ম্যানেজমেন্ট</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">মোট বিক্রয় (বিল)</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">৳{statistics.totalSales.toLocaleString()}</div></CardContent>
        </Card>
        
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">পরিশোধিত কালেকশন</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">৳{statistics.totalCollected.toLocaleString()}</div></CardContent>
        </Card>
        
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">অপরিশোধিত বকেয়া</CardTitle>
            <Banknote className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">৳{statistics.totalDue.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">{statistics.unpaidOrdersCount} টি অর্ডারে</p>
          </CardContent>
        </Card>

        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">কুরিয়ার বকেয়া</CardTitle>
            <MapPin className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">৳{statistics.courierDue.toLocaleString()}</div>
            <p className="text-[11px] text-muted-foreground font-medium mt-1">যা কুরিয়ারের কাছে আছে</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="অর্ডার আইডি, ফোন বা নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white/50 border-slate-200 transition-all rounded-xl w-full"
              />
            </div>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px] bg-white/50 border-slate-200">
                <SelectValue placeholder="পেমেন্ট স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব পেমেন্ট স্ট্যাটাস</SelectItem>
                <SelectItem value="paid">পরিশোধিত (Paid)</SelectItem>
                <SelectItem value="partial">আংশিক (Partial)</SelectItem>
                <SelectItem value="unpaid">বকেয়া (Unpaid)</SelectItem>
                <SelectItem value="refunded">রিফান্ডেড (Refunded)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="border-slate-100">
                <TableHead className="font-semibold text-slate-700 pl-6 rounded-tl-xl w-[220px]">
                  অর্ডার ও কাস্টমার
                </TableHead>
                <TableHead className="font-semibold text-slate-700">অ্যামাউন্ট</TableHead>
                <TableHead className="font-semibold text-slate-700">পেমেন্ট স্ট্যাটাস</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">ফ্রড রিস্ক</TableHead>
                <TableHead className="font-semibold text-slate-700 text-center">কুরিয়ার</TableHead>
                <TableHead className="font-semibold text-slate-700 text-right pr-6 rounded-tr-xl">
                  ম্যানেজ পেমেন্ট
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Receipt className="h-8 w-8 text-slate-300 mb-2" />
                      <p>কোনো ডেটা পাওয়া যায়নি</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => {
                  const tAmt = order.total_amount || 0;
                  const pAmt = order.payment_status === "paid" ? tAmt : (order.advance_payment || order.paid_amount || 0);
                  const dAmt = tAmt - pAmt;
                  
                  return (
                    <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors group">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary truncate max-w-[150px]">#{order.id.slice(0, 8)}</span>
                          <span className="text-xs text-slate-500 font-mono mt-0.5">{order.customer_phone}</span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <span className="font-bold text-slate-800 flex justify-between w-24">
                            <span className="text-slate-400 text-xs font-normal">বিল:</span> ৳{tAmt.toLocaleString()}
                          </span>
                          <span className="font-medium text-emerald-600 flex justify-between w-24">
                            <span className="text-slate-400 text-xs font-normal">জমা:</span> ৳{pAmt.toLocaleString()}
                          </span>
                          {dAmt > 0 && order.payment_status !== 'paid' && (
                            <span className="font-medium text-rose-600 flex justify-between w-24 pt-0.5 border-t border-slate-100 mt-0.5">
                              <span className="text-rose-400 text-xs font-normal">বাকি:</span> ৳{dAmt.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {getPaymentBadge(order.payment_status || 'unpaid')}
                        {order.payment_method && (
                          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md w-fit">
                            <CreditCard className="w-3 h-3 text-slate-400" />
                            {order.payment_method.toUpperCase()}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleFraudCheck(order)}
                          disabled={isChecking}
                          className="h-8 text-xs font-medium border-rose-100 hover:bg-rose-50 hover:text-rose-700 text-rose-600 ml-auto"
                        >
                          <ShieldAlert className="w-3 h-3 mr-1.5" /> চেক করুন
                        </Button>
                      </TableCell>

                      <TableCell className="text-center">
                        {order.steadfast_consignment_id ? (
                           <Button 
                             onClick={() => openDialog('tracking', order)} 
                             variant="outline" 
                             size="sm" 
                             className="h-7 text-xs font-medium border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 hover:text-indigo-800"
                           >
                              <MapPin className="w-3 h-3 mr-1" /> ট্র্যাক
                           </Button>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Not sent</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Open menu">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[180px]">
                            <DropdownMenuLabel className="text-xs text-slate-500">পেমেন্ট অ্যাকশন</DropdownMenuLabel>
                            
                            <DropdownMenuItem onClick={() => openDialog('details', order)}>
                              <FileText className="mr-2 h-4 w-4 text-blue-500" /> রসিদ ও বিস্তারিত
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => openDialog('collect', order)}
                              disabled={order.payment_status === 'paid' || order.status === 'cancelled'}
                              className={order.payment_status === 'paid' ? "opacity-50" : ""}
                            >
                              <Wallet className="mr-2 h-4 w-4 text-emerald-500" /> পেমেন্ট কালেকশন
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => openDialog('refund', order)}>
                              <ArrowLeftRight className="mr-2 h-4 w-4 text-rose-500" /> আংশিক/পূর্ণ রিফান্ড
                            </DropdownMenuItem>
                            
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Render Dialogs */}
      {selectedOrder && (
        <>
          <CollectPaymentDialog
            order={selectedOrder}
            open={dialogConfig.collect}
            onOpenChange={(v) => !v && closeDialogs()}
          />
          <PaymentDetailDialog
            order={selectedOrder}
            open={dialogConfig.details}
            onOpenChange={(v) => !v && closeDialogs()}
            onCollectPayment={() => openDialog('collect', selectedOrder)}
            onTrackCourier={() => openDialog('tracking', selectedOrder)}
            onRefund={() => openDialog('refund', selectedOrder)}
          />
          <RefundDialog
            order={selectedOrder}
            open={dialogConfig.refund}
            onOpenChange={(v) => !v && closeDialogs()}
          />
          {selectedOrder.steadfast_consignment_id && (
            <CourierTrackingDialog
              order={selectedOrder}
              open={dialogConfig.tracking}
              onOpenChange={(v) => !v && closeDialogs()}
              onCollectPayment={() => openDialog('collect', selectedOrder)}
            />
          )}
        </>
      )}
    </div>
  );
}
