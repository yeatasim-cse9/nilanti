import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name_bn: string;
  variant_name_bn?: string;
  image_url?: string;
  price: number;
  quantity: number;
  stock_quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getQuantityDiscount: () => { percentage: number; amount: number };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "organic-store-cart";

// Quantity discount tiers
const QUANTITY_DISCOUNTS = [
  { minQuantity: 5, discountPercentage: 10 },
  { minQuantity: 3, discountPercentage: 5 },
];

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "id">) => {
    setItems((prev) => {
      // Check if item with same productId and variantId exists
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.variantId === newItem.variantId
      );

      if (existingIndex >= 0) {
        // Update quantity
        const updated = [...prev];
        const newQuantity = Math.min(
          updated[existingIndex].quantity + newItem.quantity,
          newItem.stock_quantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
        };
        return updated;
      }

      // Add new item
      const id = `${newItem.productId}-${newItem.variantId || "default"}-${Date.now()}`;
      return [...prev, { ...newItem, id }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.stock_quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getQuantityDiscount = () => {
    const totalItems = getItemCount();
    const subtotal = getSubtotal();

    for (const tier of QUANTITY_DISCOUNTS) {
      if (totalItems >= tier.minQuantity) {
        return {
          percentage: tier.discountPercentage,
          amount: Math.round((subtotal * tier.discountPercentage) / 100),
        };
      }
    }

    return { percentage: 0, amount: 0 };
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemCount,
        getSubtotal,
        getQuantityDiscount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
