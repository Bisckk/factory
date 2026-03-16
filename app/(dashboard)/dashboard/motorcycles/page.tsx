'use client';

/**
 * Motorcycle Clinical History Dashboard (Historia Clínica) — Dark Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Search, Plus, Calendar, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MotorcycleDetailDrawer } from '@/components/dashboard/motorcycles/motorcycle-detail-drawer';

export default function MotorcyclesPage() {
    const [search, setSearch] = useState('');
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null);

    const MOCK_MOTOS = [
        { id: "m_1", plate: "ABC-123", brand: "Yamaha", model: "DT 175", client: "Carlos Martínez", last_service: "2024-11-15T10:00:00Z", mileage: 45000 },
        { id: "m_2", plate: "XYZ-987", brand: "Bajaj", model: "Pulsar NS200", client: "Andrea López", last_service: "2025-01-20T14:30:00Z", mileage: 23100 },
        { id: "m_3", plate: "QWE-456", brand: "Suzuki", model: "AX 100", client: "Diego Ramírez", last_service: "2025-03-01T09:15:00Z", mileage: 58000 }
    ];

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
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all">
                    <Plus className="h-4 w-4" /> Registrar Moto
                </button>
            </header>

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
                            {MOCK_MOTOS.map((moto, i) => (
                                <motion.tr key={moto.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-zinc-800/30 transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-14 items-center justify-center rounded border border-yellow-500/30 bg-yellow-500/20 font-mono text-xs font-bold text-yellow-500 tracking-widest">
                                                {moto.plate}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-200 leading-none">{moto.brand} {moto.model}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><span className="font-medium text-zinc-400">{moto.client}</span></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                                            <Activity className="h-3.5 w-3.5 text-zinc-600" />
                                            {moto.mileage.toLocaleString('es-CO')} km
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                                            {format(new Date(moto.last_service), "dd MMM yyyy", { locale: es })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedMotoId(moto.id);
                                                setIsDetailDrawerOpen(true);
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <Eye className="h-3 w-3" /> Ver Ficha
                                        </button>
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
        </div>
    );
}
