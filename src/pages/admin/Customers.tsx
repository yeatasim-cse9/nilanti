import { useState, useMemo } from "react";
import { 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingBag, 
  CreditCard, 
  User, 
  MoreHorizontal, 
  Eye, 
  TrendingUp,
  MapPin,
  Ban,
  Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomers, useOrders } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter, subDays } from "date-fns";
import { bn } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AdminCustomers = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { data: customers, isLoading: isCustomersLoading } = useCustomers();
  const { data: orders = [], isLoading: isOrdersLoading } = useOrders();

  const enrichedCustomers = useMemo(() => {
    if (!customers) return [];
    
    const customerStats = new Map<string, { totalOrders: number; totalSpent: number; orders: any[]; lastOrderDate: string | null }>();
    
    orders.forEach((order: any) => {
      const key = order.user_id || order.customer_phone || order.customer_email;
      if (!key) return;
      
      const current = customerStats.get(key) || { totalOrders: 0, totalSpent: 0, orders: [], lastOrderDate: null };
      current.totalOrders += 1;
      current.totalSpent += Number(order.total_amount || 0);
      current.orders.push(order);
      
      const orderDate = order.created_at;
      if (!current.lastOrderDate || (orderDate && isAfter(new Date(orderDate), new Date(current.lastOrderDate)))) {
        current.lastOrderDate = orderDate;
      }
      
      customerStats.set(key, current);
    });

    return customers.map((c: any) => {
      const statsMatch1 = customerStats.get(c.id);
      const statsMatch2 = c.phone ? customerStats.get(c.phone) : null;
      const statsMatch3 = c.email ? customerStats.get(c.email) : null;
      
      const stats = statsMatch1 || statsMatch2 || statsMatch3 || { totalOrders: 0, totalSpent: 0, orders: [], lastOrderDate: null };
      
      stats.orders.sort((a, b) => {
         const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
         const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
         return dateB - dateA;
      });

      return { ...c, ...stats };
    }).sort((a: any, b: any) => b.totalSpent - a.totalSpent);
  }, [customers, orders]);

  const filteredCustomers = useMemo(() => {
    return enrichedCustomers.filter((customer: any) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        customer.full_name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.includes(query)
      );

      if (!matchesSearch) return false;

      if (activeTab === "all") return true;
      if (activeTab === "active") return customer.totalOrders > 0;
      if (activeTab === "new") {
        const joinDate = customer.created_at ? new Date(customer.created_at) : null;
        return joinDate && isAfter(joinDate, subDays(new Date(), 30));
      }
      if (activeTab === "admins") return customer.role === "admin";
      
      return true;
    });
  }, [enrichedCustomers, searchQuery, activeTab]);

  const stats = useMemo(() => {
    if (!enrichedCustomers) return { total: 0, totalValue: 0, activeBuyers: 0, newGrowth: 0 };
    const totalValue = enrichedCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const activeBuyers = enrichedCustomers.filter(c => c.totalOrders > 0).length;
    const newCustomers = enrichedCustomers.filter(c => {
       const joinDate = c.created_at ? new Date(c.created_at) : null;
       return joinDate && isAfter(joinDate, subDays(new Date(), 30));
    }).length;

    return { total: enrichedCustomers.length, totalValue, activeBuyers, newGrowth: newCustomers };
  }, [enrichedCustomers]);

  const handleViewProfile = (customer: any) => {
    setSelectedCustomer(customer);
    setIsProfileOpen(true);
  };

  const isLoading = isCustomersLoading || isOrdersLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            কাস্টমার ডিরেক্টরি
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            কাস্টমার ইনসাইট ও CRM ম্যানেজমেন্ট
          </p>
        </div>
        <Badge variant="secondary" className="text-sm px-4 py-1.5">
          {stats.total} কাস্টমার
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "মোট কাস্টমার", value: stats.total, icon: User, color: "text-primary", bg: "bg-primary/10", borderColor: "border-primary/20" },
          { label: "অ্যাকটিভ বায়ার", value: stats.activeBuyers, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50", borderColor: "border-emerald-200" },
          { label: "নতুন (৩০ দিন)", value: stats.newGrowth, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", borderColor: "border-blue-200" },
          { label: "মোট সেলস", value: `৳${stats.totalValue.toLocaleString()}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50", borderColor: "border-purple-200" },
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

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">সব</TabsTrigger>
            <TabsTrigger value="active">অ্যাকটিভ</TabsTrigger>
            <TabsTrigger value="new">নতুন</TabsTrigger>
            <TabsTrigger value="admins">অ্যাডমিন</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="নাম, ফোন বা ইমেইল..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-xs pl-6">কাস্টমার</TableHead>
                    <TableHead className="font-semibold text-xs">যোগাযোগ</TableHead>
                    <TableHead className="text-center font-semibold text-xs">অর্ডার</TableHead>
                    <TableHead className="text-right font-semibold text-xs">মোট খরচ</TableHead>
                    <TableHead className="text-center font-semibold text-xs">স্ট্যাটাস</TableHead>
                    <TableHead className="text-right pr-6 font-semibold text-xs">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <User className="h-10 w-10 text-muted-foreground/30 mb-4" />
                          <p className="font-medium text-muted-foreground">কোনো কাস্টমার পাওয়া যায়নি</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer: any) => (
                      <TableRow key={customer.id} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => handleViewProfile(customer)}>
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative">
                              {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover rounded-full" />
                              ) : (
                                <span className="font-bold text-primary text-sm">
                                  {(customer.full_name || "U").charAt(0)}
                                </span>
                              )}
                              <div className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                                customer.role === 'admin' ? "bg-rose-500" : "bg-emerald-500"
                              )} />
                            </div>
                            <div>
                              <span className="font-semibold text-sm">{customer.full_name || "Guest"}</span>
                              <p className="text-[10px] text-muted-foreground">ID: {customer.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <Phone className="h-3 w-3 text-muted-foreground" /> {customer.phone || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate max-w-[180px]">
                              <Mail className="h-3 w-3" /> {customer.email || '—'}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <span className="font-bold text-lg">{customer.totalOrders}</span>
                        </TableCell>

                        <TableCell className="text-right">
                          <span className="font-bold text-primary">৳{customer.totalSpent.toLocaleString()}</span>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold rounded-full capitalize",
                              customer.role === 'admin' 
                                ? "bg-rose-50 text-rose-700 border-rose-200" 
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            )}
                          >
                            {customer.role || 'Member'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-lg hover:bg-muted"
                              onClick={(e) => { e.stopPropagation(); handleViewProfile(customer); }}
                            >
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">ম্যানেজমেন্ট</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewProfile(customer)} className="gap-2">
                                  <User className="h-4 w-4" /> প্রোফাইল দেখুন
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2">
                                  <Mail className="h-4 w-4" /> নোটিফিকেশন পাঠান
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-600 gap-2">
                                  <Ban className="h-4 w-4" /> সাসপেন্ড করুন
                                </DropdownMenuItem>
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

      {/* Profile Detail Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCustomer && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {selectedCustomer.avatar_url ? (
                      <img src={selectedCustomer.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-xl font-bold text-primary">{(selectedCustomer.full_name || 'U').charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedCustomer.full_name || "Guest"}</h2>
                    <p className="text-sm text-muted-foreground font-normal">{selectedCustomer.email || 'ইমেইল নেই'}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "মোট খরচ", value: `৳${selectedCustomer.totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
                  { label: "গড় অর্ডার", value: `৳${selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString() : 0}`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "মোট অর্ডার", value: selectedCustomer.totalOrders, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-muted/50 border flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", item.bg)}>
                      <item.icon className={cn("h-4 w-4", item.color)} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="p-4 rounded-xl bg-muted/50 border space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase">যোগাযোগ তথ্য</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.phone || 'নেই'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.created_at ? format(new Date(selectedCustomer.created_at), "dd MMMM, yyyy", { locale: bn }) : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedCustomer.address || selectedCustomer.orders?.[0]?.shipping_address || 'ঠিকানা নেই'}</span>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                  অর্ডার ইতিহাস ({selectedCustomer.totalOrders})
                </h3>
                <ScrollArea className="max-h-[300px]">
                  <div className="space-y-3">
                    {selectedCustomer.orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">কোনো অর্ডার নেই</p>
                      </div>
                    ) : (
                      selectedCustomer.orders.map((order: any) => (
                        <div key={order.id} className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-semibold text-sm">#{order.id.slice(-8)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy") : '—'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex items-center gap-3">
                              <Badge 
                                variant="outline"
                                className={cn(
                                  "text-xs font-semibold rounded-full capitalize",
                                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                                  'bg-amber-50 text-amber-700 border-amber-200'
                                )}
                              >
                                {order.status || 'pending'}
                              </Badge>
                              <span className="font-bold text-primary">৳{Number(order.total_amount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
