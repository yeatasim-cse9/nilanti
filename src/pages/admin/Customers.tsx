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
  Filter, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  ShieldCheck,
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useCustomers, useOrders } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isAfter, subDays } from "date-fns";
import { bn } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      
      // Sort orders by date
      stats.orders.sort((a, b) => {
         const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
         const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
         return dateB - dateA;
      });

      return {
        ...c,
        ...stats,
      };
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

    return {
      total: enrichedCustomers.length,
      totalValue,
      activeBuyers,
      newGrowth: newCustomers
    };
  }, [enrichedCustomers]);

  const handleViewProfile = (customer: any) => {
    setSelectedCustomer(customer);
    setIsProfileOpen(true);
  };

  const isLoading = isCustomersLoading || isOrdersLoading;

  if (isLoading) {
    return (
      <div className="space-y-10 max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="relative group">
           <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
           <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
             কাস্টমার ডিরেক্টরি
           </h1>
           <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1 opacity-60">
             Customer Insights & CRM Infrastructure
           </p>
        </div>

        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl border border-white/40 rounded-full px-6 py-3 shadow-xl">
           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
           </div>
           <span className="text-xs font-black uppercase tracking-widest text-slate-600">
             {stats.total} কাস্টমার যুক্ত আছে
           </span>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "মোট কাস্টমার", value: stats.total, icon: User, color: "text-primary", bg: "bg-primary/5", glow: "shadow-primary/5" },
          { label: "অ্যাকটিভ বায়ার", value: stats.activeBuyers, icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/5", glow: "shadow-emerald-500/5" },
          { label: "নতুন যোগফল", value: stats.newGrowth, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/5", glow: "shadow-blue-500/5" },
          { label: "মোট সেলস", value: `৳${stats.totalValue.toLocaleString()}`, icon: CreditCard, color: "text-purple-500", bg: "bg-purple-500/5", glow: "shadow-purple-500/5" }
        ].map((stat) => (
          <Card key={stat.label} className={cn("border-none shadow-xl rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-white/40 overflow-hidden", stat.glow)}>
            <CardContent className="p-8 pb-6 flex items-center justify-between">
              <div className="space-y-1">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{stat.label}</p>
                 <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                 <stat.icon className="h-7 w-7" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <TabsList className="bg-white/50 backdrop-blur-xl p-1 rounded-full border border-white/60 h-auto flex-wrap w-fit">
            <TabsTrigger value="all" className="rounded-full px-8 py-3 text-xs font-black uppercase tracking-normal data-[state=active]:bg-primary data-[state=active]:text-white transition-all shadow-sm">
              সব কাস্টমার
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-full px-8 py-3 text-xs font-black uppercase tracking-normal data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all shadow-sm">
              অ্যাকটিভ
            </TabsTrigger>
            <TabsTrigger value="new" className="rounded-full px-8 py-3 text-xs font-black uppercase tracking-normal data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all shadow-sm">
              নতুন (৩০ দিন)
            </TabsTrigger>
            <TabsTrigger value="admins" className="rounded-full px-8 py-3 text-xs font-black uppercase tracking-normal data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all shadow-sm">
              অ্যাডমিনরা
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-wrap items-center gap-4">
             <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="নাম, ফোন বা ইমেইল..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-white/80 border-white/60 rounded-full text-xs font-bold shadow-sm focus-visible:ring-primary/20"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className="h-6 w-6 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                      <Filter className="h-3 w-3 text-primary/40" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2.5rem] shadow-2xl shadow-primary/[0.02] overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
                <Table className="table-responsive-stack">
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 hidden md:table-header-group">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500 pl-8 py-6">Customer Profile</TableHead>
                        <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500">Contact & Intelligence</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Activity</TableHead>
                        <TableHead className="text-right font-black text-[10px] uppercase tracking-normal text-slate-500">Financials</TableHead>
                        <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Status</TableHead>
                        <TableHead className="text-right pr-8 font-black text-[10px] uppercase tracking-normal text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-96 text-center">
                            <div className="flex flex-col items-center justify-center p-12 text-center opacity-40">
                              <User className="h-16 w-16 mb-6 text-primary" />
                              <h3 className="text-xl font-black text-primary uppercase tracking-tight">No customers found</h3>
                              <p className="text-sm font-bold mt-2">The directory holds no matching user records.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCustomers.map((customer: any) => (
                          <TableRow key={customer.id} className="group hover:bg-slate-50/80 transition-all border-slate-50 cursor-pointer" onClick={() => handleViewProfile(customer)}>
                            <TableCell className="py-6 pl-8" data-label="Profile">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shadow-sm border border-primary/10 relative transition-transform group-hover:scale-105">
                                  {customer.avatar_url ? (
                                    <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover rounded-2xl" />
                                  ) : (
                                    <span className="font-black text-primary text-sm uppercase">
                                      {(customer.full_name || "U").charAt(0)}
                                    </span>
                                  )}
                                  <div className={cn(
                                    "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white",
                                    customer.role === 'admin' ? "bg-rose-500" : "bg-emerald-500"
                                  )} />
                                </div>
                                <div className="flex flex-col text-left">
                                  <span className="font-black text-slate-800 text-base tracking-tight">{customer.full_name || "Guest Account"}</span>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest opacity-60">ID: {customer.id.slice(0, 8)}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell data-label="Intelligence">
                               <div className="space-y-1 md:text-left text-right">
                                  <div className="flex items-center justify-end md:justify-start gap-2 text-xs font-bold text-slate-600">
                                     <Phone className="h-3 w-3 text-primary/40" /> {customer.phone || '—'}
                                  </div>
                                  <div className="flex items-center justify-end md:justify-start gap-2 text-[10px] font-medium text-slate-400 truncate max-w-[180px] ml-auto md:ml-0">
                                     <Mail className="h-3 w-3 text-slate-300" /> {customer.email || '—'}
                                  </div>
                               </div>
                            </TableCell>

                            <TableCell className="text-center" data-label="Activity">
                               <div className="flex flex-col items-end md:items-center">
                                  <span className="font-black text-slate-800 text-lg tracking-tighter">{customer.totalOrders}</span>
                                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest opacity-60">Orders</span>
                               </div>
                            </TableCell>

                            <TableCell className="text-right" data-label="Financials">
                               <div className="flex flex-col items-end">
                                  <span className="font-black text-primary text-lg tracking-tighter">৳{customer.totalSpent.toLocaleString()}</span>
                                  <Badge variant="outline" className="text-[7px] font-black uppercase border-primary/10 bg-primary/5 text-primary tracking-normal px-2 rounded-full">Spent</Badge>
                               </div>
                            </TableCell>

                            <TableCell className="text-center" data-label="Status">
                               <div className="flex flex-col items-end md:items-center gap-1">
                                  <Badge className={cn(
                                    "text-[8px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full border-none",
                                    customer.role === 'admin' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                                  )}>
                                    {customer.role || 'Member'}
                                  </Badge>
                               </div>
                            </TableCell>

                            <TableCell className="text-right pr-8" data-label="Action">
                              <div className="flex items-center justify-end gap-2">
                                 <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-primary/5 hover:text-primary transition-all border border-transparent hover:border-primary/10"
                                   onClick={(e) => { e.stopPropagation(); handleViewProfile(customer); }}
                                 >
                                   <Eye className="h-4 w-4" />
                                 </Button>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-10 w-10 min-h-[44px] min-w-[44px] rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-primary/10 shadow-2xl">
                                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 pb-2 pt-1 opacity-60">Management</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => handleViewProfile(customer)} className="rounded-xl font-bold p-3 gap-3">
                                        <User className="h-4 w-4 text-primary" /> Profile Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="rounded-xl font-bold p-3 gap-3">
                                        <Mail className="h-4 w-4 text-blue-500" /> Send Notification
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="my-2 bg-primary/5" />
                                      <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 font-bold rounded-xl p-3 gap-3">
                                        <Ban className="h-4 w-4" /> Suspend Member
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
          </div>
        </TabsContent>
      </Tabs>

      {/* Profile Detail Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#fcfcfd]">
          {selectedCustomer && (
            <div className="flex flex-col h-[90vh]">
              {/* Header */}
              <div className="bg-primary p-12 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-12 opacity-5">
                    <Users className="h-64 w-64 -mr-20 -mt-20" />
                 </div>
                 <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="w-36 h-36 rounded-[2.5rem] bg-white/20 p-2 backdrop-blur-3xl border border-white/30 shadow-2xl">
                       <div className="w-full h-full rounded-[2rem] bg-white flex items-center justify-center text-primary overflow-hidden">
                          {selectedCustomer.avatar_url ? (
                             <img src={selectedCustomer.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-5xl font-black uppercase tracking-tighter">{(selectedCustomer.full_name || 'U').charAt(0)}</span>
                          )}
                       </div>
                    </div>
                    <div className="text-center md:text-left space-y-3">
                       <div className="flex flex-col md:flex-row items-center gap-4">
                         <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">{selectedCustomer.full_name || "Guest Account"}</h2>
                         <Badge className="bg-white/20 text-white border-white/20 rounded-full px-5 py-1.5 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl">
                            {selectedCustomer.role || 'Member'}
                         </Badge>
                       </div>
                       <p className="text-white/70 font-bold text-lg tracking-tight">{selectedCustomer.email || 'No email associated'}</p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-6 opacity-60 uppercase tracking-widest text-[10px] font-black">
                          <span className="flex items-center gap-3"><Phone className="h-4 w-4" /> {selectedCustomer.phone || 'Unknown'}</span>
                          <span className="flex items-center gap-3"><Calendar className="h-4 w-4" /> Joined {selectedCustomer.created_at ? format(new Date(selectedCustomer.created_at), "dd MMMM, yyyy", { locale: bn }) : 'Unknown'}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Content body split */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
                 {/* Left Column Stats */}
                 <div className="bg-white border-r border-slate-100 p-10 space-y-10 overflow-y-auto no-scrollbar">
                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Account Vital Records</h3>
                       <div className="space-y-4">
                          {[
                            { label: "Total Revenue", value: `৳${selectedCustomer.totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
                            { label: "Avg Ticket", value: `৳${selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString() : 0}`, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/5" },
                            { label: "Order Volume", value: selectedCustomer.totalOrders, icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-500/5" }
                          ].map((item) => (
                            <div key={item.label} className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                               <div>
                                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1 opacity-60">{item.label}</p>
                                  <p className={cn("text-2xl font-black tracking-tighter", item.color)}>{item.value}</p>
                               </div>
                               <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", item.bg)}>
                                  <item.icon className={cn("h-5 w-5", item.color)} />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Delivery Logistics</h3>
                       <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100 space-y-4">
                          <div className="flex gap-4">
                             <MapPin className="h-5 w-5 text-slate-300 shrink-0 mt-1" />
                             <div>
                                <p className="text-[8px] font-black uppercase text-slate-400 mb-1 opacity-60">Recent Shipping Address</p>
                                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                   {selectedCustomer.address || selectedCustomer.orders?.[0]?.shipping_address || 'No location data found'}
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right Column Progress */}
                 <div className="md:col-span-2 flex flex-col overflow-hidden bg-slate-50/30">
                    <div className="p-10 pb-6 border-b border-slate-100 flex items-center justify-between">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60 flex items-center gap-3">
                          Acquisition History <Badge className="bg-slate-200 text-slate-500 border-none">{selectedCustomer.totalOrders}</Badge>
                       </h3>
                    </div>
                    <ScrollArea className="flex-1 px-10 pt-4">
                       <div className="space-y-6 pb-12">
                          {selectedCustomer.orders.length === 0 ? (
                             <div className="h-64 flex flex-col items-center justify-center text-slate-300 opacity-40">
                                <ShoppingBag className="h-16 w-16 mb-4" />
                                <p className="font-black uppercase tracking-widest text-[10px]">No purchase history found</p>
                             </div>
                          ) : (
                             selectedCustomer.orders.map((order: any, idx: number) => (
                                <div key={order.id} className="group p-8 rounded-[2rem] bg-white border border-slate-100 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all">
                                   <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center gap-4">
                                         <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            #{selectedCustomer.totalOrders - idx}
                                         </div>
                                         <div>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Order #{order.id.slice(-8)}</p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">{order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy") : 'Unknown'}</p>
                                         </div>
                                      </div>
                                      <Badge 
                                        className={cn(
                                          "rounded-full px-4 py-1 text-[8px] font-black uppercase tracking-widest border-none",
                                          order.status === 'delivered' ? 'bg-emerald-500 text-white' :
                                          order.status === 'processing' ? 'bg-blue-500 text-white' :
                                          order.status === 'cancelled' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                        )}
                                      >
                                        {order.status || 'pending'}
                                      </Badge>
                                   </div>
                                   <div className="flex items-end justify-between">
                                      <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-500">
                                         {(order.items || []).map((item: any, i: number) => (
                                            <div key={i} className="w-14 h-16 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-xl ring-1 ring-slate-100">
                                               {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                         ))}
                                      </div>
                                      <div className="text-right">
                                         <p className="text-[8px] font-black uppercase text-slate-400 mb-1 opacity-60">Gross Value</p>
                                         <p className="text-3xl font-black text-primary tracking-tighter leading-none">৳{Number(order.total_amount || 0).toLocaleString()}</p>
                                      </div>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </ScrollArea>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
