import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageSection } from "@/hooks/useCMSData";

const FeaturedProducts = () => {
  const { data: section } = useHomepageSection("featured_products");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: async () => {
      const q = query(
        collection(db, "products"),
        where("is_active", "==", true),
        where("is_featured", "==", true),
        limit(4)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  if (isLoading && products.length === 0) {
    return (
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Skeleton className="h-4 w-48 rounded-lg" />
              <Skeleton className="h-8 w-64 mt-2 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] rounded-2xl" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 md:mb-10 reveal">
          <div className="space-y-1">
            <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.12em]">
              {(section as any)?.subtitle_bn || "আমাদের সেরা কালেকশন"}
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {(section as any)?.title_bn || "বিশেষ আকর্ষণ"}
            </h2>
          </div>
          <Link to="/shop?featured=true">
            <Button
              variant="ghost"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 h-9 rounded-lg transition-colors"
            >
              সব দেখুন
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {products.map((product: any, i: number) => (
            <div key={product.id} className={`reveal stagger-${Math.min(i + 1, 4)}`}>
              <ProductCard
                id={product.id}
                name_bn={product.name_bn}
                slug={product.slug}
                image_url={product.images?.[0] || ''}
                base_price={product.base_price}
                sale_price={product.sale_price}
                stock_quantity={product.stock_quantity}
                onAddToCart={() => handleAddToCart(product.id)}
              />
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-6 text-center sm:hidden reveal">
          <Link to="/shop?featured=true">
            <Button variant="outline" className="w-full h-11 rounded-xl text-sm border-gray-200">
              সব দেখুন
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
