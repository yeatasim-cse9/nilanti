import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query as firestoreQuery, where, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useHomepageSection } from "@/hooks/useCMSData";

const AllProducts = () => {
  const queryClient = useQueryClient();
  const { data: section } = useHomepageSection("all_products");
  const queryKey = ['all-products-home'];

  useEffect(() => {
    const q = firestoreQuery(
      collection(db, "products"),
      where("is_active", "==", true),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      queryClient.setQueryData(queryKey, data);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const q = firestoreQuery(
        collection(db, "products"),
        where("is_active", "==", true),
        orderBy("created_at", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
    staleTime: Infinity,
  });

  const visibleProducts = allProducts.slice(0, 8);

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  if (isLoading) {
    return (
      <section className="py-10 md:py-14">
        <div className="container">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-32 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
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

  if (allProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-primary font-bold text-xs uppercase tracking-normal bg-primary/10 px-4 py-1.5 rounded-full">
              {(section as any)?.subtitle_bn || "সব কালেকশন"}
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight">
            {(section as any)?.title_bn || "বাজেটের মধ্যে সেরা পণ্য"}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl text-lg font-bengali">
            {(section as any)?.content?.description_bn || "আপনার পছন্দের হিজাব ও ক্যাজুয়াল আউটফিটগুলো খুঁজে নিন এক পলকেই।"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {visibleProducts.map((product) => (
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

        <div className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="px-8"
          >
            <Link to="/shop">আরো দেখুন</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
