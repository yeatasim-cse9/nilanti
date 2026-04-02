import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query as firestoreQuery, where, getDocs, orderBy, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useHomepageSection } from "@/hooks/useCMSData";

const AllProducts = () => {
  const { data: section } = useHomepageSection("all_products");

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['all-products-home'],
    queryFn: async () => {
      const q = firestoreQuery(
        collection(db, "products"),
        where("is_active", "==", true),
        orderBy("created_at", "desc"),
        limit(8)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  if (isLoading) {
    return (
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="text-center mb-10">
            <Skeleton className="h-4 w-32 mx-auto rounded-lg" />
            <Skeleton className="h-8 w-56 mx-auto mt-2 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {[...Array(8)].map((_, i) => (
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

  if (allProducts.length === 0) return null;

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-10 reveal">
          <p className="text-[11px] md:text-xs font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">
            {(section as any)?.subtitle_bn || "সব কালেকশন"}
          </p>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {(section as any)?.title_bn || "সকল পণ্য (All Products)"}
          </h2>
          <p className="text-gray-400 mt-3 max-w-md text-sm md:text-base">
            {(section as any)?.content?.description_bn || "আপনার পছন্দের হিজাব ও ক্যাজুয়াল আউটফিটগুলো খুঁজে নিন।"}
          </p>
          <div className="section-divider mt-5" />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {allProducts.map((product: any, i: number) => (
            <div key={product.id} className={`reveal stagger-${Math.min(i + 1, 8)}`}>
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

        {/* View More CTA */}
        <div className="mt-10 text-center reveal">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="h-12 px-8 rounded-xl border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 text-sm font-semibold gap-2 transition-all duration-300"
          >
            <Link to="/shop">
              আরো দেখুন
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
