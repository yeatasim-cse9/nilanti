import { Check, X } from "lucide-react";

import { useHomepageSection } from "@/hooks/useCMSData";

const WhyChooseUs = () => {
  const { data: section, isLoading } = useHomepageSection("why_choose_us");

  if (isLoading || !section) return null;

  const comparisons = (section as any).content || [];

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-primary font-bold text-xs uppercase tracking-normal bg-primary/10 px-4 py-1.5 rounded-full">আমাদের বিশেষত্ব</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight max-w-2xl leading-[1.1]">
            {(section as any).title_bn || "কেন হাজারো নারী আমাদের নীলান্তিকে বেছে নেন?"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg opacity-80">
            {(section as any).description_bn || "অন্যান্য সাধারণ দোকানের চেয়ে আমরা কেন আলাদা, নিজেই দেখে নিন।"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-6 mb-6 px-6">
            <div className="text-sm font-bold text-muted-foreground/60 uppercase tracking-normal">বিষয়</div>
            <div className="text-center font-bold text-destructive/80 uppercase tracking-normal">অন্যান্যরা</div>
            <div className="text-center font-bold text-primary uppercase tracking-normal">নীলান্তি</div>
          </div>

          <div className="space-y-4">
            {(comparisons.length > 0 ? comparisons : [
              { feature: "কাপড়ের মান", others: "সাধারণ প্লাস্টিক মিক্সড কাপড়", us: "১০০% প্রিমিয়াম ও সুপার সফট" },
              { feature: "আরাম", others: "গরম লাগে ও অস্বস্তি হয়", us: "সারা দিন ফুরফুরে অনুভূতি" },
              { feature: "কালার গ্যারান্টি", others: "ধোয়ার পর রঙ উঠে যায়", us: "রঙ টেকসই ও সবসময় উজ্জ্বল" },
              { feature: "শিপিং", others: "অগোছালো ও দেরি হয়", us: "খুব দ্রুত ও যত্নশীল ডেলিভারি" }
            ]).map((item: any, index: number) => (
              <div
                key={index}
                className="grid grid-cols-3 gap-4 bg-card hover:bg-muted/30 transition-colors rounded-2xl p-5 md:p-6 border border-border shadow-sm group"
              >
                <div className="font-bold text-foreground flex items-center text-base md:text-lg">
                  {item.feature}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-destructive font-medium bg-destructive/5 rounded-xl p-2">
                  <X className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">{item.others}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-primary font-bold bg-primary/10 rounded-xl p-2 ring-1 ring-primary/20">
                  <Check className="h-4 w-4 shrink-0" />
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
