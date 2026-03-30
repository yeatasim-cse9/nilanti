import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export const useSalesAnalytics = () => {
  return useQuery({
    queryKey: ["admin-sales-analytics"],
    queryFn: async () => {
      const now = new Date();
      const last7Days = subDays(now, 7);
      const last30Days = subDays(now, 30);

      // Get orders from last 30 days for trend analysis
      const q = query(
        collection(db, "orders"),
        where("created_at", ">=", last30Days.toISOString())
      );
      
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => doc.data());

      // Calculate daily sales for last 7 days
      const dailySales: { date: string; sales: number; orders: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        
        const dayOrders = orders?.filter((o) => {
          const orderDate = new Date(o.created_at);
          return orderDate >= dayStart && orderDate <= dayEnd;
        }) || [];

        dailySales.push({
          date: format(date, "EEE"),
          sales: dayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
          orders: dayOrders.length,
        });
      }

      // Order status breakdown
      const statusCounts = {
        pending: orders?.filter((o) => o.order_status === "pending").length || 0,
        confirmed: orders?.filter((o) => o.order_status === "confirmed").length || 0,
        processing: orders?.filter((o) => o.order_status === "processing").length || 0,
        shipped: orders?.filter((o) => o.order_status === "shipped").length || 0,
        delivered: orders?.filter((o) => o.order_status === "delivered").length || 0,
        cancelled: orders?.filter((o) => o.order_status === "cancelled").length || 0,
      };

      // Payment status breakdown
      const paymentCounts = {
        paid: orders?.filter((o) => o.payment_status === "paid").length || 0,
        unpaid: orders?.filter((o) => o.payment_status === "unpaid").length || 0,
        partial: orders?.filter((o) => o.payment_status === "partial").length || 0,
      };

      // Calculate conversion rate (delivered / total orders)
      const totalOrders = orders?.length || 0;
      const deliveredOrders = statusCounts.delivered;
      const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

      // Calculate cancellation rate
      const cancelledOrders = statusCounts.cancelled;
      const cancellationRate = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

      // Total revenue from last 30 days
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      // Last 7 days vs previous 7 days comparison
      const last7DaysOrders = orders?.filter((o) => new Date(o.created_at) >= last7Days) || [];
      const previous7DaysOrders = orders?.filter((o) => {
        const date = new Date(o.created_at);
        return date < last7Days && date >= subDays(last7Days, 7);
      }) || [];

      const last7DaysRevenue = last7DaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const previous7DaysRevenue = previous7DaysOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      
      const revenueGrowth = previous7DaysRevenue > 0 
        ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100 
        : last7DaysRevenue > 0 ? 100 : 0;

      return {
        dailySales,
        statusCounts,
        paymentCounts,
        conversionRate,
        cancellationRate,
        totalRevenue,
        totalOrders,
        revenueGrowth,
        last7DaysRevenue,
        last7DaysOrders: last7DaysOrders.length,
      };
    },
  });
};
