import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHomepageSection } from "@/hooks/useCMSData";

const MoneyBackGuarantee = () => {
  const { data: section, isLoading } = useHomepageSection("money_back_guarantee");

  if (isLoading || !section) return null;

  const content = (section as any).content || {};
  const title = (section as any).title_bn || "১০০% মানি ব্যাক গ্যারান্টি";

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="relative overflow-hidden bg-white border border-gray-200 p-8 md:p-12" style={{ borderRadius: "8px" }}>

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Icon */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-10 h-10 md:w-14 md:h-14 text-gray-900" />
            </div>

            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 leading-tight tracking-tight font-bengali">
                {title || "পছন্দ না হলে ১০০% টাকা ফেরত!"}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-xl leading-relaxed font-bengali">
                {content.description_bn || "আপনার সন্তুষ্টিই আমাদের সবচেয়ে বড় লক্ষ্য। প্রোডাক্ট হাতে পেয়ে পছন্দ না হলে কোনো প্রশ্ন ছাড়াই আমরা আপনার পুরো টাকা ফেরত দেব।"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to={content.primary_button_link || "/products"}>
                  <Button
                    size="lg"
                    className="bg-gray-900 text-white hover:bg-gray-800 shadow-md font-bengali"
                    style={{ borderRadius: "8px" }}
                  >
                    এখনই কেনাকাটা করুন
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/return-policy">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-gray-300 text-gray-900 hover:bg-gray-100 hover:text-gray-900 font-bengali"
                    style={{ borderRadius: "8px" }}
                  >
                    রিটার্ন পলিসি দেখুন
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyBackGuarantee;
