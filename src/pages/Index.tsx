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

const Index = () => {
  const { data: sections, isLoading } = useHomepageSections();

  // Mapping of section IDs to their corresponding components
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

  // Define the default order to maintain visual consistency
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header cartCount={0} />
        <main className="flex-1 flex items-center justify-center bg-background">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get active sections and sort them by default order
  // If a new section is added that is not in DEFAULT_ORDER, it will be added at the end
  const activeSections = (sections as any[])?.filter(s => s.is_active) || [];
  
  const sortedSectionIds = activeSections.length > 0 
    ? [...activeSections]
        .sort((a, b) => (a.order || 999) - (b.order || 999))
        .map(s => s.id)
    : DEFAULT_ORDER;

  const isAnnouncementActive = (sections as any[])?.some(s => s.id.toLowerCase() === "announcement_bar" && s.is_active);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isAnnouncementActive && <AnnouncementBar />}
      
      <Header cartCount={0} />

      <main className="flex-1">
        {sortedSectionIds
          .filter(id => id.toLowerCase() !== "announcement_bar") 
          .map(id => (
            <div key={id} className="animate-in fade-in duration-500">
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