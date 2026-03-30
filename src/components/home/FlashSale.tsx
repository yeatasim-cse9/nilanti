import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Timer, ArrowRight, Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useAdminData";
import { useHomepageSection } from "@/hooks/useCMSData";

const FlashSale = () => {
  const { data: allProducts, isLoading: productsLoading } = useProducts();
  const { data: sectionData, isLoading: sectionLoading } = useHomepageSection("flash_sale");
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  const flashProducts = (allProducts as any[] || []).filter((p: any) => p.is_flash_sale && p.is_active && p.flash_sale_end);

  // Find the earliest end date among active flash sales
  const earliestEndTime = flashProducts.length > 0
    ? Math.min(...flashProducts.map((p: any) => new Date(p.flash_sale_end).getTime()))
    : null;

  useEffect(() => {
    if (!earliestEndTime) {
      setTimeLeft(null);
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = earliestEndTime - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft(null);
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [earliestEndTime]);

  if (sectionLoading || productsLoading) return null;
  if (sectionData && (sectionData as any).is_active === false) return null;
  if (flashProducts.length === 0 || !timeLeft) return null;

  const formatNumber = (num: number) => num.toLocaleString('bn-BD', { minimumIntegerDigits: 2, useGrouping: false });

  return (
    <section className="py-20 relative overflow-hidden bg-gradient-to-br from-accent/5 via-background to-primary/5 border-y border-border/50">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64" />
      <div className="container relative z-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-accent/10 text-accent font-bold text-xs uppercase tracking-normal backdrop-blur-md border border-accent/20">
              <Zap className="h-4 w-4 fill-accent animate-pulse" />
              {(sectionData as any)?.subtitle_bn || "লিমিটেড টাইম অফার"}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tight leading-none">
              {(sectionData as any)?.title_bn || "ফ্ল্যাশ সেল"}
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium shrink-0">
                <Timer className="h-4 w-4" />
                অফারটি শেষ হবে:
              </span>
              <div className="flex items-center gap-3 md:gap-4 shrink-0">
                <div className="bg-primary text-white rounded-2xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center font-bold shadow-soft border border-white/10 group hover:bg-accent transition-colors duration-500">
                  <span className="text-2xl md:text-3xl leading-none">{formatNumber(timeLeft.d)}</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-normal opacity-60 mt-1">দিন</span>
                </div>
                <span className="text-accent font-bold text-2xl animate-pulse">:</span>
                <div className="bg-primary text-white rounded-2xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center font-bold shadow-soft border border-white/10 group hover:bg-accent transition-colors duration-500">
                  <span className="text-2xl md:text-3xl leading-none">{formatNumber(timeLeft.h)}</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-normal opacity-60 mt-1">ঘণ্টা</span>
                </div>
                <span className="text-accent font-bold text-2xl animate-pulse">:</span>
                <div className="bg-primary text-white rounded-2xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center font-bold shadow-soft border border-white/10 group hover:bg-accent transition-colors duration-500">
                  <span className="text-2xl md:text-3xl leading-none">{formatNumber(timeLeft.m)}</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-normal opacity-60 mt-1">মিনিট</span>
                </div>
                <span className="text-accent font-bold text-2xl animate-pulse">:</span>
                <div className="bg-primary text-white rounded-2xl w-16 h-16 md:w-20 md:h-20 flex flex-col items-center justify-center font-bold shadow-soft border border-white/10 group hover:bg-accent transition-colors duration-500">
                  <span className="text-2xl md:text-3xl leading-none">{formatNumber(timeLeft.s)}</span>
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-normal opacity-60 mt-1 text-accent group-hover:text-white">সেকেন্ড</span>
                </div>
              </div>
            </div>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-2 text-primary font-bold hover:text-accent hover:bg-accent/5 px-6 py-3 rounded-full border-2 border-primary/10 transition-all duration-300 group whitespace-nowrap shadow-soft"
          >
            সব দেখুন
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {flashProducts.slice(0, 4).map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name_bn={product.name_bn}
              slug={product.slug}
              image_url={product.images?.[0] || ""}
              base_price={product.base_price}
              sale_price={product.sale_price}
              rating={product.rating}
              reviews_count={product.reviews_count}
              is_featured={product.is_featured}
              stock_quantity={product.stock_quantity}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
