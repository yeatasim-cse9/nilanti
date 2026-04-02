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

const SLIDE_DURATION = 7000;

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [slideKey, setSlideKey] = useState(0);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const heroRef = useRef<HTMLElement>(null);

  const { data: allBanners, isLoading } = useBanners();
  const banners =
    (allBanners as Banner[])?.filter(
      (b) => b.position === "hero" && b.is_active
    ) || [];

  const animate = useCallback(
    (timestamp: number) => {
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
          setCurrentSlide((prev) => (prev + 1) % banners.length);
          setSlideKey((k) => k + 1);
          setTimeout(() => setIsTransitioning(false), 50);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    },
    [isPaused, banners.length]
  );

  useEffect(() => {
    if (banners.length > 1) {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [animate, banners.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index === currentSlide) return;
      setDirection(index > currentSlide ? "next" : "prev");
      setIsTransitioning(true);
      setCurrentSlide(index);
      setSlideKey((k) => k + 1);
      progressRef.current = 0;
      setProgress(0);
      lastTimeRef.current = 0;
      setTimeout(() => setIsTransitioning(false), 50);
    },
    [currentSlide]
  );

  const goToPrev = useCallback(() => {
    setDirection("prev");
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setSlideKey((k) => k + 1);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 50);
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setDirection("next");
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setSlideKey((k) => k + 1);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
    setTimeout(() => setIsTransitioning(false), 50);
  }, [banners.length]);

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart !== null) {
      setTouchDelta(e.touches[0].clientX - touchStart);
    }
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta < 0) goToNext();
      else goToPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  /* ═══════ LOADING SKELETON ═══════ */
  if (isLoading) {
    return (
      <div className="relative h-[65vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-950 overflow-hidden">
        {/* Animated skeleton shimmer */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950"
            style={{
              backgroundSize: "200% 100%",
              animation: "slide-left 2s linear infinite",
            }}
          />
        </div>
        <div className="absolute bottom-12 left-6 md:left-12 space-y-4">
          <div className="w-24 h-6 rounded-full bg-white/5 animate-pulse" />
          <div className="w-64 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-48 h-10 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-36 h-12 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ═══════ EMPTY STATE ═══════ */
  if (banners.length === 0) {
    return (
      <section className="relative h-[65vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-950 flex items-center justify-center overflow-hidden hero-grain">
        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-[100px] orb-float-1" />
        <div className="absolute bottom-1/3 left-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-br from-amber-500/8 to-orange-500/5 blur-[80px] orb-float-2" />

        <div className="text-center space-y-4 relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight hero-text-reveal">
            নীলান্তি
          </h2>
          <p className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase hero-badge-in">
            বিশ্বস্ততার বুনন
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-gray-950 group hero-grain"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Taller on mobile to maximize visual impact */}
      <div className="relative h-[65vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh]">
        {banners.map((banner, index) => {
          const isVideo =
            banner.layout_type === "video" && banner.video_url;
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
                    ? "scale(1.02) translateX(1.5%)"
                    : "scale(1.02) translateX(-1.5%)",
                transition: isTransitioning
                  ? "none"
                  : "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                zIndex: isActive ? 10 : 1,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              {isSplit ? (
                /* ═══════ SPLIT LAYOUT — Premium editorial ═══════ */
                <div className="flex flex-col md:flex-row h-full w-full">
                  {/* Text Side */}
                  <div className="flex-1 flex items-center justify-center bg-gray-950 p-6 sm:p-10 md:p-16 relative overflow-hidden">
                    {/* Ambient light orbs */}
                    <div className="absolute top-1/4 right-0 w-[350px] h-[350px] rounded-full bg-blue-500/[0.06] blur-[120px] orb-float-1" />
                    <div className="absolute bottom-0 left-1/4 w-[250px] h-[250px] rounded-full bg-amber-500/[0.04] blur-[100px] orb-float-2" />

                    <div
                      className="w-full max-w-xl space-y-5 md:space-y-7 text-center md:text-left z-10"
                      key={isActive ? `split-text-${slideKey}` : undefined}
                    >
                      {/* Badge */}
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/80 text-[11px] md:text-xs font-semibold tracking-wide ${isActive ? "hero-badge-in" : ""}`}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              "linear-gradient(135deg, #34d399, #10b981)",
                            boxShadow: "0 0 6px rgba(52,211,153,0.5)",
                            animation: "glow-pulse 2s ease-in-out infinite",
                          }}
                        />
                        {banner.subtitle_bn || "আপনার স্টাইল, আপনার পরিচয়"}
                      </span>

                      {/* Title — with text reveal animation */}
                      <div className="overflow-hidden">
                        <h2
                          className={`text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.08] text-white tracking-tight ${isActive ? "hero-text-reveal" : ""}`}
                          style={{ animationDelay: "0.15s" }}
                        >
                          {banner.title_bn}
                        </h2>
                      </div>

                      {/* CTA Button */}
                      {banner.link_url && (
                        <div className={isActive ? "hero-cta-in" : ""}>
                          <Link to={banner.link_url} className="inline-block">
                            <Button
                              size="lg"
                              className="group/btn gap-2.5 h-12 md:h-13 px-8 md:px-10 text-sm md:text-[15px] font-bold rounded-full bg-white text-gray-900 hover:bg-gray-50 relative overflow-hidden cta-glow-breathe"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                এখনই কিনুন
                                <ArrowRight className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-500 group-hover/btn:translate-x-1" />
                              </span>
                              {/* Shimmer sweep */}
                              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.04] to-transparent" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Side */}
                  <div className="flex-1 relative h-full min-h-[45%] md:min-h-full overflow-hidden">
                    {isVideo ? (
                      <video
                        src={banner.video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={banner.image_url}
                        alt={banner.title_bn}
                        className={`w-full h-full object-cover ${isActive ? "ken-burns" : ""}`}
                      />
                    )}
                    {/* Cinematic gradient bleed */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/30 to-transparent opacity-60 md:opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent md:hidden" />
                  </div>
                </div>
              ) : (
                /* ═══════ FULLSCREEN LAYOUT — Cinematic editorial ═══════ */
                <>
                  {/* Background media with Ken Burns */}
                  <div className="absolute inset-0 overflow-hidden">
                    {isVideo ? (
                      <video
                        src={banner.video_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={banner.image_url}
                        alt={banner.title_bn}
                        className={`w-full h-full object-cover will-change-transform ${isActive ? "ken-burns" : ""}`}
                        key={isActive ? `img-${slideKey}` : undefined}
                      />
                    )}

                    {/* Multi-layer cinematic overlays */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.15) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
                      }}
                    />
                    {/* Subtle vignette */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)",
                      }}
                    />
                  </div>

                  {/* Content overlay — editorial bottom-left placement */}
                  <div className="container relative h-full flex items-end pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-5 md:px-10 z-10">
                    <div
                      className="max-w-2xl lg:max-w-3xl space-y-4 md:space-y-5"
                      key={isActive ? `content-${slideKey}` : undefined}
                    >
                      {/* Subtitle badge — pill with glow dot */}
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/85 text-[11px] md:text-xs font-semibold tracking-wide ${isActive ? "hero-badge-in" : ""}`}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          backdropFilter: "blur(16px)",
                          WebkitBackdropFilter: "blur(16px)",
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, #34d399, #10b981)",
                            boxShadow: "0 0 8px rgba(52,211,153,0.6)",
                            animation: "glow-pulse 2s ease-in-out infinite",
                          }}
                        />
                        {banner.subtitle_bn || "প্রিমিয়াম কালেকশন"}
                      </span>

                      {/* Title — large editorial with text reveal */}
                      <div className="overflow-hidden">
                        <h2
                          className={`text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.06] tracking-tight ${isActive ? "hero-text-reveal" : ""}`}
                          style={{
                            animationDelay: "0.15s",
                            textShadow: "0 2px 20px rgba(0,0,0,0.15)",
                          }}
                        >
                          {banner.title_bn}
                        </h2>
                      </div>

                      {/* CTA Button — premium with glow breathe */}
                      {banner.link_url && (
                        <div
                          className={`pt-1 md:pt-2 ${isActive ? "hero-cta-in" : ""}`}
                        >
                          <Link to={banner.link_url}>
                            <Button
                              size="lg"
                              className="group/btn gap-2.5 h-12 md:h-[52px] px-7 md:px-9 text-[13px] md:text-sm font-bold rounded-full bg-white text-gray-900 hover:bg-gray-50 relative overflow-hidden cta-glow-breathe"
                            >
                              <span className="relative z-10 flex items-center gap-2">
                                এখনই কিনুন
                                <ArrowRight className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                              </span>
                              {/* Shimmer sweep on hover */}
                              <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />
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

        {/* ═══════ NAV ARROWS — minimal ghost circles ═══════ */}
        {banners.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all duration-400 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              aria-label="আগের ব্যানার"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white transition-all duration-400 z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }}
              aria-label="পরের ব্যানার"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* ═══════ BOTTOM CONTROLS — ultra-minimal editorial bar ═══════ */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Segmented progress bar — one segment per slide */}
            <div className="flex gap-[3px] px-5 md:px-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className="flex-1 h-[2.5px] rounded-full overflow-hidden transition-opacity duration-300"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    opacity: i === currentSlide ? 1 : 0.5,
                  }}
                  aria-label={`ব্যানার ${i + 1}`}
                >
                  {i === currentSlide && (
                    <div
                      className="h-full rounded-full transition-none"
                      style={{
                        width: `${progress}%`,
                        background:
                          "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,1))",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Controls row */}
            <div
              className="flex items-center justify-between px-5 md:px-10 py-3 md:py-4"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
              }}
            >
              {/* Slide counter — editorial number style */}
              <div className="flex items-center gap-1.5">
                <span
                  key={currentSlide}
                  className="text-white/90 text-xs md:text-sm font-bold tabular-nums counter-flip"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {String(currentSlide + 1).padStart(2, "0")}
                </span>
                <span
                  className="w-4 h-[1px] rounded-full"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                />
                <span
                  className="text-white/30 text-xs md:text-sm tabular-nums"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {String(banners.length).padStart(2, "0")}
                </span>
              </div>

              {/* Pause/Play — minimal */}
              <button
                onClick={() => setIsPaused((p) => !p)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 hover:bg-white/10"
                style={{
                  color: "rgba(255,255,255,0.4)",
                }}
                aria-label={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? (
                  <Play className="h-3 w-3" />
                ) : (
                  <Pause className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Mobile swipe hint — only shows first visit ═══ */}
        {banners.length > 1 && (
          <div className="absolute bottom-20 right-6 z-20 md:hidden pointer-events-none">
            <div className="swipe-hint">
              <ChevronLeft className="h-5 w-5 text-white/40" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
