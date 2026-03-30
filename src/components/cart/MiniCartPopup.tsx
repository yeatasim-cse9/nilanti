import { X, ShoppingCart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface MiniCartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  addedItem: {
    name_bn: string;
    variant_name_bn?: string;
    image_url: string;
    price: number;
    quantity: number;
  } | null;
  cartTotal: number;
  cartItemCount: number;
}

const MiniCartPopup = ({
  isOpen,
  onClose,
  addedItem,
  cartTotal,
  cartItemCount,
}: MiniCartPopupProps) => {
  if (!isOpen || !addedItem) return null;

  const formatPrice = (price: number) => `৳${price.toLocaleString("bn-BD")}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-card rounded-2xl shadow-2xl z-50 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2 text-primary">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">কার্টে যোগ করা হয়েছে!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Added Item */}
        <div className="p-4">
          <div className="flex gap-4">
            <img
              src={addedItem.image_url}
              alt={addedItem.name_bn}
              className="w-20 h-20 rounded-lg object-cover border border-border"
            />
            <div className="flex-1">
              <h4 className="font-medium text-foreground line-clamp-2">
                {addedItem.name_bn}
              </h4>
              {addedItem.variant_name_bn && (
                <p className="text-sm text-muted-foreground">
                  {addedItem.variant_name_bn}
                </p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-primary font-bold">
                  {formatPrice(addedItem.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  পরিমাণ: {addedItem.quantity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="px-4 py-3 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              কার্টে মোট ({cartItemCount}টি পণ্য)
            </span>
            <span className="font-bold text-foreground">
              {formatPrice(cartTotal)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 flex flex-col gap-3">
          <Link to="/cart" onClick={onClose}>
            <Button className="w-full" size="lg">
              <ShoppingCart className="h-4 w-4 mr-2" />
              কার্ট দেখুন
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="w-full"
          >
            কেনাকাটা চালিয়ে যান
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </>
  );
};

export default MiniCartPopup;
