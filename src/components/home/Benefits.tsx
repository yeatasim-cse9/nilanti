import { Truck, Shield, Leaf, HeartHandshake, Clock, Award } from "lucide-react";

import { useHomepageSection } from "@/hooks/useCMSData";

const iconMap: Record<string, any> = {
  Truck, Shield, Leaf, HeartHandshake, Clock, Award
};

const Benefits = () => {
  const { data: section, isLoading } = useHomepageSection("benefits");

  if (isLoading || !section) return null;

  const benefits = (section as any).content || [];

  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-primary font-bold text-xs uppercase tracking-normal bg-primary/10 px-4 py-1.5 rounded-full">
              {(section as any).subtitle_bn || "আমাদের সার্ভিস"}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter max-w-2xl leading-[1.1] font-bengali">
            {(section as any).title_bn || "আপনার কেনাকাটা হোক সহজ ও আনন্দদায়ক"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg font-bengali leading-relaxed">
            {(section as any).description_bn || "সেরা পণ্যের পাশাপাশি আমরা নিশ্চিত করি সেরা গ্রাহক সেবা।"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {(benefits.length > 0 ? benefits : [
            { icon: "Truck", title: "ফ্রি ডেলিভারি", description: "১০০০ টাকার বেশি অর্ডারে" },
            { icon: "Shield", title: "নিরাপদ পেমেন্ট", description: "১০০% সুরক্ষিত লেনদেন" },
            { icon: "Leaf", title: "অর্গানিক পণ্য", description: "১০০% খাঁটি ও স্বাস্থ্যকর" },
            { icon: "HeartHandshake", title: "গ্রাহক সেবা", description: "২৪/৭ সাপোর্ট" },
            { icon: "Clock", title: "দ্রুত রিটার্ন", description: "৭ দিনের মধ্যে রিটার্ন সম্ভব" },
            { icon: "Award", title: "সেরা মান", description: "গুণগত মানের নিশ্চয়তা" }
          ]).map((benefit: any, index: number) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10 overflow-hidden">
                {benefit.icon && (benefit.icon.startsWith("http") || benefit.icon.startsWith("/")) ? (
                  <img 
                    src={benefit.icon} 
                    alt={benefit.title} 
                    className="w-full h-full object-cover transition-all"
                    onError={(e) => {
                      (e.target as any).src = "/assets/icons/default-benefit.jpg"; 
                    }}
                  />
                ) : iconMap[benefit.icon] ? (
                  (() => {
                    const Icon = iconMap[benefit.icon];
                    return <Icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />;
                  })()
                ) : (
                  <img 
                    src="/assets/icons/default-benefit.jpg" 
                    alt={benefit.title} 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              
              <h3 className="font-bold text-xl text-foreground mb-3 font-bengali relative z-10">
                {benefit.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-bengali relative z-10">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
