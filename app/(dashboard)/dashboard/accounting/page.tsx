'use client';

/**
 * Accounting Dashboard — Dark Theme
 */

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { formatCOP, formatCOPCompact } from '@/lib/utils/format-currency';

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string; }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-zinc-900 border border-zinc-800 text-white rounded-lg shadow-xl p-4 text-xs">
                <p className="font-bold mb-2 uppercase tracking-widest opacity-80">{label}</p>
                <div className="space-y-1">
                    <p className="text-emerald-400 font-bold">Ingresos: {formatCOP(payload[0].value)}</p>
                    <p className="text-red-400 font-bold">Egresos: {formatCOP(payload[1].value)}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function AccountingPage() {

    const MOCK_CHART_DATA = [
        { name: 'Lun', ingresos: 1200000, egresos: 400000 },
        { name: 'Mar', ingresos: 1800000, egresos: 600000 },
        { name: 'Mié', ingresos: 950000, egresos: 200000 },
        { name: 'Jue', ingresos: 2100000, egresos: 1100000 },
        { name: 'Vie', ingresos: 3200000, egresos: 800000 },
        { name: 'Sáb', ingresos: 4500000, egresos: 500000 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Contabilidad</h1>
                    </div>
                    <p className="text-sm text-zinc-500">Resumen financiero de ingresos, costos operativos y nómina (Semana actual).</p>
                </div>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-all">
                    <Download className="h-4 w-4" /> Exportar Reporte (CSV)
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between border-l-4 border-l-emerald-500/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Ingresos Brutos</p>
                            <p className="font-mono text-3xl font-bold text-zinc-100">{formatCOPCompact(13750000)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-xs font-medium text-emerald-500">+12% vs. semana pasada</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between border-l-4 border-l-red-500/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Costos y Egresos</p>
                            <p className="font-mono text-3xl font-bold text-red-400">{formatCOPCompact(3600000)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-xs font-medium text-red-500">Gastos Operativos</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                    <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-red-600/10 blur-3xl" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Utilidad Neta</p>
                            <p className="font-mono text-3xl font-bold text-white">{formatCOPCompact(10150000)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20 text-white">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-medium text-zinc-500">
                        Margen Operativo: <span className="text-zinc-100 font-bold">73.8%</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-xl border border-zinc-800 bg-[#141417] col-span-1 lg:col-span-2 p-6 flex flex-col">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">Flujo de Caja (Cierre Semanal)</h2>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a', fontFamily: 'monospace' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col h-full">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">Últimas transacciones</h2>
                    <div className="space-y-4 flex-1">
                        {[
                            { id: "ORD-2025-0003", label: "Pago Efectivo", value: 850000, type: "in" },
                            { id: "Aeron C Cia", label: "Compra Repuestos", value: -2450000, type: "out" },
                            { id: "ORD-2025-0001", label: "Anticipo TC", value: 500000, type: "in" }
                        ].map((tx, idx) => (
                            <div key={idx} className="flex items-center justify-between pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                                <div className="flex gap-3">
                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", tx.type === 'in' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                        {tx.type === 'in' ? <Wallet className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-100 leading-tight">{tx.id}</p>
                                        <p className="text-[10px] uppercase font-semibold text-zinc-500 mt-1 tracking-wider">{tx.label}</p>
                                    </div>
                                </div>
                                <span className={cn("font-mono text-sm font-bold", tx.type === 'in' ? "text-emerald-400" : "text-zinc-500")}>{tx.type === 'in' ? '+' : '-'} {formatCOP(Math.abs(tx.value))}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors py-2 border border-zinc-800 rounded-lg hover:bg-zinc-800">Ver historial completo</button>
                </div>
            </div>
        </div>
    );
}
