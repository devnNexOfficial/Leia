import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Product, Shade } from "@/data/catalog";

export type CartItem = {
  id: string; // unique cart line item id e.g. `${product.id}-${shadeName}`
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  shade?: Shade;
  quantity: number;
};

export type OrderDetails = {
  orderId: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: "Cash on Delivery" | "JazzCash" | "Easypaisa";
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  date: string;
  estimatedDelivery: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  pulse: number;
  isDrawerOpen: boolean;
  lastOrder: OrderDetails | null;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  addItem: (product: Product, shade?: Shade, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (customerInfo: {
    customerName: string;
    phone: string;
    address: string;
    city: string;
    paymentMethod: "Cash on Delivery" | "JazzCash" | "Easypaisa";
    discountAmount?: number;
    orderId?: string;
    shippingFee?: number;
  }) => OrderDetails;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem("leia_cart") || localStorage.getItem("maisonrouge_cart");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return [];
  });

  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(() => {
    if (typeof window !== "undefined") {
      const saved =
        localStorage.getItem("leia_last_order") ||
        localStorage.getItem("maisonrouge_last_order");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return null;
  });

  const [pulse, setPulse] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const saveCartToStorage = (newItems: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("leia_cart", JSON.stringify(newItems));
    }
  };

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((v) => !v), []);

  const triggerPulse = useCallback(() => {
    setPulse((p) => p + 1);
  }, []);

  const addItem = useCallback(
    (product: Product, shade?: Shade, quantity = 1) => {
      triggerPulse();
      setIsDrawerOpen(true); // Auto-open slide-in drawer on Add To Cart
      const targetShade = shade || product.shades[0];
      if (product.stockCount === 0 || (targetShade && targetShade.stockCount === 0)) return;
      const itemKey = `${product.id}-${targetShade?.id || targetShade?.name || "default"}`;

      setItems((prev) => {
        let updated: CartItem[];
        const existingIndex = prev.findIndex((i) => i.id === itemKey);
        if (existingIndex > -1) {
          updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
        } else {
          updated = [
            ...prev,
            {
              id: itemKey,
              productId: product.id,
              name: product.name,
              category: product.category,
              price: targetShade?.priceOverride ?? product.price,
              image: product.image,
              shade: targetShade,
              quantity,
            },
          ];
        }
        saveCartToStorage(updated);
        return updated;
      });
    },
    [triggerPulse]
  );

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prev.filter((i) => i.id !== itemId);
      } else {
        updated = prev.map((i) => (i.id === itemId ? { ...i, quantity } : i));
      }
      saveCartToStorage(updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      saveCartToStorage(updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCartToStorage([]);
  }, []);

  const count = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [items]
  );

  const placeOrder = useCallback(
    (customerInfo: {
      customerName: string;
      phone: string;
      address: string;
      city: string;
      paymentMethod: "Cash on Delivery" | "JazzCash" | "Easypaisa";
      discountAmount?: number;
      orderId?: string;
      shippingFee?: number;
    }): OrderDetails => {
      const freeShippingThreshold = 5000;
      const shippingFee = customerInfo.shippingFee ?? (subtotal >= freeShippingThreshold ? 0 : 250);
      const discount = customerInfo.discountAmount || 0;
      const total = subtotal - discount + shippingFee;

      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const orderId = customerInfo.orderId ?? `MR-2026-${randomDigits}`;

      const order: OrderDetails = {
        orderId,
        customerName: customerInfo.customerName,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        paymentMethod: customerInfo.paymentMethod,
        items: [...items],
        subtotal,
        shippingFee,
        discountAmount: discount,
        total,
        date: new Date().toLocaleDateString("en-PK", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        estimatedDelivery: "2 to 3 Business Days (Express Nationwide)",
      };

      setLastOrder(order);
      if (typeof window !== "undefined") {
        localStorage.setItem("leia_last_order", JSON.stringify(order));
      }

      setItems([]);
      saveCartToStorage([]);
      setIsDrawerOpen(false);

      return order;
    },
    [items, subtotal]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      pulse,
      isDrawerOpen,
      lastOrder,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      placeOrder,
    }),
    [
      items,
      count,
      subtotal,
      pulse,
      isDrawerOpen,
      lastOrder,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      placeOrder,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
