import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesAnalytics } from "@/hooks/useSalesAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Percent, CheckCircle, XCircle } from "lucide-react";

const SalesAnalyticsWidget = () => {
  const { data: analytics, isLoading } = useSalesAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[150px]" />
        <Skeleton className="h-[150px]" />
      </div>
    );
  }

  const orderStatusData = [
    { name: "পেন্ডিং", value: analytics?.statusCounts.pending || 0, color: "hsl(var(--chart-1))" },
    { name: "কনফার্মড", value: analytics?.statusCounts.confirmed || 0, color: "hsl(var(--chart-2))" },
    { name: "প্রসেসিং", value: analytics?.statusCounts.processing || 0, color: "hsl(var(--chart-3))" },
    { name: "শিপড", value: analytics?.statusCounts.shipped || 0, color: "hsl(var(--chart-4))" },
    { name: "ডেলিভার্ড", value: analytics?.statusCounts.delivered || 0, color: "hsl(var(--chart-5))" },
    { name: "বাতিল", value: analytics?.statusCounts.cancelled || 0, color: "hsl(var(--destructive))" },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">৩০ দিনের বিক্রি</p>
                <p className="text-xl font-bold text-foreground">
                  ৳{(analytics?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">৭ দিনের বিক্রি</p>
                <p className="text-xl font-bold text-foreground">
                  ৳{(analytics?.last7DaysRevenue || 0).toLocaleString()}
                </p>
                <div className={`flex items-center gap-1 text-xs ${(analytics?.revenueGrowth || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(analytics?.revenueGrowth || 0) >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(analytics?.revenueGrowth || 0).toFixed(1)}% vs আগের সপ্তাহ
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">সফলতার হার</p>
                <p className="text-xl font-bold text-green-600">
                  {(analytics?.conversionRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">বাতিলের হার</p>
                <p className="text-xl font-bold text-red-600">
                  {(analytics?.cancellationRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">সাপ্তাহিক বিক্রি</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics?.dailySales || []}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `৳${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`৳${value.toLocaleString()}`, "বিক্রি"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">অর্ডার স্ট্যাটাস (৩০ দিন)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, name]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-muted-foreground w-full">কোনো অর্ডার নেই</p>
              )}
              <div className="flex flex-col gap-2 min-w-[120px]">
                {orderStatusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesAnalyticsWidget;
