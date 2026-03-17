'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, DollarSign, Hash, Receipt, Save, Tags, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClientsStore } from '@/stores/clients.store';
import { useTransactionsStore, type PaymentMethod, type Transaction, type TransactionCategory, type TransactionType } from '@/stores/transactions.store';

type TransactionDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    transactionId?: string | null;
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
    service: 'Servicios',
    parts: 'Repuestos',
    payroll: 'Nómina',
    rent: 'Arriendo',
    utilities: 'Servicios públicos',
    tools: 'Herramientas',
    supplies: 'Insumos',
    marketing: 'Marketing',
    taxes: 'Impuestos',
    other: 'Otros',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    advance: 'Anticipo',
    other: 'Otro',
};

const TYPE_LABELS: Record<TransactionType, string> = {
    income: 'Ingreso',
    expense: 'Egreso',
};

export function TransactionDrawer({ isOpen, onClose, transactionId }: TransactionDrawerProps) {
    const isEdit = Boolean(transactionId);
    const clients = useClientsStore((s) => s.clients);
    const transactions = useTransactionsStore((s) => s.transactions);
    const addTransaction = useTransactionsStore((s) => s.addTransaction);
    const updateTransaction = useTransactionsStore((s) => s.updateTransaction);
    const deleteTransaction = useTransactionsStore((s) => s.deleteTransaction);

    const tx = useMemo(() => transactions.find((t) => t.id === transactionId), [transactions, transactionId]);

    const [type, setType] = useState<TransactionType>('income');
    const [category, setCategory] = useState<TransactionCategory>('service');
    const [method, setMethod] = useState<PaymentMethod>('cash');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');
    const [clientId, setClientId] = useState<string>('none');

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && tx) {
            setType(tx.type);
            setCategory(tx.category);
            setMethod(tx.paymentMethod);
            setAmount(String(tx.amount));
            const d = new Date(tx.occurredAt);
            setDate(d.toISOString().slice(0, 10));
            setTime(d.toTimeString().slice(0, 5));
            setDescription(tx.description);
            setReference(tx.reference ?? '');
            setClientId(tx.clientId ?? 'none');
            return;
        }
        const now = new Date();
        setType('income');
        setCategory('service');
        setMethod('cash');
        setAmount('');
        setDate(now.toISOString().slice(0, 10));
        setTime(now.toTimeString().slice(0, 5));
        setDescription('');
        setReference('');
        setClientId('none');
    }, [isEdit, isOpen, tx]);

    const canSubmit = useMemo(() => {
        const v = Number(amount);
        if (!Number.isFinite(v) || v <= 0) return false;
        if (!description.trim()) return false;
        if (!date || !time) return false;
        return true;
    }, [amount, date, description, time]);

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    const title = isEdit ? 'Editar Movimiento' : 'Nuevo Movimiento';
    const typeBadge = type === 'income'
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
        : 'bg-red-500/10 text-red-400 border border-red-500/20';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
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
                                    <DollarSign className="h-5 w-5 text-red-500" />
                                    {title}
                                </h2>
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="text-xs text-zinc-500">Registra ingresos y egresos del taller.</p>
                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", typeBadge)}>
                                        {TYPE_LABELS[type]}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Movimiento</h3>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Tipo *</label>
                                            <div className="relative group flex items-center">
                                                <DollarSign className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                                <Select value={type} onValueChange={(v) => setType(((v ?? 'income') as TransactionType))}>
                                                    <SelectTrigger className="w-full h-[52px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                        <SelectValue placeholder="Selecciona...">
                                                            {(v) => TYPE_LABELS[(v ?? 'income') as TransactionType]}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                        <SelectItem value="income" className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                            Ingreso
                                                        </SelectItem>
                                                        <SelectItem value="expense" className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                            Egreso
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Categoría *</label>
                                            <div className="relative group flex items-center">
                                                <Tags className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                                <Select value={category} onValueChange={(v) => setCategory(((v ?? 'service') as TransactionCategory))}>
                                                    <SelectTrigger className="w-full h-[52px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                        <SelectValue placeholder="Selecciona...">
                                                            {(v) => CATEGORY_LABELS[(v ?? 'service') as TransactionCategory]}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                        {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                                                            <SelectItem key={k} value={k} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Valor (COP) *</label>
                                        <div className="relative group flex items-center">
                                            <Hash className="absolute left-4 h-4 w-4 text-zinc-600" />
                                            <input
                                                type="number"
                                                min={0}
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0"
                                                className={cn(inputClass, 'pl-10 pr-4 font-mono h-[52px]')}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Método</label>
                                            <div className="relative group flex items-center">
                                                <Receipt className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                                <Select value={method} onValueChange={(v) => setMethod(((v ?? 'cash') as PaymentMethod))}>
                                                    <SelectTrigger className="w-full h-[52px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                        <SelectValue placeholder="Selecciona...">
                                                            {(v) => METHOD_LABELS[(v ?? 'cash') as PaymentMethod]}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                        {Object.entries(METHOD_LABELS).map(([k, label]) => (
                                                            <SelectItem key={k} value={k} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                                {label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cliente</label>
                                            <div className="relative group flex items-center">
                                                <User className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                                <Select value={clientId} onValueChange={(value) => setClientId(value ?? 'none')}>
                                                    <SelectTrigger className="w-full h-[52px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                        <SelectValue placeholder="Opcional">
                                                            {(v) => {
                                                                const id = String(v ?? 'none');
                                                                if (id === 'none') return 'Sin cliente';
                                                                return clients.find((c) => c.id === id)?.name ?? 'Cliente';
                                                            }}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                        <SelectItem value="none" className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                            Sin cliente
                                                        </SelectItem>
                                                        {clients.map((c) => (
                                                            <SelectItem key={c.id} value={c.id} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                                {c.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Fecha *</label>
                                            <div className="relative group flex items-center">
                                                <Calendar className="absolute left-4 h-4 w-4 text-zinc-600" />
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className={cn(inputClass, 'pl-10 pr-4 h-[52px]')}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Hora *</label>
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className={cn(inputClass, 'h-[52px]')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Detalle</h3>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Descripción *</label>
                                        <div className="relative group flex items-center">
                                            <Tags className="absolute left-4 h-4 w-4 text-zinc-600" />
                                            <input
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Ej. Pago servicio, compra insumos..."
                                                className={cn(inputClass, 'pl-10 pr-4 h-[52px]')}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Referencia</label>
                                        <div className="relative group flex items-center">
                                            <Receipt className="absolute left-4 h-4 w-4 text-zinc-600" />
                                            <input
                                                value={reference}
                                                onChange={(e) => setReference(e.target.value)}
                                                placeholder="Ej. ORD-2025-0001, FACT-0003"
                                                className={cn(inputClass, 'pl-10 pr-4 font-mono h-[52px]')}
                                            />
                                        </div>
                                    </div>

                                    {clientId !== 'none' && (
                                        <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-start gap-3">
                                            <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                <User className="h-5 w-5 text-red-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-zinc-200 truncate">{clients.find((c) => c.id === clientId)?.name ?? 'Cliente'}</p>
                                                <p className="text-xs text-zinc-500 mt-1">Vinculado a este movimiento</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0 space-y-3">
                            {isEdit && tx && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ok = window.confirm('¿Eliminar este movimiento?');
                                        if (!ok) return;
                                        deleteTransaction(tx.id);
                                        toast.success('Movimiento eliminado.');
                                        onClose();
                                    }}
                                    className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (!canSubmit) {
                                        toast.error('Completa valor, fecha/hora y descripción.');
                                        return;
                                    }
                                    const occurredAt = new Date(`${date}T${time}`).getTime();
                                    if (!Number.isFinite(occurredAt)) {
                                        toast.error('Fecha u hora inválida.');
                                        return;
                                    }
                                    const v = Number(amount);
                                    const payload = {
                                        type,
                                        category,
                                        amount: v,
                                        occurredAt,
                                        paymentMethod: method,
                                        description: description.trim(),
                                        reference: reference.trim() || undefined,
                                        clientId: clientId === 'none' ? undefined : clientId,
                                    } satisfies Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;

                                    if (isEdit && tx) {
                                        updateTransaction({ id: tx.id, ...payload });
                                        toast.success('Movimiento actualizado.');
                                    } else {
                                        addTransaction(payload);
                                        toast.success('Movimiento registrado.');
                                    }
                                    onClose();
                                }}
                                className={cn(
                                    'w-full flex justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                    canSubmit
                                        ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                        : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                )}
                            >
                                <Save className="h-4 w-4 mr-2" /> Guardar
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
