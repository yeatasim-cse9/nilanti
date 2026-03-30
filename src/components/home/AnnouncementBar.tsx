import { useHomepageSection } from "@/hooks/useCMSData";

const AnnouncementBar = () => {
  const { data: rawSection } = useHomepageSection("announcement_bar");
  const section = rawSection as any;

  if (!section || !section.is_active || !section.text_bn) return null;

  return (
    <div 
      className="py-2.5 px-4 text-center text-[13px] md:text-sm font-medium transition-all duration-300 shadow-sm relative z-50"
      style={{ 
        backgroundColor: section.bg_color || "#16a34a", 
        color: section.text_color || "#ffffff" 
      }}
    >
      <div className="container mx-auto animate-pulse-slow">
        {section.text_bn}
      </div>
    </div>
  );
};

export default AnnouncementBar;
