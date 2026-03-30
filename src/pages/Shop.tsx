import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Grid3X3, LayoutList, Search, X, SlidersHorizontal, Sparkles, Package, Tag, ArrowUpDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";

// Types
interface Category {
  id: string;
  name_bn: string;
  slug: string;
  image_url: string | null;
  sort_order?: number;
}

interface Product {
  id: string;
  name_bn: string;
  slug: string;
  images: string[] | null;
  base_price: number;
  sale_price: number | null;
  is_featured: boolean;
  category_id: string | null;
  stock_quantity: number | null;
}

const SORT_OPTIONS = [
  { value: "newest", label: "নতুন পণ্য" },
  { value: "featured", label: "বিশেষ পণ্য" },
  { value: "price-low", label: "দাম: কম → বেশি" },
  { value: "price-high", label: "দাম: বেশি → কম" },
];

const Shop = () => {
  const { getItemCount } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States (Initialized from URL if available)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("cat") ? searchParams.get("cat")!.split(",") : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("max") || "");

  // URL Synchronization
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategories.length > 0) params.set("cat", selectedCategories.join(","));
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);

    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategories, sortBy, minPrice, maxPrice, setSearchParams]);

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const categoriesQuery = query(collection(db, "categories"), where("is_active", "==", true));
      const productsQuery = query(collection(db, "products"), where("is_active", "==", true));

      const [categoriesSnap, productsSnap] = await Promise.all([
        getDocs(categoriesQuery),
        getDocs(productsQuery),
      ]);

      const categoriesData = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
      categoriesData.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

      const productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];

      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  }, []);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSortBy("newest");
    setMinPrice("");
    setMaxPrice("");
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const currentPrice = product.sale_price || product.base_price;
        const matchesSearch = searchQuery.trim() === "" || product.name_bn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || (product.category_id && selectedCategories.includes(product.category_id));
        const matchesMinPrice = minPrice === "" || currentPrice >= Number(minPrice);
        const matchesMaxPrice = maxPrice === "" || currentPrice <= Number(maxPrice);

        return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
      })
      .sort((a, b) => {
        const priceA = a.sale_price || a.base_price;
        const priceB = b.sale_price || b.base_price;

        switch (sortBy) {
          case "price-low": return priceA - priceB;
          case "price-high": return priceB - priceA;
          case "featured": return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
          default: return 0;
        }
      });
  }, [products, searchQuery, selectedCategories, sortBy, minPrice, maxPrice]);

  const selectedCategoryNames = useMemo(() => {
    return selectedCategories.map(id => categories.find(c => c.id === id)?.name_bn).filter(Boolean);
  }, [selectedCategories, categories]);

  // ─── Components ─────────────────────────────────────────────

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-none overflow-hidden border border-border/50 bg-card" style={{ animationDelay: `${i * 80}ms` }}>
          <div className="aspect-square bg-gradient-to-br from-muted/60 via-muted/30 to-muted/60 animate-pulse" />
          <div className="p-4 space-y-3">
            <div className="h-3 bg-muted/50 rounded-none animate-pulse w-2/3" />
            <div className="h-4 bg-muted/50 rounded-none animate-pulse w-1/2" />
            <div className="h-10 bg-muted/40 rounded-none animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-none bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center">
          <Package className="w-14 h-14 text-primary/40" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center animate-bounce">
          <Search className="w-4 h-4 text-accent/50" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground/80 mb-2">কোনো পণ্য পাওয়া যায়নি</h3>
      <p className="text-muted-foreground text-sm max-w-sm">আপনার সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
      <Button variant="outline" className="mt-6 gap-2 rounded-full border-primary/20 hover:bg-primary/5" onClick={clearAllFilters}>
        <X className="w-4 h-4" /> সব ফিল্টার মুছুন
      </Button>
    </div>
  );

  const FilterSidebar = () => (
    <div className="space-y-8">
      {/* Price Range Filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center font-bold text-primary text-lg leading-none">
            ৳
          </div>
          <h3 className="font-bold text-foreground text-sm tracking-normal uppercase font-bengali">দামের রেঞ্জ</h3>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="সর্বনিম্ন"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm rounded-lg"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="সর্বোচ্চ"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm rounded-lg"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-none bg-primary/10 flex items-center justify-center">
            <Tag className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-bold text-foreground text-sm tracking-normal uppercase">ক্যাটাগরি</h3>
        </div>
        <div className="space-y-1.5">
          {categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center gap-3 cursor-pointer group px-3 py-2.5 rounded-none transition-all duration-200
                ${selectedCategories.includes(category.id) ? "bg-primary/8 border border-primary/15" : "hover:bg-muted/60 border border-transparent"}`}
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
                className="data-[state=checked]:bg-primary"
              />
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {category.image_url && (
                  <div className="w-7 h-7 rounded-none overflow-hidden flex-shrink-0 border border-border/50">
                    <img src={category.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <span className={`text-sm font-medium transition-colors truncate ${selectedCategories.includes(category.id) ? "text-primary" : "text-foreground/70 group-hover:text-foreground"}`}>
                  {category.name_bn}
                </span>
              </div>
              <span className="text-xs text-muted-foreground/60 flex-shrink-0 font-bengali">
                {products.filter(p => p.category_id === category.id).length.toLocaleString('bn-BD')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(selectedCategories.length > 0 || minPrice || maxPrice) && (
        <div className="pt-4 border-t border-border/50 space-y-3">
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="w-full text-destructive/80 hover:text-destructive hover:bg-destructive/5 rounded-none font-medium text-xs h-9 mt-1">
            <X className="h-3.5 w-3.5 mr-1.5" /> সব ফিল্টার রিসেট করুন
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header cartCount={getItemCount()} />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/85">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="container relative z-10 py-12 md:py-20 lg:py-24 max-w-6xl">
            <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[10px] font-black uppercase tracking-normal ring-1 ring-white/20 font-bengali">
                প্রিমিয়াম কালেকশন
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight font-bengali leading-[1.1]">
                খুঁজুন আপনার পছন্দের স্টাইল
              </h1>
              <p className="text-lg md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed font-bengali">
                হাজারো হিজাব ও আবায়া থেকে নিজের জন্য সেরাটি বেছে নিন। প্রিমিয়াম কোয়ালিটি আর আধুনিক ডিজাইনের দারুণ সব কালেকশন এখন আপনার হাতের মুঠোয়।
              </p>

              {/* Search */}
              <div className="w-full md:w-[400px] animate-in slide-in-from-bottom-4 duration-700">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40 group-focus-within:text-accent transition-colors" />
                  <Input
                    type="search"
                    placeholder="পছন্দের পণ্যটি খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-12 h-14 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 rounded-none focus:bg-white/15 focus:border-accent/40 text-base shadow-lg shadow-black/10 font-bengali"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="container py-8 md:py-12 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-[100px] bg-white rounded-none p-6 border border-border overflow-y-auto max-h-[calc(100vh-120px)] shadow-sm scrollbar-hide">
                <FilterSidebar />
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-none h-10 px-4">
                        <SlidersHorizontal className="h-4 w-4" /> ফিল্টার
                        {(selectedCategories.length > 0 || minPrice || maxPrice) && (
                          <Badge className="h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-primary rounded-full">!</Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[320px] sm:w-[380px]">
                      <SheetHeader>
                        <SheetTitle className="flex items-center gap-2"><SlidersHorizontal className="h-5 w-5 text-primary" /> ফিল্টার</SheetTitle>
                      </SheetHeader>
                      <div className="mt-8"><FilterSidebar /></div>
                    </SheetContent>
                  </Sheet>

                  <span className="hidden sm:inline-block font-medium text-muted-foreground font-bengali">{filteredProducts.length.toLocaleString('bn-BD')}টি পণ্য পাওয়া গেছে</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[170px] h-10 rounded-none border-border/60 bg-card">
                      <div className="flex items-center gap-2"><ArrowUpDown className="h-3.5 w-3.5" /><SelectValue placeholder="সাজান" /></div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {SORT_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:flex items-center bg-card border border-border/60 rounded-none p-1 gap-0.5">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-none ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}><Grid3X3 className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-none ${viewMode === "list" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50"}`}><LayoutList className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>

              {/* Products Render */}
              {loading ? (
                <LoadingSkeleton />
              ) : filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" : "space-y-6"}>
                  {filteredProducts.map((product, index) => (
                    <div key={product.id} className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${index * 50}ms` }}>
                      <ProductCard
                        id={product.id}
                        name_bn={product.name_bn}
                        slug={product.slug}
                        image_url={product.images?.[0] || "/placeholder.svg"}
                        base_price={product.base_price}
                        sale_price={product.sale_price}
                        is_featured={product.is_featured}
                        stock_quantity={product.stock_quantity || 0}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;