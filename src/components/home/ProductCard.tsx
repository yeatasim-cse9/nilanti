import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Eye, ImageOff, Heart } from "lucide-react";
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
  const [imgError, setImgError] = useState(false);

  const hasDiscount = sale_price && sale_price < base_price;
  const discountPercentage = hasDiscount
    ? Math.round(((base_price - sale_price) / base_price) * 100)
    : 0;
  const isOutOfStock = stock_quantity <= 0;
  const isLowStock = stock_quantity > 0 && stock_quantity <= 10;
  const showImage = image_url && !imgError;

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isOutOfStock) return;

    addItem({
      productId: id,
      name_bn: name_bn,
      image_url: image_url || "",
      price: sale_price || base_price,
      quantity: 1,
      stock_quantity: stock_quantity,
    });

    trackAddToCart({
      content_name: name_bn,
      content_ids: [id],
      content_type: 'product',
      value: sale_price || base_price,
      currency: 'BDT',
    });

    toast({
      title: "কার্টে যোগ হয়েছে",
      description: name_bn,
    });

    if (showQuickView) setShowQuickView(false);
    navigate("/cart");
  };

  const ImagePlaceholder = ({ className = "" }: { className?: string }) => (
    <div className={`w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-2 ${className}`}>
      <ImageOff className="w-7 h-7 text-gray-200" />
      <span className="text-[10px] text-gray-300 font-medium">ছবি নেই</span>
    </div>
  );

  return (
    <>
      <div className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-1 border border-gray-100/80">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Link to={`/product/${slug}`} className="block w-full h-full">
            {showImage ? (
              <img
                src={image_url}
                alt={name_bn}
                className="w-full h-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.06]"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            ) : (
              <ImagePlaceholder />
            )}
          </Link>

          {/* Hover Actions — desktop only */}
          {showImage && (
            <div className="hidden md:flex absolute inset-x-0 bottom-0 p-3 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out z-10 justify-center bg-gradient-to-t from-black/40 via-black/20 to-transparent pt-10">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickView(true);
                }}
                className="w-full max-w-[160px] gap-1.5 bg-white/95 hover:bg-white text-gray-900 rounded-xl text-[11px] font-semibold h-9 shadow-lg backdrop-blur-sm"
              >
                <Eye className="w-3.5 h-3.5" /> কুইক ভিউ
              </Button>
            </div>
          )}

          {/* Badges — top-left stack */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {hasDiscount && (
              <span className="inline-flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm tracking-wide">
                -{discountPercentage}%
              </span>
            )}
            {is_featured && !hasDiscount && (
              <span className="inline-flex items-center justify-center bg-amber-400 text-gray-900 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                ⭐ সেরা
              </span>
            )}
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[3px] flex items-center justify-center z-10 pointer-events-none">
              <span className="text-gray-700 font-bold text-xs px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                স্টক শেষ
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 md:p-4 flex flex-col flex-grow">
          <div className="flex-grow space-y-1.5">
            {/* Name */}
            <Link to={`/product/${slug}`} className="block">
              <h3 className="font-semibold text-gray-800 text-[13px] md:text-sm leading-snug group-hover:text-gray-950 transition-colors line-clamp-2">
                {name_bn}
              </h3>
            </Link>

            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-semibold text-gray-600">
                  {rating.toFixed(1)}
                </span>
                <span className="text-[11px] text-gray-300">({reviews_count})</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-[15px] md:text-base font-bold text-gray-900 tracking-tight">
                {formatPrice(sale_price || base_price)}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-gray-300 line-through">
                  {formatPrice(base_price)}
                </span>
              )}
            </div>

            {/* Low Stock Alert */}
            {isLowStock && (
              <p className="text-[10px] font-semibold text-orange-500 flex items-center gap-1 pt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
                </span>
                মাত্র {stock_quantity}টি বাকি
              </p>
            )}
          </div>

          {/* Add to Cart — 44px min touch target */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 h-10 md:h-9 text-xs rounded-xl gap-1.5 border-gray-150 bg-gray-50/50 hover:bg-gray-900 hover:text-white hover:border-gray-900 active:scale-[0.98] transition-all duration-300"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {isOutOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
          </Button>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={showQuickView} onOpenChange={setShowQuickView}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden border-none shadow-2xl bg-white rounded-2xl w-[95vw] md:w-full">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square bg-gray-50">
              {showImage ? (
                <img src={image_url} alt={name_bn} className="w-full h-full object-cover" />
              ) : (
                <ImagePlaceholder />
              )}
            </div>
            <div className="p-5 md:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl md:text-2xl font-extrabold leading-tight text-gray-900">
                    {name_bn}
                  </DialogTitle>
                </DialogHeader>

                {rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({reviews_count} রিভিউ)</span>
                  </div>
                )}

                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl md:text-3xl font-bold text-gray-900">
                    {formatPrice(sale_price || base_price)}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-gray-300 line-through">
                      {formatPrice(base_price)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {is_featured && <Badge variant="secondary" className="rounded-lg">বিশেষ পণ্য</Badge>}
                  {isOutOfStock ? (
                    <Badge variant="destructive" className="rounded-lg">স্টক শেষ</Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 rounded-lg">ইন স্টক</Badge>
                  )}
                  {isLowStock && (
                    <Badge variant="outline" className="border-amber-200 text-amber-600 bg-amber-50 rounded-lg">
                      সীমিত স্টক ({stock_quantity} টি)
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 mt-6 pt-5 border-t border-gray-100">
                <Button
                  className="w-full h-12 rounded-xl text-sm font-semibold bg-gray-900 hover:bg-gray-800"
                  onClick={() => handleAddToCart()}
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "স্টক নেই" : "কার্টে যোগ করুন"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-xl text-sm border-gray-200"
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
