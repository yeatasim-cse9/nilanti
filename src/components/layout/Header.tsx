import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingCart, User, X, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSiteSettings } from "@/hooks/useAdminData";

interface HeaderProps {
  cartCount?: number;
}

const Header = ({ cartCount = 0 }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { name: "হোম", href: "/" },
    { name: "সকল পণ্য", href: "/shop" },
    { name: "আমাদের সম্পর্কে", href: "/about" },
    { name: "যোগাযোগ", href: "/contact" },
    { name: "অর্ডার ট্র্যাক", href: "/track-order", icon: PackageSearch },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 header-entrance"
        style={{
          background: scrolled
            ? "rgba(255,255,255,0.82)"
            : "rgba(255,255,255,0.55)",
          backdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: scrolled ? "blur(24px) saturate(1.8)" : "blur(16px) saturate(1.4)",
          borderBottom: scrolled
            ? "1px solid rgba(0,0,0,0.06)"
            : "1px solid transparent",
          transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: scrolled
            ? "0 1px 3px rgba(0,0,0,0.02), 0 8px 32px rgba(0,0,0,0.04)"
            : "none",
        }}
      >
        <div className="container">
          <div className="flex items-center justify-between h-[56px] md:h-[64px] gap-2">
            {/* ═══ Mobile hamburger — animated 3-line to X ═══ */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button
                  className="relative w-11 h-11 flex items-center justify-center rounded-2xl hover:bg-black/[0.04] active:bg-black/[0.08] transition-colors icon-tap"
                  aria-label="মেনু"
                >
                  <div className="w-[18px] h-[14px] flex flex-col justify-between">
                    <span
                      className="block h-[1.5px] bg-gray-800 rounded-full transition-all duration-300 origin-center"
                      style={{
                        transform: isMenuOpen
                          ? "translateY(6.25px) rotate(45deg)"
                          : "none",
                        width: isMenuOpen ? "18px" : "18px",
                      }}
                    />
                    <span
                      className="block h-[1.5px] bg-gray-800 rounded-full transition-all duration-300"
                      style={{
                        opacity: isMenuOpen ? 0 : 1,
                        transform: isMenuOpen ? "scaleX(0)" : "scaleX(1)",
                        width: "12px",
                      }}
                    />
                    <span
                      className="block h-[1.5px] bg-gray-800 rounded-full transition-all duration-300 origin-center"
                      style={{
                        transform: isMenuOpen
                          ? "translateY(-6.25px) rotate(-45deg)"
                          : "none",
                        width: isMenuOpen ? "18px" : "15px",
                      }}
                    />
                  </div>
                </button>
              </SheetTrigger>

              {/* ═══ Mobile Menu — premium slide-in ═══ */}
              <SheetContent
                side="left"
                className="w-[82vw] max-w-[340px] p-0 border-none"
                style={{
                  background: "rgba(255,255,255,0.96)",
                  backdropFilter: "blur(40px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(40px) saturate(1.8)",
                }}
              >
                <div className="flex flex-col h-full">
                  <SheetHeader className="px-7 pt-7 pb-5">
                    <SheetTitle className="flex items-center gap-3">
                      {settings?.logo ? (
                        <img
                          src={settings.logo}
                          alt="Nilanti"
                          className="h-8 w-auto"
                        />
                      ) : null}
                      <div>
                        <span className="text-lg font-extrabold tracking-tight text-gray-900 block">
                          {settings?.store_name || "নীলান্তি"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium tracking-[0.12em] uppercase block -mt-0.5">
                          {settings?.tagline || "বিশ্বস্ততার বুনন"}
                        </span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  {/* Divider — subtle gradient line */}
                  <div className="mx-7 h-[1px] bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

                  <nav className="flex-1 px-4 py-5 space-y-0.5 overflow-y-auto">
                    {navLinks.map((link, i) => {
                      const isActive = location.pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold transition-all duration-300 group relative overflow-hidden"
                          style={{
                            color: isActive ? "#1a1a2e" : "#6b7280",
                            background: isActive
                              ? "rgba(0,0,0,0.04)"
                              : "transparent",
                            animationDelay: `${i * 60}ms`,
                          }}
                        >
                          {link.icon && (
                            <link.icon
                              className="h-[18px] w-[18px] transition-colors"
                              style={{
                                color: isActive ? "#1a1a2e" : "#9ca3af",
                              }}
                            />
                          )}
                          <span className="relative">
                            {link.name}
                            {isActive && (
                              <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-gray-900 rounded-full" />
                            )}
                          </span>

                          {/* Hover ripple */}
                          <span className="absolute inset-0 bg-black/[0.02] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="px-7 py-6 border-t border-gray-100/60">
                    <p className="text-[10px] text-gray-400/80 font-semibold tracking-[0.15em] uppercase">
                      {settings?.tagline || "বিশ্বস্ততার বুনন..."}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* ═══ Logo — refined with subtle hover animation ═══ */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="relative">
                <img
                  src={settings?.logo || "/logo.png"}
                  alt={settings?.store_name || "Nilanti"}
                  className="h-8 md:h-9 w-auto object-contain transition-all duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-[15px] md:text-base font-extrabold text-gray-900 leading-tight tracking-tight">
                  {settings?.store_name || "নীলান্তি"}
                </h1>
                <p className="text-[8px] md:text-[9px] text-gray-400 font-semibold uppercase tracking-[0.12em] -mt-px">
                  {settings?.tagline || "বিশ্বস্ততার বুনন..."}
                </p>
              </div>
            </Link>

            {/* ═══ Desktop Navigation — minimal with animated underline ═══ */}
            <nav className="hidden md:flex items-center gap-0">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="relative px-4 py-2 text-[13px] font-semibold transition-colors duration-300 group"
                    style={{
                      color: isActive ? "#111827" : "#9ca3af",
                    }}
                  >
                    <span className="relative z-10">{link.name}</span>

                    {/* Active state — thin bottom line */}
                    <span
                      className="absolute bottom-0 left-1/2 h-[1.5px] bg-gray-900 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: isActive ? "60%" : "0%",
                        transform: "translateX(-50%)",
                      }}
                    />

                    {/* Hover state — expand line */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-gray-400 rounded-full transition-all duration-400 group-hover:w-[40%]"
                      style={{ display: isActive ? "none" : "block" }}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ═══ Actions — clean icons with micro-interactions ═══ */}
            <div className="flex items-center gap-0.5 md:gap-1">
              {/* Desktop Search — frosted pill */}
              <form
                onSubmit={handleSearch}
                className="hidden lg:flex items-center relative"
              >
                <div className="relative group">
                  <Input
                    type="search"
                    placeholder="পণ্য খুঁজুন..."
                    className="w-48 xl:w-56 pr-9 h-9 text-[13px] rounded-xl border-0 bg-black/[0.03] focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all duration-300 placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <Search className="h-[15px] w-[15px]" />
                  </button>
                </div>
              </form>

              {/* Mobile Search Icon */}
              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/[0.04] active:bg-black/[0.08] transition-all icon-tap"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="সার্চ"
              >
                {isSearchOpen ? (
                  <X className="h-[18px] w-[18px] text-gray-700" />
                ) : (
                  <Search className="h-[18px] w-[18px] text-gray-600" />
                )}
              </button>

              {/* Cart — with animated badge */}
              <Link to="/cart">
                <button className="relative w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-xl hover:bg-black/[0.04] active:bg-black/[0.08] transition-all icon-tap">
                  <ShoppingCart className="h-[18px] w-[18px] text-gray-600" />
                  {cartCount > 0 && (
                    <span
                      className="absolute top-1 right-1 flex items-center justify-center"
                      style={{
                        animation: "hero-badge-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                      }}
                    >
                      <span className="h-[17px] min-w-[17px] px-1 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center ring-[1.5px] ring-white">
                        {cartCount > 99 ? "99+" : cartCount}
                      </span>
                    </span>
                  )}
                </button>
              </Link>

              {/* Account */}
              <Link to="/account">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-black/[0.04] active:bg-black/[0.08] transition-all icon-tap">
                  <User className="h-[18px] w-[18px] text-gray-600" />
                </button>
              </Link>
            </div>
          </div>

          {/* ═══ Mobile Expandable Search — frosted glass overlay ═══ */}
          <div
            className="lg:hidden overflow-hidden transition-all duration-500 ease-out"
            style={{
              maxHeight: isSearchOpen ? "64px" : "0px",
              opacity: isSearchOpen ? 1 : 0,
              paddingBottom: isSearchOpen ? "12px" : "0px",
            }}
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="কি খুঁজছেন?"
                  className="w-full pr-10 h-11 text-[15px] rounded-2xl border-0 bg-black/[0.04] focus:bg-white focus:ring-1 focus:ring-gray-200 transition-all placeholder:text-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
