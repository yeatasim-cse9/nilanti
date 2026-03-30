import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { trackAddToCart } from "@/lib/tracking";

interface ProductCardProps {
  id: string;
  name_bn: string;
  slug: string;
  image_url?: string;
  base_price: number;
  sale_price?: number | null;
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  stock_quantity?: number;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id,
  name_bn,
  slug,
  image_url,
  base_price,
  sale_price,
  rating = 0,
  reviews_count = 0,
  is_featured = false,
  stock_quantity = 0,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [showQuickView, setShowQuickView] = useState(false);

  const hasDiscount = sale_price && sale_price < base_price;
  const discountPercentage = hasDiscount
    ? Math.round(((base_price - sale_price) / base_price) * 100)
    : 0;
  const isOutOfStock = stock_quantity <= 0;
  const isLowStock = stock_quantity > 0 && stock_quantity <= 10;

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString("bn-BD")}`;
  };

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isOutOfStock) return;

    addItem({
      productId: id,
      name_bn: name_bn,
      image_url: image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop",
      price: sale_price || base_price,
      quantity: 1,
      stock_quantity: stock_quantity,
    });

    // Track AddToCart event
    trackAddToCart({
      content_name: name_bn,
      content_ids: [id],
      content_type: 'product',
      value: sale_price || base_price,
      currency: 'BDT',
    });

    toast({
      title: "কার্টে যোগ হয়েছে",
      description: name_bn,
    });

    if (showQuickView) {
      setShowQuickView(false);
    }
    navigate("/cart");
  };

  return (
    <>
      <div className="group flex flex-col h-full bg-transparent transition-all duration-500 relative">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/20 group/image">
          <Link to={`/product/${slug}`} className="block w-full h-full">
            <img
              src={image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop"}
              alt={name_bn}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
          </Link>

          {/* Quick View Button Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 z-10 flex justify-center bg-gradient-to-t from-black/60 via-black/30 to-transparent">
            <Button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="w-full max-w-[200px] gap-2 bg-white hover:bg-blue-600 hover:text-white text-gray-900 transition-all duration-300 rounded-none text-[11px] font-bold h-10 tracking-normal font-bengali"
            >
              <Eye className="w-4 h-4" /> কুইক ভিউ
            </Button>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
            {hasDiscount && (
              <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-1 uppercase tracking-normal shadow-sm font-bengali">
                {discountPercentage.toLocaleString('bn-BD')}% ছাড়
              </span>
            )}
            {is_featured && !hasDiscount && (
              <span className="bg-black text-white text-[11px] font-black px-2.5 py-1 uppercase tracking-normal shadow-sm font-bengali">
                সেরা পণ্য
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center z-10 pointer-events-none">
              <span className="text-black font-black text-xs px-4 py-2 bg-white tracking-normal uppercase shadow-sm font-bengali">স্টক শেষ</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pt-4 pb-2 flex flex-col flex-grow bg-transparent relative">
          <div className="flex-grow">
            <div className="flex justify-between items-start gap-3 mb-1.5">
              <div className="text-blue-600 font-black uppercase text-[11px] md:text-xs tracking-normal mt-0.5 line-clamp-1 truncate pe-4">
                {name_bn.split(' ')[0]}
              </div>

              <div className="flex flex-col items-end leading-none text-right flex-shrink-0 gap-1.5">
                {hasDiscount && (
                  <span className="text-[11px] font-bold text-muted-foreground line-through decoration-muted-foreground/40">
                    {formatPrice(base_price)}
                  </span>
                )}
                <span className="text-[16px] md:text-[18px] font-black text-black tracking-tight">
                  {formatPrice(sale_price || base_price)}
                </span>
              </div>
            </div>

            {/* Name */}
            <Link to={`/product/${slug}`} className="block mt-1">
              <h3 className="font-bold text-gray-900 text-[14px] md:text-[16px] leading-snug group-hover:text-blue-600 transition-colors duration-300 pr-12">
                {name_bn}
              </h3>
            </Link>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 mt-2.5 opacity-80">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-gray-900 font-bengali">
                  {rating.toLocaleString('bn-BD', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
                <span className="text-xs text-muted-foreground font-bengali">({reviews_count.toLocaleString('bn-BD')})</span>
              </div>
            )}

            {/* Stock Alert */}
            {isLowStock && (
              <p className="text-[10px] md:text-xs font-bold text-destructive mt-3 inline-flex items-center gap-1.5 uppercase tracking-normal">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                </span>
                মাত্র {stock_quantity.toLocaleString('bn-BD')}টি বাকি!
              </p>
            )}
          </div>

          {/* Add to Cart button on hover */}
          <div className="absolute bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
             <Button
                variant="ghost"
                size="icon"
                className="rounded-none bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white h-9 w-9"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
             >
                <ShoppingCart className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl bg-card rounded-2xl w-[95vw] md:w-full">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square bg-muted/30">
              <img
                src={image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop"}
                alt={name_bn}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight text-foreground">
                    {name_bn}
                  </DialogTitle>
                </DialogHeader>

                {rating > 0 && (
                  <div className="flex items-center gap-1.5 opacity-90">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold font-bengali">
                      {rating.toLocaleString('bn-BD', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                    </span>
                    <span className="text-sm text-muted-foreground font-bengali">({reviews_count.toLocaleString('bn-BD')} রিভিউ)</span>
                  </div>
                )}

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(sale_price || base_price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(base_price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {is_featured && <Badge variant="secondary">বিশেষ পণ্য</Badge>}
                  {isOutOfStock ? (
                    <Badge variant="destructive">স্টক শেষ</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500/30 text-green-600 bg-green-500/10">ইন স্টক</Badge>
                  )}
                  {isLowStock && (
                    <Badge variant="destructive" className="bg-blue-500/10 text-blue-600 border-none hover:bg-blue-500/20 font-bengali">
                      সীমিত স্টক ({stock_quantity.toLocaleString('bn-BD')} টি)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-8 pt-6 border-t border-border">
                <Button
                  className="w-full text-base h-12 shadow-sm"
                  size="lg"
                  onClick={() => handleAddToCart()}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-base h-12"
                  size="lg"
                  onClick={() => {
                    setShowQuickView(false);
                    navigate(`/product/${slug}`);
                  }}
                >
                  বিস্তারিত দেখুন
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
