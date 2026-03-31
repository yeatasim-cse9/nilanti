import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  MessageCircle,
  BarChart3,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import SalesAnalyticsWidget from "@/components/admin/widgets/SalesAnalyticsWidget";
import { cn } from "@/lib/utils";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100/50 border-yellow-200";
      case "confirmed":
        return "text-blue-600 bg-blue-100/50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-100/50 border-purple-200";
      case "delivered":
        return "text-green-600 bg-green-100/50 border-green-200";
      default:
        return "text-gray-600 bg-gray-100/50 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "পেন্ডিং",
      confirmed: "কনফার্মড",
      shipped: "শিপড",
      delivered: "ডেলিভার্ড",
      cancelled: "বাতিল",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-5 w-48 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
           <Skeleton className="h-[400px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "আজকের অর্ডার",
      value: stats?.todayOrders || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      glow: "shadow-blue-500/20",
    },
    {
      title: "মোট পণ্য",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      glow: "shadow-purple-500/20",
    },
    {
      title: "মোট কাস্টমার",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      glow: "shadow-emerald-500/20",
    },
    {
      title: "আজকের বিক্রি",
      value: `৳${(stats?.todaySales || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
      glow: "shadow-orange-500/20",
    },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="relative group">
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-full opacity-40 group-hover:opacity-100 transition-opacity" />
        <h1 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-tight">
          ম্যানেজমেন্ট ড্যাশবোর্ড
        </h1>
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1 opacity-60">
          Nilanti Store Overview & Real-time Analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className={cn(
            "border-none shadow-xl transition-all duration-500 hover:-translate-y-2 group overflow-hidden rounded-[2.5rem] bg-card/60 backdrop-blur-xl border border-white/40",
            stat.glow
          )}>
            <CardContent className="p-8 relative">
              {/* Decorative background element */}
              <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 transition-transform group-hover:scale-150 duration-700", stat.bg)} />
              
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{stat.title}</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter">
                    {stat.value}
                  </p>
                </div>
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg", stat.bg, stat.color)}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden group">
          <CardHeader className="p-8 pb-4 border-b border-muted/30 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-primary">
              <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              সাম্প্রতিক অর্ডার
            </CardTitle>
            <Link to="/admin/orders">
              <Button variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-black uppercase tracking-normal opacity-40 hover:opacity-100 hover:bg-primary/5">
                সব দেখুন <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {stats?.recentOrders?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                   <Package className="h-16 w-16 mb-4" />
                   <p className="font-bold text-sm">কোনো অর্ডার নেই</p>
                </div>
              ) : (
                stats?.recentOrders?.map((order: any) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="flex items-center justify-between p-4 rounded-3xl hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-muted group/item"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-muted shadow-sm flex items-center justify-center group-hover/item:shadow-md transition-all">
                         <span className="text-[10px] font-black text-primary">#{order.order_number.slice(-4)}</span>
                      </div>
                      <div>
                        <p className="font-black text-foreground text-sm uppercase tracking-tight">{order.customer_name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                          ID: {order.order_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-black text-foreground tracking-tighter">
                        ৳{Number(order.total_amount).toLocaleString()}
                      </p>
                      <span
                        className={cn(
                          "inline-block px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border",
                          getStatusColor(order.order_status)
                        )}
                      >
                        {getStatusLabel(order.order_status)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-4 border-b border-muted/30">
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
              স্টক সতর্কতা
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {stats?.lowStock?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                   <Zap className="h-16 w-16 mb-4" />
                   <p className="font-bold text-sm">সব পণ্যের স্টক পর্যাপ্ত আছে</p>
                </div>
              ) : (
                stats?.lowStock?.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-red-50/50 rounded-3xl border border-red-100 group transition-all hover:bg-red-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-red-200 flex items-center justify-center overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-red-200" />
                        )}
                      </div>
                      <div>
                         <p className="font-black text-foreground text-sm line-clamp-1">{product.name_bn}</p>
                         <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Inventory Warning</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-black text-red-600 tracking-tighter">
                        {product.stock_quantity}
                      </span>
                      <span className="text-[9px] font-black text-red-400 uppercase tracking-normal">টি বাকি</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics Widget */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
           </div>
           <div>
              <h2 className="text-xl font-black text-primary uppercase tracking-tight">অ্যানালিটিক্স সেন্টার</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Growth & Conversion Metrics</p>
           </div>
        </div>
        <div className="rounded-[3rem] bg-white shadow-2xl p-4 sm:p-8 overflow-hidden border border-muted/30 transition-all hover:shadow-primary/5">
          <SalesAnalyticsWidget />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "অর্ডার", icon: ShoppingCart, href: "/admin/orders", color: "bg-blue-500", shadow: "shadow-blue-500/25" },
          { label: "পণ্য", icon: Package, href: "/admin/products", color: "bg-purple-500", shadow: "shadow-purple-500/25" },
          { label: "কাস্টমার", icon: Users, href: "/admin/customers", color: "bg-emerald-500", shadow: "shadow-emerald-500/25" },
          { label: "চ্যাট", icon: MessageCircle, href: "/admin/chat", color: "bg-orange-500", shadow: "shadow-orange-500/25" },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className={cn(
              "p-8 rounded-[2.5rem] bg-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-muted/20 text-center flex flex-col items-center gap-4 group",
              item.shadow
            )}
          >
            <div className={cn("w-16 h-16 rounded-[1.8rem] text-white flex items-center justify-center p-4 transition-transform group-hover:scale-110 duration-500", item.color)}>
              <item.icon className="h-full w-full" />
            </div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

