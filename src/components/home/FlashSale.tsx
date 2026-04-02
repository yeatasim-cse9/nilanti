import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Timer, ArrowRight, Zap } from "lucide-react";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { useHomepageSection } from "@/hooks/useCMSData";

const FlashSale = () => {
  const { data: sectionData, isLoading: sectionLoading } = useHomepageSection("flash_sale");
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  const { data: flashProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['flash-sale-products'],
    queryFn: async () => {
      const q = query(
        collection(db, "products"),
        where("is_active", "==", true),
        where("is_flash_sale", "==", true),
        limit(4)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const activeFlashProducts = flashProducts.filter((p: any) => p.flash_sale_end);

  const earliestEndTime = activeFlashProducts.length > 0
    ? Math.min(...activeFlashProducts.map((p: any) => new Date(p.flash_sale_end).getTime()))
    : null;

  useEffect(() => {
    if (!earliestEndTime) { setTimeLeft(null); return; }
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = earliestEndTime - now;
      if (distance < 0) { clearInterval(timer); setTimeLeft(null); }
      else {
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
  if (activeFlashProducts.length === 0 || !timeLeft) return null;

  const formatNum = (n: number) => n.toLocaleString('bn-BD', { minimumIntegerDigits: 2, useGrouping: false });

  const timerUnits = [
    { value: timeLeft.d, label: "দিন" },
    { value: timeLeft.h, label: "ঘণ্টা" },
    { value: timeLeft.m, label: "মিনিট" },
    { value: timeLeft.s, label: "সেকেন্ড" },
  ];

  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-gray-950">
      {/* Ambient gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[180px] -mr-48 -mt-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] -ml-48 -mb-48 pointer-events-none" />

      <div className="container relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 reveal">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 text-amber-400 font-bold text-[11px] uppercase tracking-[0.08em] backdrop-blur-sm border border-amber-400/20">
              <Zap className="h-3.5 w-3.5 fill-amber-400" />
              {(sectionData as any)?.subtitle_bn || "লিমিটেড টাইম অফার"}
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
              {(sectionData as any)?.title_bn || "ফ্ল্যাশ সেল"}
            </h2>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 md:gap-3 pt-1">
              <Timer className="h-4 w-4 text-gray-400 hidden md:block" />
              <div className="flex items-center gap-2">
                {timerUnits.map((unit, i) => (
                  <div key={unit.label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl w-[52px] h-[52px] md:w-[60px] md:h-[60px] justify-center border border-white/5">
                      <span className="text-xl md:text-2xl font-bold text-white leading-none tabular-nums">
                        {formatNum(unit.value)}
                      </span>
                      <span className="text-[8px] md:text-[9px] font-semibold text-white/40 uppercase mt-0.5">
                        {unit.label}
                      </span>
                    </div>
                    {i < 3 && <span className="text-white/20 font-bold text-lg">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm transition-colors group"
          >
            সব দেখুন
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {activeFlashProducts.slice(0, 4).map((product: any, i: number) => (
            <div key={product.id} className={`reveal stagger-${Math.min(i + 1, 4)}`}>
              <ProductCard
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlashSale;
