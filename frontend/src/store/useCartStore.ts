import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  category?: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      addToCart: (item) => set((state) => {
        const existingIndex = state.items.findIndex((i) => i.id === item.id);
        if (existingIndex > -1) {
          const nextItems = [...state.items];
          nextItems[existingIndex].quantity += item.quantity;
          return { items: nextItems };
        }
        return { items: [...state.items, item] };
      }),
      removeFromCart: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      })),
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map((i) => 
          i.id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i
        ),
      })),
      clearCart: () => set({ items: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      getTotals: () => {
        const { items, coupon } = get();
        const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const discount = coupon ? (subtotal * coupon.discountPercent) / 100 : 0;
        const tax = Math.round((subtotal - discount) * 0.05 * 100) / 100; // 5% GST
        const shipping = subtotal > 500 || subtotal === 0 ? 0 : 40; // Free shipping over 500
        const total = Math.round((subtotal - discount + tax + shipping) * 100) / 100;
        
        return {
          subtotal,
          discount,
          tax,
          shipping,
          total,
        };
      },
    }),
    {
      name: 'medcare-cart-store',
    }
  )
);
