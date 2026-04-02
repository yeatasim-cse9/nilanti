import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, PackageSearch } from "lucide-react";
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
  const { data: settings } = useSiteSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        scrolled
          ? "bg-white/85 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_24px_rgba(0,0,0,0.06)] border-b border-gray-100/80"
          : "bg-white/60 backdrop-blur-xl border-b border-transparent"
      }`}
    >
      {/* Main header */}
      <div className="container">
        <div className="flex items-center justify-between h-[60px] md:h-[68px] gap-3">
          {/* Mobile menu — 48px touch target */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="touch-target rounded-xl hover:bg-gray-100/80 active:scale-95 transition-all">
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85vw] max-w-[320px] p-0 border-none">
              <div className="flex flex-col h-full bg-white">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-gray-50">
                  <SheetTitle className="flex items-center gap-2.5">
                    {settings?.logo ? (
                      <img src={settings.logo} alt="Nilanti" className="h-7 w-auto" />
                    ) : null}
                    <span className="text-lg font-extrabold tracking-tight text-gray-900">
                      {settings?.store_name || "নীলান্তি"}
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100 transition-all"
                    >
                      {link.icon && <link.icon className="h-4.5 w-4.5 text-gray-400" />}
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <div className="px-6 py-5 border-t border-gray-50">
                  <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                    {settings?.tagline || "বিশ্বস্ততার বুনন..."}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <img
              src={settings?.logo || "/logo.png"}
              alt={settings?.store_name || "Nilanti"}
              className="h-9 md:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:block">
              <h1 className="text-base md:text-lg font-extrabold text-gray-900 leading-tight tracking-tight">
                {settings?.store_name || "নীলান্তি"}
              </h1>
              <p className="text-[9px] md:text-[10px] text-gray-400 -mt-0.5 font-medium uppercase tracking-[0.08em]">
                {settings?.tagline || "বিশ্বস্ততার বুনন..."}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-4 py-2 rounded-lg text-[13px] font-semibold text-gray-500 hover:text-gray-900 transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gray-900 rounded-full transition-all duration-300 group-hover:w-4/5" />
              </Link>
            ))}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-1 md:gap-1.5">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center relative">
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                className="w-52 xl:w-64 pr-10 bg-gray-50/80 border-gray-100 rounded-xl text-sm h-10 focus:bg-white focus:border-gray-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-3 text-gray-400 hover:text-gray-700 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden touch-target rounded-xl hover:bg-gray-100/80 active:scale-95 transition-all"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              {isSearchOpen ? <X className="h-5 w-5 text-gray-700" /> : <Search className="h-5 w-5 text-gray-700" />}
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative touch-target rounded-xl hover:bg-gray-100/80 active:scale-95 transition-all">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 h-[18px] min-w-[18px] px-1 rounded-full bg-gray-900 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Account */}
            <Link to="/account">
              <Button variant="ghost" size="icon" className="touch-target rounded-xl hover:bg-gray-100/80 active:scale-95 transition-all">
                <User className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar — smooth slide */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-400 ease-out ${
            isSearchOpen ? "max-h-20 opacity-100 pb-3" : "max-h-0 opacity-0"
          }`}
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="search"
                placeholder="পণ্য খুঁজুন..."
                className="w-full pr-10 h-11 bg-gray-50/80 border-gray-100 rounded-xl text-[15px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="h-4.5 w-4.5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;
