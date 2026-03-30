import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useHomepageSection } from "@/hooks/useCMSData";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: sectionData } = useHomepageSection("newsletter");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("নিউজলেটার সাবস্ক্রাইব করার জন্য ধন্যবাদ!");
      setEmail("");
    } catch (error) {
      toast.error("কিছু সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="container px-4 md:px-6">
        <div
          className="max-w-4xl mx-auto py-14 md:py-20 px-6 md:px-16"
        >
          <div className="flex flex-col items-center text-center space-y-5">
            {/* Title - matching other section titles */}
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-bengali uppercase">
              {(sectionData as any)?.title_bn || "অফারের খবর পেতে চান?"}
            </h2>

            {/* Description - matching other section subtitles */}
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-medium font-bengali">
              {(sectionData as any)?.subtitle_bn ||
                "আমাদের নতুন কালেকশন ও স্পেশাল ডিসকাউন্ট অফারগুলো সবার আগে জানতে সাবস্ক্রাইব করুন।"}
            </p>

            {/* Email form */}
            <form
              onSubmit={handleSubmit}
              className="mt-6 w-full max-w-lg flex items-center"
            >
              <input
                type="email"
                placeholder="আপনার ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 md:h-14 px-6 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all font-bengali"
                style={{ borderRadius: "8px 0 0 8px" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="h-12 md:h-14 px-8 md:px-10 bg-gray-900 text-white font-bold text-sm md:text-base hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 whitespace-nowrap font-bengali"
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "সাবমিট"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
