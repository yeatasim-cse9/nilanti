import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Minus, Plus, ShoppingCart, Truck, Shield, Check, Send, RefreshCw, Heart, ArrowRight, MessageSquare, Share2, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, addDoc, query, where, orderBy, limit } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MiniCartPopup from "@/components/cart/MiniCartPopup";
import { Skeleton } from "@/components/ui/skeleton";
import { trackViewContent, trackAddToCart } from "@/lib/tracking";

interface ProductVariant {
  color: string;
  size: string;
  price: number;
  stock: number;
  sku: string;
}

interface SizeChart {
  headers: string[];
  rows: string[][];
}

interface Product {
  id: string;
  name: string;
  name_bn: string;
  slug: string;
  description_bn: string | null;
  images: string[] | null;
  base_price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  is_featured: boolean | null;
  category_id: string | null;
  fabric?: string;
  fabric_composition?: string;
  gsm?: string;
  returnable?: boolean;
  return_period?: string;
  exchangeable?: boolean;
  pre_order?: boolean;
  estimated_delivery?: string;
  selected_sizes?: string[];
  colors?: { name: string; code: string; image?: string }[];
  variants?: ProductVariant[];
  tags?: string[];
  wash_instructions?: string[];
  features?: string[];
  composition?: string;
  care_instructions?: string[];
  short_description?: string;
  size_chart?: SizeChart;
  frequently_bought_ids?: string[];
  related_product_ids?: string[];
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: any;
}

const ProductDetail = () => {
  const { slug } = useParams();
  const { addItem, getItemCount, getSubtotal } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [addedItem, setAddedItem] = useState<{
    name_bn: string;
    variant_name_bn?: string;
    image_url: string;
    price: number;
    quantity: number;
  } | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Review form state
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Fetch product by slug
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;
      const q = query(collection(db, 'products'), where('slug', '==', slug), where('is_active', '==', true), limit(1));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      const d = querySnapshot.docs[0];
      return { id: d.id, ...d.data() } as Product;
    },
    enabled: !!slug,
  });

  // Fetch category name
  const { data: category } = useQuery({
    queryKey: ['category', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return null;
      const docRef = doc(db, 'categories', product.category_id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: docSnap.id, ...data } as { id: string; name_bn: string; slug: string };
      }
      return null;
    },
    enabled: !!product?.category_id,
  });

  const variants = product?.variants || [];

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', product?.id],
    queryFn: async () => {
      const q = query(
        collection(db, 'reviews'),
        where('product_id', '==', product!.id),
        where('is_approved', '==', true),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    },
    enabled: !!product?.id,
  });

  // Fetch related products
  const { data: frequentlyBoughtTogether = [] } = useQuery({
    queryKey: ['frequently-bought', product?.frequently_bought_ids],
    queryFn: async () => {
      if (!product?.frequently_bought_ids?.length) return [];
      const q = query(collection(db, 'products'), where('id', 'in', product.frequently_bought_ids.slice(0, 10)));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    },
    enabled: !!product?.frequently_bought_ids?.length,
  });

  const { data: youMayAlsoLike = [] } = useQuery({
    queryKey: ['related-products', product?.id, product?.category_id],
    queryFn: async () => {
      const q = product?.related_product_ids?.length
        ? query(collection(db, 'products'), where('id', 'in', product.related_product_ids.slice(0, 10)))
        : query(collection(db, 'products'), where('category_id', '==', product!.category_id), limit(8));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== product!.id) as Product[];
    },
    enabled: !!product?.id,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      await addDoc(collection(db, 'reviews'), {
        product_id: product!.id,
        customer_name: reviewName,
        rating: reviewRating,
        comment: reviewComment || null,
        is_approved: false,
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast({ title: "রিভিউ জমা হয়েছে", description: "আপনার রিভিউ অনুমোদনের পর প্রকাশিত হবে।" });
      setReviewName(""); setReviewRating(5); setReviewComment(""); setShowReviewForm(false);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
    },
    onError: () => {
      toast({ title: "ত্রুটি", description: "রিভিউ জমা দিতে সমস্যা হয়েছে।", variant: "destructive" });
    },
  });

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0) setSelectedColor(product.colors[0].name);
      if (product.selected_sizes && product.selected_sizes.length > 0) setSelectedSize(product.selected_sizes[0]);
    }
  }, [product]);

  useEffect(() => {
    if (variants.length > 0 && selectedColor && selectedSize) {
      const variant = variants.find(
        (v) => (v.color === selectedColor || v.color === "N/A") &&
               (v.size === selectedSize || v.size === "N/A")
      );
      setSelectedVariant(variant || null);
    } else if (variants.length === 1 && !selectedColor && !selectedSize) {
      setSelectedVariant(variants[0]);
    }
  }, [selectedColor, selectedSize, variants]);

  // Track ViewContent
  useEffect(() => {
    if (product) {
      trackViewContent({
        content_name: product.name_bn,
        content_ids: [product.id],
        content_type: 'product',
        value: product.sale_price || product.base_price,
        currency: 'BDT',
      });
    }
  }, [product?.id]);

  // Touch swipe for image gallery
  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header cartCount={getItemCount()} />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
              <div className="lg:col-span-7">
                <Skeleton className="aspect-[3/4] md:aspect-square rounded-2xl w-full" />
                <div className="flex gap-2 mt-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="w-16 h-16 rounded-xl" />)}
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header cartCount={getItemCount()} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 mx-auto mb-6 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">পণ্য পাওয়া যায়নি</h1>
            <p className="text-gray-500 text-sm mb-6">এই পণ্যটি বর্তমানে পাওয়া যাচ্ছে না।</p>
            <Link to="/shop">
              <Button className="rounded-full px-8">কেনাকাটা করুন</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.sale_price || product.base_price;
  const originalPrice = selectedVariant?.price || product.base_price;
  const hasDiscount = !selectedVariant && product.sale_price;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const stockQuantity = selectedVariant ? selectedVariant.stock : (product.stock_quantity || 0);
  const isOutOfStock = stockQuantity <= 0;
  const images = product.images || ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop"];

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.sku || product.id,
      name_bn: product.name_bn,
      variant_name_bn: selectedVariant ? `${selectedVariant.color !== "N/A" ? selectedVariant.color : ""} ${selectedVariant.size !== "N/A" ? selectedVariant.size : ""}`.trim() : undefined,
      image_url: images[0],
      price: currentPrice,
      quantity: quantity,
      stock_quantity: stockQuantity,
    });
    trackAddToCart({
      content_name: product.name_bn,
      content_ids: [product.id],
      content_type: 'product',
      value: currentPrice * quantity,
      currency: 'BDT',
    });
    setAddedItem({
      name_bn: product.name_bn,
      variant_name_bn: selectedVariant ? `${selectedVariant.color !== "N/A" ? selectedVariant.color : ""} ${selectedVariant.size !== "N/A" ? selectedVariant.size : ""}`.trim() : undefined,
      image_url: images[0],
      price: currentPrice,
      quantity: quantity,
    });
    setShowMiniCart(true);
  };

  const nextImage = () => setSelectedImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewRating) {
      toast({ title: "তথ্য অসম্পূর্ণ", description: "দয়াকরে আপনার নাম এবং রেটিং দিন।", variant: "destructive" });
      return;
    }
    submitReviewMutation.mutate();
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name_bn, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: "লিঙ্ক কপি হয়েছে!" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartCount={getItemCount()} />

      <main className="flex-1 pb-20 md:pb-0">
        {/* Breadcrumb — compact */}
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4 py-2.5">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
              <Link to="/" className="hover:text-primary transition-colors shrink-0">হোম</Link>
              <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
              {category && (
                <>
                  <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors shrink-0">
                    {category.name_bn}
                  </Link>
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
                </>
              )}
              <span className="text-gray-700 font-medium truncate">{product.name_bn}</span>
            </nav>
          </div>
        </div>

        {/* Main Product Section */}
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
            {/* Image Gallery */}
            <div className="lg:col-span-7">
              {/* Main Image */}
              <div
                ref={galleryRef}
                className="relative aspect-[3/4] md:aspect-square rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50 group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name_bn}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop";
                  }}
                />

                {/* Discount badge */}
                {hasDiscount && (
                  <div className="absolute top-3 left-3 md:top-5 md:left-5 bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-lg">
                    -{discountPercentage}%
                  </div>
                )}

                {/* Wishlist */}
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`absolute top-3 right-3 md:top-5 md:right-5 w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all bg-white/90 backdrop-blur-sm shadow-md ${
                    isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-4 w-4 md:h-5 md:w-5 ${isWishlisted ? "fill-current" : ""}`} />
                </button>

                {/* Navigation arrows — desktop only */}
                {images.length > 1 && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 justify-between px-3 hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Image counter — mobile */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 md:hidden bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex
                          ? "border-primary ring-1 ring-primary/20 shadow-sm"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop";
                      }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
              {/* Title & Rating */}
              <div className="space-y-2 mb-4">
                <h1 className="text-xl md:text-3xl font-bold text-gray-900 leading-snug">
                  {product.name_bn}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 font-medium">
                      ({reviews.length} রিভিউ)
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isOutOfStock ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {isOutOfStock ? "স্টক আউট" : "স্টক আছে"}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                      {discountPercentage}% ছাড়
                    </span>
                  </>
                )}
              </div>

              {product.short_description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">
                  {product.short_description}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-gray-100 mb-5" />

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-semibold text-gray-700">কালার:</span>
                    <span className="text-xs text-gray-400 capitalize">{selectedColor || "বাছুন"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => { setSelectedColor(color.name); setQuantity(1); }}
                        className={`relative w-9 h-9 rounded-full transition-all ${
                          selectedColor === color.name
                            ? "ring-2 ring-primary ring-offset-2 scale-110"
                            : "hover:scale-110 opacity-75 hover:opacity-100"
                        }`}
                        title={color.name}
                      >
                        <div
                          className="w-full h-full rounded-full border border-black/10"
                          style={{ backgroundColor: color.code }}
                        />
                        {selectedColor === color.name && (
                          <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center shadow">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.selected_sizes && product.selected_sizes.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-semibold text-gray-700">সাইজ:</span>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <Ruler className="h-3 w-3" /> সাইজ চার্ট
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.selected_sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setQuantity(1); }}
                        className={`min-w-[44px] h-10 px-3.5 rounded-lg border text-sm font-semibold transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart — inline */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center border border-gray-200 rounded-lg h-11 bg-white shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                    className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30"
                    disabled={quantity >= stockQuantity}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button
                  className="flex-1 h-11 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || (product.colors?.length > 0 && !selectedColor) || (product.selected_sizes?.length > 0 && !selectedSize)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" /> কার্টে যোগ করুন
                </Button>
              </div>

              {/* Buy Now */}
              <Button
                className="w-full h-12 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-sm hidden md:flex"
                onClick={() => { handleAddToCart(); }}
                disabled={isOutOfStock}
              >
                সরাসরি কিনুন
              </Button>

              {/* Quick Actions */}
              <div className="flex items-center gap-4 mt-5 pt-5 border-t border-gray-100">
                <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition-colors">
                  <Share2 className="h-3.5 w-3.5" /> শেয়ার
                </button>
                <button onClick={() => setIsWishlisted(!isWishlisted)} className={`flex items-center gap-1.5 text-xs transition-colors ${isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"}`}>
                  <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} /> {isWishlisted ? "পছন্দ করা হয়েছে" : "পছন্দে যোগ করুন"}
                </button>
              </div>

              {/* Trust Badges — compact */}
              <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="space-y-1">
                    <Truck className="h-4 w-4 mx-auto text-primary" />
                    <p className="text-[10px] font-medium text-gray-500 leading-tight">সারাদেশে<br />ডেলিভারি</p>
                  </div>
                  <div className="space-y-1">
                    <Shield className="h-4 w-4 mx-auto text-primary" />
                    <p className="text-[10px] font-medium text-gray-500 leading-tight">অরিজিনাল<br />প্রোডাক্ট</p>
                  </div>
                  <div className="space-y-1">
                    <RefreshCw className="h-4 w-4 mx-auto text-primary" />
                    <p className="text-[10px] font-medium text-gray-500 leading-tight">সহজ<br />রিটার্ন</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-4 flex items-center gap-2 justify-center flex-wrap">
                {["বিকাশ", "নগদ", "রকেট", "ক্যাশ অন ডেলিভারি"].map(m => (
                  <span key={m} className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="border-t border-gray-100 mt-4 md:mt-10">
          <div className="container mx-auto px-4">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide -mb-px">
              {[
                { key: 'description' as const, label: 'বিস্তারিত' },
                { key: 'specs' as const, label: 'স্পেসিফিকেশন' },
                { key: 'reviews' as const, label: `রিভিউ (${reviews.length})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors shrink-0 ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-6 md:py-10">
              {/* Description */}
              {activeTab === 'description' && (
                <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-600 leading-relaxed">
                    {product.description_bn ? (
                      <div className="whitespace-pre-wrap">{product.description_bn}</div>
                    ) : (
                      <p>প্রিমিয়াম কোয়ালিটির এই ফ্যাশনেবল পণ্যটি আপনাকে দিবে এক বিশেষ আরামদায়ক অনুভূতি। আমাদের বিশেষ ডিজাইন এবং মার্জিত কাজের নিখুঁত সমন্বয় এই পোশাকটিকে করেছে অনন্য।</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Features */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-500" /> পণ্যের বৈশিষ্ট্য
                      </h4>
                      <ul className="space-y-2.5">
                        {(product.features?.length > 0 ? product.features : [
                          "এক্সেপশনাল কমফোর্ট লেভেল",
                          "ডিউরেবল এবং কালার ফাস্টনেস গ্যারান্টি",
                          "মডার্ন এবং স্টাইলিশ ফিটিং",
                          "যেকোনো ক্ষেত্রে মানানসই"
                        ]).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Care Instructions */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-primary" /> যত্নের নির্দেশনা
                      </h4>
                      <ul className="space-y-2.5">
                        {(product.care_instructions?.length > 0 ? product.care_instructions : [
                          "ঠান্ডা পানিতে ধুয়ে নিন",
                          "ব্লিচ ব্যবহার করবেন না",
                          "সরাসরি কড়া রোদে শুকাবেন না",
                          "মাঝারি তাপে আয়রন করুন"
                        ]).map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Specifications */}
              {activeTab === 'specs' && (
                <div className="max-w-2xl animate-in fade-in duration-300">
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {[
                      { label: "ফেব্রিক", value: product.fabric || "প্রিমিয়াম কটন" },
                      { label: "জিএসএম", value: product.gsm || "১৮০-২০০" },
                      { label: "উপাদান", value: product.fabric_composition || "১০০% কটন" },
                      { label: "ফেরতযোগ্য", value: product.returnable ? "হ্যাঁ (৭ দিন)" : "না" },
                      { label: "বিনিময়যোগ্য", value: product.exchangeable ? "হ্যাঁ" : "না" },
                      { label: "ডেলিভারি সময়", value: product.estimated_delivery || "৩-৫ কার্যদিবস" }
                    ].map((spec, i) => (
                      <div key={i} className={`flex justify-between items-center px-4 py-3.5 ${i % 2 === 0 ? "bg-gray-50/60" : "bg-white"}`}>
                        <span className="text-sm text-gray-500">{spec.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              {activeTab === 'reviews' && (
                <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
                  {/* Rating Summary */}
                  <div className="flex items-start gap-6 p-5 bg-gray-50 rounded-xl">
                    <div className="text-center shrink-0">
                      <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                      <div className="flex gap-0.5 mt-1 justify-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.floor(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{reviews.length} রিভিউ</p>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((rating) => {
                        const count = reviews.filter(r => r.rating === rating).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3">{rating}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-5">
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-white border border-gray-100 rounded-xl">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                              {review.customer_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900">{review.customer_name}</h4>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-gray-400">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">এখনও কোন রিভিউ নেই</p>
                      </div>
                    )}
                  </div>

                  {/* Review Form */}
                  <div className="border-t border-gray-100 pt-6">
                    {!showReviewForm ? (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl h-11"
                        onClick={() => setShowReviewForm(true)}
                      >
                        রিভিউ লিখুন
                      </Button>
                    ) : (
                      <form onSubmit={handleSubmitReview} className="space-y-4 bg-gray-50 p-5 rounded-xl">
                        <h4 className="font-bold text-gray-900">আপনার মতামত দিন</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="আপনার নাম"
                            className="h-11 rounded-lg bg-white"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            required
                          />
                          <div className="flex items-center gap-2 h-11 bg-white rounded-lg border px-3">
                            <span className="text-sm text-gray-500 shrink-0">রেটিং:</span>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button key={i} type="button" onClick={() => setReviewRating(i + 1)} className="transition-transform hover:scale-110">
                                <Star className={`h-5 w-5 ${i < reviewRating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="আপনার মতামত লিখুন..."
                          className="rounded-lg min-h-[100px] bg-white"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={submitReviewMutation.isPending} className="rounded-lg h-10 flex-1">
                            {submitReviewMutation.isPending ? "সাবমিট হচ্ছে..." : "সাবমিট করুন"}
                          </Button>
                          <Button type="button" variant="ghost" className="rounded-lg h-10" onClick={() => setShowReviewForm(false)}>
                            বাতিল
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {youMayAlsoLike.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="container mx-auto px-4 py-8 md:py-14">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">আপনার পছন্দ হতে পারে</h2>
                <Link to="/shop" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                  সব দেখুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {youMayAlsoLike.slice(0, 4).map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="group" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-50 mb-2.5 relative">
                      <img
                        src={p.images?.[0] || ""}
                        alt={p.name_bn}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=400&fit=crop"; }}
                      />
                    </div>
                    <h4 className="text-sm font-medium text-gray-900 truncate">{p.name_bn}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(p.sale_price || p.base_price)}</span>
                      {p.sale_price && <span className="text-xs text-gray-400 line-through">{formatPrice(p.base_price)}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Frequently Bought Together */}
        {frequentlyBoughtTogether.length > 0 && (
          <div className="border-t border-gray-100">
            <div className="container mx-auto px-4 py-8 md:py-14">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-5">একসাথে কিনলে সাশ্রয়ী</h2>
              <div className="bg-gray-50 rounded-xl p-5 md:p-8 flex flex-col md:flex-row items-center gap-6">
                <div className="flex items-center gap-3 overflow-x-auto">
                  <div className="w-20 h-24 md:w-28 md:h-36 rounded-xl overflow-hidden bg-white p-1 shrink-0">
                    <img src={images[0]} className="w-full h-full object-cover rounded-lg" alt="Current" onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop"; }} />
                  </div>
                  <Plus className="h-4 w-4 text-gray-300 shrink-0" />
                  {frequentlyBoughtTogether.map(item => (
                    <Link key={item.id} to={`/product/${item.slug}`} className="w-20 h-24 md:w-28 md:h-36 rounded-xl overflow-hidden bg-white p-1 shrink-0 hover:shadow-md transition-shadow">
                      <img src={item.images?.[0] || ""} className="w-full h-full object-cover rounded-lg" alt={item.name_bn} />
                    </Link>
                  ))}
                </div>
                <div className="text-center md:text-left md:ml-auto">
                  <p className="text-xs text-gray-500 mb-1">বান্ডেল মূল্য</p>
                  <p className="text-2xl font-bold text-gray-900 mb-3">
                    {formatPrice(currentPrice + (frequentlyBoughtTogether[0]?.sale_price || frequentlyBoughtTogether[0]?.base_price || 0))}
                  </p>
                  <Button className="rounded-lg h-10 px-6 text-sm">বান্ডেল কিনুন</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="text-left shrink-0">
          <p className="text-xs text-gray-400 leading-none">মূল্য</p>
          <p className="text-lg font-bold text-gray-900 leading-tight">{formatPrice(currentPrice)}</p>
        </div>
        <Button
          className="flex-1 h-11 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm"
          onClick={handleAddToCart}
          disabled={isOutOfStock || (product.colors?.length > 0 && !selectedColor) || (product.selected_sizes?.length > 0 && !selectedSize)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isOutOfStock ? "স্টক আউট" : "কার্টে যোগ করুন"}
        </Button>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4" onClick={() => setShowSizeChart(false)}>
          <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">সাইজ চার্ট</h3>
              <button onClick={() => setShowSizeChart(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Plus className="h-4 w-4 rotate-45 text-gray-500" />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left text-xs text-gray-500">সাইজ</th>
                      <th className="p-3 text-left text-xs text-gray-500">বুক</th>
                      <th className="p-3 text-left text-xs text-gray-500">লম্বা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(product.size_chart?.rows || [["S", "38", "27"], ["M", "40", "28"], ["L", "42", "29"], ["XL", "44", "30"]]).map((row, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-gray-900">{row[0]}</td>
                        <td className="p-3 text-gray-600">{row[1]}"</td>
                        <td className="p-3 text-gray-600">{row[2]}"</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center">* সকল মাপ ইঞ্চিতে দেওয়া হয়েছে।</p>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <MiniCartPopup
        isOpen={showMiniCart}
        onClose={() => setShowMiniCart(false)}
        addedItem={addedItem}
        cartTotal={getSubtotal()}
        cartItemCount={getItemCount()}
      />
    </div>
  );
};

export default ProductDetail;
