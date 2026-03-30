import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  User, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Clock, 
  Truck, 
  CheckCircle,
  Settings,
  CreditCard,
  ShoppingBag,
  Bell,
  Heart,
  Mail,
  Calendar,
  Phone,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useUserOrders } from "@/hooks/useAdminData";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const Account = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, signOut, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const [activeTab, setActiveTab] = useState("orders");

  const { data: userOrders = [], isLoading: ordersLoading } = useUserOrders(user?.uid);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: "পেন্ডিং", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-none" },
      confirmed: { label: "কনফার্মড", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none" },
      processing: { label: "প্রসেসিং", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none" },
      shipped: { label: "শিপ করা হয়েছে", className: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-none" },
      delivered: { label: "ডেলিভার হয়েছে", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-none" },
      cancelled: { label: "বাতিল", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={cn("px-2.5 py-0.5 font-medium rounded-full", config.className)}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-indigo-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground animate-pulse font-medium">একটু অপেক্ষা করুন...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const userInitials = user.displayName 
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()
    : user.email?.[0].toUpperCase() || "U";

  const SidebarNav = () => (
    <div className="space-y-1">
      {[
        { id: "orders", label: "অর্ডার ইতিহাস", icon: ShoppingBag },
        { id: "profile", label: "প্রোফাইল তথ্য", icon: User },
        { id: "addresses", label: "ঠিকানা সমূহ", icon: MapPin },
        { id: "wishlist", label: "উইশলিস্ট", icon: Heart },
        { id: "notifications", label: "নোটিফিকেশন", icon: Bell },
        { id: "settings", label: "একাউন্ট সেটিংস", icon: Settings },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
            activeTab === item.id 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className={cn("h-4 w-4 transition-transform duration-200", activeTab === item.id ? "scale-110" : "group-hover:scale-110")} />
          {item.label}
          {activeTab === item.id && <ChevronRight className="h-4 w-4 ml-auto" />}
        </button>
      ))}
      <Separator className="my-4 opacity-50" />
      <button
        onClick={() => {
          signOut();
          navigate("/");
        }}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 group"
      >
        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        লগআউট করুন
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-background">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 md:gap-10">
            {/* Left Sidebar - Profile Summary & Nav */}
            <aside className="space-y-6">
              <div className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-4">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground line-clamp-1">
                  {user.displayName || "ব্যবহারকারী"}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mb-4 line-clamp-1">
                  {user.email}
                </p>
                {isAdmin && (
                  <Link to="/admin" className="w-full">
                    <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/40 transition-all">
                      <LayoutDashboard className="h-4 w-4" />
                      অ্যাডমিন প্যানেল
                    </Button>
                  </Link>
                )}
              </div>

              {/* Sidebar Navigation - Hidden on mobile, but we will handle it with Tabs for mobile responsiveness if needed */}
              <div className="hidden lg:block bg-card rounded-2xl p-4 border border-border shadow-sm">
                <SidebarNav />
              </div>

              {/* Mobile Tab Trigger Placeholder */}
              <div className="lg:hidden flex overflow-x-auto pb-2 gap-2 scrollbar-none">
                {[
                  { id: "orders", label: "অর্ডার", icon: ShoppingBag },
                  { id: "profile", label: "প্রোফাইল", icon: User },
                  { id: "addresses", label: "ঠিকানা", icon: MapPin },
                ].map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab(item.id)}
                    className="rounded-full whitespace-nowrap gap-2 shrink-0"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </aside>

            {/* Right Side - Content Area */}
            <div className="space-y-6 min-h-[500px]">
              {/* Conditional Content based on activeTab */}
              <div className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards")}>
                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">অর্ডার ইতিহাস</h2>
                      <p className="text-sm text-muted-foreground">{userOrders.length}টি অর্ডার পাওয়া গেছে</p>
                    </div>

                    {userOrders.length === 0 ? (
                      <div className="bg-card rounded-3xl p-16 border border-border border-dashed text-center">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                          <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          কোনো অর্ডার নেই
                        </h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                          আপনি এখনো কোনো কেনাকাটা করেননি। আমাদের সেরা লেটেস্ট কালেকশনগুলো দেখুন!
                        </p>
                        <Link to="/shop">
                          <Button className="rounded-xl px-8 h-12 gap-2 shadow-lg shadow-primary/20">
                            কেনাকাটা শুরু করুন
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : ordersLoading ? (
                      <div className="space-y-5">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-card rounded-2xl p-5 md:p-6 border border-border animate-pulse">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-muted" />
                                <div className="space-y-3">
                                  <div className="h-5 w-32 bg-muted rounded" />
                                  <div className="h-4 w-48 bg-muted rounded" />
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="h-6 w-24 bg-muted rounded" />
                                <div className="h-10 w-28 bg-muted rounded-xl" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {userOrders.map((order) => (
                          <div
                            key={order.id}
                            className="bg-card rounded-2xl p-5 md:p-6 border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                              <div className="flex items-start gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                  {getStatusIcon(order.order_status)}
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-bold text-lg text-foreground tracking-tight">
                                      {order.order_number}
                                    </span>
                                    {getStatusBadge(order.order_status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5 font-medium">
                                      <Calendar className="h-3.5 w-3.5" />
                                      {order.created_at && !isNaN(Date.parse(order.created_at)) 
                                        ? format(new Date(order.created_at), "dd MMMM yyyy", { locale: bn })
                                        : order.created_at || "অজানা তারিখ"}
                                    </span>
                                    <span className="text-border">|</span>
                                    <span className="flex items-center gap-1.5 font-medium">
                                      <Package className="h-3.5 w-3.5" />
                                      {order.items?.length || 0}টি পণ্য
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground font-medium mb-1">মোট পরিমাণ</p>
                                  <p className="text-2xl font-extrabold text-primary">
                                    {formatPrice(order.total_amount)}
                                  </p>
                                </div>
                                <Button variant="secondary" size="sm" className="rounded-xl h-10 px-4 gap-1.5 bg-muted/50 hover:bg-muted text-foreground transition-all">
                                  ট্র্যাকিং করুন
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "profile" && (
                  <div className="space-y-6 max-w-2xl">
                    <h2 className="text-2xl font-bold text-foreground">প্রোফাইল তথ্য</h2>
                    <div className="bg-card rounded-3xl p-8 border border-border mt-2 shadow-sm relative overflow-hidden">
                      {/* Decorative background element */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />
                      
                      <div className="space-y-8 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-normal text-muted-foreground flex items-center gap-2">
                              <User className="h-3.5 w-3.5" />
                              নাম
                            </label>
                            <p className="text-lg font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                              {user.displayName || "প্রদান করা হয়নি"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-normal text-muted-foreground flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5" />
                              ইমেইল অ্যাড্রেস
                            </label>
                            <p className="text-lg font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                              {user.email}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-normal text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              ফোন নম্বর
                            </label>
                            <p className="text-lg font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                              {user.phoneNumber || "সংযুক্ত করা হয়নি"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-normal text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              একাউন্ট খোলার সময়
                            </label>
                            <p className="text-lg font-semibold text-foreground bg-muted/30 p-3 rounded-xl border border-border/50">
                              {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("bn-BD", { year: 'numeric', month: 'long', day: 'numeric' }) : "অজানা"}
                            </p>
                          </div>
                        </div>

                        <Separator className="opacity-50" />

                        <div className="flex flex-wrap gap-4 pt-2">
                          <Button className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
                            প্রোফাইল সম্পাদন করুন
                          </Button>
                          <Button variant="outline" className="rounded-xl h-12 px-6 border-primary/20 text-primary hover:bg-primary/5 transition-colors">
                            পাসওয়ার্ড পরিবর্তন করুন
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "addresses" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">ঠিকানা সমূহ</h2>
                      <Button className="rounded-xl gap-2 font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                        <MapPin className="h-4 w-4" />
                        নতুন ঠিকানা
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-5">
                      {/* Empty state for addresses as default for now */}
                      <div className="bg-card rounded-3xl p-16 border border-border border-dashed text-center shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                          <MapPin className="h-10 w-10 text-primary drop-shadow-sm" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          কোনো ঠিকানা সংরক্ষিত নেই
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
                          আপনার ডেলিভারি ঠিকানা সংরক্ষণ করুন যেন দ্রুত চেকআউট করা সম্ভব হয় এবং সময় বাঁচে।
                        </p>
                        <Button variant="outline" className="rounded-xl px-8 h-12 border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg transition-all duration-300">
                          ঠিকানা যোগ করুন
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Other states */}
                {(activeTab === "wishlist" || activeTab === "notifications" || activeTab === "settings") && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-card rounded-3xl border border-border border-dashed relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32"></div>
                    <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6 z-10 group-hover:bg-muted transition-colors duration-500">
                      <Clock className="h-10 w-10 text-muted-foreground animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2 z-10">শীঘ্রই আসছে</h3>
                    <p className="text-muted-foreground max-w-sm z-10 font-medium">এই চমৎকার ফিচারটি নিয়ে আমাদের ডেভেলপমেন্ট টিম কাজ করছে। একটি চমৎকার অভিজ্ঞতার জন্য সাথেই থাকুন!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
