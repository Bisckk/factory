/**
 * Order cart store — tracks parts being added to an open service order.
 *
 * Used in the order creation/edit flow when the mechanic
 * selects inventory items to associate with the repair.
 */
import { create } from 'zustand';

interface CartItem {
    itemId: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    availableStock: number;
}

interface OrderCartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clear: () => void;
    total: () => number;
}

export const useOrderCartStore = create<OrderCartState>((set, get) => ({
    items: [],
    addItem: (item) =>
        set((state) => {
            const existing = state.items.find((i) => i.itemId === item.itemId);
            if (existing) {
                return {
                    items: state.items.map((i) =>
                        i.itemId === item.itemId
                            ? { ...i, quantity: Math.min(i.quantity + 1, i.availableStock) }
                            : i
                    ),
                };
            }
            return { items: [...state.items, { ...item, quantity: 1 }] };
        }),
    removeItem: (itemId) =>
        set((state) => ({
            items: state.items.filter((i) => i.itemId !== itemId),
        })),
    updateQuantity: (itemId, quantity) =>
        set((state) => ({
            items: state.items.map((i) =>
                i.itemId === itemId
                    ? { ...i, quantity: Math.max(0, Math.min(quantity, i.availableStock)) }
                    : i
            ),
        })),
    clear: () => set({ items: [] }),
    total: () =>
        get().items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
}));
