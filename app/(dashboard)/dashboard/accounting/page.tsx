'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Download, Plus, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCOP, formatCOPCompact } from '@/lib/utils/format-currency';
import { useClientsStore } from '@/stores/clients.store';
import { useTransactionsStore } from '@/stores/transactions.store';
import { TransactionDrawer } from '@/components/dashboard/accounting/transaction-drawer';

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
    const transactions = useTransactionsStore((s) => s.transactions);
    const clients = useClientsStore((s) => s.clients);

    const [range, setRange] = useState<'7d' | '30d' | 'all'>('7d');
    const [isTxDrawerOpen, setIsTxDrawerOpen] = useState(false);
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    const now = Date.now();
    const start = useMemo(() => {
        if (range === '7d') return startOfDay(subDays(now, 6)).getTime();
        if (range === '30d') return startOfDay(subDays(now, 29)).getTime();
        return 0;
    }, [now, range]);

    const scoped = useMemo(() => {
        return transactions.filter((t) => t.occurredAt >= start).slice().sort((a, b) => b.occurredAt - a.occurredAt);
    }, [start, transactions]);

    const totals = useMemo(() => {
        const income = scoped.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = scoped.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;
        const margin = income > 0 ? (net / income) * 100 : 0;
        return { income, expense, net, margin };
    }, [scoped]);

    const chartData = useMemo(() => {
        const days = range === '30d' ? 30 : range === '7d' ? 7 : 14;
        const startDate = startOfDay(subDays(now, days - 1));
        const map = new Map<string, { ingresos: number; egresos: number; date: number }>();
        for (let i = 0; i < days; i++) {
            const d = addDays(startDate, i);
            const key = format(d, 'yyyy-MM-dd');
            map.set(key, {
                ingresos: 0,
                egresos: 0,
                date: d.getTime(),
            });
        }

        for (const t of scoped) {
            const d = startOfDay(new Date(t.occurredAt));
            const key = format(d, 'yyyy-MM-dd');
            const row = map.get(key);
            if (!row) continue;
            if (t.type === 'income') row.ingresos += t.amount;
            if (t.type === 'expense') row.egresos += t.amount;
        }

        return Array.from(map.entries()).map(([_, row]) => {
            const label = range === '30d'
                ? format(new Date(row.date), 'dd MMM', { locale: es })
                : format(new Date(row.date), 'EEE', { locale: es });
            return { name: label.replace('.', ''), ingresos: row.ingresos, egresos: row.egresos };
        });
    }, [now, range, scoped]);

    const exportCsv = () => {
        const header = [
            'fecha',
            'tipo',
            'categoria',
            'metodo',
            'monto',
            'cliente',
            'descripcion',
            'referencia',
        ];
        const lines = scoped.map((t) => {
            const clientName = t.clientId ? clients.find((c) => c.id === t.clientId)?.name ?? '' : '';
            return [
                format(new Date(t.occurredAt), "yyyy-MM-dd HH:mm"),
                t.type,
                t.category,
                t.paymentMethod,
                String(t.amount),
                clientName,
                t.description.replaceAll('\n', ' ').replaceAll('"', '""'),
                (t.reference ?? '').replaceAll('"', '""'),
            ]
                .map((v) => `"${v}"`)
                .join(',');
        });
        const csv = [header.join(','), ...lines].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mototaller_contabilidad_${range}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Contabilidad</h1>
                    </div>
                    <p className="text-sm text-zinc-500">Resumen financiero y control de caja del taller.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
                        {[
                            { value: '7d', label: '7D' },
                            { value: '30d', label: '30D' },
                            { value: 'all', label: 'Todo' },
                        ].map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setRange(r.value as '7d' | '30d' | 'all')}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-200",
                                    range === r.value
                                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTxId(null);
                            setIsTxDrawerOpen(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Movimiento
                    </button>
                    <button
                        onClick={exportCsv}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 transition-all"
                    >
                        <Download className="h-4 w-4" /> Exportar CSV
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between border-l-4 border-l-emerald-500/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Ingresos Brutos</p>
                            <p className="font-mono text-3xl font-bold text-zinc-100">{formatCOPCompact(totals.income)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-xs font-medium text-emerald-500">Entradas de caja</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between border-l-4 border-l-red-500/50">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Costos y Egresos</p>
                            <p className="font-mono text-3xl font-bold text-red-400">{formatCOPCompact(totals.expense)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center gap-2 text-xs font-medium text-red-500">Salidas de caja</div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black">
                    <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-red-600/10 blur-3xl" />
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Utilidad Neta</p>
                            <p className="font-mono text-3xl font-bold text-white">{formatCOPCompact(totals.net)}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20 text-white">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                    <div className="relative z-10 mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs font-medium text-zinc-500">
                        Margen Operativo: <span className="text-zinc-100 font-bold">{totals.margin.toFixed(1)}%</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-xl border border-zinc-800 bg-[#141417] col-span-1 lg:col-span-2 p-6 flex flex-col">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">Flujo de Caja</h2>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                                    <linearGradient id="colorEgresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                                <YAxis tickFormatter={(val) => `$${Math.round(val / 1000)}k`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#71717a', fontFamily: 'monospace' }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                                <Area type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorEgresos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col h-full">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">Últimos movimientos</h2>
                    <div className="space-y-4 flex-1">
                        {scoped.slice(0, 6).map((tx) => {
                            const isIn = tx.type === 'income';
                            const clientName = tx.clientId ? clients.find((c) => c.id === tx.clientId)?.name : undefined;
                            return (
                                <div key={tx.id} className="flex items-center justify-between pb-4 border-b border-zinc-800/50 last:border-0 last:pb-0">
                                    <div className="flex gap-3 min-w-0">
                                        <button
                                            onClick={() => {
                                                setSelectedTxId(tx.id);
                                                setIsTxDrawerOpen(true);
                                            }}
                                            className={cn(
                                                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors border",
                                                isIn
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/15"
                                            )}
                                            aria-label="Editar movimiento"
                                        >
                                            <Wallet className="h-5 w-5" />
                                        </button>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-zinc-100 leading-tight truncate">{tx.reference ?? tx.description}</p>
                                            <p className="text-[10px] uppercase font-semibold text-zinc-500 mt-1 tracking-wider truncate">{tx.description}{clientName ? ` · ${clientName}` : ''}</p>
                                        </div>
                                    </div>
                                    <span className={cn("font-mono text-sm font-bold shrink-0", isIn ? "text-emerald-400" : "text-red-400")}>{isIn ? '+' : '-'} {formatCOP(tx.amount)}</span>
                                </div>
                            );
                        })}
                        {scoped.length === 0 && (
                            <div className="p-8 rounded-xl border border-dashed border-zinc-800 text-center">
                                <p className="text-sm font-medium text-zinc-500">Aún no hay movimientos en este rango.</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setSelectedTxId(null);
                            setIsTxDrawerOpen(true);
                        }}
                        className="w-full mt-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 transition-colors py-2 border border-zinc-800 rounded-lg hover:bg-zinc-800"
                    >
                        Registrar movimiento
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between gap-4">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">Historial</h2>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                        {scoped.length} movimientos
                    </span>
                </div>

                <div className="sm:hidden divide-y divide-zinc-800/50">
                    {scoped.slice(0, 20).map((t) => {
                        const isIn = t.type === 'income';
                        const clientName = t.clientId ? clients.find((c) => c.id === t.clientId)?.name : undefined;
                        return (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setSelectedTxId(t.id);
                                    setIsTxDrawerOpen(true);
                                }}
                                className="w-full text-left p-4 hover:bg-zinc-800/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-zinc-200 truncate">{t.description}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">
                                            {format(new Date(t.occurredAt), "dd MMM yyyy · HH:mm", { locale: es })}
                                            {clientName ? ` · ${clientName}` : ''}
                                        </p>
                                    </div>
                                    <span className={cn("font-mono text-sm font-bold shrink-0", isIn ? "text-emerald-400" : "text-red-400")}>
                                        {isIn ? '+' : '-'} {formatCOP(t.amount)}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Fecha</th>
                                <th className="px-6 py-4 font-semibold">Detalle</th>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Tipo</th>
                                <th className="px-6 py-4 font-semibold text-right">Monto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {scoped.slice(0, 50).map((t, i) => {
                                const isIn = t.type === 'income';
                                const clientName = t.clientId ? clients.find((c) => c.id === t.clientId)?.name : '-';
                                return (
                                    <motion.tr
                                        key={t.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.01 }}
                                        className="group hover:bg-zinc-800/30 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedTxId(t.id);
                                            setIsTxDrawerOpen(true);
                                        }}
                                    >
                                        <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{format(new Date(t.occurredAt), "yyyy-MM-dd HH:mm")}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-zinc-200">{t.description}</p>
                                            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">{t.category}{t.reference ? ` · ${t.reference}` : ''}</p>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-400">{clientName}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide border",
                                                isIn ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                            )}>
                                                {isIn ? 'Ingreso' : 'Egreso'}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4 text-right font-mono font-bold", isIn ? "text-emerald-400" : "text-red-400")}>
                                            {isIn ? '+' : '-'} {formatCOP(t.amount)}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <TransactionDrawer
                isOpen={isTxDrawerOpen}
                onClose={() => setIsTxDrawerOpen(false)}
                transactionId={selectedTxId}
            />
        </div>
    );
}
