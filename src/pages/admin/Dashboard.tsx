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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";
import SalesAnalyticsWidget from "@/components/admin/widgets/SalesAnalyticsWidget";
const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
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
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "আজকের অর্ডার",
      value: stats?.todayOrders || 0,
      icon: ShoppingCart,
    },
    {
      title: "মোট পণ্য",
      value: stats?.totalProducts || 0,
      icon: Package,
    },
    {
      title: "মোট কাস্টমার",
      value: stats?.totalCustomers || 0,
      icon: Users,
    },
    {
      title: "আজকের বিক্রি",
      value: `৳${(stats?.todaySales || 0).toLocaleString()}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ড্যাশবোর্ড</h1>
        <p className="text-muted-foreground">স্বাগতম, অ্যাডমিন প্যানেলে</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              সাম্প্রতিক অর্ডার
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentOrders?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  কোনো অর্ডার নেই
                </p>
              ) : (
                stats?.recentOrders?.map((order: any) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div>
                      <p className="font-medium text-foreground font-mono">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ৳{Number(order.total_amount).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                          order.order_status
                        )}`}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              স্টক কম আছে
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.lowStock?.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  সব পণ্যের স্টক পর্যাপ্ত আছে
                </p>
              ) : (
                stats?.lowStock?.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg border border-destructive/20"
                  >
                    <p className="font-medium text-foreground">{product.name_bn}</p>
                    <span className="text-sm font-bold text-destructive">
                      {product.stock_quantity}টি বাকি
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Analytics Widget */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          বিক্রি ও রূপান্তর বিশ্লেষণ
        </h2>
        <SalesAnalyticsWidget />
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>দ্রুত লিঙ্ক</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/orders"
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">অর্ডার</span>
            </Link>
            <Link
              to="/admin/products"
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">পণ্য</span>
            </Link>
            <Link
              to="/admin/customers"
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">কাস্টমার</span>
            </Link>
            <Link
              to="/admin/chat"
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors text-center"
            >
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">চ্যাট</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
