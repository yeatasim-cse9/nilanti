import { useState, useEffect } from "react";
import { TrendingUp, ArrowRightLeft, ShoppingCart, Target, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { format, subDays } from "date-fns";
import { bn } from "date-fns/locale";

interface IncompleteOrder {
  id: string;
  created_at: string;
  is_converted: boolean;
  cart_data: any[];
  customer_phone: string | null;
}

interface DailyStats {
  date: string;
  total: number;
  converted: number;
  conversionRate: number;
}

const RecoveryAnalytics = () => {
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<IncompleteOrder[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    const startDate = subDays(new Date(), parseInt(dateRange));
    
    try {
      const q = query(
        collection(db, "incomplete_orders"),
        where("created_at", ">=", startDate.toISOString())
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as IncompleteOrder[];
      setOrders(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = (cartData: any[] | null) => {
    if (!cartData || cartData.length === 0) return 0;
    return cartData.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const convertedOrders = orders.filter(o => o.is_converted).length;
  const pendingOrders = orders.filter(o => !o.is_converted).length;
  const ordersWithPhone = orders.filter(o => o.customer_phone).length;
  const conversionRate = totalOrders > 0 ? Math.round((convertedOrders / totalOrders) * 100) : 0;
  
  const recoveredRevenue = orders
    .filter(o => o.is_converted)
    .reduce((sum, o) => sum + getCartTotal(o.cart_data), 0);
  
  const potentialRevenue = orders
    .filter(o => !o.is_converted)
    .reduce((sum, o) => sum + getCartTotal(o.cart_data), 0);

  // Daily trend data
  const getDailyStats = (): DailyStats[] => {
    const days = parseInt(dateRange);
    const stats: DailyStats[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const dayOrders = orders.filter(o => 
        format(new Date(o.created_at), "yyyy-MM-dd") === dateStr
      );
      
      const total = dayOrders.length;
      const converted = dayOrders.filter(o => o.is_converted).length;
      
      stats.push({
        date: format(date, "dd MMM", { locale: bn }),
        total,
        converted,
        conversionRate: total > 0 ? Math.round((converted / total) * 100) : 0,
      });
    }

    return stats;
  };

  // Funnel data
  const funnelData = [
    { name: "চেকআউট শুরু", value: totalOrders, fill: "hsl(var(--chart-1))" },
    { name: "ফোন দিয়েছে", value: ordersWithPhone, fill: "hsl(var(--chart-2))" },
    { name: "রূপান্তরিত", value: convertedOrders, fill: "hsl(var(--chart-3))" },
  ];

  // Pie chart data
  const pieData = [
    { name: "রূপান্তরিত", value: convertedOrders, fill: "hsl(var(--primary))" },
    { name: "অসম্পূর্ণ", value: pendingOrders, fill: "hsl(var(--muted))" },
  ];

  // Top recovered amounts
  const topRecovered = orders
    .filter(o => o.is_converted)
    .sort((a, b) => getCartTotal(b.cart_data) - getCartTotal(a.cart_data))
    .slice(0, 5);

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">রিকভারি অ্যানালিটিক্স</h1>
          <p className="text-muted-foreground">অসম্পূর্ণ অর্ডার রূপান্তর ও বিশ্লেষণ</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">গত ৭ দিন</SelectItem>
            <SelectItem value="30">গত ৩০ দিন</SelectItem>
            <SelectItem value="90">গত ৯০ দিন</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <ShoppingCart className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-muted-foreground">মোট অসম্পূর্ণ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <ArrowRightLeft className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{convertedOrders}</p>
                <p className="text-sm text-muted-foreground">রূপান্তরিত</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate}%</p>
                <p className="text-sm text-muted-foreground">রূপান্তর হার</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <span className="h-5 w-5 text-purple-600 font-bold flex items-center justify-center">৳</span>
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPrice(recoveredRevenue)}</p>
                <p className="text-sm text-muted-foreground">উদ্ধারকৃত বিক্রি</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">উদ্ধারকৃত রাজস্ব</p>
                <p className="text-3xl font-bold text-green-700">{formatPrice(recoveredRevenue)}</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">সম্ভাব্য রাজস্ব (অসম্পূর্ণ)</p>
                <p className="text-3xl font-bold text-orange-700">{formatPrice(potentialRevenue)}</p>
              </div>
              <ShoppingCart className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>দৈনিক রূপান্তর ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDailyStats().slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="total" name="মোট" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" name="রূপান্তরিত" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Trend */}
        <Card>
          <CardHeader>
            <CardTitle>রূপান্তর হার ট্রেন্ড</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getDailyStats().slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`${value}%`, "রূপান্তর হার"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversionRate" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>রূপান্তর ফানেল</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, idx) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.value}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${totalOrders > 0 ? (item.value / totalOrders) * 100 : 0}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                  {idx < funnelData.length - 1 && (
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {totalOrders > 0 ? Math.round((item.value / totalOrders) * 100) : 0}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>রূপান্তর অনুপাত</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Recovered */}
        <Card>
          <CardHeader>
            <CardTitle>সর্বোচ্চ উদ্ধারকৃত অর্ডার</CardTitle>
          </CardHeader>
          <CardContent>
            {topRecovered.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">কোনো রূপান্তরিত অর্ডার নেই</p>
            ) : (
              <div className="space-y-3">
                {topRecovered.map((order, idx) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? "bg-yellow-400 text-yellow-900" :
                        idx === 1 ? "bg-gray-300 text-gray-700" :
                        idx === 2 ? "bg-amber-600 text-white" :
                        "bg-muted-foreground/20 text-muted-foreground"
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {order.customer_phone || "অজানা"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "dd MMM", { locale: bn })}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">
                      {formatPrice(getCartTotal(order.cart_data))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecoveryAnalytics;