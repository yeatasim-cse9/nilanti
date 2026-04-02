import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";

// Pages
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderTracking from "./pages/OrderTracking";
import PaymentSuccess from "./pages/PaymentSuccess";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// Admin
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminCoupons from "./pages/admin/Coupons";
import AdminDeliveryZones from "./pages/admin/DeliveryZones";
import AdminBanners from "./pages/admin/Banners";
import AdminSettings from "./pages/admin/Settings";
import AdminChat from "./pages/admin/Chat";
import AdminIncompleteOrders from "./pages/admin/IncompleteOrders";
import AdminRecoveryAnalytics from "./pages/admin/RecoveryAnalytics";
import AdminContent from "./pages/admin/Content";
import AdminNewProduct from "./pages/admin/NewProduct";
import AdminTransactions from "./pages/admin/Transactions";
import AdminPayments from "./pages/admin/Payments";
import AdminIntegrations from "./pages/admin/Integrations";
import LiveChatWidget from "./components/chat/LiveChatWidget";
import MetaPixel from "./components/MetaPixel";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — data is considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes — keep inactive data in cache
      refetchOnWindowFocus: false, // Don't refetch when tab regains focus
      retry: 1, // Only retry once on failure
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <MetaPixel />
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/category/:slug" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
              <Route path="/track-order" element={<OrderTracking />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/account" element={<Account />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/return-policy" element={<ReturnPolicy />} />
              <Route path="/shipping-policy" element={<ShippingPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="incomplete-orders" element={<AdminIncompleteOrders />} />
                <Route path="recovery-analytics" element={<AdminRecoveryAnalytics />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="customers" element={<AdminCustomers />} />
                
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminNewProduct />} />
                <Route path="products/:id/edit" element={<AdminNewProduct />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="delivery-zones" element={<AdminDeliveryZones />} />
                
                <Route path="chat" element={<AdminChat />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="integrations" element={<AdminIntegrations />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <LiveChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
