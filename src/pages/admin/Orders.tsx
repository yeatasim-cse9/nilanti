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
  ArrowRight,
  TrendingUp,
  CreditCard,
  Clock,
  Plus,
  Phone,
  Truck
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { useOrders, useTrashOrders, useUpdateOrder, useBulkUpdateOrders, useSoftDeleteOrder, useRestoreOrder, usePermanentDeleteOrder, AdminOrder } from "@/hooks/useAdminData";
import { useSendToSteadfast, useSteadfastBalance } from "@/hooks/useSteadfast";

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
import { cn } from "@/lib/utils";

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrderForDialog, setSelectedOrderForDialog] = useState<AdminOrder | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleOpenDialog = (order: AdminOrder) => {
    setSelectedOrderForDialog(order);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = (orderId: string, order_status: string) => {
    updateOrder.mutate({ id: orderId, order_status });
  };

  const currentList = activeTab === "active" ? activeOrdersList : trashOrdersList;

  const filteredOrders = useMemo(() => {
    return currentList.filter(order => {
      const matchSearch = (order.order_number || order.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer_phone?.includes(searchQuery) ||
                          order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      // Support both status and order_status for legacy data, but prefer order_status
      const currentStatus = order.order_status || order.status;
      const matchStatus = statusFilter === "all" || currentStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [currentList, searchQuery, statusFilter]);

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

  const handleBulkStatusUpdate = (order_status: string) => {
    if (selectedOrders.length === 0) return;
    bulkUpdate.mutate({ ids: selectedOrders, updates: { order_status } }, {
      onSuccess: () => {
        setSelectedOrders([]);
      }
    });
  };

  const handleBulkAction = (action: "soft_delete" | "restore" | "hard_delete" | "steadfast") => {
    if (selectedOrders.length === 0) return;

    if (action === "soft_delete") {
      Promise.all(selectedOrders.map(id => softDelete.mutateAsync(id))).then(() => {
        toast.success(`${selectedOrders.length} orders moved to trash.`);
        setSelectedOrders([]);
      });
    } else if (action === "restore") {
      Promise.all(selectedOrders.map(id => restoreOrder.mutateAsync(id))).then(() => {
        toast.success(`${selectedOrders.length} orders restored.`);
        setSelectedOrders([]);
      });
    } else if (action === "hard_delete") {
      if(window.confirm("Are you sure you want to permanently delete these orders?")) {
        Promise.all(selectedOrders.map(id => hardDelete.mutateAsync(id))).then(() => {
          toast.success(`${selectedOrders.length} orders permanently deleted.`);
          setSelectedOrders([]);
        });
      }
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
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border shadow-sm transition-all duration-300";
    switch (status) {
      case 'pending': return <Badge variant="outline" className={cn(base, "bg-amber-500/10 text-amber-600 border-amber-200/50 hover:bg-amber-500/20")}>Pending</Badge>;
      case 'confirmed': return <Badge variant="outline" className={cn(base, "bg-blue-500/10 text-blue-600 border-blue-200/50 hover:bg-blue-500/20")}>Confirmed</Badge>;
      case 'processing': return <Badge variant="outline" className={cn(base, "bg-indigo-500/10 text-indigo-600 border-indigo-200/50 hover:bg-indigo-500/20")}>Processing</Badge>;
      case 'shipped': return <Badge variant="outline" className={cn(base, "bg-purple-500/10 text-purple-600 border-purple-200/50 hover:bg-purple-500/20")}>Shipped</Badge>;
      case 'delivered': return <Badge variant="outline" className={cn(base, "bg-emerald-500/10 text-emerald-600 border-emerald-200/50 hover:bg-emerald-500/20")}>Delivered</Badge>;
      case 'cancelled': return <Badge variant="outline" className={cn(base, "bg-rose-500/10 text-rose-600 border-rose-200/50 hover:bg-rose-500/20")}>Cancelled</Badge>;
      default: return <Badge variant="outline" className={base}>{status}</Badge>;
    }
  };

  const isLoading = isLoadingActive || isLoadingTrash;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Sticky Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20 py-4 px-6 -mx-4 rounded-3xl border border-white/60 dark:border-slate-700/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-all duration-300">
        <div className="relative group">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500" />
           <h1 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-tight flex items-center gap-3">
             <Package className="w-8 h-8" />
             অর্ডার ম্যানেজমেন্ট
           </h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[9px] mt-0.5 opacity-60 ml-1">
             Real-time inventory & fulfillment hub
           </p>
        </div>
        
        <div className="flex items-center gap-4">
          {steadfastBalance !== undefined && (
            <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-xl border border-indigo-100/50 dark:border-indigo-900/40 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-500">
                 <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-60">Balance</p>
                <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg tracking-tighter">৳{steadfastBalance.toLocaleString() || 0}</p>
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => {
              setSelectedOrderForDialog(null);
              setIsDialogOpen(true);
            }}
            className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            নতুন অর্ডার
          </Button>
        </div>
      </div>

      {/* Analytics Summary - More Glassy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        {[
          { label: "মোট অর্ডার", value: activeOrdersList.length, icon: Package, color: "text-primary", bg: "bg-primary/5", glow: "shadow-primary/5" },
          { label: "পেন্ডিং", value: activeOrdersList.filter(o => (o.order_status || o.status) === 'pending').length, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-500/5", glow: "shadow-amber-500/5" },
          { label: "শিপমেন্টিং", value: activeOrdersList.filter(o => o.steadfast_consignment_id).length, icon: Send, color: "text-indigo-500", bg: "bg-indigo-500/5", glow: "shadow-indigo-500/5" },
          { label: "ডেলিভার্ড", value: activeOrdersList.filter(o => (o.order_status || o.status) === 'delivered').length, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/5", glow: "shadow-emerald-500/5" }
        ].map((stat) => (
          <div key={stat.label} className={cn(
            "p-6 rounded-[2.2rem] bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-slate-700/50 shadow-xl transition-all duration-500 hover:-translate-y-1.5 group overflow-hidden",
            stat.glow
          )}>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] opacity-60">{stat.label}</p>
                 <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                 <stat.icon className="h-7 w-7" />
              </div>
            </div>
            {/* Visual accent */}
            <div className={cn("mt-4 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700/30 overflow-hidden")}>
                <div className={cn("h-full w-2/3 rounded-full transition-all duration-1000", stat.bg.replace('/5', ''))} style={{ width: `${(stat.value / (activeOrdersList.length || 1)) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full space-y-8 px-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl p-1.5 rounded-full border border-white/60 dark:border-slate-700/50 h-auto flex-wrap w-fit shadow-lg shadow-black/5">
            <TabsTrigger value="active" className="rounded-full px-8 py-3 text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-sm">
              সক্রিয় ফিল্ড ({activeOrdersList.length})
            </TabsTrigger>
            <TabsTrigger value="trash" className="rounded-full px-8 py-3 text-[11px] font-black uppercase tracking-wider data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all shadow-sm">
              আর্কাইভ / ট্র্যাশ ({trashOrdersList.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-4">
             {selectedOrders.length > 0 && (
               <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500 bg-primary/5 dark:bg-primary/10 pl-5 pr-2 py-1.5 rounded-full border border-primary/20 shadow-lg shadow-primary/5">
                 <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">
                   {selectedOrders.length} Selected
                 </span>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="default" size="sm" className="h-9 px-4 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-primary/20">
                       Bulk Operations <MoreHorizontal className="h-3 w-3 ml-2" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 border-white/40 dark:border-slate-700/40 backdrop-blur-2xl shadow-3xl">
                     <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-500/60 px-3 py-2">Batch Status Update</DropdownMenuLabel>
                     <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')} className="font-bold rounded-xl p-3 focus:bg-indigo-50 text-slate-700">Processing</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')} className="font-bold rounded-xl p-3 focus:bg-purple-50 text-slate-700">Shipped</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleBulkStatusUpdate('delivered')} className="font-bold rounded-xl p-3 focus:bg-emerald-50 text-slate-700">Delivered</DropdownMenuItem>
                     <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')} className="font-bold rounded-xl p-3 text-rose-500 focus:bg-rose-50">Cancelled</DropdownMenuItem>
                     <DropdownMenuSeparator className="my-2 opacity-50" />
                     
                     <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-500/60 px-3 py-2">Entity Control</DropdownMenuLabel>
                     {activeTab === "active" ? (
                       <>
                        <DropdownMenuItem onClick={() => handleBulkAction('steadfast')} className="text-indigo-600 font-bold rounded-xl p-3 focus:bg-indigo-50">
                          <Send className="mr-3 h-4 w-4" /> Send to Courier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('soft_delete')} className="text-rose-600 font-bold rounded-xl p-3 focus:bg-rose-50">
                          <Trash2 className="mr-3 h-4 w-4" /> Move to Archive
                        </DropdownMenuItem>
                       </>
                     ) : (
                       <>
                        <DropdownMenuItem onClick={() => handleBulkAction('restore')} className="text-emerald-600 font-bold rounded-xl p-3 focus:bg-emerald-50">
                          <RotateCcw className="mr-3 h-4 w-4" /> Restore Selection
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('hard_delete')} className="text-rose-600 font-bold rounded-xl p-3 focus:bg-rose-50">
                          <Trash2 className="mr-3 h-4 w-4" /> Permanent Delete
                        </DropdownMenuItem>
                       </>
                     )}
                   </DropdownMenuContent>
                 </DropdownMenu>
               </div>
             )}

             <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-all duration-300" />
                <Input
                  placeholder="ID, ফোন বা নাম খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 h-12 bg-white/60 dark:bg-slate-800/60 border-white/60 dark:border-slate-700/50 rounded-2xl text-[12px] font-bold shadow-lg shadow-black/5 focus-visible:ring-primary/20 backdrop-blur-xl transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className="h-6 w-6 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-slate-600/50">
                      <Filter className="h-3 w-3 text-slate-400" />
                   </div>
                </div>
             </div>

             <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] h-12 bg-white/60 dark:bg-slate-800/60 border-white/60 dark:border-slate-700/50 rounded-2xl text-[10px] font-black uppercase tracking-widest pl-6 shadow-lg shadow-black/5 focus:ring-primary/20 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-white/40 dark:border-slate-700/50 p-2 shadow-3xl backdrop-blur-2xl">
                  <SelectItem value="all" className="rounded-xl p-3 text-[10px] font-black uppercase">সব স্ট্যাটাস</SelectItem>
                  <SelectItem value="pending" className="rounded-xl p-3 text-[10px] font-black uppercase">Pending Orders</SelectItem>
                  <SelectItem value="confirmed" className="rounded-xl p-3 text-[10px] font-black uppercase">Confirmed</SelectItem>
                  <SelectItem value="processing" className="rounded-xl p-3 text-[10px] font-black uppercase">Processing</SelectItem>
                  <SelectItem value="shipped" className="rounded-xl p-3 text-[10px] font-black uppercase">Shipped Out</SelectItem>
                  <SelectItem value="delivered" className="rounded-xl p-3 text-[10px] font-black uppercase text-emerald-600">Delivered</SelectItem>
                  <SelectItem value="cancelled" className="rounded-xl p-3 text-[10px] font-black uppercase text-rose-500">Cancelled</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          <Card className="border-none bg-white/40 dark:bg-slate-800/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/5 overflow-hidden border border-white/40 dark:border-slate-700/30">
            <div className="overflow-x-auto no-scrollbar">
                <Table>
                    <TableHeader className="bg-slate-100/30 dark:bg-slate-900/30">
                      <TableRow className="hover:bg-transparent border-slate-100/50 dark:border-slate-700/50">
                        <TableHead className="w-12 pl-8">
                          <Checkbox 
                            checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                            onCheckedChange={toggleSelectAll}
                            className="rounded-md border-slate-300 data-[state=checked]:bg-primary"
                          />
                        </TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 py-6 min-w-[200px]">Order Record</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 min-w-[150px]">Customer Hub</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">Quantity</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">Status</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-widest text-slate-500">Logistics Status</TableHead>
                        <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-widest text-slate-500">Operations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={7} className="p-8">
                              <div className="flex items-center gap-6">
                                <Skeleton className="h-6 w-6 rounded-md" />
                                <div className="space-y-2 flex-1">
                                  <Skeleton className="h-5 w-[150px] rounded-lg" />
                                  <Skeleton className="h-3 w-[100px] rounded-md opacity-50" />
                                </div>
                                <Skeleton className="h-10 w-[200px] rounded-xl" />
                                <Skeleton className="h-8 w-[80px] rounded-full" />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-96 text-center">
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                              <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <Package className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                              </div>
                              <h3 className="text-xl font-black text-slate-400 uppercase tracking-tight">অর্ডার পাওয়া যায়নি</h3>
                              <p className="text-sm font-bold text-slate-400/60 mt-2">Try adjusting your filters or search query</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map(order => (
                          <TableRow key={order.id} className="group hover:bg-white/40 dark:hover:bg-slate-700/20 transition-all duration-300 border-slate-50 dark:border-slate-800">
                            <TableCell className="pl-8">
                              <Checkbox 
                                checked={selectedOrders.includes(order.id)} 
                                onCheckedChange={() => toggleSelect(order.id)}
                                className="rounded-md border-slate-300 data-[state=checked]:bg-primary transition-transform duration-500 group-hover:scale-110"
                              />
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex flex-col space-y-1.5">
                                <Link to={`#`} onClick={(e) => {e.preventDefault(); handleOpenDialog(order);}} className="font-black text-primary text-base tracking-tighter hover:underline">
                                  {order.order_number?.startsWith('#') ? order.order_number : `#${order.order_number || order.id.slice(0,8).toUpperCase()}`}
                                </Link>
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] opacity-80">
                                   <Clock className="w-3 h-3" />
                                   {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy", { locale: bn }) : 'Unknown Date'}
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
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-black text-[9px] bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 px-3 py-0.5 rounded-full border-none">
                                {order.items?.length || 0} ITEMS
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                                {getStatusBadge(order.order_status || order.status)}
                            </TableCell>
                            <TableCell className="text-center">
                                {order.steadfast_consignment_id ? (
                                  <div className="flex flex-col items-center gap-1.5">
                                     <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-600 rounded-full border border-indigo-200/50">
                                       <Truck className="w-3 h-3" />
                                       <span className="text-[8px] font-black uppercase tracking-widest">Courier In Transit</span>
                                     </div>
                                     <span className="text-[8px] font-bold text-slate-400/60 tabular-nums">#{order.steadfast_consignment_id}</span>
                                  </div>
                                ) : (
                                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Waiting for Booking</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right pr-8">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                 <Button
                                   variant="outline"
                                   size="icon"
                                   className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md active:scale-95"
                                   onClick={() => handleOpenDialog(order)}
                                 >
                                    <Eye className="h-4 w-4" />
                                 </Button>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 transition-all shadow-md active:scale-95">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2 border-white/40 dark:border-slate-700/40 backdrop-blur-2xl shadow-3xl">
                                      <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-slate-500/60 px-3 py-2">Fulfillment Control</DropdownMenuLabel>
                                      
                                      <div className="grid grid-cols-2 gap-1.5 p-1 mb-2">
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="text-[8px] h-9 rounded-xl font-black uppercase tracking-normal border-blue-100 hover:bg-blue-50 hover:text-blue-600 transition-all">Confirm</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'processing')} className="text-[8px] h-9 rounded-xl font-black uppercase tracking-normal border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all">Process</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'shipped')} className="text-[8px] h-9 rounded-xl font-black uppercase tracking-normal border-purple-100 hover:bg-purple-50 hover:text-purple-600 transition-all">Ship</Button>
                                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'delivered')} className="text-[8px] h-9 rounded-xl font-black uppercase tracking-normal border-emerald-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all">Deliver</Button>
                                      </div>

                                      <DropdownMenuSeparator className="opacity-50" />
                                      
                                      {activeTab === 'active' && !order.steadfast_consignment_id && (
                                        <DropdownMenuItem 
                                          onClick={() => sendToSteadfast({ orderId: order.id, orderData: order })}
                                          disabled={isSendingSteadfast}
                                          className="rounded-xl font-bold p-3 text-indigo-600 focus:bg-indigo-50"
                                        >
                                          <Send className="mr-3 h-4 w-4" /> Book Courier
                                        </DropdownMenuItem>
                                      )}
    
                                      {activeTab === 'active' ? (
                                        <DropdownMenuItem onClick={() => {
                                          if(window.confirm('Move this order to archive?')) {
                                            softDelete.mutate(order.id);
                                          }
                                        }} className="text-rose-600 focus:bg-rose-50 font-bold rounded-xl p-3">
                                          <Trash2 className="mr-3 h-4 w-4" /> Archive Record
                                        </DropdownMenuItem>
                                      ) : (
                                        <>
                                          <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="text-emerald-600 focus:bg-emerald-50 font-bold rounded-xl p-3">
                                            <RotateCcw className="mr-3 h-4 w-4" /> Restore Order
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => {
                                            if(window.confirm('This action cannot be undone. Permanent delete?')) { hardDelete.mutate(order.id); }
                                          }} className="text-rose-600 focus:bg-rose-50 font-bold rounded-xl p-3">
                                            <Trash2 className="mr-3 h-4 w-4" /> Erase Data
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                 </DropdownMenu>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedOrderForDialog && (
        <OrderDialog
          order={selectedOrderForDialog}
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedOrderForDialog(null);
          }}
        />
      )}
    </div>
  );
}