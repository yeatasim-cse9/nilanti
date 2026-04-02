import { Check, X } from "lucide-react";
import { useHomepageSection } from "@/hooks/useCMSData";

const WhyChooseUs = () => {
  const { data: section, isLoading } = useHomepageSection("why_choose_us");

  if (isLoading || !section) return null;

  const comparisons = (section as any).content || [];

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-10 md:mb-14 reveal">
          <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">
            আমাদের বিশেষত্ব
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight max-w-xl">
            {(section as any).title_bn || "কেন নীলান্তিকে বেছে নেন?"}
          </h2>
          <p className="text-gray-400 mt-3 max-w-md text-sm md:text-base">
            {(section as any).description_bn || "অন্যান্য সাধারণ দোকানের চেয়ে আমরা কেন আলাদা, নিজেই দেখে নিন।"}
          </p>
          <div className="section-divider mt-5" />
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Desktop header row */}
          <div className="hidden md:grid grid-cols-3 gap-4 mb-4 px-6 reveal">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">বিষয়</div>
            <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">অন্যান্যরা</div>
            <div className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">নীলান্তি</div>
          </div>

          <div className="space-y-2.5 md:space-y-3">
            {(comparisons.length > 0 ? comparisons : [
              { feature: "কাপড়ের মান", others: "সাধারণ প্লাস্টিক মিক্সড", us: "১০০% প্রিমিয়াম সফট" },
              { feature: "আরাম", others: "গরম ও অস্বস্তি", us: "সারা দিন ফুরফুরে" },
              { feature: "কালার গ্যারান্টি", others: "ধোয়ার পর রঙ উঠে", us: "রঙ টেকসই ও উজ্জ্বল" },
              { feature: "শিপিং", others: "অগোছালো ও দেরি", us: "দ্রুত ও যত্নশীল" }
            ]).map((item: any, index: number) => (
              <div
                key={index}
                className={`reveal stagger-${Math.min(index + 1, 4)} grid grid-cols-3 gap-3 md:gap-4 bg-white rounded-xl md:rounded-2xl p-4 md:p-5 border border-gray-100/80 group hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-400`}
              >
                <div className="font-bold text-gray-900 flex items-center text-[13px] md:text-sm">
                  {item.feature}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] md:text-xs text-red-400 font-medium bg-red-50 rounded-lg p-2">
                  <X className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden md:inline">{item.others}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] md:text-xs text-emerald-600 font-semibold bg-emerald-50 rounded-lg p-2 ring-1 ring-emerald-100">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden md:inline">{item.us}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
