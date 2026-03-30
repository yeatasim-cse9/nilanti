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
  Ban
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
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent uppercase tracking-tight">
            কাস্টমার ডিরেক্টরি
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-normal opacity-60">Customer Profiles & CRM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-xl shadow-primary/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-primary/20 transition-all cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Total Customers <User className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary tracking-tighter">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-emerald-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-emerald-200 transition-all cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Active Buyers <ShoppingBag className="h-4 w-4 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">{stats.activeBuyers}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-blue-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-blue-200 transition-all cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              New This Month <TrendingUp className="h-4 w-4 text-blue-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600 tracking-tighter">{stats.newGrowth}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl shadow-purple-500/5 border-white/40 bg-white/60 backdrop-blur-xl group hover:border-purple-200 transition-all cursor-default">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-normal text-muted-foreground flex items-center justify-between">
              Lifetime Value <CreditCard className="h-4 w-4 text-purple-500 opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-purple-600 tracking-tighter">৳{stats.totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <TabsList className="bg-white/50 backdrop-blur p-1 rounded-full border border-white/60 h-12 h-auto flex-wrap">
            <TabsTrigger value="all" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-primary data-[state=active]:text-white transition-all">All Members</TabsTrigger>
            <TabsTrigger value="active" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all">Active Buyers</TabsTrigger>
            <TabsTrigger value="new" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all">New (30d)</TabsTrigger>
            <TabsTrigger value="admins" className="rounded-full px-6 py-2 text-xs font-black uppercase tracking-normal data-[state=active]:bg-rose-500 data-[state=active]:text-white transition-all">Admins</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                className="pl-11 h-12 bg-white/80 border-white/60 rounded-full text-xs font-bold shadow-sm focus-visible:ring-primary/20 pr-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 bg-primary/5 rounded flex items-center justify-center border border-primary/10">
                 <Filter className="h-2.5 w-2.5 text-primary/40" />
              </div>
            </div>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[32px] shadow-2xl shadow-primary/[0.02] overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[700px] no-scrollbar">
              <Table>
                <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500 py-6 pl-8">Customer Detail</TableHead>
                    <TableHead className="font-black text-[10px] uppercase tracking-normal text-slate-500">Contact & Location</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Activity</TableHead>
                    <TableHead className="text-right font-black text-[10px] uppercase tracking-normal text-slate-500">Financials</TableHead>
                    <TableHead className="text-center font-black text-[10px] uppercase tracking-normal text-slate-500">Member Status</TableHead>
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
                          <p className="text-sm font-bold mt-2">Try adjusting your filters or search query.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer: any) => (
                      <TableRow key={customer.id} className="hover:bg-slate-50/80 transition-all border-slate-50 group cursor-pointer" onClick={() => handleViewProfile(customer)}>
                        <TableCell className="py-6 pl-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shadow-sm border border-primary/10 ring-4 ring-white group-hover:ring-primary/5 transition-all relative">
                              {customer.avatar_url ? (
                                <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover rounded-2xl" />
                              ) : (
                                <span className="font-black text-primary text-sm uppercase">
                                  {(customer.full_name || "U").charAt(0)}
                                </span>
                              )}
                              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${customer.role === 'admin' ? 'bg-rose-500' : 'bg-emerald-500 shadow-lg'}`} />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-base">{customer.full_name || "Guest Account"}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-normal px-2 py-0.5 rounded-full ${customer.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                  {customer.role || 'customer'}
                                </Badge>
                                {customer.totalOrders > 5 && (
                                  <Badge className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-2 py-0.5 border-none rounded-full">VIP Member</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 transition-all">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Phone className="h-3 w-3 text-primary" /> {customer.phone || 'No phone'}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                              <Mail className="h-3 w-3 text-primary/40" /> {customer.email || 'No email'}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 truncate max-w-[150px]">
                              <MapPin className="h-3 w-3 text-slate-300" /> {customer.address || customer.orders?.[0]?.shipping_address || 'No address'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-slate-800 text-lg tracking-tighter">{customer.totalOrders}</span>
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-normal">
                              Last: {customer.lastOrderDate ? format(new Date(customer.lastOrderDate), "dd MMM") : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-black text-primary text-lg tracking-tighter">৳{customer.totalSpent.toLocaleString()}</span>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-normal">AOV: ৳{customer.totalOrders > 0 ? Math.round(customer.totalSpent / customer.totalOrders).toLocaleString() : 0}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                           <div className="flex flex-col items-center gap-1">
                             <span className="text-xs font-black text-slate-600">
                               {customer.created_at ? format(new Date(customer.created_at), "MMM yyyy", { locale: bn }) : '—'}
                             </span>
                             <Badge variant="outline" className={`text-[7px] font-black uppercase tracking-normal px-2 py-0 border-none rounded-full ${
                               customer.totalSpent > 10000 ? 'bg-amber-50 text-amber-600' : 
                               customer.totalOrders > 3 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                             }`}>
                               {customer.totalSpent > 10000 ? 'Whale' : customer.totalOrders > 3 ? 'Frequent' : 'Standard'}
                             </Badge>
                           </div>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex items-center justify-end gap-2">
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-10 w-10 rounded-full hover:bg-primary/5 hover:text-primary transition-all shadow-sm border border-transparent hover:border-primary/10"
                               onClick={(e) => { e.stopPropagation(); handleViewProfile(customer); }}
                             >
                               <Eye className="h-4 w-4" />
                             </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-slate-100 shadow-sm border border-transparent hover:border-slate-200">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-primary/10 shadow-2xl">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 px-3 pb-2 pt-1">User Management</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleViewProfile(customer)} className="rounded-xl font-bold p-3">
                                    <User className="h-4 w-4 mr-2 text-primary" /> Full Profile Info
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-xl font-bold p-3">
                                    <Mail className="h-4 w-4 mr-2 text-blue-500" /> Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2 bg-primary/5" />
                                  {customer.role !== 'admin' ? (
                                    <DropdownMenuItem className="rounded-xl font-bold p-3 text-emerald-600">
                                      <ShieldCheck className="h-4 w-4 mr-2" /> Promote to Admin
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="rounded-xl font-bold p-3 text-slate-600">
                                      <ShieldCheck className="h-4 w-4 mr-2" /> Demote to Customer
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem className="text-red-600 focus:bg-red-50 font-bold rounded-xl p-3">
                                    <Ban className="h-4 w-4 mr-2 text-red-500" /> Suspend Account
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
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[40px] border-none shadow-2xl bg-[#fcfcfd]">
          {selectedCustomer && (
            <div className="flex flex-col h-[90vh]">
              {/* Header / Hero */}
              <div className="bg-primary p-8 md:p-12 text-white relative">
                 <div className="absolute top-0 right-0 p-12 opacity-10">
                    <User className="h-64 w-64 -mr-20 -mt-20" />
                 </div>
                 <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-32 h-32 rounded-[32px] bg-white/20 p-2 backdrop-blur-xl border border-white/30 shadow-2xl">
                       <div className="w-full h-full rounded-[24px] bg-white flex items-center justify-center text-primary overflow-hidden">
                          {selectedCustomer.avatar_url ? (
                             <img src={selectedCustomer.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                             <span className="text-4xl font-black uppercase tracking-tighter">{(selectedCustomer.full_name || 'U').charAt(0)}</span>
                          )}
                       </div>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                       <div className="flex flex-col md:flex-row items-center gap-3">
                         <h2 className="text-4xl font-black uppercase tracking-tight">{selectedCustomer.full_name || "Guest Account"}</h2>
                         <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-normal backdrop-blur-lg">
                           {selectedCustomer.role || 'Member'}
                         </Badge>
                       </div>
                       <p className="text-white/60 font-medium text-lg">{selectedCustomer.email || 'No email attached'}</p>
                       <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-4 opacity-80 uppercase tracking-normal text-[10px] font-black">
                          <span className="flex items-center gap-2"><Phone className="h-3 w-3" /> {selectedCustomer.phone || 'Unknown'}</span>
                          <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> Member Since {selectedCustomer.created_at ? format(new Date(selectedCustomer.created_at), "dd MMMM, yyyy", { locale: bn }) : 'Unknown'}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">
                 {/* Left Sidebar Info */}
                 <div className="bg-white border-r border-slate-100 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-normal text-slate-400">Account Insights</h3>
                       <div className="grid grid-cols-1 gap-3">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <div>
                                <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Total Revenue</div>
                                <div className="text-xl font-black text-primary tracking-tighter">৳{selectedCustomer.totalSpent.toLocaleString()}</div>
                             </div>
                             <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                <TrendingUp className="h-4 w-4 text-primary" />
                             </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <div>
                                <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Avg. Order Value</div>
                                <div className="text-xl font-black text-emerald-600 tracking-tighter">৳{selectedCustomer.totalOrders > 0 ? Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString() : 0}</div>
                             </div>
                             <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                                <CreditCard className="h-4 w-4 text-emerald-500" />
                             </div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <div>
                                <div className="text-[9px] font-black uppercase text-slate-400 mb-0.5">Order Frequency</div>
                                <div className="text-xl font-black text-blue-600 tracking-tighter">
                                   {selectedCustomer.totalOrders > 0 ? (selectedCustomer.totalOrders / (Math.max(1, (new Date().getTime() - new Date(selectedCustomer.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24 * 30)))).toFixed(1) : 0}/mo
                                </div>
                             </div>
                             <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                                <ShoppingBag className="h-4 w-4 text-blue-500" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-normal text-slate-400">Contact & Identity</h3>
                       <div className="space-y-4">
                          <div className="flex gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <Phone className="h-4 w-4 text-slate-400" />
                             </div>
                             <div>
                                <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Primary Phone</div>
                                <div className="text-sm font-bold text-slate-700">{selectedCustomer.phone || 'Not available'}</div>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <Mail className="h-4 w-4 text-slate-400" />
                             </div>
                             <div>
                                <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Verified Email</div>
                                <div className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{selectedCustomer.email || 'Not available'}</div>
                             </div>
                          </div>
                          <div className="flex gap-4">
                             <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <MapPin className="h-4 w-4 text-slate-400" />
                             </div>
                             <div>
                                <div className="text-[8px] font-black uppercase text-slate-400 mb-0.5">Primary Shipping</div>
                                <div className="text-xs font-bold text-slate-600 leading-relaxed">
                                   {selectedCustomer.address || selectedCustomer.orders?.[0]?.shipping_address || 'No address saved'}
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-black uppercase tracking-normal text-slate-400">Trust Score</h3>
                          <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black">9.8 HIGH</Badge>
                       </div>
                       <Button className="w-full h-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold uppercase text-[10px] tracking-normal gap-2">
                          Edit Profile <ChevronRight className="h-4 w-4" />
                       </Button>
                    </div>
                 </div>

                 {/* Main Order History */}
                 <div className="md:col-span-2 p-0 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-xl">
                       <h3 className="text-xs font-black uppercase tracking-normal text-slate-400 flex items-center gap-2">
                          Order History <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-500">{selectedCustomer.totalOrders}</Badge>
                       </h3>
                    </div>
                    <ScrollArea className="flex-1 p-8">
                       <div className="space-y-4">
                          {selectedCustomer.orders.length === 0 ? (
                             <div className="h-64 flex flex-col items-center justify-center text-slate-300 opacity-60 italic">
                                <ShoppingBag className="h-12 w-12 mb-4" />
                                <p className="font-bold">No orders found for this user</p>
                             </div>
                          ) : (
                             selectedCustomer.orders.map((order: any, idx: number) => (
                                <div key={order.id} className="group p-6 rounded-3xl bg-white border border-slate-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                                   <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-3">
                                         <span className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                                            #{selectedCustomer.totalOrders - idx}
                                         </span>
                                         <div>
                                            <div className="text-xs font-black text-slate-800 uppercase tracking-tight">Order #{order.id.slice(-8)}</div>
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-normal">{order.created_at ? format(new Date(order.created_at), "dd MMM, yyyy") : 'Unknown Date'}</div>
                                         </div>
                                      </div>
                                      <Badge 
                                        className={`rounded-full px-3 py-0.5 text-[8px] font-black uppercase tracking-normal border-none ${
                                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                          order.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        {order.status || 'pending'}
                                      </Badge>
                                   </div>
                                   <div className="flex items-end justify-between">
                                      <div className="flex -space-x-3 group-hover:-space-x-1 transition-all duration-500">
                                         {(order.items || []).map((item: any, i: number) => (
                                            <div key={i} className="w-12 h-14 rounded-xl border-4 border-white bg-slate-50 overflow-hidden shadow-lg shadow-black/5 ring-1 ring-slate-100">
                                               {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                         ))}
                                         {(!order.items || order.items.length === 0) && (
                                            <div className="w-12 h-14 rounded-xl border-4 border-white bg-slate-50 flex items-center justify-center">
                                               <ShoppingBag className="h-4 w-4 text-slate-300" />
                                            </div>
                                         )}
                                      </div>
                                      <div className="text-right">
                                         <div className="text-[8px] font-black uppercase text-slate-400 mb-1">Order Value</div>
                                         <div className="text-2xl font-black text-primary tracking-tighter">৳{Number(order.total_amount || 0).toLocaleString()}</div>
                                      </div>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                       <div className="h-8" />
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
