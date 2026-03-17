'use client';

/**
 * Inventory Page — Dark Theme
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { formatCOP } from '@/lib/utils/format-currency';
import { useInventoryStore } from '@/stores/inventory.store';
import { InventoryItemDrawer } from '@/components/dashboard/inventory/inventory-item-drawer';

export default function InventoryPage() {
    const { role } = useAuthStore();
    const [search, setSearch] = useState('');
    const items = useInventoryStore((s) => s.items);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const isMechanic = role === 'mechanic';
    const canEdit = role === 'admin' || role === 'receptionist';

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) => {
            return (
                it.name.toLowerCase().includes(q) ||
                it.sku.toLowerCase().includes(q) ||
                it.category.toLowerCase().includes(q)
            );
        });
    }, [items, search]);

    const stats = useMemo(() => {
        const totalSkus = items.length;
        const critical = items.filter((i) => i.stock_quantity === 0).length;
        const warning = items.filter((i) => i.stock_quantity > 0 && i.stock_quantity <= i.min_stock_level).length;
        const inventoryValue = items.reduce((sum, i) => sum + i.price * i.stock_quantity, 0);
        return { totalSkus, critical, warning, inventoryValue };
    }, [items]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Package className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                            {isMechanic ? 'Consulta de Repuestos' : 'Inventario de Repuestos'}
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        {isMechanic ? 'Consulta disponibilidad, precios y ubicación de repuestos.' : 'Control de stock, ubicaciones, y alertas de reabastecimiento.'}
                    </p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => {
                            setSelectedItemId(null);
                            setIsDrawerOpen(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Artículo
                    </button>
                )}
            </header>

            {!isMechanic && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-blue-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total SKUs</p>
                            <p className="font-mono text-xl font-bold text-blue-400">{stats.totalSkus}</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-red-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">Stock Crítico</p>
                            <p className="font-mono text-xl font-bold text-red-400">{stats.critical}</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-emerald-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Valor Inventario</p>
                            <p className="font-mono text-xl font-bold text-emerald-400">{formatCOP(stats.inventoryValue)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input type="text" placeholder="Buscar repuesto por nombre, SKU o categoría..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="p-4 space-y-3 md:hidden">
                    {filteredItems.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
                            <Package className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm font-medium text-zinc-500">No se encontraron repuestos</p>
                        </div>
                    ) : (
                        filteredItems.map((item) => {
                            const isCritical = item.stock_quantity === 0;
                            const isWarning = !isCritical && item.stock_quantity <= item.min_stock_level;
                            const cover = item.images?.[0]?.dataUrl;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setSelectedItemId(item.id);
                                        setIsDrawerOpen(true);
                                    }}
                                    className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex items-center justify-center shrink-0">
                                            {cover ? (
                                                <img src={cover} alt="Foto del repuesto" className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-5 w-5 text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-extrabold text-zinc-200 truncate">{item.name}</p>
                                                    <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 mt-1 truncate">{item.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-extrabold text-zinc-100">{formatCOP(item.price)}</p>
                                                    <p className="text-[10px] text-zinc-600 mt-1">{item.location}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn("font-mono text-sm font-bold", isCritical ? "text-red-400" : (isWarning ? "text-amber-400" : "text-emerald-400"))}>
                                                        {item.stock_quantity}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600">/ Min: {item.min_stock_level}</span>
                                                    {isCritical && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">AGOTADO</span>}
                                                </div>
                                                {canEdit && (
                                                    <span className={cn(
                                                        "text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border",
                                                        isCritical
                                                            ? "text-red-300 bg-red-500/10 border-red-500/20"
                                                            : "text-zinc-300 bg-zinc-800 border-zinc-700"
                                                    )}>
                                                        {isCritical ? 'Reabastecer' : 'Editar'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Repuesto</th>
                                <th className="px-6 py-4 font-semibold">Stock Actual</th>
                                <th className="px-6 py-4 font-semibold">Precio Base</th>
                                <th className="px-6 py-4 font-semibold">Ubicación</th>
                                {!isMechanic && <th className="px-6 py-4 font-semibold text-right">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredItems.map((item, i) => {
                                const isCritical = item.stock_quantity === 0;
                                const isWarning = !isCritical && item.stock_quantity <= item.min_stock_level;
                                const cover = item.images?.[0]?.dataUrl;
                                return (
                                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-11 w-11 rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex items-center justify-center shrink-0">
                                                    {cover ? (
                                                        <img src={cover} alt="Foto del repuesto" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-zinc-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-zinc-200 truncate">{item.name}</div>
                                                    <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 mt-1 truncate">{item.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={cn("font-mono text-sm font-bold", isCritical ? "text-red-400" : (isWarning ? "text-amber-400" : "text-emerald-400"))}>{item.stock_quantity}</span>
                                                <span className="text-[10px] text-zinc-600">/ Min: {item.min_stock_level}</span>
                                                {isCritical && <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">AGOTADO</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-zinc-400">{formatCOP(item.price)}</td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-600" />{item.location}
                                            </div>
                                        </td>
                                        {!isMechanic && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedItemId(item.id);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-md transition-colors",
                                                        isCritical
                                                            ? "text-red-300 bg-red-500/10 hover:bg-red-500/20"
                                                            : "text-zinc-300 bg-zinc-800 hover:bg-zinc-700"
                                                    )}
                                                >
                                                    {isCritical ? 'Reabastecer' : 'Editar'}
                                                </button>
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <InventoryItemDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                itemId={selectedItemId}
            />
        </div>
    );
}
