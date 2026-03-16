'use client';

/**
 * Inventory Page — Dark Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Plus, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { formatCOP } from '@/lib/utils/format-currency';

export default function InventoryPage() {
    const { role } = useAuthStore();
    const [search, setSearch] = useState('');

    const isMechanic = role === 'mechanic';
    const canEdit = role === 'admin' || role === 'receptionist';

    const MOCK_INVENTORY = [
        { sku: "YAM-DT-175-PIST", name: "Pistón Standard (Kit)", category: "Motor", stock_quantity: 0, min_stock_level: 2, price: 185000, location: "Estante A-1" },
        { sku: "SP-NGK-BR9ES", name: "Bujía NGK Racing", category: "Eléctrico", stock_quantity: 12, min_stock_level: 5, price: 25000, location: "Cajón B-3" },
        { sku: "OIL-IPONE-SAMURAI", name: "Aceite Ipone Samurai Racing 2T", category: "Lubricantes", stock_quantity: 4, min_stock_level: 5, price: 98000, location: "Vitrina Frontal" },
    ];

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
                    <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all">
                        <Plus className="h-4 w-4" /> Nuevo Artículo
                    </button>
                )}
            </header>

            {!isMechanic && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-blue-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total SKUs</p>
                            <p className="font-mono text-xl font-bold text-blue-400">1,245</p>
                        </div>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-red-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-1">Stock Crítico</p>
                            <p className="font-mono text-xl font-bold text-red-400">2</p>
                        </div>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-[#141417] p-5 flex items-center justify-between border-l-4 border-l-emerald-500/50">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-1">Valor Inventario</p>
                            <p className="font-mono text-xl font-bold text-emerald-400">{formatCOP(48500000)}</p>
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

                <div className="overflow-x-auto">
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
                            {MOCK_INVENTORY.map((item, i) => {
                                const isCritical = item.stock_quantity === 0;
                                const isWarning = !isCritical && item.stock_quantity <= item.min_stock_level;
                                return (
                                    <motion.tr key={item.sku} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                        className="group hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-zinc-200">{item.name}</div>
                                            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-600 mt-1">{item.sku} · {item.category}</div>
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
                                                {isCritical ? (
                                                    <button className="text-[10px] uppercase tracking-wider font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-md transition-colors">Comprar</button>
                                                ) : (
                                                    <button className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors">Editar</button>
                                                )}
                                            </td>
                                        )}
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
