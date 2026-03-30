import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useBanners } from "@/hooks/useAdminData";
import { useHomepageSection } from "@/hooks/useCMSData";

const PromotionalBanners = () => {
  const { data: allBanners, isLoading } = useBanners();
  const { data: sectionData } = useHomepageSection("promotional_banners");
  const banners = (allBanners as any[])?.filter(b => b.position === "promo" && b.is_active) || [];

  if (isLoading || banners.length === 0) {
    return null;
  }

  const count = Math.min(banners.length, 6);

  // Dynamic grid container style based on banner count
  const getGridStyle = (): React.CSSProperties => {
    switch (count) {
      case 1:
        return {
          display: "grid",
          gridTemplateColumns: "1fr",
          gridTemplateRows: "400px",
          gap: "1.25rem",
        };
      case 2:
        return {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "400px",
          gap: "1.25rem",
        };
      case 3:
        return {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "400px",
          gap: "1.25rem",
        };
      case 4:
        // 2 rows × 3 cols: item0=top-left, item1=top-center+bot-center (tall), item2=top-right, item3=bottom spanning left+right
        return {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "300px 300px",
          gap: "1.25rem",
        };
      case 5:
        return {
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "300px 300px",
          gap: "1.25rem",
        };
      case 6:
      default:
        return {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "300px 300px",
          gap: "1.25rem",
        };
    }
  };

  // Dynamic grid item style based on banner count and index
  const getItemStyle = (index: number): React.CSSProperties => {
    if (count === 4) {
      // Layout: [0] [1 tall] [2]
      //         [3 wide ]  [1 cont]
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" }; // tall center
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1 / 2", gridRow: "2" }; // bottom left
        default: return {};
      }
    }
    if (count === 5) {
      // Layout: [0] [1 tall] [2]
      //         [3] [1 cont] [4]
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" }; // tall center
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }
    if (count === 6) {
      // Layout: [0] [1 tall] [2]
      //         [3] [4]      [5]
      // Or bento: [0] [1 tall] [2]
      //           [3 tall] [4] [5 tall] -- but 6 items in 2 rows works fine
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" }; // tall center
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "2", gridRow: "2" }; // won't show if 1 is spanning
        case 5: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }
    // For 1,2,3 - no special positioning needed
    return {};
  };

  // For count=6, item at index 1 spans 2 rows, so index 4 is hidden
  // Let's adjust: for 6 items, use a proper 2x3 flat grid instead
  const getItemStyleAdjusted = (index: number): React.CSSProperties => {
    if (count <= 3) return {};

    if (count === 4) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1 / 2", gridRow: "2" };
        default: return {};
      }
    }

    if (count === 5) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }

    // count === 6: all 6 fill a 2x3 grid perfectly
    if (count === 6) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "2", gridRow: "2" };
        case 5: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }

    return {};
  };

  // For 4 banners, the 4th item should also span the remaining right column
  const getFinalItemStyle = (index: number): React.CSSProperties => {
    if (count <= 3) return {};

    if (count === 4) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1 / 2", gridRow: "2" };
        // gap at col3/row2 — let's span item 3 across both
      }
      // Actually let's make item 3 span col 1 AND col 3
      if (index === 3) return { gridColumn: "1", gridRow: "2" };
      // We need a 5th phantom or item 2 to also span. Better approach:
      // Make item 2 span row 1-2 on col 3
      if (index === 2) return { gridColumn: "3", gridRow: "1 / 3" };
    }

    if (count === 5) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1 / 3" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }

    if (count === 6) {
      switch (index) {
        case 0: return { gridColumn: "1", gridRow: "1" };
        case 1: return { gridColumn: "2", gridRow: "1" };
        case 2: return { gridColumn: "3", gridRow: "1" };
        case 3: return { gridColumn: "1", gridRow: "2" };
        case 4: return { gridColumn: "2", gridRow: "2" };
        case 5: return { gridColumn: "3", gridRow: "2" };
        default: return {};
      }
    }

    return {};
  };

  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="container px-4 md:px-6">
        {/* Section Header */}
        <div className="mb-10 md:mb-16 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-bengali uppercase">
            {(sectionData as any)?.title_bn || "Featured Collections"}
          </h2>
          <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-2xl font-medium font-bengali">
            {(sectionData as any)?.subtitle_bn || "Dare to mix and match! Check our collections to level up your fashion game"}
          </p>
        </div>

        {/* Adaptive Grid - always fills the space */}
        <div
          className="hidden md:grid"
          style={getGridStyle()}
        >
          {banners.slice(0, count).map((banner: any, index: number) => (
            <Link
              key={banner.id}
              to={banner.link_url}
              className="group relative overflow-hidden bg-gray-100 rounded-2xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
              style={getFinalItemStyle(index)}
            >
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110">
                {banner.layout_type === "video" && banner.video_url ? (
                  <video
                    src={banner.video_url}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/25 transition-colors duration-500 group-hover:bg-black/35" />
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg font-bengali">
                  {banner.title_bn}
                </h3>
                <div className="mt-3 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500 text-white font-semibold text-sm border-b-2 border-white pb-1 font-bengali">
                  সংগ্রহটি দেখুন <ArrowRight className="inline-block h-4 w-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile: simple stacked layout */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {banners.slice(0, count).map((banner: any) => (
            <Link
              key={banner.id}
              to={banner.link_url}
              className="group relative overflow-hidden bg-gray-100 rounded-2xl h-[280px] transition-all duration-500"
            >
              <div className="absolute inset-0 z-0">
                {banner.layout_type === "video" && banner.video_url ? (
                  <video
                    src={banner.video_url}
                    autoPlay loop muted playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={banner.image_url}
                    alt={banner.title_bn}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/25" />
              </div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-2xl font-bold text-white drop-shadow-lg font-bengali">
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

export default PromotionalBanners;
