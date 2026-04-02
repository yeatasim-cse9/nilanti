import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

/* ═══════ Framer Motion Variants ═══════ */
const badgeVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const ctaVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: "easeIn" },
  },
};

const imageVariants = {
  hidden: { scale: 1.0, opacity: 0 },
  visible: {
    scale: 1.08,
    opacity: 1,
    transition: { scale: { duration: 10, ease: "linear" }, opacity: { duration: 1.2, ease: "easeOut" } },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" },
  },
};


const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const progressRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

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
          setCurrentSlide((prev) => (prev + 1) % banners.length);
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
      setCurrentSlide(index);
      progressRef.current = 0;
      setProgress(0);
      lastTimeRef.current = 0;
    },
    [currentSlide]
  );

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
  }, [banners.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    progressRef.current = 0;
    setProgress(0);
    lastTimeRef.current = 0;
  }, [banners.length]);

  /* ═══ Touch / Swipe for mobile ═══ */
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
      <div className="relative h-[60vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-10 h-10 border-2 border-gray-700 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        {/* Skeleton shimmer */}
        <div className="absolute bottom-12 left-6 md:left-12 space-y-4">
          <div className="w-48 h-7 rounded-full bg-white/5 animate-pulse" />
          <div className="w-72 h-12 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-56 h-12 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-36 h-12 rounded-full bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  /* ═══════ EMPTY STATE ═══════ */
  if (banners.length === 0) {
    return (
      <section className="relative h-[60vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh] bg-gray-950 flex items-center justify-center overflow-hidden">
        {/* Floating ambient orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-[100px]"
          animate={{ x: [0, 15, -10, 0], y: [0, -20, -5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-[250px] h-[250px] rounded-full bg-gradient-to-br from-amber-500/8 to-orange-500/5 blur-[80px]"
          animate={{ x: [0, -15, 10, 0], y: [0, 10, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="text-center space-y-4 relative z-10">
          <motion.h2
            className="text-5xl md:text-7xl font-black text-white tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            নীলান্তি
          </motion.h2>
          <motion.p
            className="text-gray-500 text-sm font-medium tracking-[0.2em] uppercase"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          >
            বিশ্বস্ততার বুনন
          </motion.p>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentSlide];

  return (
    <section
      className="relative overflow-hidden bg-gray-950 group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative h-[60vh] sm:h-[60vh] md:h-[75vh] lg:h-[85vh]">

        {/* ═══════ BACKGROUND IMAGE / VIDEO ═══════ */}
        <AnimatePresence mode="sync">
          <motion.div
            key={`bg-${currentSlide}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          >
            {currentBanner.layout_type === "split" ? (
              /* ═══ SPLIT LAYOUT ═══ */
              <div className="flex flex-col md:flex-row h-full w-full">
                {/* Text side */}
                <div className="flex-1 flex items-center justify-center bg-gray-950 p-6 sm:p-10 md:p-16 relative overflow-hidden">
                  {/* Ambient orbs */}
                  <motion.div
                    className="absolute top-1/4 right-0 w-[350px] h-[350px] rounded-full bg-blue-500/[0.06] blur-[120px]"
                    animate={{ x: [0, 12, -8, 0], y: [0, -20, -10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-1/4 w-[250px] h-[250px] rounded-full bg-amber-500/[0.04] blur-[100px]"
                    animate={{ x: [0, -15, 10, 0], y: [0, 10, -15, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <SplitContent banner={currentBanner} slideKey={currentSlide} />
                </div>
                {/* Image side */}
                <div className="flex-1 relative h-full min-h-[45%] md:min-h-full overflow-hidden">
                  {currentBanner.layout_type === "video" && currentBanner.video_url ? (
                    <video src={currentBanner.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <motion.img
                      key={`split-img-${currentSlide}`}
                      src={currentBanner.image_url}
                      alt={currentBanner.title_bn}
                      className="w-full h-full object-cover"
                      variants={imageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/30 to-transparent opacity-60 md:opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/50 via-transparent to-transparent md:hidden" />
                </div>
              </div>
            ) : (
              /* ═══ FULLSCREEN LAYOUT ═══ */
              <>
                <div className="absolute inset-0 overflow-hidden">
                  {currentBanner.layout_type === "video" && currentBanner.video_url ? (
                    <video src={currentBanner.video_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                  ) : (
                    <motion.img
                      key={`fs-img-${currentSlide}`}
                      src={currentBanner.image_url}
                      alt={currentBanner.title_bn}
                      className="w-full h-full object-cover will-change-transform"
                      variants={imageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    />
                  )}

                  {/* Multi-layer cinematic overlays */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.15) 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)",
                    }}
                  />
                  {/* Vignette */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)",
                    }}
                  />
                </div>

                {/* Fullscreen text content */}
                <FullscreenContent banner={currentBanner} slideKey={currentSlide} />
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ═══════ NAV ARROWS ═══════ */}
        {banners.length > 1 && (
          <>
            <motion.button
              onClick={goToPrev}
              className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 focus:opacity-100"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
              }}
              whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-label="আগের ব্যানার"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={goToNext}
              className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-white z-20 opacity-0 group-hover:opacity-100 focus:opacity-100"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(20px)",
              }}
              whileHover={{ scale: 1.08, background: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              aria-label="পরের ব্যানার"
            >
              <ChevronRight className="h-4 w-4" />
            </motion.button>
          </>
        )}

        {/* ═══════ BOTTOM CONTROLS ═══════ */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20">
            {/* Segmented progress bar */}
            <div className="flex gap-[3px] px-5 md:px-10">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className="flex-1 h-[2.5px] rounded-full overflow-hidden transition-opacity duration-300"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    opacity: i === currentSlide ? 1 : 0.4,
                  }}
                  aria-label={`ব্যানার ${i + 1}`}
                >
                  {i === currentSlide && (
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, rgba(255,255,255,0.85), rgba(255,255,255,1))",
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
                background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)",
              }}
            >
              {/* Editorial counter */}
              <div className="flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentSlide}
                    className="text-white/90 text-xs md:text-sm font-bold tabular-nums"
                    style={{ fontFeatureSettings: '"tnum"' }}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {String(currentSlide + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
                <span className="w-4 h-[1px] rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span className="text-white/30 text-xs md:text-sm tabular-nums" style={{ fontFeatureSettings: '"tnum"' }}>
                  {String(banners.length).padStart(2, "0")}
                </span>
              </div>

              {/* Pause/Play */}
              <motion.button
                onClick={() => setIsPaused((p) => !p)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ color: "rgba(255,255,255,0.4)" }}
                whileHover={{ scale: 1.15, color: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.9 }}
                aria-label={isPaused ? "Play" : "Pause"}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle grain overlay */}
      <div className="hero-grain absolute inset-0 pointer-events-none z-[3]" />
    </section>
  );
};


/* ═══════════════════════════════════════════
   FULLSCREEN TEXT CONTENT — AnimatePresence
   ═══════════════════════════════════════════ */
const FullscreenContent = ({ banner, slideKey }: { banner: Banner; slideKey: number }) => (
  <div className="container relative h-full flex items-end pb-20 sm:pb-24 md:pb-28 lg:pb-32 px-5 md:px-10 z-10">
    <AnimatePresence mode="wait">
      <motion.div
        key={`fs-content-${slideKey}`}
        className="max-w-2xl lg:max-w-3xl space-y-4 md:space-y-5"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Badge */}
        <motion.span
          variants={badgeVariants}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/85 text-[11px] md:text-xs font-semibold tracking-wide"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #34d399, #10b981)",
              boxShadow: "0 0 8px rgba(52,211,153,0.6)",
            }}
          />
          {banner.subtitle_bn || "প্রিমিয়াম কালেকশন"}
        </motion.span>

        {/* Title — NO overflow-hidden, text won't clip */}
        <motion.h2
          variants={titleVariants}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.15] tracking-tight"
          style={{ textShadow: "0 2px 20px rgba(0,0,0,0.15)" }}
        >
          {banner.title_bn}
        </motion.h2>

        {/* CTA */}
        {banner.link_url && (
          <motion.div variants={ctaVariants} className="pt-1 md:pt-2">
            <Link to={banner.link_url}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="group/btn gap-2.5 h-12 md:h-[52px] px-7 md:px-9 text-[13px] md:text-sm font-bold rounded-full bg-white text-gray-900 hover:bg-gray-50 relative overflow-hidden cta-glow-breathe"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    এখনই কিনুন
                    <ArrowRight className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-500 group-hover/btn:translate-x-1.5" />
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-gray-200/40 to-transparent" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
);


/* ═══════════════════════════════════════════
   SPLIT TEXT CONTENT — AnimatePresence
   ═══════════════════════════════════════════ */
const SplitContent = ({ banner, slideKey }: { banner: Banner; slideKey: number }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={`split-content-${slideKey}`}
      className="w-full max-w-xl space-y-5 md:space-y-7 text-center md:text-left z-10"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Badge */}
      <motion.span
        variants={badgeVariants}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white/80 text-[11px] md:text-xs font-semibold tracking-wide"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #34d399, #10b981)",
            boxShadow: "0 0 6px rgba(52,211,153,0.5)",
          }}
        />
        {banner.subtitle_bn || "আপনার স্টাইল, আপনার পরিচয়"}
      </motion.span>

      {/* Title — proper line-height, no clipping */}
      <motion.h2
        variants={titleVariants}
        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.15] text-white tracking-tight"
      >
        {banner.title_bn}
      </motion.h2>

      {/* CTA */}
      {banner.link_url && (
        <motion.div variants={ctaVariants}>
          <Link to={banner.link_url} className="inline-block">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="group/btn gap-2.5 h-12 md:h-13 px-8 md:px-10 text-sm md:text-[15px] font-bold rounded-full bg-white text-gray-900 hover:bg-gray-50 relative overflow-hidden cta-glow-breathe"
              >
                <span className="relative z-10 flex items-center gap-2">
                  এখনই কিনুন
                  <ArrowRight className="h-4 w-4 md:h-[18px] md:w-[18px] transition-transform duration-500 group-hover/btn:translate-x-1" />
                </span>
                <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-black/[0.04] to-transparent" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </motion.div>
  </AnimatePresence>
);


export default HeroBanner;
