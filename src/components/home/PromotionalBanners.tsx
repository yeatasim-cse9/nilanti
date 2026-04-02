import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBanners } from "@/hooks/useAdminData";
import { useHomepageSection } from "@/hooks/useCMSData";

const PromotionalBanners = () => {
  const { data: allBanners, isLoading } = useBanners();
  const { data: sectionData } = useHomepageSection("promotional_banners");
  const banners = (allBanners as any[])
    ?.filter(b => b.position === "promo" && b.is_active)
    ?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];

  if (isLoading || banners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-10 md:mb-14 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-bengali">
            {(sectionData as any)?.title_bn || "Featured Collections"}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-2xl font-medium font-bengali">
            {(sectionData as any)?.subtitle_bn || "Dare to mix and match! Check our collections to level up your fashion game"}
          </p>
        </div>

        {/* Desktop: Responsive Bento Grid */}
        <div className="hidden md:grid gap-4 md:gap-5" style={getGridStyle(banners.length)}>
          {banners.map((banner: any, index: number) => (
            <Link
              key={banner.id}
              to={banner.link_url || "#"}
              className="group relative overflow-hidden bg-gray-100 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              style={getItemStyle(banners.length, index)}
            >
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                {banner.layout_type === "video" && banner.video_url ? (
                  <video
                    src={banner.video_url}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                ) : banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn || "Banner"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-end p-6 pb-8 text-center">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg font-bengali leading-tight">
                  {banner.title_bn}
                </h3>
                {banner.subtitle_bn && (
                  <p className="text-white/80 text-sm mt-1 font-bengali">{banner.subtitle_bn}</p>
                )}
                <div className="mt-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 text-white font-semibold text-sm flex items-center gap-1.5">
                  <span className="border-b border-white pb-0.5 font-bengali">সংগ্রহটি দেখুন</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile: Clean 2-column grid */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          {banners.map((banner: any) => (
            <Link
              key={banner.id}
              to={banner.link_url || "#"}
              className="group relative overflow-hidden bg-gray-100 rounded-xl aspect-[3/4] transition-all duration-300"
            >
              <div className="absolute inset-0 z-0">
                {banner.layout_type === "video" && banner.video_url ? (
                  <video
                    src={banner.video_url}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                ) : banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn || "Banner"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-end p-3 pb-4 text-center">
                <h3 className="text-sm font-bold text-white drop-shadow-md font-bengali leading-snug">
                  {banner.title_bn}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

/* --- Grid Layout Helpers --- */

function getGridStyle(count: number): React.CSSProperties {
  // 1 banner: single full-width
  if (count === 1) {
    return { gridTemplateColumns: "1fr", gridTemplateRows: "400px" };
  }
  // 2 or 4: 2-column grid
  if (count === 2) {
    return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "380px" };
  }
  // 3: 3-column single row
  if (count === 3) {
    return { gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "380px" };
  }
  // 4: 2×2 grid
  if (count === 4) {
    return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "320px 320px" };
  }
  // 5: first row 3 items, second row 2 items spanning
  if (count === 5) {
    return {
      gridTemplateColumns: "repeat(6, 1fr)",
      gridTemplateRows: "300px 300px",
    };
  }
  // 6+: 3-column, 2-row
  return { gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "300px 300px" };
}

function getItemStyle(count: number, index: number): React.CSSProperties {
  // For 1, 2, 3, 4, 6: auto placement works fine
  if (count <= 4 || count === 6) return {};

  // For 5: Use 6-col grid trick so bottom 2 items center
  if (count === 5) {
    switch (index) {
      case 0: return { gridColumn: "1 / 3", gridRow: "1" };
      case 1: return { gridColumn: "3 / 5", gridRow: "1" };
      case 2: return { gridColumn: "5 / 7", gridRow: "1" };
      case 3: return { gridColumn: "1 / 4", gridRow: "2" }; // spans 3 of 6
      case 4: return { gridColumn: "4 / 7", gridRow: "2" }; // spans 3 of 6
      default: return {};
    }
  }

  return {};
}

export default PromotionalBanners;
