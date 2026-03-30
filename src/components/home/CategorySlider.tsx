import { useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Baby, Shirt, Sparkles, Layers, Wind, ShoppingBag, Store } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageSection } from "@/hooks/useCMSData";

const CategorySlider = () => {
  const queryClient = useQueryClient();
  const { data: section } = useHomepageSection("categories_slider");

  const queryKey = ['categories-slider'];

  useEffect(() => {
    const q = query(
      collection(db, "categories"),
      where("is_active", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      const sorted = docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      queryClient.setQueryData(queryKey, sorted);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: categories = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const q = query(
        collection(db, "categories"),
        where("is_active", "==", true)
      );

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return docs.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    },
    staleTime: Infinity,
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
      <section className="py-10 md:py-16 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-10 w-48" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 rounded-md" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container">
        <div className="flex flex-col items-center justify-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2 text-center">
            {(section as any)?.title_bn || "ক্যাটাগরি"}
          </h2>
          <div className="h-1 w-16 bg-accent rounded-full mx-auto"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-6 py-4 px-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="group flex flex-col items-center justify-start gap-3 w-full"
            >
              <div className="w-full aspect-square rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 group-hover:border-accent shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden p-0 relative">
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name_bn} 
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="text-primary group-hover:text-accent transition-colors duration-300 group-hover:scale-110">
                    {getCategoryIcon(category.slug, "w-12 h-12 md:w-16 md:h-16 stroke-[1.5]")}
                  </div>
                )}
              </div>
              <span className="text-sm md:text-base font-semibold text-primary/80 group-hover:text-primary transition-colors duration-300 text-center leading-tight">
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
