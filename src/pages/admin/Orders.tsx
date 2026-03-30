import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { Search, Filter, Package, Trash2, RotateCcw, Send, MoreHorizontal, Eye, ShieldAlert } from "lucide-react";
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

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateOrder.mutate({ id: orderId, status });
  };

  const currentList = activeTab === "active" ? activeOrdersList : trashOrdersList;

  const filteredOrders = useMemo(() => {
    return currentList.filter(order => {
      const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.customer_phone?.includes(searchQuery) ||
                          order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || order.status === statusFilter;
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

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedOrders.length === 0) return;
    bulkUpdate.mutate({ ids: selectedOrders, updates: { status } }, {
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
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>;
      case 'processing': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Processing</Badge>;
      case 'shipped': return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Shipped</Badge>;
      case 'delivered': return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Delivered</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isLoading = isLoadingActive || isLoadingTrash;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
            অর্ডার ফুলফিলমেন্ট
          </h1>
          <p className="text-muted-foreground mt-1">
            নতুন অর্ডার পরিচালনা এবং Steadfast কুরিয়ার বুকিং
          </p>
        </div>
        
        {steadfastBalance && (
          <div className="bg-white/60 backdrop-blur border border-indigo-100 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <Package className="w-5 h-5 text-indigo-500" />
            <div>
              <p className="text-xs text-slate-500 font-medium leading-none">Steadfast ব্যালেন্স</p>
              <p className="font-bold text-indigo-700 mt-1">৳{steadfastBalance.current_balance?.toLocaleString() || 0}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">মোট অর্ডার</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeOrdersList.length}</div></CardContent>
        </Card>
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">পেন্ডিং</CardTitle>
            <ShieldAlert className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeOrdersList.filter(o => o.status === 'pending').length}</div></CardContent>
        </Card>
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">কুরিয়ারে পাঠানো</CardTitle>
            <Send className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeOrdersList.filter(o => o.steadfast_consignment_id).length}</div></CardContent>
        </Card>
        <Card className="border-white/40 bg-white/60 backdrop-blur shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">ডেলিভার্ড</CardTitle>
            <Package className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeOrdersList.filter(o => o.status === 'delivered').length}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full space-y-4">
        <TabsList className="bg-white/60 backdrop-blur border border-white/40 shadow-sm rounded-xl p-1">
          <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">অ্যাকটিভ ({activeOrdersList.length})</TabsTrigger>
          <TabsTrigger value="trash" className="rounded-lg data-[state=active]:bg-rose-500 data-[state=active]:text-white">ট্র্যাশ ({trashOrdersList.length})</TabsTrigger>
        </TabsList>

        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="অর্ডার আইডি, ফোন বা নাম..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-slate-200 bg-white/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-white/50 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {selectedOrders.length > 0 && (
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" className="border-primary/20 bg-primary/5 text-primary">
                     বাল্ক অ্যাকশন ({selectedOrders.length})
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48">
                   <DropdownMenuLabel>স্ট্যাটাস পরিবর্তন</DropdownMenuLabel>
                   <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')}>Processing করুন</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')}>Shipped করুন</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleBulkStatusUpdate('delivered')}>Delivered করুন</DropdownMenuItem>
                   <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')}>Cancelled করুন</DropdownMenuItem>
                   <DropdownMenuSeparator />
                   
                   {activeTab === "active" ? (
                     <>
                      <DropdownMenuItem onClick={() => handleBulkAction('steadfast')} className="text-indigo-600 font-medium">
                        <Send className="mr-2 h-4 w-4" /> Steadfast-এ পাঠান
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('soft_delete')} className="text-rose-600">
                        <Trash2 className="mr-2 h-4 w-4" /> ট্র্যাশে পাঠান
                      </DropdownMenuItem>
                     </>
                   ) : (
                     <>
                      <DropdownMenuItem onClick={() => handleBulkAction('restore')} className="text-emerald-600">
                        <RotateCcw className="mr-2 h-4 w-4" /> রিস্টোর করুন
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('hard_delete')} className="text-rose-600">
                        <Trash2 className="mr-2 h-4 w-4" /> চিরতরে মুছুন
                      </DropdownMenuItem>
                     </>
                   )}
                 </DropdownMenuContent>
               </DropdownMenu>
            )}
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="w-12 pl-4">
                      <Checkbox 
                        checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>অর্ডার তথ্য</TableHead>
                    <TableHead>কাস্টমার</TableHead>
                    <TableHead className="text-center">আইটেম</TableHead>
                    <TableHead className="text-center">স্ট্যাটাস</TableHead>
                    <TableHead className="text-center">Steadfast</TableHead>
                    <TableHead className="text-right pr-4">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7}><Skeleton className="h-12 w-full" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                        <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        কোনো অর্ডার পাওয়া যায়নি
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map(order => (
                      <TableRow key={order.id} className="group hover:bg-slate-50/80 transition-colors">
                        <TableCell className="pl-4">
                          <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-primary">#{order.id.slice(0,8)}</div>
                          <div className="text-xs text-slate-500">
                            {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy", { locale: bn }) : 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">{order.customer_name}</div>
                          <div className="text-xs font-mono text-slate-500">{order.customer_phone}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="font-semibold">{order.items?.length || 0} টি</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.steadfast_consignment_id ? (
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">Sent to Steadfast</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Not Sent</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>অ্যাকশন</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenDialog(order)}>
                                <Eye className="mr-2 h-4 w-4 text-blue-500" /> বিস্তারিত দেখুন
                              </DropdownMenuItem>

                              {activeTab === 'active' && !order.steadfast_consignment_id && (
                                <DropdownMenuItem 
                                  onClick={() => sendToSteadfast({ orderId: order.id, orderData: order })}
                                  disabled={isSendingSteadfast}
                                >
                                  <Send className="mr-2 h-4 w-4 text-indigo-500" /> Steadfast-এ পাঠান
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuSeparator />
                              
                              <DropdownMenuLabel className="text-xs">স্ট্যাটাস আপডেট</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'pending')}>Pending</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')}>Processing</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')}>Shipped</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')}>Delivered</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'cancelled')}>Cancelled</DropdownMenuItem>

                              <DropdownMenuSeparator />
                              
                              {activeTab === 'active' ? (
                                <DropdownMenuItem onClick={() => {
                                  if(window.confirm('Are you sure you want to move this order to trash?')) {
                                    softDelete.mutate(order.id);
                                  }
                                }} className="text-rose-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> ট্র্যাশে পাঠান
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="text-emerald-600">
                                    <RotateCcw className="mr-2 h-4 w-4" /> রিস্টোর করুন
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    if(window.confirm('Permanently delete this order?')) { hardDelete.mutate(order.id); }
                                  }} className="text-rose-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> চিরতরে মুছুন
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedOrderForDialog && (
        <OrderDialog
          order={selectedOrderForDialog}
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedOrderForDialog(null);
          }}
          onStatusChange={handleStatusUpdate}
        />
      )}
    </div>
  );
}