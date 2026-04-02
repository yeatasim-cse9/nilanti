import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, X, SlidersHorizontal, Package, Tag, ArrowUpDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/home/ProductCard";

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("cat") ? searchParams.get("cat")!.split(",") : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("max") || "");

  // URL Sync
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const [categoriesSnap, productsSnap] = await Promise.all([
          getDocs(query(collection(db, "categories"), where("is_active", "==", true))),
          getDocs(query(collection(db, "products"), where("is_active", "==", true))),
        ]);
        const cats = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        cats.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        setCategories(cats);
        setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const activeFilterCount = (selectedCategories.length > 0 ? 1 : 0) + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // Filter & Sort
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

  // ─── Filter Sidebar Content ─────────────────────────────────
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-6">
      {/* Search — mobile only inside filter */}
      {isMobile && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="পণ্য খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-lg bg-gray-50 border-gray-200 text-sm"
          />
        </div>
      )}

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">৳</span>
          দামের রেঞ্জ
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="সর্বনিম্ন"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm rounded-lg bg-gray-50 border-gray-200"
          />
          <span className="text-gray-300 text-sm">—</span>
          <Input
            type="number"
            placeholder="সর্বোচ্চ"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm rounded-lg bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Tag className="h-3.5 w-3.5 text-primary" />
          ক্যাটাগরি
        </h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <label
              key={category.id}
              className={`flex items-center gap-3 cursor-pointer px-2.5 py-2 rounded-lg transition-colors ${
                selectedCategories.includes(category.id)
                  ? "bg-primary/5 text-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Checkbox
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm font-medium flex-1 truncate">{category.name_bn}</span>
              <span className="text-xs text-gray-400 tabular-nums">
                {products.filter(p => p.category_id === category.id).length}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs h-9"
        >
          <X className="h-3.5 w-3.5 mr-1.5" /> সব ফিল্টার রিসেট
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartCount={getItemCount()} />

      <main className="flex-1">
        {/* Compact Hero / Search Bar */}
        <div className="bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4 py-5 md:py-8">
            <div className="max-w-2xl mx-auto text-center space-y-3">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">সকল পণ্য</h1>
              <p className="text-sm text-gray-500 hidden md:block">
                আমাদের সম্পূর্ণ কালেকশন ব্রাউজ করুন এবং পছন্দের পণ্য খুঁজে নিন
              </p>
              {/* Desktop Search */}
              <div className="hidden md:block max-w-md mx-auto pt-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="পণ্য খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-white border-gray-200 text-sm shadow-sm focus:shadow-md transition-shadow"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills — horizontal scroll */}
        {categories.length > 0 && (
          <div className="border-b border-gray-100 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategories.length === 0
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  সকল
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (selectedCategories.includes(cat.id)) {
                        setSelectedCategories(prev => prev.filter(id => id !== cat.id));
                      } else {
                        setSelectedCategories([cat.id]);
                      }
                    }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategories.includes(cat.id)
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name_bn}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="sticky top-24 space-y-1">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">ফিল্টার</h2>
                <FilterContent />
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  {/* Mobile Search */}
                  <div className="md:hidden relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="খুঁজুন..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-9 text-sm rounded-lg bg-gray-50 border-gray-200 w-full"
                    />
                  </div>

                  {/* Mobile Filter Sheet */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-1.5 rounded-lg h-9 px-3 text-xs shrink-0 border-gray-200">
                        <SlidersHorizontal className="h-3.5 w-3.5" /> ফিল্টার
                        {activeFilterCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
                      <SheetHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <SheetTitle className="text-base">ফিল্টার</SheetTitle>
                        </div>
                      </SheetHeader>
                      <div className="pt-4 pb-6">
                        <FilterContent isMobile />
                        <SheetClose asChild>
                          <Button className="w-full mt-6 h-11 rounded-xl">
                            {filteredProducts.length} পণ্য দেখুন
                          </Button>
                        </SheetClose>
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="hidden md:block text-sm text-gray-400">
                    {filteredProducts.length} পণ্য
                  </span>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto min-w-[140px] h-9 rounded-lg border-gray-200 text-xs bg-white">
                    <div className="flex items-center gap-1.5">
                      <ArrowUpDown className="h-3 w-3 text-gray-400" />
                      <SelectValue placeholder="সাজান" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters Chips */}
              {(selectedCategories.length > 0 || searchQuery || minPrice || maxPrice) && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                      "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  {selectedCategories.map(id => {
                    const cat = categories.find(c => c.id === id);
                    return cat ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs text-primary font-medium">
                        {cat.name_bn}
                        <button onClick={() => toggleCategory(id)}><X className="h-3 w-3" /></button>
                      </span>
                    ) : null;
                  })}
                  {(minPrice || maxPrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-600">
                      ৳{minPrice || "০"} — ৳{maxPrice || "∞"}
                      <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                    </span>
                  )}
                  <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1">
                    সব মুছুন
                  </button>
                </div>
              )}

              {/* Products */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden bg-white border border-gray-100">
                      <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Package className="w-7 h-7 text-gray-300" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">কোনো পণ্য পাওয়া যায়নি</h3>
                  <p className="text-sm text-gray-500 mb-4 max-w-xs">আপনার সার্চ বা ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                  <Button variant="outline" size="sm" onClick={clearAllFilters} className="rounded-lg gap-1.5 text-xs">
                    <X className="w-3.5 h-3.5" /> সব ফিল্টার মুছুন
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile product count */}
                  <p className="text-xs text-gray-400 mb-3 md:hidden">{filteredProducts.length} পণ্য দেখানো হচ্ছে</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name_bn={product.name_bn}
                        slug={product.slug}
                        image_url={product.images?.[0] || ""}
                        base_price={product.base_price}
                        sale_price={product.sale_price}
                        is_featured={product.is_featured}
                        stock_quantity={product.stock_quantity || 0}
                      />
                    ))}
                  </div>
                </>
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