'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Shield, CheckCircle2, Clock, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { usePayrollStore, computePayrollTotal, type PayrollStatus } from '@/stores/payroll.store';
import { PayrollRunDrawer } from '@/components/dashboard/payroll/payroll-run-drawer';
import { formatCOPCompact } from '@/lib/utils/format-currency';

const STATUS_BADGE: Record<PayrollStatus, string> = {
    draft: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    void: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
};

const STATUS_ICON: Record<PayrollStatus, React.ElementType> = {
    draft: Clock,
    paid: CheckCircle2,
    void: Ban,
};

export default function PayrollPage() {
    const { role } = useAuthStore();
    const runs = usePayrollStore((s) => s.runs);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<PayrollStatus | 'all'>('all');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

    const isRestricted = role !== 'admin' && role !== 'accountant';

    const enriched = useMemo(() => {
        return runs.map((r) => ({ run: r, total: computePayrollTotal(r) }));
    }, [runs]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return enriched
            .filter(({ run }) => {
                if (statusFilter !== 'all' && run.status !== statusFilter) return false;
                if (!q) return true;
                return (
                    run.reference.toLowerCase().includes(q) ||
                    new Date(run.periodStart).toLocaleDateString('es-CO').includes(q) ||
                    new Date(run.periodEnd).toLocaleDateString('es-CO').includes(q)
                );
            })
            .slice()
            .sort((a, b) => b.run.periodStart - a.run.periodStart);
    }, [enriched, search, statusFilter]);

    const kpis = useMemo(() => {
        const totalDraft = enriched.filter((x) => x.run.status === 'draft').reduce((s, x) => s + x.total, 0);
        const totalPaid = enriched.filter((x) => x.run.status === 'paid').reduce((s, x) => s + x.total, 0);
        const runsThisMonth = enriched.filter((x) => {
            const d = new Date(x.run.periodStart);
            const now = new Date();
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }).length;
        return { totalDraft, totalPaid, runsThisMonth };
    }, [enriched]);

    if (isRestricted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Acceso Restringido</h1>
                <p className="mt-2 text-zinc-500">Este módulo está disponible para Administrador y Contabilidad.</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Nómina</h1>
                    </div>
                    <p className="text-sm text-zinc-500">Genera pagos del periodo y registra egresos en Contabilidad.</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedRunId(null);
                        setIsDrawerOpen(true);
                    }}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                >
                    <Plus className="h-4 w-4" /> Nueva Nómina
                </button>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pendiente</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-amber-400">{formatCOPCompact(kpis.totalDraft)}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pagado</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-400">{formatCOPCompact(kpis.totalPaid)}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4 col-span-2 lg:col-span-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Corridas (mes)</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-100">{kpis.runsThisMonth}</p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-zinc-800 gap-4">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar por referencia o fecha..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-full sm:w-auto">
                        {(['all', 'draft', 'paid', 'void'] as const).map((k) => (
                            <button
                                key={k}
                                onClick={() => setStatusFilter(k)}
                                className={cn(
                                    "flex-1 sm:flex-none px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-200",
                                    statusFilter === k
                                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-300"
                                )}
                            >
                                {k === 'all' ? 'Todos' : k === 'draft' ? 'Borrador' : k === 'paid' ? 'Pagadas' : 'Anuladas'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 space-y-3 md:hidden">
                    {filtered.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
                            <Users className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm font-medium text-zinc-500">No hay nóminas para mostrar</p>
                        </div>
                    ) : (
                        filtered.map(({ run, total }) => {
                            const Icon = STATUS_ICON[run.status];
                            return (
                                <button
                                    key={run.id}
                                    onClick={() => {
                                        setSelectedRunId(run.id);
                                        setIsDrawerOpen(true);
                                    }}
                                    className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-extrabold text-zinc-200 truncate">{run.reference}</p>
                                            <p className="text-xs text-zinc-500 mt-1 truncate">
                                                {new Date(run.periodStart).toLocaleDateString('es-CO')} → {new Date(run.periodEnd).toLocaleDateString('es-CO')}
                                            </p>
                                        </div>
                                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide", STATUS_BADGE[run.status])}>
                                            <Icon className="h-3.5 w-3.5" />
                                            {run.status === 'draft' ? 'Borrador' : run.status === 'paid' ? 'Pagada' : 'Anulada'}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-zinc-500">Total</span>
                                        <span className="text-sm font-extrabold text-zinc-100">{formatCOPCompact(total)}</span>
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
                                <th className="px-6 py-4 font-semibold">Referencia</th>
                                <th className="px-6 py-4 font-semibold">Periodo</th>
                                <th className="px-6 py-4 font-semibold">Estado</th>
                                <th className="px-6 py-4 font-semibold">Total</th>
                                <th className="px-6 py-4 font-semibold text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <Users className="h-8 w-8 text-zinc-700 mb-3 mx-auto" />
                                        <p className="text-sm font-medium text-zinc-500">No hay nóminas</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(({ run, total }, i) => {
                                    const Icon = STATUS_ICON[run.status];
                                    return (
                                        <motion.tr
                                            key={run.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="group hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-mono text-xs font-bold text-zinc-200">{run.reference}</div>
                                                <div className="text-[10px] text-zinc-600 mt-0.5">{new Date(run.createdAt).toLocaleDateString('es-CO')}</div>
                                            </td>
                                            <td className="px-6 py-4 text-zinc-400">
                                                {new Date(run.periodStart).toLocaleDateString('es-CO')} → {new Date(run.periodEnd).toLocaleDateString('es-CO')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide", STATUS_BADGE[run.status])}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {run.status === 'draft' ? 'Borrador' : run.status === 'paid' ? 'Pagada' : 'Anulada'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-extrabold text-zinc-100">{formatCOPCompact(total)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRunId(run.id);
                                                        setIsDrawerOpen(true);
                                                    }}
                                                    className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-100 transition-colors py-1.5 px-3 border border-zinc-800 rounded-lg hover:bg-zinc-800"
                                                >
                                                    Gestionar
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PayrollRunDrawer
                isOpen={isDrawerOpen}
                runId={selectedRunId}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedRunId(null);
                }}
            />
        </div>
    );
}

