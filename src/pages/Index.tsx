import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroBanner from "@/components/home/HeroBanner";
import CategorySlider from "@/components/home/CategorySlider";
import FlashSale from "@/components/home/FlashSale";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromotionalBanners from "@/components/home/PromotionalBanners";
import AllProducts from "@/components/home/AllProducts";
import CustomerReviews from "@/components/home/CustomerReviews";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Benefits from "@/components/home/Benefits";
import MoneyBackGuarantee from "@/components/home/MoneyBackGuarantee";
import InstagramFeed from "@/components/home/InstagramFeed";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import Newsletter from "@/components/home/Newsletter";
import { useHomepageSections } from "@/hooks/useCMSData";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const Index = () => {
  const { data: sections } = useHomepageSections();
  const containerRef = useScrollReveal();

  const renderSection = (id: string) => {
    switch (id.toLowerCase()) {
      case "hero_banner": return <HeroBanner />;
      case "categories_slider": return <CategorySlider />;
      case "flash_sale": return <FlashSale />;
      case "featured_products": return <FeaturedProducts />;
      case "promotional_banners": return <PromotionalBanners />;
      case "all_products": return <AllProducts />;
      case "why_choose_us": return <WhyChooseUs />;
      case "customer_reviews": return <CustomerReviews />;
      case "benefits": return <Benefits />;
      case "money_back_guarantee": return <MoneyBackGuarantee />;
      case "instagram_feed": return <InstagramFeed />;
      case "newsletter": return <Newsletter />;
      default: return null;
    }
  };

  const DEFAULT_ORDER = [
    "hero_banner",
    "categories_slider",
    "flash_sale",
    "featured_products",
    "promotional_banners",
    "all_products",
    "why_choose_us",
    "customer_reviews",
    "benefits",
    "money_back_guarantee",
    "instagram_feed",
    "newsletter",
  ];

  const activeSections = (sections as any[])?.filter(s => s.is_active) || [];

  const sortedSectionIds = activeSections.length > 0
    ? [...activeSections]
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .map(s => s.id)
    : DEFAULT_ORDER;

  const isAnnouncementActive = (sections as any[])?.some(s => s.id.toLowerCase() === "announcement_bar" && s.is_active);

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white">
      {isAnnouncementActive && <AnnouncementBar />}

      <Header cartCount={0} />

      <main className="flex-1">
        {sortedSectionIds
          .filter(id => id.toLowerCase() !== "announcement_bar")
          .map(id => (
            <div key={id}>
              {renderSection(id)}
            </div>
          ))
        }
      </main>

      <Footer />
    </div>
  );
};

export default Index;