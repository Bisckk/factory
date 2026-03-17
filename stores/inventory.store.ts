import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InventoryImage = {
    id: string;
    dataUrl: string;
};

export type InventoryItem = {
    id: string;
    sku: string;
    name: string;
    category: string;
    location: string;
    stock_quantity: number;
    min_stock_level: number;
    price: number;
    cost?: number;
    supplier?: string;
    notes?: string;
    images: InventoryImage[];
    createdAt: number;
    updatedAt: number;
};

type CreateInventoryItemInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt' | 'images' | 'sku'> & {
    sku?: string;
    images?: InventoryImage[];
    cost?: number;
    supplier?: string;
    notes?: string;
};

type UpdateInventoryItemInput = Partial<Omit<InventoryItem, 'id' | 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSku(input: string | undefined, name: string, category: string) {
    const explicit = (input ?? '').trim().toUpperCase();
    if (explicit) return explicit;
    const cat = category
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 6) || 'REP';
    const nm = name
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 10) || 'ITEM';
    const stamp = Date.now().toString(36).toUpperCase();
    return `${cat}-${nm}-${stamp}`;
}

const initialItems: InventoryItem[] = [
    {
        id: 'inv_1',
        sku: 'YAM-DT-175-PIST',
        name: 'Pistón Standard (Kit)',
        category: 'Motor',
        stock_quantity: 0,
        min_stock_level: 2,
        price: 185000,
        location: 'Estante A-1',
        images: [],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: 'inv_2',
        sku: 'SP-NGK-BR9ES',
        name: 'Bujía NGK Racing',
        category: 'Eléctrico',
        stock_quantity: 12,
        min_stock_level: 5,
        price: 25000,
        location: 'Cajón B-3',
        images: [],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
        id: 'inv_3',
        sku: 'OIL-IPONE-SAMURAI',
        name: 'Aceite Ipone Samurai Racing 2T',
        category: 'Lubricantes',
        stock_quantity: 4,
        min_stock_level: 5,
        price: 98000,
        location: 'Vitrina Frontal',
        images: [],
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
];

type InventoryState = {
    items: InventoryItem[];
    getItem: (id: string) => InventoryItem | undefined;
    addItem: (input: CreateInventoryItemInput) => string;
    updateItem: (input: UpdateInventoryItemInput) => void;
    deleteItem: (id: string) => void;
    addImages: (id: string, images: InventoryImage[]) => void;
    removeImage: (id: string, imageId: string) => void;
    setCoverImage: (id: string, imageId: string) => void;
};

export const useInventoryStore = create<InventoryState>()(
    persist(
        (set, get) => ({
            items: initialItems,
            getItem: (id) => get().items.find((i) => i.id === id),
            addItem: (input) => {
                const id = createId('inv');
                const now = Date.now();
                const images = input.images ?? [];
                const item: InventoryItem = {
                    id,
                    sku: normalizeSku(input.sku, input.name, input.category),
                    name: input.name.trim(),
                    category: input.category.trim(),
                    location: input.location.trim(),
                    stock_quantity: input.stock_quantity,
                    min_stock_level: input.min_stock_level,
                    price: input.price,
                    cost: input.cost,
                    supplier: input.supplier?.trim() || undefined,
                    notes: input.notes?.trim() || undefined,
                    images,
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ items: [item, ...s.items] }));
                return id;
            },
            updateItem: (input) => {
                const now = Date.now();
                set((s) => ({
                    items: s.items.map((it) => {
                        if (it.id !== input.id) return it;
                        return {
                            ...it,
                            ...input,
                            sku: input.sku ? input.sku.trim() : it.sku,
                            name: input.name ? input.name.trim() : it.name,
                            category: input.category ? input.category.trim() : it.category,
                            location: input.location ? input.location.trim() : it.location,
                            supplier: input.supplier?.trim() || it.supplier,
                            notes: input.notes?.trim() || it.notes,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteItem: (id) => {
                set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
            },
            addImages: (id, images) => {
                const now = Date.now();
                set((s) => ({
                    items: s.items.map((it) => {
                        if (it.id !== id) return it;
                        const merged = [...it.images, ...images].slice(0, 6);
                        return { ...it, images: merged, updatedAt: now };
                    }),
                }));
            },
            removeImage: (id, imageId) => {
                const now = Date.now();
                set((s) => ({
                    items: s.items.map((it) => {
                        if (it.id !== id) return it;
                        return { ...it, images: it.images.filter((img) => img.id !== imageId), updatedAt: now };
                    }),
                }));
            },
            setCoverImage: (id, imageId) => {
                const now = Date.now();
                set((s) => ({
                    items: s.items.map((it) => {
                        if (it.id !== id) return it;
                        const cover = it.images.find((img) => img.id === imageId);
                        if (!cover) return it;
                        const rest = it.images.filter((img) => img.id !== imageId);
                        return { ...it, images: [cover, ...rest], updatedAt: now };
                    }),
                }));
            },
        }),
        {
            name: 'mototaller_inventory_v1',
            version: 1,
        }
    )
);
