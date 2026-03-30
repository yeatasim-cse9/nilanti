import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHomepageSection, useTestimonials } from "@/hooks/useCMSData";

const CustomerReviews = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: section } = useHomepageSection("customer_reviews");
  const { data: reviews, isLoading } = useTestimonials(true);

  if (isLoading || !reviews) return null;

  const title = (section as any)?.title_bn || "গ্রাহকদের মতামত";
  const subtitle = (section as any)?.subtitle_bn || "আমাদের সম্মানিত গ্রাহকদের অভিজ্ঞতা";

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-10 md:py-14 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 md:h-12 bg-primary rounded-full"></div>
            <div>
              <p className="text-primary font-bold text-xs uppercase tracking-normal bg-primary/10 px-4 py-1.5 rounded-full inline-block mb-3">
                {(section as any)?.subtitle_bn || (section as any)?.content?.subtitle_bn || "গ্রাহক সন্তুষ্টি"}
              </p>
              <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-4 leading-tight font-bengali">
                {(section as any)?.title_bn || "নীলান্তি: হাজারো আপুর আস্থার ঠিকানা"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium font-bengali leading-relaxed">
                {(section as any)?.content?.description_bn || "৫০০০+ সন্তুষ্ট গ্রাহকের ভালোবাসা ও রিভিউ দেখে নিন। আপনার আস্থাই আমাদের এগিয়ে চলার দেশ।"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {(reviews as any[]).map((review) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-80 bg-card rounded-xl p-6 border border-border shadow-card"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary/20 mb-4" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                      }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
                "{review.comment}"
              </p>

              {/* Product */}
              {review.product_name && (
                <p className="text-sm text-primary font-medium mb-4">
                  {review.product_name}
                </p>
              )}

              {/* Customer */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {review.customer_name.charAt(0)}
                  </span>
                </div>
                <span className="font-medium text-foreground">
                  {review.customer_name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
