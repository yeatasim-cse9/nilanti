import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  MessageCircle,
  Tag,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  TrendingUp,
  FileText,
  CreditCard,
  PlusCircle,
  Image,
  Puzzle,
  ExternalLink,
  Bell,
  Sparkles,
  Shield,
} from "lucide-react";
import { useSiteSettings } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  icon: any;
  label: string;
  href: string;
}

interface MenuGroup {
  icon: any;
  label: string;
  href?: string;
  children: MenuItem[];
}

type MenuItemOrGroup = MenuItem | MenuGroup;

const AdminLayout = () => {
  const { data: settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["অর্ডার", "পণ্য"]);
  const [scrolled, setScrolled] = useState(false);

  // Dynamic branding from settings
  const storeName = settings?.store_name || "Nilanti";
  const storeLogo = settings?.logo || "";
  const storeTagline = settings?.tagline || "";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const menuStructure: MenuItemOrGroup[] = [
    { icon: LayoutDashboard, label: "ড্যাশবোর্ড", href: "/admin" },
    {
      icon: ShoppingCart,
      label: "অর্ডার",
      href: "/admin/orders",
      children: [
        { icon: AlertCircle, label: "অসম্পূর্ণ অর্ডার", href: "/admin/incomplete-orders" },
        { icon: TrendingUp, label: "রিকভারি অ্যানালিটিক্স", href: "/admin/recovery-analytics" },
        { icon: CreditCard, label: "পেমেন্ট", href: "/admin/payments" },
        { icon: FileText, label: "ট্রানজ্যাকশন", href: "/admin/transactions" },
        { icon: Users, label: "কাস্টমার", href: "/admin/customers" },
      ],
    },
    {
      icon: Package,
      label: "পণ্য",
      href: "/admin/products",
      children: [
        { icon: PlusCircle, label: "নতুন পণ্য", href: "/admin/products/new" },
        { icon: FolderTree, label: "ক্যাটাগরি", href: "/admin/categories" },
        { icon: Tag, label: "কুপন", href: "/admin/coupons" },
        { icon: Truck, label: "ডেলিভারি জোন", href: "/admin/delivery-zones" },
      ],
    },
    { icon: MessageCircle, label: "লাইভ চ্যাট", href: "/admin/chat" },
    { 
      icon: FileText, 
      label: "কন্টেন্ট", 
      href: "/admin/content",
      children: [
        { icon: Image, label: "ব্যানার", href: "/admin/banners" },
      ],
    },
    { icon: Puzzle, label: "ইন্টিগ্রেশন", href: "/admin/integrations" },
    { icon: Settings, label: "সেটিংস", href: "/admin/settings" },
  ];

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <p className="font-bold text-primary animate-pulse uppercase tracking-[0.2em] text-xs">Loading Admin...</p>
        </div>
      </div>
    );
  }

  // Auth check
  if (!user || !isAdmin) {
    navigate("/auth");
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname === href || location.pathname.startsWith(href + "/");
  };

  const isGroupActive = (group: MenuGroup) => {
    if (group.href && isActive(group.href)) return true;
    return group.children.some((child) => isActive(child.href));
  };

  const isMenuGroup = (item: MenuItemOrGroup): item is MenuGroup => {
    return "children" in item;
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => (
    <Link
      key={item.href}
      to={item.href}
      className={cn(
        "group/item flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative",
        isChild ? "ml-4 pl-4 text-[12.5px] py-2" : "mb-0.5",
        isActive(item.href)
          ? "bg-white/[0.12] text-white shadow-lg shadow-white/[0.05] backdrop-blur-sm"
          : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
      )}
    >
      {/* Active indicator bar */}
      {isActive(item.href) && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
      )}
      {/* Child item connector line */}
      {isChild && !isActive(item.href) && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-white/20" />
      )}
      <item.icon className={cn(
        "h-4 w-4 transition-all duration-300 flex-shrink-0",
        isActive(item.href) 
          ? "text-blue-300 drop-shadow-[0_0_4px_rgba(147,197,253,0.5)]" 
          : "opacity-50 group-hover/item:opacity-80"
      )} />
      <span className="truncate">{item.label}</span>
      {isActive(item.href) && (
        <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)] animate-pulse" />
      )}
    </Link>
  );

  const renderMenuGroup = (group: MenuGroup) => {
    const isOpen = openGroups.includes(group.label);
    const groupActive = isGroupActive(group);

    return (
      <Collapsible
        key={group.label}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.label)}
        className="mb-0.5"
      >
        <div className="space-y-0.5">
          <div className="flex items-center">
            {group.href ? (
              <Link
                to={group.href}
                className={cn(
                  "group/item flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 relative",
                  isActive(group.href)
                    ? "bg-white/[0.12] text-white shadow-lg shadow-white/[0.05] backdrop-blur-sm"
                    : groupActive
                    ? "text-white/80 bg-white/[0.04]"
                    : "text-white/55 hover:text-white/90 hover:bg-white/[0.06]"
                )}
              >
                {isActive(group.href) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
                <group.icon className={cn(
                  "h-4 w-4 transition-all duration-300 flex-shrink-0",
                  isActive(group.href) || groupActive
                    ? "text-blue-300 drop-shadow-[0_0_4px_rgba(147,197,253,0.5)]" 
                    : "opacity-50"
                )} />
                <span className="truncate">{group.label}</span>
                {isActive(group.href) && (
                  <span className="absolute right-10 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)] animate-pulse" />
                )}
              </Link>
            ) : (
              <div
                className={cn(
                  "flex-1 flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold rounded-xl",
                  groupActive ? "text-white/80 bg-white/[0.04]" : "text-white/55"
                )}
              >
                <group.icon className={cn("h-4 w-4 flex-shrink-0", groupActive ? "text-blue-300 opacity-100" : "opacity-50")} />
                <span className="truncate">{group.label}</span>
              </div>
            )}
            <CollapsibleTrigger asChild>
              <button className="touch-target p-2 hover:bg-white/[0.08] rounded-xl transition-all duration-300 ml-0.5 group/chevron">
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 text-white/40 transition-all duration-500 group-hover/chevron:text-white/70",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-0.5 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down">
            <div className="pt-0.5 pb-1 ml-2 border-l border-white/[0.06] pl-0">
              {group.children.map((child) => renderMenuItem(child, true))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Mobile Top App Bar */}
      <header className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-[60] transition-all duration-300 px-3",
        scrolled ? "h-14 py-1.5" : "h-16 py-2"
      )}>
        <div className="flex items-center justify-between h-full bg-[#0f172a]/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl px-4 shadow-2xl shadow-black/20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="touch-target w-10 h-10 hover:bg-white/[0.08] rounded-xl transition-all active:scale-90 flex items-center justify-center"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-white/80" />
          </button>
          
          <Link to="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
              {storeLogo ? (
                <img src={storeLogo} alt={storeName} className="w-full h-full object-contain p-1.5" />
              ) : (
                <Sparkles className="h-4 w-4 text-blue-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-sm leading-none tracking-tight">{storeName}</span>
              <span className="text-[9px] font-medium text-white/40 uppercase tracking-widest mt-0.5">Admin</span>
            </div>
          </Link>

          <button className="touch-target w-10 h-10 hover:bg-white/[0.08] rounded-xl transition-all flex items-center justify-center relative">
            <Bell className="h-4.5 w-4.5 text-white/60" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-blue-500 rounded-full border border-[#0f172a] ring-2 ring-blue-500/30" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay (Mobile only) */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── SIDEBAR ─── */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 left-0 z-[80] h-[100dvh] w-[270px] flex-shrink-0",
            "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
            "lg:translate-x-0",   /* Always visible on desktop — cannot close */
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Background — dark gradient with depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c1524] via-[#0f172a] to-[#0c1222] border-r border-white/[0.04]" />
          
          {/* Subtle noise/glow accent */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-blue-600/[0.06] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

          <div className="flex flex-col h-full relative z-10">
            {/* ─── Logo Section ─── */}
            <div className="px-5 pt-6 pb-5">
              <div className="flex items-center justify-between">
                <Link to="/admin" className="flex items-center gap-3 group transition-transform hover:scale-[1.02] active:scale-[0.98] duration-300">
                  {/* Logo container with animated glow */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-600/20 border border-white/[0.1] flex items-center justify-center shadow-xl shadow-blue-900/30 group-hover:shadow-blue-500/20 transition-all duration-500">
                      {storeLogo ? (
                        <img 
                          src={storeLogo} 
                          alt={storeName} 
                          className="w-full h-full object-contain p-2 transition-transform group-hover:scale-110 duration-700" 
                        />
                      ) : (
                        <Sparkles className="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                      )}
                    </div>
                    {/* Glow ring */}
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white text-[15px] leading-tight tracking-tight truncate">
                      {storeName}
                    </span>
                    <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.15em] mt-0.5">
                      Admin Panel
                    </span>
                  </div>
                </Link>

                {/* Close button — mobile only */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden touch-target w-9 h-9 hover:bg-white/[0.08] rounded-xl transition-all flex items-center justify-center border border-white/[0.06]"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>
            </div>

            {/* Divider with gradient */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* ─── Navigation ─── */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar space-y-0.5">
              <div className="mb-3 px-4 text-[10px] font-semibold text-white/25 uppercase tracking-[0.2em]">
                Navigation
              </div>
              {menuStructure.map((item) =>
                isMenuGroup(item) ? renderMenuGroup(item) : renderMenuItem(item)
              )}
            </nav>

            {/* Divider */}
            <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

            {/* ─── User Profile & Footer ─── */}
            <div className="p-4">
              <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3.5 border border-white/[0.06] space-y-3">
                {/* User info */}
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-600/25 flex items-center justify-center border border-white/[0.08] shadow-lg shadow-blue-900/20">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white/90 truncate">{user?.email?.split('@')[0]}</span>
                    <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">Administrator</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-1">
                  <Link to="/" target="_blank">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between gap-2 h-9 rounded-xl text-[11px] font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all border-0"
                    >
                      <span className="flex items-center gap-2">
                        <ExternalLink className="h-3.5 w-3.5" /> View Store
                      </span>
                      <ChevronRight className="h-3 w-3 opacity-30" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-9 rounded-xl text-[11px] font-medium text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all border-0"
                    onClick={() => {
                      signOut();
                      navigate("/");
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    লগআউট
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="flex-1 min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="p-4 sm:p-8 lg:p-12 pt-20 lg:pt-12 relative z-10">
            <div className="max-w-[1400px] mx-auto stagger-children">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
