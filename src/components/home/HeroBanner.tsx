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

  // Progress bar animation loop
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

  if (isLoading) {
    return (
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gradient-to-br from-primary/5 via-background to-primary/10 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center">
        <div className="text-center space-y-4 animate-in fade-in duration-1000">
          <h2 className="text-3xl md:text-5xl font-black text-primary font-bengali">নীলান্তি</h2>
          <p className="text-muted-foreground font-bengali">বিশ্বস্ততার বুনন...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-hidden bg-black group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-[50vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh]" style={{ background: 'linear-gradient(135deg, #0c1929 0%, #162a4a 50%, #1a365d 100%)' }}>
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
                    ? "scale(1.05) translateX(3%)"
                    : "scale(1.05) translateX(-3%)",
                transition: isTransitioning ? "none" : "opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isActive ? 10 : 1,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {isSplit ? (
                /* ═══════ SPLIT LAYOUT ═══════ */
                <div className="flex flex-col md:flex-row h-full w-full">
                  {/* Text Side */}
                  <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f1f3d] to-[#132b52] p-6 sm:p-10 md:p-16 relative overflow-hidden">
                    {/* Ambient light effects */}
                    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/15 blur-[150px]" />
                    <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-400/10 blur-[120px]" />

                    <div
                      className="w-full max-w-xl space-y-6 md:space-y-8 text-center md:text-left z-10"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(30px)",
                        transition: "opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
                      }}
                    >
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-[11px] md:text-xs font-semibold tracking-wide ring-1 ring-white/20 backdrop-blur-sm font-bengali">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {banner.subtitle_bn || "আপনার স্টাইল, আপনার পরিচয়"}
                      </span>

                      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-white font-bengali">
                        {banner.title_bn}
                      </h2>

                      {banner.link_url && (
                        <Link to={banner.link_url} className="inline-block mt-2">
                          <Button size="lg" className="group/btn gap-3 h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-bold rounded-full relative overflow-hidden shadow-2xl shadow-primary/30 font-bengali">
                            <span className="relative z-10 flex items-center gap-2">
                              এখনই কিনুন
                              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                            </span>
                            {/* Shimmer effect */}
                            <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
                          transform: isActive ? "scale(1)" : "scale(1.1)",
                          transition: `transform ${SLIDE_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                        }}
                      />
                    )}
                    {/* Soft edge blend */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-transparent to-transparent opacity-60 md:opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/50 via-transparent to-transparent md:hidden" />
                  </div>
                </div>
              ) : (
                /* ═══════ FULLSCREEN LAYOUT ═══════ */
                <>
                  {/* Background media */}
                  <div className="absolute inset-0 overflow-hidden">
                    {isVideo ? (
                      <video src={banner.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={banner.image_url}
                        alt={banner.title_bn}
                        className="w-full h-full object-cover"
                        style={{
                          transform: isActive ? "scale(1.05)" : "scale(1)",
                          transition: `transform ${SLIDE_DURATION + 2000}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                        }}
                      />
                    )}

                    {/* Cinematic gradient overlays - allowing images to be clearly visible */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
                  </div>

                  {/* Content - Bottom-left aligned for editorial feel */}
                  <div className="container relative h-full flex items-end pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-6 md:px-10 lg:px-16">
                    <div
                      className="max-w-3xl space-y-5 md:space-y-6"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "translateY(0)" : "translateY(40px)",
                        transition: "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
                      }}
                    >
                      {/* Subtitle pill */}
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] md:text-xs font-semibold tracking-wide ring-1 ring-white/20 font-bengali">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        {banner.subtitle_bn || "প্রিমিয়াম কালেকশন"}
                      </span>

                      {/* Title */}
                      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] tracking-tight font-bengali drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
                        {banner.title_bn}
                      </h2>

                      {/* CTA */}
                      {banner.link_url && (
                        <div className="pt-2 md:pt-4">
                          <Link to={banner.link_url}>
                            <Button size="lg" className="group/btn gap-3 h-12 md:h-14 px-8 md:px-10 text-sm md:text-base font-bold rounded-full relative overflow-hidden shadow-2xl shadow-primary/30 font-bengali">
                              <span className="relative z-10 flex items-center gap-2">
                                এখনই কিনুন
                                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                              </span>
                              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
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
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/25 flex items-center justify-center text-white transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 ring-1 ring-white/20"
              aria-label="আগের ব্যানার"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl hover:bg-white/25 flex items-center justify-center text-white transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 ring-1 ring-white/20"
              aria-label="পরের ব্যানার"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* ═══════ BOTTOM CONTROLS BAR ═══════ */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Progress bar - full width thin line */}
            <div className="h-[3px] bg-white/10">
              <div
                className="h-full bg-white transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls strip */}
            <div className="bg-gradient-to-t from-black/60 to-transparent">
              <div className="container flex items-center justify-between px-6 md:px-10 lg:px-16 py-3 md:py-4">
                {/* Slide counter */}
                <div className="flex items-center gap-3">
                  <span className="text-white/90 text-sm md:text-base font-bold tabular-nums tracking-tight">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="text-white/30 text-xs">/</span>
                  <span className="text-white/40 text-sm tabular-nums">
                    {String(banners.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Slide indicators */}
                <div className="flex items-center gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="group/dot relative py-2"
                      aria-label={`ব্যানার ${index + 1}`}
                    >
                      <span
                        className={`block rounded-full transition-all duration-500 ${
                          index === currentSlide
                            ? "w-8 h-1.5 bg-white"
                            : "w-1.5 h-1.5 bg-white/40 group-hover/dot:bg-white/70"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Pause/Play */}
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  aria-label={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
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
