import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useHomepageSection } from "@/hooks/useCMSData";

const FeaturedProducts = () => {
  const queryClient = useQueryClient();
  const { data: section } = useHomepageSection("featured_products");

  const queryKey = ['featured-products'];

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("is_active", "==", true),
      where("is_featured", "==", true),
      limit(4)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      queryClient.setQueryData(queryKey, data);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: products = [], isLoading } = useQuery({
    queryKey,
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
    staleTime: Infinity,
  });

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  if (isLoading && products.length === 0) {
    return (
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 md:h-12 bg-primary rounded-full"></div>
            <div>
              <p className="text-primary font-bold text-sm md:text-base tracking-normal uppercase mb-1">
                {(section as any)?.subtitle_bn || "আমাদের সেরা মানের অর্গানিক পণ্যসমূহ দেখুন"}
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
                {(section as any)?.title_bn || "বিশেষ আকর্ষণ"}
              </h2>
            </div>
          </div>
          <Link to="/shop?featured=true">
            <Button variant="outline" className="hidden sm:flex items-center gap-2">
              সব দেখুন
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name_bn={product.name_bn}
              slug={product.slug}
              image_url={product.images?.[0] || ''}
              base_price={product.base_price}
              sale_price={product.sale_price}
              stock_quantity={product.stock_quantity}
              onAddToCart={() => handleAddToCart(product.id)}
            />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop?featured=true">
            <Button variant="outline" className="w-full">
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
