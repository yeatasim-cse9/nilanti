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

  const { data: activeOrdersList = [], isLoading: isLoadingActive } = useOrders();
  const { data: trashOrdersList = [], isLoading: isLoadingTrash } = useTrashOrders();
  const { data: steadfastBalance } = useSteadfastBalance();

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
      onSuccess: () => setSelectedOrders([])
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
    const variants: Record<string, { bg: string; text: string; border: string }> = {
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      processing: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      shipped: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      cancelled: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
    };
    const v = variants[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    return (
      <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize", v.bg, v.text, v.border)}>
        {status}
      </Badge>
    );
  };

  const isLoading = isLoadingActive || isLoadingTrash;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            অর্ডার ম্যানেজমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            রিয়েল-টাইম অর্ডার ট্র্যাকিং ও ফুলফিলমেন্ট
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {steadfastBalance !== undefined && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="py-2 px-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase">Balance</p>
                  <p className="font-bold text-indigo-700 text-sm">৳{steadfastBalance.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Button 
            onClick={() => {
              setSelectedOrderForDialog(null);
              setIsDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            নতুন অর্ডার
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "মোট অর্ডার", value: activeOrdersList.length, icon: Package, color: "text-primary", bg: "bg-primary/10", borderColor: "border-primary/20" },
          { label: "পেন্ডিং", value: activeOrdersList.filter(o => (o.order_status || o.status) === 'pending').length, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50", borderColor: "border-amber-200" },
          { label: "শিপমেন্ট", value: activeOrdersList.filter(o => o.steadfast_consignment_id).length, icon: Send, color: "text-indigo-600", bg: "bg-indigo-50", borderColor: "border-indigo-200" },
          { label: "ডেলিভার্ড", value: activeOrdersList.filter(o => (o.order_status || o.status) === 'delivered').length, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-200" },
        ].map((stat) => (
          <Card key={stat.label} className={cn("border", stat.borderColor)}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="active">
              সক্রিয় ({activeOrdersList.length})
            </TabsTrigger>
            <TabsTrigger value="trash">
              ট্র্যাশ ({trashOrdersList.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/5 pl-4 pr-2 py-1.5 rounded-lg border border-primary/20">
                <span className="text-xs font-semibold text-primary">
                  {selectedOrders.length} সিলেক্টেড
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="h-8 px-3 rounded-lg text-xs gap-1">
                      অ্যাকশন <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">স্ট্যাটাস আপডেট</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('processing')}>Processing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('shipped')}>Shipped</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('delivered')}>Delivered</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatusUpdate('cancelled')} className="text-rose-600">Cancelled</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-xs text-muted-foreground">ব্যাচ অ্যাকশন</DropdownMenuLabel>
                    {activeTab === "active" ? (
                      <>
                        <DropdownMenuItem onClick={() => handleBulkAction('steadfast')} className="text-indigo-600">
                          <Send className="mr-2 h-4 w-4" /> কুরিয়ারে পাঠান
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('soft_delete')} className="text-rose-600">
                          <Trash2 className="mr-2 h-4 w-4" /> ট্র্যাশে সরান
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => handleBulkAction('restore')} className="text-emerald-600">
                          <RotateCcw className="mr-2 h-4 w-4" /> রিস্টোর করুন
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleBulkAction('hard_delete')} className="text-rose-600">
                          <Trash2 className="mr-2 h-4 w-4" /> স্থায়ীভাবে ডিলিট
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ID, ফোন বা নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-10">
                <SelectValue placeholder="সব স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 pl-6">
                      <Checkbox 
                        checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-xs">অর্ডার</TableHead>
                    <TableHead className="font-semibold text-xs">কাস্টমার</TableHead>
                    <TableHead className="text-center font-semibold text-xs">আইটেম</TableHead>
                    <TableHead className="text-center font-semibold text-xs">স্ট্যাটাস</TableHead>
                    <TableHead className="text-center font-semibold text-xs">কুরিয়ার</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="p-6">
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-4 w-[120px] rounded" />
                            <Skeleton className="h-4 w-[100px] rounded" />
                            <Skeleton className="h-6 w-[70px] rounded-full ml-auto" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-10 w-10 text-muted-foreground/30 mb-4" />
                          <h3 className="text-lg font-semibold text-muted-foreground">অর্ডার পাওয়া যায়নি</h3>
                          <p className="text-sm text-muted-foreground/60 mt-1">ফিল্টার বা সার্চ পরিবর্তন করুন</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map(order => (
                      <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="pl-6">
                          <Checkbox 
                            checked={selectedOrders.includes(order.id)} 
                            onCheckedChange={() => toggleSelect(order.id)}
                          />
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col gap-1">
                            <Link to="#" onClick={(e) => {e.preventDefault(); handleOpenDialog(order);}} className="font-bold text-primary hover:underline text-sm">
                              {order.order_number?.startsWith('#') ? order.order_number : `#${order.order_number || order.id.slice(0,8).toUpperCase()}`}
                            </Link>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy", { locale: bn }) : '—'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm">{order.customer_name || "Guest"}</span>
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {order.customer_phone || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-xs">
                            {order.items?.length || 0} টি
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(order.order_status || order.status)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.steadfast_consignment_id ? (
                            <div className="flex flex-col items-center gap-1">
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs gap-1">
                                <Truck className="w-3 h-3" />
                                কুরিয়ারে
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">#{order.steadfast_consignment_id}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">বুকিং হয়নি</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-muted"
                              onClick={() => handleOpenDialog(order)}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">স্ট্যাটাস পরিবর্তন</DropdownMenuLabel>
                                
                                <div className="grid grid-cols-2 gap-1 p-1 mb-1">
                                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'confirmed')} className="text-xs h-8">Confirm</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'processing')} className="text-xs h-8">Process</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'shipped')} className="text-xs h-8">Ship</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(order.id, 'delivered')} className="text-xs h-8">Deliver</Button>
                                </div>

                                <DropdownMenuSeparator />
                                
                                {activeTab === 'active' && !order.steadfast_consignment_id && (
                                  <DropdownMenuItem 
                                    onClick={() => sendToSteadfast({ orderId: order.id, orderData: order })}
                                    disabled={isSendingSteadfast}
                                    className="text-indigo-600"
                                  >
                                    <Send className="mr-2 h-4 w-4" /> কুরিয়ারে পাঠান
                                  </DropdownMenuItem>
                                )}
  
                                {activeTab === 'active' ? (
                                  <DropdownMenuItem onClick={() => {
                                    if(window.confirm('ট্র্যাশে সরাতে চান?')) {
                                      softDelete.mutate(order.id);
                                    }
                                  }} className="text-rose-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> ট্র্যাশে সরান
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="text-emerald-600">
                                      <RotateCcw className="mr-2 h-4 w-4" /> রিস্টোর
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                      if(window.confirm('স্থায়ীভাবে ডিলিট করতে চান?')) { hardDelete.mutate(order.id); }
                                    }} className="text-rose-600">
                                      <Trash2 className="mr-2 h-4 w-4" /> স্থায়ী ডিলিট
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