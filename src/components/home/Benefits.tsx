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
    <section className="py-12 md:py-20 bg-gray-50/60">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-10 md:mb-14 reveal">
          <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">
            {(section as any).subtitle_bn || "আমাদের সার্ভিস"}
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight max-w-xl">
            {(section as any).title_bn || "আপনার কেনাকাটা হোক সহজ ও আনন্দদায়ক"}
          </h2>
          <p className="text-gray-400 mt-3 max-w-md text-sm md:text-base">
            {(section as any).description_bn || "সেরা পণ্যের পাশাপাশি আমরা নিশ্চিত করি সেরা গ্রাহক সেবা।"}
          </p>
          <div className="section-divider mt-5" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {(benefits.length > 0 ? benefits : [
            { icon: "Truck", title: "ফ্রি ডেলিভারি", description: "১০০০ টাকার বেশি অর্ডারে" },
            { icon: "Shield", title: "নিরাপদ পেমেন্ট", description: "১০০% সুরক্ষিত লেনদেন" },
            { icon: "Leaf", title: "অর্গানিক পণ্য", description: "১০০% খাঁটি ও স্বাস্থ্যকর" },
            { icon: "HeartHandshake", title: "গ্রাহক সেবা", description: "২৪/৭ সাপোর্ট" },
            { icon: "Clock", title: "দ্রুত রিটার্ন", description: "৭ দিনের মধ্যে রিটার্ন" },
            { icon: "Award", title: "সেরা মান", description: "গুণগত মানের নিশ্চয়তা" }
          ]).map((benefit: any, index: number) => (
            <div
              key={index}
              className={`reveal stagger-${Math.min(index + 1, 6)} group bg-white rounded-2xl p-5 md:p-7 border border-gray-100/80 transition-all duration-500 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] hover:-translate-y-1 text-center relative overflow-hidden`}
            >
              {/* Subtle gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-xl bg-gray-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 relative z-10 overflow-hidden">
                {benefit.icon && (benefit.icon.startsWith("http") || benefit.icon.startsWith("/")) ? (
                  <img
                    src={benefit.icon}
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = "/assets/icons/default-benefit.jpg";
                    }}
                  />
                ) : iconMap[benefit.icon] ? (
                  (() => {
                    const Icon = iconMap[benefit.icon];
                    return <Icon className="h-6 w-6 md:h-7 md:w-7 text-gray-600 group-hover:text-gray-900 transition-colors" />;
                  })()
                ) : (
                  <img
                    src="/assets/icons/default-benefit.jpg"
                    alt={benefit.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <h3 className="font-bold text-[15px] md:text-base text-gray-900 mb-1.5 relative z-10">
                {benefit.title}
              </h3>
              <p className="text-[12px] md:text-[13px] text-gray-400 leading-relaxed relative z-10">
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
