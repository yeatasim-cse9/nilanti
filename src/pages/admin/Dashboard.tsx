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
  ArrowUpRight,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";
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
        return "text-amber-700 bg-amber-50 border-amber-200/50";
      case "confirmed":
        return "text-blue-700 bg-blue-50 border-blue-200/50";
      case "shipped":
        return "text-violet-700 bg-violet-50 border-violet-200/50";
      case "delivered":
        return "text-emerald-700 bg-emerald-50 border-emerald-200/50";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200/50";
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
      <div className="space-y-6">
        <Skeleton className="h-7 w-40 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] rounded-2xl" />
          <Skeleton className="h-[300px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "আজকের অর্ডার",
      value: stats?.todayOrders || 0,
      subtitle: "নতুন অর্ডার",
      icon: ShoppingCart,
      gradient: "from-blue-600 to-indigo-700",
      shadowColor: "shadow-blue-500/25",
      lightBg: "bg-blue-500/10",
      lightText: "text-blue-600",
    },
    {
      title: "মোট পণ্য",
      value: stats?.totalProducts || 0,
      subtitle: "অ্যাক্টিভ পণ্য",
      icon: Package,
      gradient: "from-violet-600 to-purple-700",
      shadowColor: "shadow-violet-500/25",
      lightBg: "bg-violet-500/10",
      lightText: "text-violet-600",
    },
    {
      title: "মোট কাস্টমার",
      value: stats?.totalCustomers || 0,
      subtitle: "রেজিস্টার্ড",
      icon: Users,
      gradient: "from-emerald-600 to-teal-700",
      shadowColor: "shadow-emerald-500/25",
      lightBg: "bg-emerald-500/10",
      lightText: "text-emerald-600",
    },
    {
      title: "আজকের বিক্রি",
      value: `৳${(stats?.todaySales || 0).toLocaleString()}`,
      subtitle: "আজকের রেভেনিউ",
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      shadowColor: "shadow-amber-500/25",
      lightBg: "bg-amber-500/10",
      lightText: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* ═══ HEADER ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              ড্যাশবোর্ড
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              লাইভ
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">
            স্টোর পারফরম্যান্স ও রিয়েল-টাইম ডেটা
          </p>
        </div>
        <Link to="/admin/orders">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex h-8 rounded-lg text-[11px] font-semibold gap-1.5 border-gray-200 text-gray-500 hover:text-gray-700 shadow-sm"
          >
            <Activity className="h-3 w-3" />
            সব অর্ডার
          </Button>
        </Link>
      </div>

      {/* ═══ STAT CARDS — PREMIUM ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
          >
            {/* Gradient top strip */}
            <div className={cn("h-1 bg-gradient-to-r", stat.gradient)} />

            <div className="p-4 sm:p-5">
              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-lg transition-transform group-hover:scale-105 duration-500",
                  stat.gradient,
                  stat.shadowColor
                )}
              >
                <stat.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              </div>

              {/* Value */}
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
                {stat.value}
              </p>

              {/* Title */}
              <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 mb-0.5">
                {stat.title}
              </p>

              {/* Subtitle badge */}
              <span className={cn(
                "inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md mt-1",
                stat.lightBg, stat.lightText
              )}>
                <Sparkles className="h-2.5 w-2.5" />
                {stat.subtitle}
              </span>
            </div>

            {/* Decorative circle */}
            <div className={cn(
              "absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.04] bg-gradient-to-br transition-transform group-hover:scale-150 duration-700",
              stat.gradient
            )} />
          </div>
        ))}
      </div>

      {/* ═══ MAIN GRID ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Recent Orders — wider */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Clock className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">সাম্প্রতিক অর্ডার</h2>
                <p className="text-[9px] text-gray-400 font-medium">শেষ ১০টি অর্ডার</p>
              </div>
            </div>
            <Link to="/admin/orders">
              <button className="text-[11px] font-semibold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
                সব দেখুন <ArrowRight className="h-3 w-3" />
              </button>
            </Link>
          </div>

          <div className="divide-y divide-gray-50">
            {stats?.recentOrders?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4 border border-gray-100">
                  <Package className="h-7 w-7 text-gray-200" />
                </div>
                <p className="text-sm font-semibold text-gray-400 mb-1">কোনো অর্ডার নেই</p>
                <p className="text-[11px] text-gray-300 max-w-[200px]">
                  নতুন অর্ডার আসলে এখানে দেখাবে
                </p>
              </div>
            ) : (
              stats?.recentOrders?.map((order: any) => (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-gray-50/60 transition-colors group/row"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-gray-500 font-mono">
                        #{order.order_number?.slice(-4)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900 leading-tight group-hover/row:text-indigo-600 transition-colors">
                        {order.customer_name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium font-mono">
                        {order.order_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1.5">
                    <p className="text-[13px] font-bold text-gray-900 font-mono">
                      ৳{Number(order.total_amount).toLocaleString()}
                    </p>
                    <span
                      className={cn(
                        "inline-block px-2 py-[3px] text-[8px] font-bold rounded-md border leading-none",
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
        </div>

        {/* Right Column: Stock Alert + Quick Actions */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          {/* Low Stock */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-md shadow-red-500/20">
                <AlertTriangle className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h2 className="text-[13px] font-bold text-gray-900">স্টক সতর্কতা</h2>
                <p className="text-[9px] text-gray-400 font-medium">কম স্টকের পণ্য</p>
              </div>
            </div>

            <div className="p-4">
              {stats?.lowStock?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 border border-emerald-100">
                    <Zap className="h-5 w-5 text-emerald-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-400">সব ঠিক আছে!</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">স্টক পর্যাপ্ত আছে</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats?.lowStock?.map((product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-white border border-red-100 flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-4 w-4 text-red-200" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-semibold text-gray-900 line-clamp-1">{product.name_bn}</p>
                          <p className="text-[9px] font-medium text-red-400">রি-অর্ডার করুন</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-lg font-extrabold text-red-600 leading-none">{product.stock_quantity}</span>
                        <span className="text-[8px] font-semibold text-red-400">বাকি</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-50">
              <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest">দ্রুত অ্যাক্সেস</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: "নতুন অর্ডার", icon: ShoppingCart, href: "/admin/orders", gradient: "from-blue-500 to-indigo-600", shadow: "shadow-blue-500/15" },
                { label: "পণ্য যোগ করুন", icon: Package, href: "/admin/products/new", gradient: "from-violet-500 to-purple-600", shadow: "shadow-violet-500/15" },
                { label: "কাস্টমার", icon: Users, href: "/admin/customers", gradient: "from-emerald-500 to-teal-600", shadow: "shadow-emerald-500/15" },
                { label: "লাইভ চ্যাট", icon: MessageCircle, href: "/admin/chat", gradient: "from-amber-500 to-orange-600", shadow: "shadow-amber-500/15" },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors group/qa"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-md transition-transform group-hover/qa:scale-110 duration-300",
                    item.gradient, item.shadow
                  )}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-700 group-hover/qa:text-gray-900 flex-1">
                    {item.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover/qa:text-indigo-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ANALYTICS ═══ */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
            <BarChart3 className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-[13px] font-bold text-gray-900">অ্যানালিটিক্স</h2>
            <p className="text-[9px] text-gray-400 font-medium">বিক্রি, কনভার্সন ও গ্রোথ মেট্রিক্স</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 overflow-hidden">
          <SalesAnalyticsWidget />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
