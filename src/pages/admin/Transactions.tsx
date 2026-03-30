import React, { useState, useMemo } from "react";
import { format, isAfter } from "date-fns";
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
  Truck
} from "lucide-react";
import { toast } from "sonner";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        if (order.status !== "cancelled") {
          const totalAmount = order.total_amount || 0;
          const paidAmount = order.payment_status === "paid" ? totalAmount : (order.advance_payment || order.paid_amount || 0);
          const dueAmount = totalAmount - paidAmount;

          acc.totalSales += totalAmount;
          acc.totalCollected += paidAmount;
          acc.totalDue += dueAmount;
          
          if (order.status === 'pending') acc.pendingCount++;
          if (order.steadfast_consignment_id && order.status !== "delivered") {
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
      const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer_phone?.includes(searchQuery) ||
                          order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || order.status === statusFilter;
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
            sendToSteadfast(order);
          }
        });
        setSelectedOrders([]);
      }
    } else {
      // Bulk status update
      bulkUpdate.mutate({ ids: selectedOrders, updates: { status: action } as any }, {
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

  const statusBadges: Record<string, any> = {
    pending: <Badge className="bg-amber-100 text-amber-700 border-none shadow-none">পেন্ডিং</Badge>,
    processing: <Badge className="bg-blue-100 text-blue-700 border-none shadow-none">প্রসেসিং</Badge>,
    shipped: <Badge className="bg-indigo-100 text-indigo-700 border-none shadow-none">শিপড</Badge>,
    delivered: <Badge className="bg-emerald-100 text-emerald-700 border-none shadow-none">ডেলিভারড</Badge>,
    cancelled: <Badge className="bg-rose-100 text-rose-700 border-none shadow-none">বাতিল</Badge>,
  };

  const paymentBadges: Record<string, any> = {
    paid: <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50/50">Paid</Badge>,
    partial: <Badge variant="outline" className="border-indigo-200 text-indigo-600 bg-indigo-50/50">Partial</Badge>,
    unpaid: <Badge variant="outline" className="border-rose-200 text-rose-600 bg-rose-50/50">Unpaid</Badge>,
    refunded: <Badge variant="outline" className="border-slate-200 text-slate-600 bg-slate-50/50">Refunded</Badge>,
  };

  const isLoading = isLoadingActive || isLoadingTrash;

  if (isLoading && activeOrdersList.length === 0) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex justify-between items-end"><Skeleton className="h-20 w-1/3" /><Skeleton className="h-12 w-48" /></div>
        <div className="grid grid-cols-4 gap-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
        <Skeleton className="h-[600px] w-full mt-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent uppercase tracking-tight">
            ট্রানজ্যাকশন মাস্টার
          </h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black tracking-normal uppercase">Admin Terminal</Badge>
            <p className="text-sm font-bold text-muted-foreground opacity-60 uppercase tracking-normal">Orders, Payments & Logistics</p>
          </div>
        </div>
        
        {steadfastBalance !== undefined && (
          <Card className="bg-white/40 border-indigo-100 shadow-xl shadow-indigo-500/5 group hover:border-indigo-300 transition-all rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
               <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <Package className="w-6 h-6" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-normal text-slate-400">Steadfast Funds</p>
                  <p className="text-xl font-black text-indigo-700 tracking-tighter">৳{Number(steadfastBalance || 0).toLocaleString()}</p>
               </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-primary/20 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Total Revenue <TrendingUp className="h-4 w-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tighter">৳{statistics.totalSales.toLocaleString()}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-1">LIFETIME SALES VOLUME</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-emerald-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-emerald-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Collected <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">৳{statistics.totalCollected.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-1">
               <div className="flex-1 h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${statistics.totalSales > 0 ? (statistics.totalCollected/statistics.totalSales)*100 : 0}%` }} />
               </div>
               <span className="text-[9px] font-black text-emerald-600">{statistics.totalSales > 0 ? Math.round((statistics.totalCollected/statistics.totalSales)*100) : 0}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-amber-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-amber-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              In Courier <MapPin className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600 tracking-tighter">৳{statistics.courierPipeline.toLocaleString()}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">OUTSTANDING LOGISTICS</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-rose-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-rose-200 transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Pending Orders <ShieldAlert className="h-4 w-4 text-rose-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-rose-600 tracking-tighter">{statistics.pendingCount}</div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-normal">AWAITING PROCESSING</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Controls Section */}
        <div className="flex flex-col gap-6 mb-8">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-3 rounded-[28px] border border-white/60 shadow-lg shadow-black/[0.02]">
              <TabsList className="bg-slate-100/50 p-1 rounded-[20px] h-11 border border-transparent">
                <TabsTrigger value="active" className="rounded-[16px] px-8 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-none">Active Flows</TabsTrigger>
                <TabsTrigger value="trash" className="rounded-[16px] px-8 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all shadow-none">Recycle Bin</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3 w-full md:w-auto px-2">
                 <div className="relative flex-1 md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Order ID, Customer or Phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11 h-11 bg-white/80 border-white/40 rounded-full text-[11px] font-bold shadow-sm focus-visible:ring-primary/20"
                    />
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 h-11 bg-white/80 border-white/40 rounded-full text-[10px] font-black uppercase tracking-normal">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">ANY STATUS</SelectItem>
                        <SelectItem value="pending">PENDING</SelectItem>
                        <SelectItem value="processing">PROCESSING</SelectItem>
                        <SelectItem value="shipped">SHIPPED</SelectItem>
                        <SelectItem value="delivered">DELIVERED</SelectItem>
                        <SelectItem value="cancelled">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                      <SelectTrigger className="w-32 h-11 bg-white/80 border-white/40 rounded-full text-[10px] font-black uppercase tracking-normal">
                        <SelectValue placeholder="Payment" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="all">ANY PAYMENT</SelectItem>
                        <SelectItem value="paid">PAID</SelectItem>
                        <SelectItem value="partial">PARTIAL</SelectItem>
                        <SelectItem value="unpaid">UNPAID</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
           </div>

           {selectedOrders.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 bg-primary/[0.03] border border-primary/10 rounded-2xl animate-in slide-in-from-top-4">
                 <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-primary uppercase tracking-normal bg-primary/10 px-4 py-1.5 rounded-full">
                       {selectedOrders.length} Transaction{selectedOrders.length > 1 ? 's' : ''} Selected
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                          <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl h-10 px-6 font-bold uppercase text-[10px] tracking-normal shadow-lg shadow-primary/20">
                             Bulk Fleet Command <MoreHorizontal className="ml-2 h-4 w-4" />
                          </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/10">
                          <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-normal text-slate-400 px-3 pb-2 pt-1">Execution Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleBulkAction('processing')} className="rounded-xl font-bold p-3">Mark Processing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('shipped')} className="rounded-xl font-bold p-3">Mark Shipped</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkAction('delivered')} className="rounded-xl font-bold p-3">Mark Delivered</DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2 opacity-50" />
                          {activeTab === 'active' ? (
                             <>
                                <DropdownMenuItem onClick={() => handleBulkAction('steadfast')} className="rounded-xl font-bold p-3 text-indigo-600">
                                   <Send className="w-4 h-4 mr-2" /> Dispatch to Steadfast
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('soft_delete')} className="rounded-xl font-bold p-3 text-rose-600">
                                   <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                                </DropdownMenuItem>
                             </>
                          ) : (
                             <>
                                <DropdownMenuItem onClick={() => handleBulkAction('restore')} className="rounded-xl font-bold p-3 text-emerald-600">
                                   <RotateCcw className="w-4 h-4 mr-2" /> Restore Selection
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                   if(window.confirm('Delete permanently?')) handleBulkAction('hard_delete');
                                }} className="rounded-xl font-bold p-3 text-rose-600">
                                   <Trash2 className="w-4 h-4 mr-2" /> Purge Permanently
                                </DropdownMenuItem>
                             </>
                          )}
                       </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
           )}
        </div>

        {/* Table Content */}
        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-black/[0.02] overflow-hidden">
            <div className="overflow-x-auto min-h-[600px] no-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-12 pl-8">
                       <Checkbox checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500 py-6">Transaction ID</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500">Customer Intelligence</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500">Financial Matrix</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Logistics & Risk</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Flow Status</TableHead>
                    <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-normal text-slate-500">Operational Hub</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-96 text-center">
                        <div className="flex flex-col items-center justify-center opacity-40">
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
                        <TableRow key={order.id} className="hover:bg-slate-50/50 transition-all border-slate-50 group">
                          <TableCell className="pl-8 py-6">
                            <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-primary text-base">#{order.id.slice(-8).toUpperCase()}</span>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-normal">
                                {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy HH:mm") : 'UNTYPED'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-sm truncate max-w-[180px]">{order.customer_name || 'Anonymous User'}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Phone className="w-3 h-3 text-primary/40" />
                                 <span className="text-[11px] font-mono text-slate-500">{order.customer_phone}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-6">
                               <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-normal italic">Total Bill</div>
                                  <div className="text-lg font-black text-slate-800 tracking-tighter">৳{tAmt.toLocaleString()}</div>
                               </div>
                               <div className="space-y-1">
                                  <div className="text-[9px] font-black text-slate-400 uppercase tracking-normal italic">Paid/Due</div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-sm font-black text-emerald-600">৳{pAmt.toLocaleString()}</span>
                                     <span className="text-slate-300">/</span>
                                     <span className={`text-sm font-black ${dAmt > 0 ? 'text-rose-600' : 'text-slate-300 font-normal tracking-normal'}`}>৳{dAmt.toLocaleString()}</span>
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
                                      <Button variant="ghost" className="h-5 text-[8px] font-black p-0 uppercase underline decoration-primary/20 hover:text-primary transition-all" onClick={() => handleFraudCheck(order)}>Verification Req.</Button>
                                   )}
                                </div>
                                
                                {order.steadfast_consignment_id ? (
                                   <Badge variant="outline" className="border-indigo-100 bg-indigo-50/50 text-indigo-600 font-black text-[8px] flex items-center gap-1">
                                      <Send className="w-2 h-2" /> Steadfast #{order.steadfast_consignment_id}
                                   </Badge>
                                ) : (
                                   <span className="text-[10px] font-black text-slate-300 uppercase italic">Offline Cargo</span>
                                )}
                             </div>
                          </TableCell>
                          <TableCell className="text-center">
                             <div className="flex flex-col items-center gap-1.5">
                                {statusBadges[order.status || 'pending']}
                                {paymentBadges[order.payment_status || 'unpaid']}
                             </div>
                          </TableCell>
                          <TableCell className="text-right pr-8">
                             <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 rounded-full hover:bg-primary/5 hover:text-primary border border-transparent hover:border-primary/10 transition-all shadow-sm shadow-black/[0.02]"
                                  onClick={() => openDialog('details', order)}
                                >
                                   <Eye className="h-4 w-4" />
                                </Button>

                                <DropdownMenu>
                                   <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 shadow-sm shadow-black/[0.02]">
                                         <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                   </DropdownMenuTrigger>
                                   <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/10">
                                      <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-normal text-slate-400 px-3 pb-2 pt-1">Matrix Controls</DropdownMenuLabel>
                                      
                                      <DropdownMenuItem onClick={() => openDialog('details', order)} className="rounded-xl font-bold p-3">
                                         <FileText className="w-4 h-4 mr-2 text-primary" /> Comprehensive Ledger
                                      </DropdownMenuItem>

                                      <DropdownMenuSeparator className="my-2 opacity-50" />

                                      <DropdownMenuItem onClick={() => openDialog('collect', order)} disabled={order.payment_status === 'paid'} className="rounded-xl font-bold p-3">
                                         <Wallet className="w-4 h-4 mr-2 text-emerald-500" /> Collect Transaction
                                      </DropdownMenuItem>

                                      <DropdownMenuItem onClick={() => openDialog('refund', order)} className="rounded-xl font-bold p-3">
                                         <ArrowLeftRight className="w-4 h-4 mr-2 text-rose-500" /> Process Refund
                                      </DropdownMenuItem>

                                      {order.steadfast_consignment_id && (
                                         <DropdownMenuItem onClick={() => openDialog('tracking', order)} className="rounded-xl font-bold p-3 text-indigo-600">
                                            <MapPin className="w-4 h-4 mr-2" /> Real-time Tracking
                                         </DropdownMenuItem>
                                      )}

                                      <DropdownMenuSeparator className="my-2 opacity-50" />
                                      
                                      {activeTab === 'active' ? (
                                         <DropdownMenuItem onClick={() => softDelete.mutate(order.id)} className="rounded-xl font-bold p-3 text-rose-600 focus:bg-rose-50">
                                            <Trash2 className="w-4 h-4 mr-2" /> Termination (Trash)
                                         </DropdownMenuItem>
                                      ) : (
                                         <>
                                            <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="rounded-xl font-bold p-3 text-emerald-600">
                                               <RotateCcw className="w-4 h-4 mr-2" /> Reactivate Order
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => hardDelete.mutate(order.id)} className="rounded-xl font-bold p-3 text-rose-600 focus:bg-rose-50">
                                               <Trash2 className="w-4 h-4 mr-2" /> Critical Purge
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
          </div>
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
