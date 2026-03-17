'use client';

/**
 * Motorcycle Clinical History Dashboard (Historia Clínica) — Dark Theme
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, Eye, Pencil, Plus, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MotorcycleDetailDrawer } from '@/components/dashboard/motorcycles/motorcycle-detail-drawer';
import { MotorcycleDrawer } from '@/components/dashboard/motorcycles/motorcycle-drawer';
import { useAuthStore } from '@/stores/auth.store';
import { useClientsStore } from '@/stores/clients.store';
import { useMotorcycleRecordsStore } from '@/stores/motorcycle-records.store';

export default function MotorcyclesPage() {
    const { role } = useAuthStore();
    const clients = useClientsStore((s) => s.clients);
    const records = useMotorcycleRecordsStore((s) => s.records);

    const [search, setSearch] = useState('');
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null);
    const [isMotoDrawerOpen, setIsMotoDrawerOpen] = useState(false);
    const [selectedMotoIdForEdit, setSelectedMotoIdForEdit] = useState<string | null>(null);

    const canCreate = role === 'admin' || role === 'receptionist';

    const motorcycles = useMemo(() => {
        const byMoto = new Map<string, { occurredAt: number }>();
        for (const r of records) {
            const prev = byMoto.get(r.motoId);
            if (!prev || r.occurredAt > prev.occurredAt) byMoto.set(r.motoId, { occurredAt: r.occurredAt });
        }

        return clients.flatMap((client) =>
            client.motorcycles.map((moto) => {
                const last = byMoto.get(moto.id)?.occurredAt;
                const kmNum = moto.km ? Number(String(moto.km).replace(/[^\d]/g, '')) : undefined;
                return {
                    moto,
                    client,
                    mileage: Number.isFinite(kmNum) ? (kmNum as number) : undefined,
                    lastServiceAt: last,
                };
            })
        );
    }, [clients, records]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const base = motorcycles.slice().sort((a, b) => a.moto.plate.localeCompare(b.moto.plate));
        if (!q) return base;
        return base.filter(({ moto, client }) => {
            return (
                moto.plate.toLowerCase().includes(q) ||
                moto.brand.toLowerCase().includes(q) ||
                moto.model.toLowerCase().includes(q) ||
                client.name.toLowerCase().includes(q) ||
                client.phone.includes(q)
            );
        });
    }, [motorcycles, search]);

    const stats = useMemo(() => {
        const total = motorcycles.length;
        const withHistory = new Set(records.map((r) => r.motoId)).size;
        const noHistory = total - withHistory;
        const highMileage = motorcycles.filter((m) => (m.mileage ?? 0) >= 50000).length;
        return { total, withHistory, noHistory, highMileage };
    }, [motorcycles, records]);

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Historia Clínica</h1>
                    </div>
                    <p className="text-sm text-zinc-500">Registro de intervenciones, kilometraje y dueños de todas las motos atendidas.</p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => {
                            setSelectedMotoIdForEdit(null);
                            setIsMotoDrawerOpen(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Registrar Moto
                    </button>
                )}
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.total}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Con Historia</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.withHistory}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sin Historia</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.noHistory}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">50k+ km</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.highMileage}</p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input type="text" placeholder="Buscar por placa, cliente o modelo..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Identificación</th>
                                <th className="px-6 py-4 font-semibold">Propietario</th>
                                <th className="px-6 py-4 font-semibold">Kilometraje</th>
                                <th className="px-6 py-4 font-semibold">Último Servicio</th>
                                <th className="px-6 py-4 font-semibold text-right">Expediente</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filtered.map(({ moto, client, mileage, lastServiceAt }, i) => (
                                <motion.tr key={moto.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                                    className="group hover:bg-zinc-800/30 transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-14 items-center justify-center rounded border border-yellow-500/30 bg-yellow-500/20 font-mono text-xs font-bold text-yellow-500 tracking-widest">
                                                {moto.plate}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-200 leading-none">{moto.brand} {moto.model}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">{moto.year ? `Modelo ${moto.year}` : 'Sin año'}{moto.color ? ` • ${moto.color}` : ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                <User className="h-4 w-4 text-zinc-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-medium text-zinc-300 truncate block">{client.name}</span>
                                                <span className="text-[10px] text-zinc-600">{client.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                                            <Activity className="h-3.5 w-3.5 text-zinc-600" />
                                            {(mileage ?? 0).toLocaleString('es-CO')} km
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                                            {lastServiceAt ? format(new Date(lastServiceAt), "dd MMM yyyy", { locale: es }) : 'Sin registro'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedMotoId(moto.id);
                                                    setIsDetailDrawerOpen(true);
                                                }}
                                                className="text-[10px] uppercase tracking-wider font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <Eye className="h-3 w-3" /> Ver Ficha
                                            </button>
                                            {canCreate && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMotoIdForEdit(moto.id);
                                                        setIsMotoDrawerOpen(true);
                                                    }}
                                                    className="text-[10px] uppercase tracking-wider font-bold text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5"
                                                >
                                                    <Pencil className="h-3 w-3" /> Editar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <MotorcycleDetailDrawer
                isOpen={isDetailDrawerOpen}
                onClose={() => setIsDetailDrawerOpen(false)}
                motoId={selectedMotoId}
            />

            <MotorcycleDrawer
                isOpen={isMotoDrawerOpen}
                onClose={() => setIsMotoDrawerOpen(false)}
                motoId={selectedMotoIdForEdit}
            />
        </div>
    );
}
