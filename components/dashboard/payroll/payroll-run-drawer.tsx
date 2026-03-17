'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, Users, Plus, Trash2, CreditCard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStaffStore } from '@/stores/staff.store';
import { usePayrollStore, computePayrollTotal, type PayrollLine, type PayrollStatus } from '@/stores/payroll.store';
import { useTransactionsStore } from '@/stores/transactions.store';
import { useSettingsStore } from '@/stores/settings.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCOP } from '@/lib/utils/format-currency';

type PayrollRunDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    runId: string | null;
};

const STATUS_LABELS: Record<PayrollStatus, string> = {
    draft: 'Borrador',
    paid: 'Pagada',
    void: 'Anulada',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
    advance: 'Anticipo',
};

export function PayrollRunDrawer({ isOpen, onClose, runId }: PayrollRunDrawerProps) {
    const run = usePayrollStore((s) => (runId ? s.getRun(runId) : undefined));
    const addRun = usePayrollStore((s) => s.addRun);
    const updateRun = usePayrollStore((s) => s.updateRun);
    const deleteRun = usePayrollStore((s) => s.deleteRun);
    const linkTransactions = usePayrollStore((s) => s.linkTransactions);
    const setStatus = usePayrollStore((s) => s.setStatus);

    const staff = useStaffStore((s) => s.staff);
    const addTransaction = useTransactionsStore((s) => s.addTransaction);
    const paymentMethods = useSettingsStore((s) => s.settings.catalogs.paymentMethods);

    const activeStaff = useMemo(() => staff.filter((m) => m.status === 'active').slice().sort((a, b) => a.fullName.localeCompare(b.fullName)), [staff]);

    const [periodStart, setPeriodStart] = useState('');
    const [periodEnd, setPeriodEnd] = useState('');
    const [status, setLocalStatus] = useState<PayrollStatus>('draft');
    const [lines, setLines] = useState<PayrollLine[]>([]);
    const [staffDraftId, setStaffDraftId] = useState<string>('none');
    const [payMethod, setPayMethod] = useState<string>('transfer');

    useEffect(() => {
        if (!isOpen) return;
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const first = `${y}-${m}-01`;
        const lastDate = new Date(y, today.getMonth() + 1, 0).getDate();
        const last = `${y}-${m}-${String(lastDate).padStart(2, '0')}`;

        if (!run) {
            setPeriodStart(first);
            setPeriodEnd(last);
            setLocalStatus('draft');
            setLines([]);
            setStaffDraftId('none');
            setPayMethod(paymentMethods.includes('transfer') ? 'transfer' : (paymentMethods[0] ?? 'transfer'));
            return;
        }

        setPeriodStart(new Date(run.periodStart).toISOString().slice(0, 10));
        setPeriodEnd(new Date(run.periodEnd).toISOString().slice(0, 10));
        setLocalStatus(run.status);
        setLines(run.lines);
        setStaffDraftId('none');
        setPayMethod(paymentMethods.includes('transfer') ? 'transfer' : (paymentMethods[0] ?? 'transfer'));
    }, [isOpen, run?.id, paymentMethods]);

    const totals = useMemo(() => ({ total: computePayrollTotal({ lines }) }), [lines]);

    const canSave = Boolean(periodStart && periodEnd && lines.length > 0 && lines.every((l) => l.staffId && l.concept.trim() && l.amount >= 0));

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    const getDefaultAmountForStaff = (staffId: string) => {
        const member = activeStaff.find((m) => m.id === staffId);
        if (!member) return 0;
        if (member.monthlySalary != null) return member.monthlySalary;
        if (member.hourlyRate != null) return member.hourlyRate * 160;
        return 0;
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = () => {
        if (!canSave) {
            toast.error('Define periodo y agrega al menos un pago válido.');
            return;
        }
        const startTs = new Date(`${periodStart}T12:00:00`).getTime();
        const endTs = new Date(`${periodEnd}T12:00:00`).getTime();

        if (!runId) {
            addRun({
                periodStart: startTs,
                periodEnd: endTs,
                status,
                lines,
            });
            toast.success('Nómina creada.');
            handleClose();
            return;
        }

        updateRun({
            id: runId,
            periodStart: startTs,
            periodEnd: endTs,
            status,
            lines,
        });
        toast.success('Nómina actualizada.');
        handleClose();
    };

    const handleRegisterPayment = () => {
        if (!runId || !run) return;
        if (run.status === 'void') {
            toast.error('No se puede registrar pago en una nómina anulada.');
            return;
        }
        if (run.transactionIds.length > 0) {
            toast.message('Esta nómina ya tiene transacciones registradas.');
            return;
        }
        const ids: string[] = [];
        for (const line of run.lines) {
            const member = staff.find((m) => m.id === line.staffId);
            const txId = addTransaction({
                type: 'expense',
                category: 'payroll',
                amount: Math.max(0, Math.round(line.amount)),
                occurredAt: Date.now(),
                paymentMethod: (payMethod as any) ?? 'transfer',
                description: `Nómina ${run.reference} - ${member?.fullName ?? 'Empleado'} (${line.concept})`,
                reference: run.reference,
                staffId: line.staffId,
            });
            ids.push(txId);
        }
        linkTransactions(runId, ids);
        setStatus(runId, 'paid');
        toast.success('Pago registrado en Contabilidad.');
        handleClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Users className="h-5 w-5 text-red-500" />
                                    {runId ? 'Gestionar Nómina' : 'Nueva Nómina'}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Genera pagos del periodo y registra egresos en Contabilidad.</p>
                            </div>
                            <button onClick={handleClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Periodo</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Inicio *</label>
                                        <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className={cn(inputClass, 'font-mono')} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Fin *</label>
                                        <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className={cn(inputClass, 'font-mono')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Estado</label>
                                        <Select value={status} onValueChange={(v) => setLocalStatus((v ?? 'draft') as PayrollStatus)}>
                                            <SelectTrigger className="w-full h-[52px] border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                <SelectValue placeholder="Selecciona...">
                                                    {(v) => STATUS_LABELS[(v ?? 'draft') as PayrollStatus]}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                {(['draft', 'paid', 'void'] as PayrollStatus[]).map((s) => (
                                                    <SelectItem key={s} value={s} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                        {STATUS_LABELS[s]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Método pago</label>
                                            <Select value={payMethod} onValueChange={(v) => setPayMethod(v ?? 'transfer')}>
                                                <SelectTrigger className="w-full h-[52px] border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                    <SelectValue placeholder="Selecciona...">
                                                        {(v) => PAYMENT_METHOD_LABELS[String(v ?? 'transfer')] ?? 'Selecciona...'}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                    {(paymentMethods.length ? paymentMethods : (['cash', 'transfer', 'card', 'advance'] as const)).map((m) => (
                                                        <SelectItem key={m} value={m} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                            {PAYMENT_METHOD_LABELS[m]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Pagos</h3>
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Agregar empleado</label>
                                    <div className="flex gap-2">
                                        <Select value={staffDraftId} onValueChange={(v) => setStaffDraftId(v ?? 'none')}>
                                            <SelectTrigger className="w-full h-[52px] border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                <SelectValue placeholder="Selecciona un empleado...">
                                                    {(v) => {
                                                        const id = String(v ?? 'none');
                                                        if (id === 'none') return 'Selecciona...';
                                                        return activeStaff.find((m) => m.id === id)?.fullName ?? 'Empleado';
                                                    }}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                <SelectItem value="none" className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg">
                                                    Selecciona...
                                                </SelectItem>
                                                {activeStaff.map((m) => (
                                                    <SelectItem key={m.id} value={m.id} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                        {m.fullName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <button
                                            onClick={() => {
                                                if (!staffDraftId || staffDraftId === 'none') return;
                                                if (lines.some((l) => l.staffId === staffDraftId)) return;
                                                const member = activeStaff.find((m) => m.id === staffDraftId);
                                                setLines((p) => [
                                                    ...p,
                                                    {
                                                        id: `ln_${Date.now().toString(36)}`,
                                                        staffId: staffDraftId,
                                                        concept: member?.monthlySalary != null ? 'Salario mensual' : member?.hourlyRate != null ? 'Horas (estimado)' : 'Pago',
                                                        amount: getDefaultAmountForStaff(staffDraftId),
                                                    },
                                                ]);
                                                setStaffDraftId('none');
                                            }}
                                            className="shrink-0 inline-flex h-[52px] items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {lines.map((l) => {
                                        const member = staff.find((m) => m.id === l.staffId);
                                        return (
                                            <div key={l.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-extrabold text-zinc-200 truncate">{member?.fullName ?? 'Empleado'}</p>
                                                        <p className="text-[10px] text-zinc-600 mt-1">{member?.email ?? ''}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setLines((p) => p.filter((x) => x.id !== l.id))}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Concepto</label>
                                                    <input
                                                        value={l.concept}
                                                        onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, concept: e.target.value } : x))}
                                                        placeholder="Ej. Quincena / Bonificación"
                                                        className={inputClass}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Monto</label>
                                                    <input
                                                        type="number"
                                                        value={l.amount}
                                                        onChange={(e) => setLines((p) => p.map((x) => x.id === l.id ? { ...x, amount: Number(e.target.value || 0) } : x))}
                                                        className={cn(inputClass, 'font-mono')}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500 font-semibold">Total</span>
                                        <span className="text-zinc-100 text-lg font-extrabold">{formatCOP(totals.total)}</span>
                                    </div>
                                </div>
                            </section>

                            {run && run.status !== 'paid' && run.status !== 'void' && (
                                <section className="space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Registrar pago</h3>
                                    <button
                                        onClick={handleRegisterPayment}
                                        className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                                    >
                                        <CreditCard className="h-4 w-4" /> Registrar egresos en Contabilidad
                                    </button>
                                    <p className="text-[10px] text-zinc-600">
                                        Esto crea una transacción por cada empleado y marca la nómina como pagada.
                                    </p>
                                </section>
                            )}
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0 space-y-3">
                            <button
                                type="button"
                                disabled={!canSave}
                                onClick={handleSave}
                                className={cn(
                                    "w-full flex items-center justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    canSave
                                        ? "text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10"
                                        : "text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed"
                                )}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> {runId ? 'Guardar cambios' : 'Crear nómina'}
                            </button>

                            {runId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ok = window.confirm('¿Eliminar esta nómina?');
                                        if (!ok) return;
                                        deleteRun(runId);
                                        toast.success('Nómina eliminada.');
                                        handleClose();
                                    }}
                                    className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
