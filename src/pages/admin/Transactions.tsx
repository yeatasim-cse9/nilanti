import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { bn } from "date-fns/locale";
import { 
  Search, 
  Trash2, 
  RotateCcw, 
  Send, 
  MoreHorizontal, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Wallet, 
  CreditCard, 
  MapPin,
  TrendingUp,
  Receipt,
  FileText,
  ArrowLeftRight,
  Phone,
  Truck,
  Clock,
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
import { Card, CardContent } from "@/components/ui/card";
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

  const { data: activeOrdersList = [], isLoading: isLoadingActive } = useOrders();
  const { data: trashOrdersList = [], isLoading: isLoadingTrash } = useTrashOrders();
  const { data: steadfastBalance } = useSteadfastBalance();

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
        toast.success(`${selectedOrders.length} টি ট্র্যাশে সরানো হয়েছে`);
        setSelectedOrders([]);
      });
    } else if (action === "restore") {
      Promise.all(selectedOrders.map(id => restoreOrder.mutateAsync(id))).then(() => {
        toast.success(`${selectedOrders.length} টি রিস্টোর হয়েছে`);
        setSelectedOrders([]);
      });
    } else if (action === "steadfast") {
      if(window.confirm(`${selectedOrders.length} টি অর্ডার কুরিয়ারে পাঠাবেন?`)) {
        selectedOrders.forEach(id => {
          const order = currentList.find(o => o.id === id);
          if (order && !order.steadfast_consignment_id) {
            sendToSteadfast({ orderId: id, orderData: order });
          }
        });
        setSelectedOrders([]);
      }
    } else {
      bulkUpdate.mutate({ ids: selectedOrders, updates: { order_status: action } }, {
        onSuccess: () => setSelectedOrders([])
      });
    }
  };

  const handleFraudCheck = async (order: AdminOrder) => {
    if (!order.customer_phone) return toast.error('ফোন পাওয়া যায়নি');
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

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, { bg: string; text: string; border: string }> = {
      paid: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      partial: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
      unpaid: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
      refunded: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    };
    const v = variants[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    return (
      <Badge variant="outline" className={cn("px-2.5 py-0.5 text-[11px] font-semibold rounded-full border capitalize", v.bg, v.text, v.border)}>
        {status}
      </Badge>
    );
  };

  const isLoading = isLoadingActive || isLoadingTrash;
  const collectedPercent = statistics.totalSales > 0 ? Math.round((statistics.totalCollected / statistics.totalSales) * 100) : 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            ট্রানজ্যাকশন
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ফিনান্সিয়াল ও পেমেন্ট ম্যানেজমেন্ট
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {steadfastBalance !== undefined && (
            <Card className="border-indigo-200 bg-indigo-50">
              <CardContent className="py-2 px-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                <div>
                  <p className="text-[10px] text-indigo-500 font-medium uppercase">Courier Balance</p>
                  <p className="font-bold text-indigo-700 text-sm">৳{steadfastBalance.toLocaleString() || 0}</p>
                </div>
              </CardContent>
            </Card>
          )}
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <FileText className="w-4 h-4" />
            রিপোর্ট
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "মোট বিক্রি", value: `৳${statistics.totalSales.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", borderColor: "border-primary/20" },
          { label: "কালেকটেড", value: `৳${statistics.totalCollected.toLocaleString()}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-200", sub: `${collectedPercent}% সম্পন্ন` },
          { label: "কুরিয়ারে আছে", value: `৳${statistics.courierPipeline.toLocaleString()}`, icon: Truck, color: "text-indigo-600", bg: "bg-indigo-50", borderColor: "border-indigo-200" },
          { label: "পেন্ডিং", value: statistics.pendingCount, icon: ShieldAlert, color: "text-rose-600", bg: "bg-rose-50", borderColor: "border-rose-200" },
        ].map((stat) => (
          <Card key={stat.label} className={cn("border", stat.borderColor)}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {stat.sub && <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{stat.sub}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="active">সক্রিয়</TabsTrigger>
            <TabsTrigger value="trash">ট্র্যাশ</TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-3">
            {selectedOrders.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/5 pl-4 pr-2 py-1.5 rounded-lg border border-primary/20">
                <span className="text-xs font-semibold text-primary">{selectedOrders.length} সিলেক্টেড</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm" className="h-8 px-3 rounded-lg text-xs gap-1">
                      অ্যাকশন <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">স্ট্যাটাস আপডেট</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => handleBulkAction('processing')}>Processing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('shipped')}>Shipped</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkAction('delivered')} className="text-emerald-600">Delivered</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {activeTab === 'active' ? (
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
                          <RotateCcw className="mr-2 h-4 w-4" /> রিস্টোর
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="স্ট্যাটাস" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[140px] h-10">
                <SelectValue placeholder="পেমেন্ট" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">সব পেমেন্ট</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
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
                      <Checkbox checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.length} onCheckedChange={toggleSelectAll} />
                    </TableHead>
                    <TableHead className="font-semibold text-xs">ট্রানজ্যাকশন</TableHead>
                    <TableHead className="font-semibold text-xs">কাস্টমার</TableHead>
                    <TableHead className="font-semibold text-xs">ফিনান্স</TableHead>
                    <TableHead className="text-center font-semibold text-xs">রিস্ক/কুরিয়ার</TableHead>
                    <TableHead className="text-center font-semibold text-xs">স্ট্যাটাস</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={7} className="p-6">
                          <Skeleton className="h-10 w-full rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Receipt className="h-10 w-10 text-muted-foreground/30 mb-4" />
                          <p className="font-medium text-muted-foreground">কোনো ট্রানজ্যাকশন পাওয়া যায়নি</p>
                          <p className="text-sm text-muted-foreground/60 mt-1">ফিল্টার পরিবর্তন করুন</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map(order => {
                      const tAmt = order.total_amount || 0;
                      const pAmt = order.payment_status === "paid" ? tAmt : (order.advance_payment || order.paid_amount || 0);
                      const dAmt = tAmt - pAmt;

                      return (
                        <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6">
                            <Checkbox checked={selectedOrders.includes(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col gap-1">
                              <span className="font-bold text-primary text-sm">
                                {order.order_number?.startsWith('#') ? order.order_number : `#${order.order_number || order.id.slice(-8).toUpperCase()}`}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy") : '—'}
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
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold">৳{tAmt.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-emerald-600 font-semibold">৳{pAmt.toLocaleString()}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className={cn("font-semibold", dAmt > 0 ? 'text-rose-600' : 'text-muted-foreground')}>৳{dAmt.toLocaleString()}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {order.fraud_risk === 'high' ? (
                                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">HIGH RISK</Badge>
                              ) : order.fraud_risk === 'medium' ? (
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">MID RISK</Badge>
                              ) : order.fraud_risk === 'low' ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">STABLE</Badge>
                              ) : (
                                <Button variant="ghost" className="h-6 text-xs text-muted-foreground underline" onClick={() => handleFraudCheck(order)}>চেক করুন</Button>
                              )}
                              {order.steadfast_consignment_id && (
                                <span className="text-[10px] text-muted-foreground">#{order.steadfast_consignment_id}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {getStatusBadge(order.order_status || order.status)}
                              {getPaymentBadge(order.payment_status || 'unpaid')}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg hover:bg-muted"
                                onClick={() => openDialog('details', order)}
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
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">ম্যানেজমেন্ট</DropdownMenuLabel>
                                  
                                  <DropdownMenuItem onClick={() => openDialog('details', order)} className="gap-2">
                                    <FileText className="w-4 h-4 text-primary" /> বিস্তারিত দেখুন
                                  </DropdownMenuItem>

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem onClick={() => openDialog('collect', order)} disabled={order.payment_status === 'paid'} className="gap-2">
                                    <Wallet className="w-4 h-4 text-emerald-600" /> পেমেন্ট কালেক্ট
                                  </DropdownMenuItem>

                                  <DropdownMenuItem onClick={() => openDialog('refund', order)} className="gap-2">
                                    <ArrowLeftRight className="w-4 h-4 text-rose-500" /> রিফান্ড
                                  </DropdownMenuItem>

                                  {order.steadfast_consignment_id && (
                                    <DropdownMenuItem onClick={() => openDialog('tracking', order)} className="text-indigo-600 gap-2">
                                      <MapPin className="w-4 h-4" /> ট্র্যাকিং
                                    </DropdownMenuItem>
                                  )}

                                  <DropdownMenuSeparator />
                                  
                                  {activeTab === 'active' ? (
                                    <DropdownMenuItem onClick={() => softDelete.mutate(order.id)} className="text-rose-600 gap-2">
                                      <Trash2 className="w-4 h-4" /> ট্র্যাশে সরান
                                    </DropdownMenuItem>
                                  ) : (
                                    <>
                                      <DropdownMenuItem onClick={() => restoreOrder.mutate(order.id)} className="text-emerald-600 gap-2">
                                        <RotateCcw className="w-4 h-4" /> রিস্টোর
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => hardDelete.mutate(order.id)} className="text-rose-600 gap-2">
                                        <Trash2 className="w-4 h-4" /> স্থায়ী ডিলিট
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

      {/* Dialogs */}
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
