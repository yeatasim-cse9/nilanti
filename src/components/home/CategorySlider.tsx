import { Link } from "react-router-dom";
import { User, Baby, Shirt, Sparkles, Layers, Wind, ShoppingBag, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageSection } from "@/hooks/useCMSData";

const CategorySlider = () => {
  const { data: section } = useHomepageSection("categories_slider");

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-slider'],
    queryFn: async () => {
      const q = query(
        collection(db, "categories"),
        where("is_active", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },
    staleTime: 10 * 60 * 1000,
  });

  const getCategoryIcon = (slug: string, className: string) => {
    switch (slug) {
      case 'hijab-scarf': return <User className={className} />;
      case 'burqa-abaya': return <Store className={className} />;
      case 'childrens-clothing': return <Baby className={className} />;
      case 'salwar-kameez': return <Shirt className={className} />;
      case 'cosmetics-fragrance': return <Sparkles className={className} />;
      case 'turkish-inner': return <Layers className={className} />;
      case 'orna-dupatta': return <Wind className={className} />;
      case 'niqab-accessories': return <ShoppingBag className={className} />;
      default: return <ShoppingBag className={className} />;
    }
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-16">
        <div className="container">
          <div className="flex items-center justify-center mb-8">
            <Skeleton className="h-8 w-40 rounded-xl" />
          </div>
          {/* Mobile: horizontal scroll skeletons */}
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[120px] md:w-full">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-3 w-3/4 mx-auto mt-2.5 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        {/* Section heading */}
        <div className="flex flex-col items-center text-center mb-8 reveal">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            {(section as any)?.title_bn || "ক্যাটাগরি"}
          </h2>
          <div className="section-divider mt-3" />
        </div>

        {/* Mobile: Horizontal scroll | Desktop: Grid */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-5 md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category: any, index: number) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className={`group flex flex-col items-center gap-2.5 flex-shrink-0 w-[110px] md:w-full snap-start reveal-scale stagger-${Math.min(index + 1, 8)}`}
            >
              <div className="w-full aspect-square rounded-2xl bg-gray-50 overflow-hidden border border-gray-100/80 group-hover:border-gray-200 transition-all duration-500 group-hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] group-active:scale-[0.97]">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name_bn}
                    className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 group-hover:text-gray-400 transition-colors duration-300">
                    {getCategoryIcon(category.slug, "w-10 h-10 md:w-12 md:h-12 stroke-[1.5]")}
                  </div>
                )}
              </div>
              <span className="text-[12px] md:text-[13px] font-semibold text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-center leading-tight line-clamp-2">
                {category.name_bn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySlider;
