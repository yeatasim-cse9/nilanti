import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title_bn: string;
  subtitle_bn?: string;
  image_url: string;
  video_url?: string;
  link_url?: string;
  position: string;
  layout_type?: string;
  is_active: boolean;
}

import { useBanners } from "@/hooks/useAdminData";

const SLIDE_DURATION = 6000;

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const { data: allBanners, isLoading } = useBanners();
  const banners = (allBanners as Banner[])?.filter(b => b.position === "hero" && b.is_active) || [];

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!isPaused) {
      progressRef.current += (delta / SLIDE_DURATION) * 100;
      setProgress(progressRef.current);

      if (progressRef.current >= 100) {
        progressRef.current = 0;
        setProgress(0);
        setDirection("next");
        setIsTransitioning(true);
        setCurrentSlide(prev => (prev + 1) % banners.length);
        setTimeout(() => setIsTransitioning(false), 50);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isPaused, banners.length]);

  useEffect(() => {
    if (banners.length > 1) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [animate, banners.length]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return;
    setDirection(index > currentSlide ? "next" : "prev");
    setIsTransitioning(true);
    setCurrentSlide(index);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 50);
  }, [currentSlide]);

  const goToPrev = useCallback(() => {
    setDirection("prev");
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev - 1 + banners.length) % banners.length);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 50);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setDirection("next");
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % banners.length);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 50);
  }, [banners.length]);

  /* ═══════ LOADING STATE ═══════ */
  if (isLoading) {
    return (
      <div className="relative h-[55vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /* ═══════ EMPTY STATE ═══════ */
  if (banners.length === 0) {
    return (
      <section className="relative h-[55vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">নীলান্তি</h2>
          <p className="text-gray-500 text-sm font-medium">বিশ্বস্ততার বুনন...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-gray-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Taller on mobile so products peek below */}
      <div className="relative h-[55vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh]">
        {banners.map((banner, index) => {
          const isVideo = banner.layout_type === "video" && banner.video_url;
          const isSplit = banner.layout_type === "split";
          const isActive = index === currentSlide;

          return (
            <div
              key={banner.id}
              className="absolute inset-0"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? "scale(1) translateX(0)"
                  : direction === "next"
                    ? "scale(1.04) translateX(2%)"
                    : "scale(1.04) translateX(-2%)",
                transition: isTransitioning
                  ? "none"
                  : "opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isActive ? 10 : 1,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {isSplit ? (
                /* ═══════ SPLIT LAYOUT ═══════ */
                <div className="flex flex-col md:flex-row h-full w-full">
                  {/* Text Side */}
                  <div className="flex-1 flex items-center justify-center bg-gray-950 p-6 sm:p-10 md:p-16 relative overflow-hidden">
                    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/8 blur-[150px]" />
                    <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[120px]" />

                    <div
                      className="w-full max-w-xl space-y-5 md:space-y-7 text-center md:text-left z-10"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(30px)",
                        transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                      }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 text-white/80 text-[11px] md:text-xs font-semibold tracking-wide ring-1 ring-white/10 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {banner.subtitle_bn || "আপনার স্টাইল, আপনার পরিচয়"}
                      </span>

                      <h2 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] text-white tracking-tight">
                        {banner.title_bn}
                      </h2>

                      {banner.link_url && (
                        <Link to={banner.link_url} className="inline-block mt-1">
                          <Button size="lg" className="group/btn gap-2.5 h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-bold rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-2xl shadow-white/10 relative overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                              এখনই কিনুন
                              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 group-hover/btn:translate-x-1" />
                            </span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className="flex-1 relative h-full min-h-[45%] md:min-h-full overflow-hidden">
                    {isVideo ? (
                      <video src={banner.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={banner.image_url}
                        alt={banner.title_bn}
                        className="w-full h-full object-cover"
                        style={{
                          transform: isActive ? "scale(1)" : "scale(1.08)",
                          transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-transparent to-transparent opacity-50 md:opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent md:hidden" />
                  </div>
                </div>
              ) : (
                /* ═══════ FULLSCREEN LAYOUT ═══════ */
                <>
                  <div className="absolute inset-0 overflow-hidden">
                    {isVideo ? (
                      <video src={banner.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={banner.image_url}
                        alt={banner.title_bn}
                        className="w-full h-full object-cover"
                        style={{
                          transform: isActive ? "scale(1.04)" : "scale(1)",
                          transition: `transform ${SLIDE_DURATION + 2000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                        }}
                      />
                    )}
                    {/* Cinematic overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/5 to-transparent" />
                  </div>

                  {/* Content — bottom-left for editorial feel */}
                  <div className="container relative h-full flex items-end pb-16 sm:pb-20 md:pb-24 lg:pb-28 px-5 md:px-10">
                    <div
                      className="max-w-2xl lg:max-w-3xl space-y-4 md:space-y-5"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(36px)",
                        transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                      }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/85 text-[11px] md:text-xs font-semibold tracking-wide ring-1 ring-white/15">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {banner.subtitle_bn || "প্রিমিয়াম কালেকশন"}
                      </span>

                      <h2 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.06] tracking-tight">
                        {banner.title_bn}
                      </h2>

                      {banner.link_url && (
                        <div className="pt-1 md:pt-3">
                          <Link to={banner.link_url}>
                            <Button size="lg" className="group/btn gap-2.5 h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-bold rounded-full bg-white text-gray-900 hover:bg-gray-100 shadow-2xl shadow-white/10 relative overflow-hidden">
                              <span className="relative z-10 flex items-center gap-2">
                                এখনই কিনুন
                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 group-hover/btn:translate-x-1" />
                              </span>
                              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* ═══════ NAVIGATION ARROWS ═══════ */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 ring-1 ring-white/15"
              aria-label="আগের ব্যানার"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 ring-1 ring-white/15"
              aria-label="পরের ব্যানার"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* ═══════ BOTTOM PROGRESS BAR + CONTROLS ═══════ */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Thin progress line */}
            <div className="h-[2px] bg-white/10">
              <div
                className="h-full bg-white/80 transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="bg-gradient-to-t from-black/50 to-transparent">
              <div className="container flex items-center justify-between px-5 md:px-10 py-3">
                {/* Slide counter */}
                <div className="flex items-center gap-2">
                  <span className="text-white/80 text-sm font-bold tabular-nums">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white/20 text-[10px]">/</span>
                  <span className="text-white/30 text-sm tabular-nums">
                    {String(banners.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="p-1.5"
                      aria-label={`ব্যানার ${index + 1}`}
                    >
                      <span
                        className={`block rounded-full transition-all duration-500 ${
                          index === currentSlide
                            ? "w-7 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Pause */}
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="text-white/40 hover:text-white/80 transition-colors p-1.5"
                  aria-label={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
