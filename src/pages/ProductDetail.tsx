import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star, Minus, Plus, ShoppingCart, Truck, Shield, Check, Send, RefreshCw, Heart, Clock, Percent, ArrowRight, Eye, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  const [addedItem, setAddedItem] = useState<{
    name_bn: string;
    variant_name_bn?: string;
    image_url: string;
    price: number;
    quantity: number;
  } | null>(null);

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


  // Calculate dynamically derived variants
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
      // Fallback to same category if no explicit related products
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
      toast({
        title: "রিভিউ জমা হয়েছে",
        description: "আপনার রিভিউ অনুমোদনের পর প্রকাশিত হবে।",
      });
      setReviewName("");
      setReviewRating(5);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ['product-reviews', product?.id] });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "রিভিউ জমা দিতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    },
  });

  // Update selected variant when color/size changes
  useEffect(() => {
    if (selectedColor && selectedSize) {
      if (typeof selectedColor === 'string' && typeof selectedSize === 'string') {
          // This block is left intentionally empty; it's handled properly by the later hook logic.
      }
    }
  }, []);

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

  // Track ViewContent when product is loaded
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

  if (productLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartCount={getItemCount()} />
        <main className="flex-1 py-6">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
              <div className="lg:col-span-7">
                <Skeleton className="aspect-[4/5] rounded-2xl w-full" />
              </div>
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-6 w-1/3" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <Skeleton className="h-40 w-full rounded-xl" />
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
      <div className="min-h-screen flex flex-col">
        <Header cartCount={getItemCount()} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">পণ্য পাওয়া যায়নি</h1>
            <p className="text-muted-foreground mb-4">এই পণ্যটি বর্তমানে পাওয়া যাচ্ছে না।</p>
            <Link to="/shop">
              <Button>কেনাকাটা করুন</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.sale_price || product.base_price;
  const originalPrice = selectedVariant?.price || product.base_price; // Note: variants don't currently support discrete sale prices
  const hasDiscount = !selectedVariant && product.sale_price; // If they have a sale price globally
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

    // Track AddToCart event
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

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewRating) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "দয়াকরে আপনার নাম এবং রেটিং দিন।",
        variant: "destructive",
      });
      return;
    }
    submitReviewMutation.mutate();
  };

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFF]">
      <Header cartCount={getItemCount()} />

      <main className="flex-1">
        <div className="bg-gray-50/50 border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
              <Link to="/" className="hover:text-primary transition-colors">হোম</Link>
              <ChevronRight className="h-3 w-3 opacity-30" />
              {category && (
                <>
                  <Link to={`/category/${category.slug}`} className="hover:text-primary transition-colors">
                    {category.name_bn}
                  </Link>
                  <ChevronRight className="h-3 w-3 opacity-30" />
                </>
              )}
              <span className="text-gray-900 font-semibold truncate">{product.name_bn}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Gallery Section */}
            <div className="space-y-4">
              <div className="relative aspect-[1/1] rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm group">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name_bn}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {hasDiscount && (
                  <div className="absolute top-6 left-6 bg-brand-yellow text-primary px-4 py-1.5 rounded-full text-[13px] font-black uppercase tracking-normal shadow-lg">
                    -{discountPercentage}% ছাড়
                  </div>
                )}

                <button 
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className={`absolute top-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all bg-white shadow-lg border border-gray-100 ${
                    isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isWishlisted ? "fill-current" : ""}`} />
                </button>

                {images.length > 1 && (
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary border border-gray-100">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary border border-gray-100">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                        idx === selectedImageIndex 
                          ? "border-primary ring-2 ring-primary/10 shadow-md" 
                          : "border-gray-100 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col">
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-brand-yellow/10 px-3 py-1 rounded-full border border-brand-yellow/20">
                    <Star className="h-3.5 w-3.5 fill-brand-yellow text-brand-yellow" />
                    <span className="text-[13px] font-black text-primary">{avgRating.toFixed(1)}</span>
                    <span className="text-[11px] text-primary/40 font-bold ml-1">({reviews.length} রিভিউ)</span>
                  </div>
                  <span className={`text-[12px] font-bold uppercase tracking-normal ${isOutOfStock ? "text-red-500" : "text-emerald-500"}`}>
                    {isOutOfStock ? "স্টক আউট" : "স্টক আছে"}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-primary leading-[1.1] tracking-tight">
                  {product.name_bn}
                </h1>
              </div>

              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-black text-primary">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through font-bold">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {product.short_description && (
                <p className="text-gray-600 leading-relaxed mb-8 text-[15px]">
                  {product.short_description}
                </p>
              )}

              {/* Selection Options */}
              <div className="space-y-8 mb-10">
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-black text-primary uppercase tracking-normal">কালার নির্বাচন করুন</span>
                      <span className="text-[13px] font-bold text-gray-500 capitalize">{selectedColor || "বাছুন"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map(color => (
                        <button 
                          key={color.name}
                          onClick={() => {
                            setSelectedColor(color.name);
                            setQuantity(1);
                          }}
                          className={`relative w-10 h-10 rounded-full p-1.5 transition-all outline-none ${
                            selectedColor === color.name 
                              ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-lg" 
                              : "hover:scale-110 opacity-80"
                          }`}
                        >
                          <div 
                            className="w-full h-full rounded-full border border-black/5"
                            style={{ backgroundColor: color.code }}
                          />
                          {selectedColor === color.name && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-md">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.selected_sizes && product.selected_sizes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[13px] font-black text-primary uppercase tracking-normal">সাইজ নির্বাচন করুন</span>
                      <button 
                         onClick={() => setShowSizeChart(true)}
                        className="text-[12px] font-black text-primary/60 hover:text-primary transition-colors underline underline-offset-4 flex items-center gap-1.5"
                      >
                        সাইজ চার্ট <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.selected_sizes.map(size => (
                        <button
                          key={size}
                          onClick={() => {
                            setSelectedSize(size);
                            setQuantity(1);
                          }}
                          className={`min-w-[56px] h-12 px-4 rounded-xl border-2 transition-all font-black text-sm uppercase tracking-normal ${
                            selectedSize === size
                              ? "border-primary bg-primary text-white shadow-xl shadow-primary/20 -translate-y-1"
                              : "border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-5 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between border-2 border-gray-100 bg-white rounded-2xl p-2 h-16 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors disabled:opacity-30"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-black text-primary">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
                      className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-primary transition-colors disabled:opacity-30"
                      disabled={quantity >= stockQuantity}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    size="lg"
                    className="h-16 rounded-2xl bg-[#eff6ff] text-primary border-2 border-primary/10 text-[15px] font-black uppercase tracking-normal hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || (product.colors?.length > 0 && !selectedColor) || (product.selected_sizes?.length > 0 && !selectedSize)}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" /> কার্টে যোগ করুন
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full h-18 rounded-2xl bg-brand-yellow text-primary hover:bg-brand-yellow/90 hover:scale-[1.01] active:scale-[0.99] shadow-xl shadow-brand-yellow/20 text-lg font-black uppercase tracking-normal transition-all"
                  onClick={() => {
                    handleAddToCart();
                  }}
                  disabled={isOutOfStock}
                >
                  সরাসরি কিনুন
                </Button>
              </div>

              {/* trust bar */}
              <div className="mt-12 p-6 rounded-[2rem] bg-gray-50 border border-gray-100">
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-normal text-center mb-6 font-bengali">নিরাপদ পেমেন্ট গ্যারান্টি</p>
                <div className="flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm font-bold text-[10px] text-gray-600 font-bengali">বিকাশ</div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm font-bold text-[10px] text-gray-600 font-bengali">নগদ</div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm font-bold text-[10px] text-gray-600 font-bengali">রকেট</div>
                  <div className="px-4 py-2 bg-white rounded-lg border border-gray-100 shadow-sm font-bold text-[10px] text-gray-600 font-bengali">নগদ মূল্যে</div>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors cursor-pointer group">
                  <Send className="h-4 w-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                  <span className="text-[13px] font-bold uppercase tracking-normal font-bengali">শেয়ার করুন</span>
                </div>
                <div className="w-px h-4 bg-gray-200" />
                <div className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors cursor-pointer group">
                  <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="text-[13px] font-bold uppercase tracking-normal font-bengali">রিটার্ন পলিসি</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="bg-[#0f172a] py-16 mb-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Truck className="h-8 w-8 text-brand-yellow" />
                </div>
                <h4 className="text-white font-black uppercase tracking-normal text-sm">সারা বাংলাদেশে ডেলিভারি</h4>
                <p className="text-gray-400 text-[13px] font-medium leading-relaxed">আমরা সারা বাংলাদেশে দ্রুত হোম ডেলিভারি নিশ্চিত করি। ক্যাশ অন ডেলিভারি সুবিধা আছে।</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Shield className="h-8 w-8 text-brand-yellow" />
                </div>
                <h4 className="text-white font-black uppercase tracking-normal text-sm">১০০% অরিজিনাল প্রোডাক্ট</h4>
                <p className="text-gray-400 text-[13px] font-medium leading-relaxed">নীলাঞ্জি থেকে আপনি পাবেন প্রিমিয়াম কোয়ালিটির আসল পণ্য যা আপনার জন্য বিশেষভাবে তৈরি।</p>
              </div>
              <div className="space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <RefreshCw className="h-8 w-8 text-brand-yellow" />
                </div>
                <h4 className="text-white font-black uppercase tracking-normal text-sm">সহজ রিটার্ন পলিসি</h4>
                <p className="text-gray-400 text-[13px] font-medium leading-relaxed">পণ্য হাতে পাওয়ার পর কোনো ত্রুটি পেলে বা পছন্দ না হলে ৭ দিনের মধ্যে সহজ উপায়ে রিটার্ন করুন।</p>
              </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <div className="container mx-auto px-4 py-24 border-t border-gray-100">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="flex flex-wrap md:flex-nowrap justify-center bg-transparent border-b border-gray-100 mb-20 h-auto p-0 gap-8 md:gap-24">
            {["description", "specifications", "reviews"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="relative pb-6 px-0 rounded-none bg-transparent border-none text-[13px] font-black uppercase tracking-normal text-gray-400 data-[state=active]:text-primary data-[state=active]:shadow-none transition-all group font-bengali"
              >
                {tab === "reviews" ? `রিভিউ (${reviews.length.toLocaleString('bn-BD')})` : 
                 tab === "description" ? "বিস্তারিত" : "স্পেসিফিকেশন"}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-primary scale-x-0 group-data-[state=active]:scale-x-100 transition-transform duration-500 ease-out" />
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="description" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="prose prose-lg max-w-none text-gray-600 font-medium leading-[2] text-center md:text-left">
                {product.description_bn ? (
                  <div className="whitespace-pre-wrap">{product.description_bn}</div>
                ) : (
                  <p>প্রিমিয়াম কোয়ালিটির এই ফ্যাশনেবল পণ্যটি আপনাকে দিবে এক বিশেষ আরামদায়ক অনুভূতি। আমাদের বিশেষ ডিজাইন এবং মার্জিত কাজের নিখুঁত সমন্বয় এই পোশাকটিকে করেছে অনন্য। এটি প্রতিদিন ব্যবহারের জন্য আদর্শ।</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-gray-100">
                <div className="space-y-6">
                  <h4 className="text-[13px] font-black uppercase tracking-normal text-primary flex items-center gap-3 font-bengali">
                    <Check className="h-4 w-4 text-brand-yellow" /> পণ্যের বৈশিষ্ট্য
                  </h4>
                  <ul className="space-y-4">
                    {(product.features?.length > 0 ? product.features : [
                      "এক্সেপশনাল কমফোর্ট লেভেল",
                      "ডিউরেবল এবং কালার ফাস্টনেস গ্যারান্টি",
                      "মডার্ন এবং স্টাইলিশ ফিটিং",
                      "রেগুলার এবং ফরমাল যেকোনো ক্ষেত্রে মানানসই"
                    ]).map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-500 text-sm font-bold uppercase tracking-normal">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow mt-1.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[13px] font-black uppercase tracking-normal text-primary flex items-center gap-3 font-bengali">
                    <RefreshCw className="h-4 w-4 text-brand-yellow" /> যত্ন সমাচার
                  </h4>
                  <ul className="space-y-4">
                    {(product.care_instructions?.length > 0 ? product.care_instructions : [
                      "ঠান্ডা পানিতে ধুয়ে নিন",
                      "ব্লিচ ব্যবহার করা থেকে বিরত থাকুন",
                      "সরাসরি কড়া রোদে শুকাবেন না",
                      "মাঝারি তাপে আয়রন করুন"
                    ]).map((care, i) => (
                      <li key={i} className="flex items-start gap-3 text-gray-500 text-sm font-bold uppercase tracking-normal">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {care}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specifications" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-0 border-t border-gray-100">
                {[
                  { label: "ফেব্রিক", value: product.fabric || "প্রিমিয়াম কটন" },
                  { label: "জিএসএম (GSM)", value: product.gsm ? product.gsm.replace(/[0-9]/g, (d: string) => "০১২৩৪৫৬৭৮৯"[parseInt(d)]) : "১৮০-২০০" },
                  { label: "উপাদান", value: product.fabric_composition || "১০০% কটন" },
                  { label: "ফেরতযোগ্য", value: product.returnable ? "হ্যাঁ (৭ দিন)" : "না" },
                  { label: "বিনিময়যোগ্য", value: product.exchangeable ? "হ্যাঁ" : "না" },
                  { label: "ডেলিভারি", value: product.estimated_delivery || "৩-৫ কার্যদিবস" }
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between py-6 border-b border-gray-100 hover:bg-gray-50/50 px-4 transition-colors">
                    <span className="text-[11px] font-black uppercase tracking-normal text-gray-400 font-bengali">{spec.label}</span>
                    <span className="text-sm font-black text-primary uppercase tracking-normal font-bengali">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="max-w-5xl mx-auto space-y-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <div className="lg:col-span-5 text-center lg:text-left space-y-6">
                  <div className="space-y-2">
                    <span className="text-8xl md:text-9xl font-black text-primary tracking-tighter block font-bengali">{avgRating.toLocaleString('bn-BD', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
                    <div className="flex justify-center lg:justify-start gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-6 w-6 ${i < Math.floor(avgRating) ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] font-black text-gray-400 uppercase tracking-normal leading-loose font-bengali">{reviews.length.toLocaleString('bn-BD')} টি যাচাইকৃত রিভিউয়ের ভিত্তিতে</p>
                </div>
                
                <div className="lg:col-span-7 space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = reviews.filter(r => r.rating === rating).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-6">
                        <span className="text-[11px] font-black text-primary w-4">{rating}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-yellow transition-all duration-1000" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-400 w-8">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-gray-100 pb-8">
                  <h3 className="text-xl font-black text-primary uppercase tracking-normal font-bengali">ক্রেতাদের মতামত</h3>
                  <Button variant="outline" className="rounded-full border-primary/20 text-[11px] font-black uppercase tracking-normal px-8 font-bengali" onClick={() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })}>
                    রিভিউ দিন
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-12">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-black text-primary text-sm">
                            {review.customer_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h4 className="font-black text-primary text-sm uppercase tracking-normal">{review.customer_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"}`} />
                                ))}
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-normal ml-2 font-bengali">ভেরিফাইড পারচেজ</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 font-medium leading-relaxed pl-16">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200 text-gray-400">
                      <MessageSquare className="h-12 w-12 mx-auto opacity-20" />
                      <p className="font-black uppercase tracking-normal text-[13px] font-bengali">এখনও কোন রিভিউ নেই। আপনার অভিজ্ঞতা শেয়ার করা প্রথম ব্যক্তি হন!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

      </Tabs>
      </div>

      <div id="review-form" className="container mx-auto px-4 py-24 border-t border-gray-100 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-50/50 rounded-[3rem] p-12 md:p-20 border border-gray-100">
            <div className="text-center space-y-4 mb-16">
              <h3 className="text-3xl md:text-5xl font-black text-primary tracking-tight">পণ্যটি কেমন লাগলো?</h3>
              <p className="text-gray-400 text-[13px] font-black uppercase tracking-normal">আপনার অভিজ্ঞতা শেয়ার করুন</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary/40 uppercase tracking-normal ml-4">আপনার নাম *</label>
                  <Input
                    placeholder="উদা: আরিয়ান রহমান"
                    className="bg-white border-gray-100 h-16 rounded-2xl px-6 focus:ring-primary/10 transition-all font-bold"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary/40 uppercase tracking-normal ml-4">আপনার রেটিং *</label>
                  <div className="flex items-center gap-4 bg-white h-16 rounded-2xl border border-gray-100 px-8">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewRating(i + 1)}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < reviewRating ? "fill-brand-yellow text-brand-yellow" : "text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-primary/40 uppercase tracking-normal ml-4">মন্তব্য</label>
                <Textarea
                  placeholder="পণ্যটি সম্পর্কে আপনার বিস্তারিত মতামত দিন..."
                  className="bg-white border-gray-100 rounded-2xl min-h-[160px] p-8 focus:ring-primary/10 transition-all font-medium"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={submitReviewMutation.isPending}
                className="w-full h-18 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-normal rounded-2xl transition-all shadow-xl shadow-primary/20 group"
              >
                {submitReviewMutation.isPending ? "সাবমিট হচ্ছে..." : "সাবমিট রিভিউ"}
                {!submitReviewMutation.isPending && <Send className="h-4 w-4 ml-3 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {(frequentlyBoughtTogether.length > 0 || youMayAlsoLike.length > 0) && (
        <div className="container mx-auto px-4 pb-24 space-y-32">
          {frequentlyBoughtTogether.length > 0 && (
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">একসাথে কিনলে সাশ্রয়ী</h2>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-normal font-bengali">প্রায়ই একসাথে কেনা হয়</p>
              </div>
              <div className="bg-gray-50/50 rounded-[3rem] border border-gray-100 p-8 md:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="w-32 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white p-2">
                      <img src={images[0]} className="w-full h-full object-cover rounded-xl" alt="Current Item" />
                    </div>
                    <Plus className="h-6 w-6 text-gray-300" />
                    {frequentlyBoughtTogether.map(item => (
                      <Link key={item.id} to={`/product/${item.slug}`} className="w-32 md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-white p-2 hover:-translate-y-2 transition-transform">
                        <img src={item.images?.[0] || ""} className="w-full h-full object-cover rounded-xl" alt={item.name_bn} />
                      </Link>
                    ))}
                  </div>
                  <div className="w-px h-32 bg-gray-200 hidden lg:block mx-8" />
                  <div className="text-center lg:text-left space-y-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-black text-gray-400 uppercase tracking-normal font-bengali">মোট বান্ডেল মূল্য</p>
                      <p className="text-4xl font-black text-primary">
                        {formatPrice(currentPrice + (frequentlyBoughtTogether[0]?.sale_price || frequentlyBoughtTogether[0]?.base_price || 0))}
                      </p>
                    </div>
                    <Button className="h-14 px-10 rounded-xl bg-primary text-white font-black uppercase tracking-normal font-bengali">
                      বান্ডেলটি কার্টে যোগ করুন
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {youMayAlsoLike.length > 0 && (
            <section className="space-y-12">
              <div className="flex justify-between items-end border-b border-gray-100 pb-8">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">পছন্দ হতে পারে</h2>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-normal font-bengali">অন্যান্য পণ্যসমূহ</p>
                </div>
                <Link to="/shop" className="text-[11px] font-black text-primary border-b-2 border-brand-yellow pb-1 hover:text-brand-yellow transition-colors font-bengali">সব দেখুন</Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {youMayAlsoLike.map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="group space-y-6" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <div className="aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm relative transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/5">
                      <img src={p.images?.[0] || ""} alt={p.name_bn} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <div className="space-y-2 text-center">
                      <h4 className="text-[13px] font-black text-primary uppercase tracking-normal truncate">{p.name_bn}</h4>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-black text-primary">{formatPrice(p.sale_price || p.base_price)}</span>
                        {p.sale_price && <span className="text-[11px] text-gray-400 line-through font-bold">{formatPrice(p.base_price)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </main>

    {/* Size Chart Modal */}
    {showSizeChart && (
      <div className="fixed inset-0 z-[100] bg-primary/40 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          <div className="bg-primary p-12 flex justify-between items-center text-white">
            <h3 className="text-2xl font-black tracking-tight uppercase font-bengali">সাইজ মেজারমেন্ট চার্ট</h3>
            <button onClick={() => setShowSizeChart(false)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Plus className="h-8 w-8 rotate-45" />
            </button>
          </div>
          <div className="p-12">
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-5 text-left font-black uppercase text-[10px] tracking-normal text-gray-400 font-bengali">সাইজ</th>
                    <th className="p-5 text-left font-black uppercase text-[10px] tracking-normal text-gray-400 font-bengali">বুক</th>
                    <th className="p-5 text-left font-black uppercase text-[10px] tracking-normal text-gray-400 font-bengali">লম্বা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(product.size_chart?.rows || [["S", "38", "27"], ["M", "40", "28"], ["L", "42", "29"], ["XL", "44", "30"]]).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-5 font-black text-primary">{row[0]}</td>
                      <td className="p-5 font-bold text-gray-500">{row[1]}"</td>
                      <td className="p-5 font-bold text-gray-500">{row[2]}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-8 text-[11px] font-bold text-gray-400 uppercase text-center tracking-normal font-bengali">* সকল মাপ ইঞ্চিতে দেওয়া হয়েছে।</p>
            <Button className="w-full mt-10 h-16 rounded-2xl bg-primary text-white font-black tracking-normal font-bengali" onClick={() => setShowSizeChart(false)}>
              বন্ধ করুন
            </Button>
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

