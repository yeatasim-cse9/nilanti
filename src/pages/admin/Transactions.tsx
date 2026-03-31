import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { 
  Search, 
  Filter, 
  Package, 
  Trash2, 
  RotateCcw, 
  Send, 
  MoreHorizontal, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  Banknote, 
  MapPin,
  TrendingUp,
  Receipt,
  FileText,
  ArrowLeftRight,
  Phone,
  Truck,
  Clock,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import { 
  useOrders, 
  useTrashOrders, 
  useUpdateOrder, 
  useBulkUpdateOrders, 
  useSoftDeleteOrder, 
  useRestoreOrder, 
  usePermanentDeleteOrder, 
  AdminOrder 
} from "@/hooks/useAdminData";
import { useSendToSteadfast, useSteadfastBalance } from "@/hooks/useSteadfast";
import { useCourierCheck } from "@/hooks/useBDCourier";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { OrderDialog } from "@/components/admin/dialogs/OrderDialog";
import { CollectPaymentDialog } from "@/components/admin/payments/CollectPaymentDialog";
import { CourierTrackingDialog } from "@/components/admin/payments/CourierTrackingDialog";
import { PaymentDetailDialog } from "@/components/admin/payments/PaymentDetailDialog";
import { RefundDialog } from "@/components/admin/payments/RefundDialog";
import { cn } from "@/lib/utils";

export default function AdminTransactions() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [dialogConfig, setDialogConfig] = useState<{
    details: boolean;
    collect: boolean;
    refund: boolean;
    tracking: boolean;
  }>({
    details: false,
    collect: false,
    refund: false,
    tracking: false,
  });

  // Data fetching
  const { data: activeOrdersList = [], isLoading: isLoadingActive } = useOrders();
  const { data: trashOrdersList = [], isLoading: isLoadingTrash } = useTrashOrders();
  const { data: steadfastBalance } = useSteadfastBalance();

  // Mutations
  const updateOrder = useUpdateOrder();
  const bulkUpdate = useBulkUpdateOrders();
  const softDelete = useSoftDeleteOrder();
  const restoreOrder = useRestoreOrder();
  const hardDelete = usePermanentDeleteOrder();
  const { mutate: sendToSteadfast, isPending: isSendingSteadfast } = useSendToSteadfast();
  const { mutateAsync: checkCourierRisk, isPending: isCheckingRisk } = useCourierCheck();

  const currentList = activeTab === "active" ? activeOrdersList : trashOrdersList;

  const statistics = useMemo(() => {
    return activeOrdersList.reduce(
      (acc, order) => {
        const currentStatus = order.order_status || order.status;
        if (currentStatus !== "cancelled") {
          const totalAmount = order.total_amount || 0;
          const paidAmount = order.payment_status === "paid" ? totalAmount : (order.advance_payment || order.paid_amount || 0);
          const dueAmount = totalAmount - paidAmount;

          acc.totalSales += totalAmount;
          acc.totalCollected += paidAmount;
          acc.totalDue += dueAmount;
          
          if (currentStatus === 'pending') acc.pendingCount++;
          if (order.steadfast_consignment_id && currentStatus !== "delivered") {
            acc.courierPipeline += dueAmount;
          }
        }
        return acc;
      },
      { totalSales: 0, totalCollected: 0, totalDue: 0, pendingCount: 0, courierPipeline: 0 }
    );
  }, [activeOrdersList]);

  const filteredOrders = useMemo(() => {
    return currentList.filter(order => {
      const matchSearch = (order.order_number || order.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer_phone?.includes(searchQuery) ||
                          order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const currentStatus = order.order_status || order.status;
      const matchStatus = statusFilter === "all" || currentStatus === statusFilter;
      const matchPayment = paymentFilter === "all" || order.payment_status === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [currentList, searchQuery, statusFilter, paymentFilter]);

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(o => o !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedOrders.length === 0) return;

    if (action === "soft_delete") {
      Promise.all(selectedOrders.map(id => softDelete.mutateAsync(id))).then(() => {
        toast.success(`${selectedOrders.length} orders trashed.`);
        setSelectedOrders([]);
      });
    } else if (action === "restore") {
      Promise.all(selectedOrders.map(id => restoreOrder.mutateAsync(id))).then(() => {
        toast.success(`${selectedOrders.length} orders restored.`);
        setSelectedOrders([]);
      });
    } else if (action === "steadfast") {
      if(window.confirm(`Send ${selectedOrders.length} orders to Steadfast?`)) {
        selectedOrders.forEach(id => {
          const order = currentList.find(o => o.id === id);
          if (order && !order.steadfast_consignment_id) {
            sendToSteadfast({ orderId: id, orderData: order });
          }
        });
        setSelectedOrders([]);
      }
    } else {
      // Bulk status update
      bulkUpdate.mutate({ ids: selectedOrders, updates: { order_status: action } }, {
        onSuccess: () => setSelectedOrders([])
      });
    }
  };

  const handleFraudCheck = async (order: AdminOrder) => {
    if (!order.customer_phone) return toast.error('ফোন পাওয়া যায়নি');
    try {
      const data = await checkCourierRisk(order.customer_phone);
      if (data && data.status !== 'error') {
        const ratio = data.summary?.success_ratio || 0;
        const risk = ratio < 60 ? 'high' : ratio < 85 ? 'medium' : 'low';
        toast.success(`সাকসেস রেট: ${ratio}% - ${risk.toUpperCase()} RISK`);
        updateOrder.mutate({ id: order.id, fraud_risk: risk });
      }
    } catch (err) {}
  };

  const openDialog = (type: keyof typeof dialogConfig, order: AdminOrder) => {
    setSelectedOrder(order);
    setDialogConfig(prev => ({ ...prev, [type]: true }));
  };

  const closeDialogs = () => {
    setDialogConfig({ details: false, collect: false, refund: false, tracking: false });
    setSelectedOrder(null);
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all duration-300";
    switch (status) {
      case 'pending': return <Badge variant="outline" className={cn(base, "bg-amber-500/10 text-amber-600 border-amber-200/50")}>Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className={cn(base, "bg-blue-500/10 text-blue-600 border-blue-200/50")}>Confirmed</Badge>;
      case 'processing': return <Badge variant="outline" className={cn(base, "bg-indigo-500/10 text-indigo-600 border-indigo-200/50")}>Processing</Badge>;
      case 'shipped': return <Badge variant="outline" className={cn(base, "bg-purple-500/10 text-purple-600 border-purple-200/50")}>Shipped</Badge>;
      case 'delivered': return <Badge variant="outline" className={cn(base, "bg-emerald-500/10 text-emerald-600 border-emerald-200/50")}>Delivered</Badge>;
      case 'cancelled': return <Badge variant="outline" className={cn(base, "bg-rose-500/10 text-rose-600 border-rose-200/50")}>Cancelled</Badge>;
      default: return <Badge variant="outline" className={base}>{status}</Badge>;
    }
  };

  const paymentBadges: Record<string, any> = {
    paid: <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-emerald-200 text-emerald-600 bg-emerald-50/50">Paid</Badge>,
    partial: <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-indigo-200 text-indigo-600 bg-indigo-50/50">Partial</Badge>,
    unpaid: <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-rose-200 text-rose-600 bg-rose-50/50">Unpaid</Badge>,
    refunded: <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border-slate-200 text-slate-600 bg-slate-50/50">Refunded</Badge>,
  };

  const isLoading = isLoadingActive || isLoadingTrash;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Sticky Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20 py-4 px-6 -mx-4 rounded-3xl border border-white/60 dark:border-slate-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="relative group">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
           <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
             <Receipt className="w-8 h-8" />
             ট্রানজ্যাকশন মাস্টার
           </h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-0.5 opacity-60 ml-1">
             Financial Matrix & Payment Hub
           </p>
        </div>
        
        <div className="flex items-center gap-4">
          {steadfastBalance !== undefined && (
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-xl border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
                 <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Courier Balance</p>
                <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg tracking-tighter">৳{steadfastBalance.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="outline"
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2 border-white/60 bg-white/40 backdrop-blur-xl transition-all hover:bg-white/60 active:scale-95"
            onClick={() => window.print()}
          >
            <FileText className="w-4 h-4" />
            রিপোর্ট
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        {[
          { label: "Total Revenue", value: `৳${statistics.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5", sub: "LIFETIME SALES VOLUME" },
          { label: "Collected", value: `৳${statistics.totalCollected.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/5", sub: "TOTAL FUNDS RECEIVED", progress: statistics.totalSales > 0 ? (statistics.totalCollected/statistics.totalSales)*100 : 0 },
          { label: "In Courier", value: `৳${statistics.courierPipeline.toLocaleString()}`, icon: Truck, color: "text-indigo-500", bg: "bg-indigo-500/5", sub: "OUTSTANDING LOGISTICS" },
          { label: "Pending", value: statistics.pendingCount, icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-500/5", sub: "AWAITING PROCESSING" }
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-[2.2rem] bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-xl transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-60">{stat.label}</p>
                 <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                 <stat.icon className="h-7 w-7" />
              </div>
            </div>
            {stat.progress !== undefined ? (
              <div className="mt-4">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/30 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stat.progress}%` }} />
                </div>
                <p className="text-[9px] font-black text-emerald-600 mt-2 uppercase tracking-widest">{Math.round(stat.progress)}% COMPLETED</p>
              </div>
            ) : (
              <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full space-y-8 px-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-1.5 rounded-full border border-white/60 dark:border-slate-700/50 h-auto flex-wrap w-fit shadow-lg shadow-black/5">
            <TabsTrigger value="active" className="rounded-full px-8 py-3 text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              Active Flows
            </TabsTrigger>
            <TabsTrigger value="trash" className="rounded-full px-8 py-3 text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all">
              Recycle Bin
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-4">
             {selectedOrders.length > 0 && (
               <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500 bg-primary/5 dark:bg-primary/10 pl-5 pr-2 py-1.5 rounded-full border border-primary/20">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                   {selectedOrders.length} Selected
                 </span>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="default" size="sm" className="h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-primary/20">
                       Fleet Command <MoreHorizontal className="h-3 w-3 ml-2" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 border-white/40 dark:border-slate-700/40 backdrop-blur-2xl shadow-3xl">
                     <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-500/60 px-3 py-2">Execution Actions</DropdownMenuLabel>
                     <DropdownMenuItem onClick={() => handleBulkAction('processing')} className="font-bold rounded-xl p-3 focus:bg-indigo-50">Mark Processing</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleBulkAction('shipped')} className="font-bold rounded-xl p-3 focus:bg-purple-50">Mark Shipped</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleBulkAction('delivered')} className="font-bold rounded-xl p-3 focus:bg-emerald-50 text-emerald-600">Mark Delivered</DropdownMenuItem>
                     <DropdownMenuSeparator className="my-2 opacity-50" />
                     {activeTab === 'active' ? (
                       <>
                        <DropdownMenuItem onClick={() => handleBulkAction('steadfast')} className="font-bold rounded-xl p-3 text-indigo-600 focus:bg-indigo-50">
                          <Send className="mr-3 h-4 w-4" /> Dispatch to Courier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('soft_delete')} className="font-bold rounded-xl p-3 text-rose-600 focus:bg-rose-50">
                          <Trash2 className="mr-3 h-4 w-4" /> Move to Trash
                        </DropdownMenuItem>
                       </>
                     ) : (
                       <>
                        <DropdownMenuItem onClick={() => handleBulkAction('restore')} className="font-bold rounded-xl p-3 text-emerald-600 focus:bg-emerald-50">
                          <RotateCcw className="mr-3 h-4 w-4" /> Restore Selection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('hard_delete')} className="font-bold rounded-xl p-3 text-rose-600 focus:bg-rose-50">
                          <Trash2 className="mr-3 h-4 w-4" /> Purge Permanently
                        </DropdownMenuItem>
                       </>
                     )}
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
             )}

             <div className="relative w-full sm:w-64 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-all" />
                <Input
                  placeholder="Order Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white/60 dark:bg-slate-800/60 border-white/60 dark:border-slate-700/50 rounded-2xl text-[12px] font-bold shadow-lg shadow-black/5 focus-visible:ring-primary/20 backdrop-blur-xl"
                />
             </div>

             <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="w-36 h-12 bg-white/60 dark:bg-slate-800/60 border-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest pl-6 shadow-lg shadow-black/5 backdrop-blur-xl">
                     <SelectValue placeholder="Status" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl">
                     <SelectItem value="all">Any Status</SelectItem>
                     <SelectItem value="pending">Pending</SelectItem>
                     <SelectItem value="confirmed">Confirmed</SelectItem>
                     <SelectItem value="processing">Processing</SelectItem>
                     <SelectItem value="shipped">Shipped</SelectItem>
                     <SelectItem value="delivered">Delivered</SelectItem>
                   </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                   <SelectTrigger className="w-36 h-12 bg-white/60 dark:bg-slate-800/60 border-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest pl-6 shadow-lg shadow-black/5 backdrop-blur-xl">
                     <SelectValue placeholder="Payment" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl">
                     <SelectItem value="all">Any Payment</SelectItem>
                     <SelectItem value="paid">Paid</SelectItem>
                     <SelectItem value="partial">Partial</SelectItem>
                     <SelectItem value="unpaid">Unpaid</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          <Card className="border-none bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-white/40 dark:border-slate-700/30">
            <div className="overflow-x-auto no-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-100/30 dark:bg-slate-900/30">
                      <TableRow className="hover:bg-transparent border-slate-100/50 dark:border-slate-700/50">
                        <TableHead className="w-12 pl-8">
                           <Checkbox checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                        </TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 min-w-[150px]">Transaction</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 min-w-[180px]">Customer Hub</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 min-w-[200px]">Financial Matrix</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">Logistics & Risk</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">Flow Status</TableHead>
                        <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-widest text-slate-500">Operations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="p-8">
                               <Skeleton className="h-12 w-full rounded-xl" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-96 text-center">
                            <div className="flex flex-col items-center justify-center p-12 opacity-40">
                              <Receipt className="h-16 w-16 mb-6 text-primary" />
                              <h3 className="text-xl font-black text-primary uppercase tracking-tight">No Flow Detected</h3>
                              <p className="text-xs font-bold mt-2">Try adjusting filters or checking the recycle bin.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map(order => {
                          const tAmt = order.total_amount || 0;
                          const pAmt = order.payment_status === "paid" ? tAmt : (order.advance_payment || order.paid_amount || 0);
                          const dAmt = tAmt - pAmt;

                          return (
                            <TableRow key={order.id} className="group hover:bg-white/40 dark:hover:bg-slate-700/20 transition-all duration-300 border-slate-50 dark:border-slate-800">
                              <TableCell className="pl-8">
                                <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelect(order.id)} className="transition-transform duration-500 group-hover:scale-110" />
                              </TableCell>
                              <TableCell className="py-6">
                                <div className="flex flex-col space-y-1.5">
                                  <span className="font-black text-primary text-base tracking-tighter">{order.order_number?.startsWith('#') ? order.order_number : `#${order.order_number || order.id.slice(-8).toUpperCase()}`}</span>
                                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] opacity-80">
                                     <Clock className="w-3 h-3" />
                                     {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy") : 'Unknown'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <div className="font-black text-slate-800 dark:text-slate-200 text-sm uppercase tracking-tight line-clamp-1">{order.customer_name || "Guest Checkout"}</div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 group-hover:text-primary transition-colors">
                                    <Phone className="w-2.5 h-2.5" />
                                    {order.customer_phone || "No Phone"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-6">
                                   <div className="space-y-1">
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-normal italic">Total Bill</div>
                                      <div className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tighter">৳{tAmt.toLocaleString()}</div>
                                   </div>
                                   <div className="h-8 w-px bg-slate-100 dark:bg-slate-700/50" />
                                   <div className="space-y-1">
                                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-normal italic">Paid/Due</div>
                                      <div className="flex items-center gap-2">
                                         <span className="text-sm font-black text-emerald-600">৳{pAmt.toLocaleString()}</span>
                                         <span className="text-slate-200">/</span>
                                         <span className={cn("text-sm font-black", dAmt > 0 ? 'text-rose-600' : 'text-slate-300')}>৳{dAmt.toLocaleString()}</span>
                                      </div>
                                   </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="flex flex-col items-center gap-2">
                                    <div className="flex items-center gap-1.5">
                                       {order.fraud_risk === 'high' ? (
                                          <Badge className="bg-rose-500 text-white border-none text-[8px] font-black px-2 py-0">HIGH RISK</Badge>
                                       ) : order.fraud_risk === 'medium' ? (
                                          <Badge className="bg-amber-500 text-white border-none text-[8px] font-black px-2 py-0">MID RISK</Badge>
                                       ) : order.fraud_risk === 'low' ? (
                                          <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-2 py-0">STABLE</Badge>
                                       ) : (
                                          <Button variant="ghost" className="h-5 text-[8px] font-black p-0 uppercase underline decoration-primary/20 hover:text-primary" onClick={() => handleFraudCheck(order)}>Verification</Button>
                                       )}
                                    </div>
                                    {order.steadfast_consignment_id && (
                                       <Badge variant="outline" className="border-indigo-100 bg-indigo-50/10 text-indigo-600 font-black text-[8px]">
                                          #{order.steadfast_consignment_id}
                                       </Badge>
                                    )}
                                 </div>
                              </TableCell>
                              <TableCell className="text-center">
                                 <div className="flex flex-col items-center gap-1.5">
                                    {getStatusBadge(order.order_status || order.status)}
                                    {paymentBadges[order.payment_status || 'unpaid']}
                                 </div>
                              </TableCell>
                              <TableCell className="text-right pr-8">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                   <Button 
                                     variant="outline" 
                                     size="icon" 
                                     className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-primary hover:text-white transition-all shadow-md"
                                     onClick={() => openDialog('details', order)}
                                   >
                                      <Eye className="h-4 w-4" />
                                   </Button>
                                   <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 shadow-md">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-white/40 dark:border-slate-700/40 backdrop-blur-2xl shadow-3xl">
                                        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-500/60 px-3 py-2">Matrix Controls</DropdownMenuLabel>
                                        
                                        <DropdownMenuItem onClick={() => openDialog('details', order)} className="rounded-xl font-bold p-3">
                                           <FileText className="w-4 h-4 mr-3 text-primary" /> Comprehensive Ledger
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator className="opacity-50" />

                                        <DropdownMenuItem onClick={() => openDialog('collect', order)} disabled={order.payment_status === 'paid'} className="rounded-xl font-bold p-3">
                                           <Wallet className="w-4 h-4 mr-3 text-emerald-500" /> Collect Payment
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => openDialog('refund', order)} className="rounded-xl font-bold p-3">
                                           <ArrowLeftRight className="w-4 h-4 mr-3 text-rose-500" /> Process Refund
                                        </DropdownMenuItem>

                                        {order.steadfast_consignment_id && (
                                           <DropdownMenuItem onClick={() => openDialog('tracking', order)} className="rounded-xl font-bold p-3 text-indigo-600">
                                              <MapPin className="w-4 h-4 mr-3" /> Real-time Tracking
                                           </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="opacity-50" />
                                        
                                        {activeTab === 'active' ? (
                                           <DropdownMenuItem onClick={() => softDelete.mutate(order.id)} className="rounded-xl font-bold p-3 text-rose-600 focus:bg-rose-50">
                                              <Trash2 className="w-4 h-4 mr-3" /> Termination (Trash)
                                           </DropdownMenuItem>
                                        ) : (
                                           <>
                                              <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="rounded-xl font-bold p-3 text-emerald-600">
                                                 <RotateCcw className="w-4 h-4 mr-3" /> Reactivate Order
                                              </DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => hardDelete.mutate(order.id)} className="rounded-xl font-bold p-3 text-rose-600 focus:bg-rose-50">
                                                 <Trash2 className="w-4 h-4 mr-3" /> Critical Purge
                                              </DropdownMenuItem>
                                           </>
                                        )}
                                      </DropdownMenuContent>
                                   </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Unified Contextual Dialogs */}
      {selectedOrder && (
        <>
          <OrderDialog
            order={selectedOrder}
            open={dialogConfig.details}
            onOpenChange={(v) => !v && closeDialogs()}
          />
          <CollectPaymentDialog
            order={selectedOrder}
            open={dialogConfig.collect}
            onOpenChange={(v) => !v && closeDialogs()}
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
