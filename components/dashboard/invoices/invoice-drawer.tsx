'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { X, FileText, Plus, Trash2, User, Search, CheckCircle2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientsStore } from '@/stores/clients.store';
import { useInvoicesStore, computeInvoiceTotals, type InvoiceItem, type InvoiceStatus } from '@/stores/invoices.store';
import { useTransactionsStore } from '@/stores/transactions.store';
import { useSettingsStore } from '@/stores/settings.store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCOP } from '@/lib/utils/format-currency';

type InvoiceDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    invoiceId: string | null;
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Borrador',
    issued: 'Emitida',
    paid: 'Pagada',
    void: 'Anulada',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
    advance: 'Anticipo',
};

export function InvoiceDrawer({ isOpen, onClose, invoiceId }: InvoiceDrawerProps) {
    const invoice = useInvoicesStore((s) => (invoiceId ? s.getInvoice(invoiceId) : undefined));
    const addInvoice = useInvoicesStore((s) => s.addInvoice);
    const updateInvoice = useInvoicesStore((s) => s.updateInvoice);
    const deleteInvoice = useInvoicesStore((s) => s.deleteInvoice);
    const linkTransaction = useInvoicesStore((s) => s.linkTransaction);
    const setStatus = useInvoicesStore((s) => s.setStatus);

    const clients = useClientsStore((s) => s.clients);
    const addTransaction = useTransactionsStore((s) => s.addTransaction);
    const paymentMethods = useSettingsStore((s) => s.settings.catalogs.paymentMethods);

    const [clientSearch, setClientSearch] = useState('');
    const [clientId, setClientId] = useState<string | null>(null);
    const [issuedAt, setIssuedAt] = useState<string>('');
    const [dueAt, setDueAt] = useState<string>('');
    const [status, setLocalStatus] = useState<InvoiceStatus>('issued');
    const [taxPercent, setTaxPercent] = useState<number>(0);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [payMethod, setPayMethod] = useState<string>('cash');

    useEffect(() => {
        if (!isOpen) return;
        if (!invoice) {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            const iso = `${y}-${m}-${d}`;
            setClientSearch('');
            setClientId(null);
            setIssuedAt(iso);
            setDueAt('');
            setLocalStatus('issued');
            setTaxPercent(0);
            setNotes('');
            setItems([
                { id: 'ln_1', description: 'Servicio', qty: 1, unitPrice: 0 },
            ]);
            setPayMethod(paymentMethods[0] ?? 'cash');
            return;
        }
        setClientSearch('');
        setClientId(invoice.clientId);
        setIssuedAt(new Date(invoice.issuedAt).toISOString().slice(0, 10));
        setDueAt(invoice.dueAt ? new Date(invoice.dueAt).toISOString().slice(0, 10) : '');
        setLocalStatus(invoice.status);
        setTaxPercent(invoice.taxPercent);
        setNotes(invoice.notes ?? '');
        setItems(invoice.items);
        setPayMethod(paymentMethods[0] ?? 'cash');
    }, [invoice?.id, isOpen, paymentMethods]);

    const selectedClient = useMemo(() => clients.find((c) => c.id === clientId), [clientId, clients]);

    const filteredClients = useMemo(() => {
        const q = clientSearch.trim().toLowerCase();
        const base = [...clients].sort((a, b) => a.name.localeCompare(b.name));
        const list = q
            ? base.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.cedula.includes(q))
            : base;
        return list.slice(0, 16);
    }, [clientSearch, clients]);

    const totals = useMemo(() => computeInvoiceTotals({ items, taxPercent }), [items, taxPercent]);

    const canSave = Boolean(clientId && issuedAt && items.length > 0 && items.every((it) => it.description.trim() && it.qty > 0 && it.unitPrice >= 0));

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setClientSearch('');
        }, 250);
    };

    const handleSave = () => {
        if (!canSave || !clientId) {
            toast.error('Completa cliente, fecha y al menos un ítem válido.');
            return;
        }
        const issuedTs = new Date(`${issuedAt}T12:00:00`).getTime();
        const dueTs = dueAt ? new Date(`${dueAt}T12:00:00`).getTime() : undefined;

        if (!invoiceId) {
            addInvoice({
                clientId,
                issuedAt: issuedTs,
                dueAt: dueTs,
                status,
                taxPercent,
                notes,
                items,
            });
            toast.success('Factura creada.');
            handleClose();
            return;
        }

        updateInvoice({
            id: invoiceId,
            clientId,
            issuedAt: issuedTs,
            dueAt: dueTs,
            status,
            taxPercent,
            notes,
            items,
        });
        toast.success('Factura actualizada.');
        handleClose();
    };

    const handleRegisterPayment = () => {
        if (!invoice || invoice.status === 'void') {
            toast.error('No se puede registrar pago en una factura anulada.');
            return;
        }
        if (!selectedClient) {
            toast.error('Selecciona un cliente válido.');
            return;
        }
        if (invoice.transactionId) {
            toast.message('Esta factura ya tiene un pago registrado.');
            return;
        }
        const { total } = computeInvoiceTotals(invoice);
        const txId = addTransaction({
            type: 'income',
            category: 'service',
            amount: total,
            occurredAt: Date.now(),
            paymentMethod: (payMethod as any) ?? 'cash',
            description: `Factura ${invoice.number} - ${selectedClient.name}`,
            reference: invoice.number,
            clientId: invoice.clientId,
        });
        linkTransaction(invoice.id, txId);
        setStatus(invoice.id, 'paid');
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
                                    <FileText className="h-5 w-5 text-red-500" />
                                    {invoiceId ? 'Gestionar Factura' : 'Nueva Factura'}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Facturación externa y registro de pago en Contabilidad.</p>
                            </div>
                            <button onClick={handleClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Cliente</h3>
                                {!selectedClient ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                                            <input
                                                value={clientSearch}
                                                onChange={(e) => setClientSearch(e.target.value)}
                                                placeholder="Buscar por cédula, nombre o teléfono..."
                                                className={cn(inputClass, 'pl-9')}
                                            />
                                        </div>
                                        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                                            <div className="divide-y divide-zinc-800/50 max-h-64 overflow-y-auto">
                                                {filteredClients.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        onClick={() => {
                                                            setClientId(c.id);
                                                            setClientSearch('');
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left"
                                                    >
                                                        <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                            <User className="h-5 w-5 text-zinc-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-extrabold text-zinc-200 truncate">{c.name}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-0.5">C.C. {c.cedula} • {c.phone}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                        <button
                                            onClick={() => setClientId(null)}
                                            className="absolute top-3 right-3 p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                            title="Cambiar cliente"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                        <p className="text-sm font-extrabold text-zinc-100">{selectedClient.name}</p>
                                        <p className="text-[10px] text-zinc-500 mt-1">C.C. {selectedClient.cedula} • {selectedClient.phone}</p>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Documento</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Emisión *</label>
                                        <input type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} className={cn(inputClass, 'font-mono')} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Vencimiento</label>
                                        <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={cn(inputClass, 'font-mono')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Estado</label>
                                        <Select value={status} onValueChange={(v) => setLocalStatus((v ?? 'issued') as InvoiceStatus)}>
                                            <SelectTrigger className="w-full h-[52px] border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                <SelectValue placeholder="Selecciona...">
                                                    {(v) => STATUS_LABELS[(v ?? 'issued') as InvoiceStatus]}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl shadow-2xl">
                                                {(['draft', 'issued', 'paid', 'void'] as InvoiceStatus[]).map((s) => (
                                                    <SelectItem key={s} value={s} className="py-3 focus:bg-zinc-800/60 focus:text-white cursor-pointer rounded-lg">
                                                        {STATUS_LABELS[s]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">IVA %</label>
                                        <input
                                            type="number"
                                            value={taxPercent}
                                            onChange={(e) => setTaxPercent(Math.max(0, Math.min(100, Number(e.target.value || 0))))}
                                            className={cn(inputClass, 'font-mono')}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Ítems</h3>
                                <div className="space-y-2">
                                    {items.map((it, idx) => (
                                        <div key={it.id} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">Línea {idx + 1}</span>
                                                <button
                                                    onClick={() => setItems((p) => p.length === 1 ? p : p.filter((x) => x.id !== it.id))}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors"
                                                    title="Eliminar línea"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <input
                                                value={it.description}
                                                onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, description: e.target.value } : x))}
                                                placeholder="Descripción"
                                                className={inputClass}
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cant.</label>
                                                    <input
                                                        type="number"
                                                        value={it.qty}
                                                        onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, qty: Number(e.target.value || 1) } : x))}
                                                        className={cn(inputClass, 'font-mono')}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Valor</label>
                                                    <input
                                                        type="number"
                                                        value={it.unitPrice}
                                                        onChange={(e) => setItems((p) => p.map((x) => x.id === it.id ? { ...x, unitPrice: Number(e.target.value || 0) } : x))}
                                                        className={cn(inputClass, 'font-mono')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setItems((p) => [...p, { id: `ln_${Date.now().toString(36)}`, description: '', qty: 1, unitPrice: 0 }])}
                                        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                    >
                                        <Plus className="h-4 w-4" /> Agregar ítem
                                    </button>
                                </div>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-semibold">Subtotal</span>
                                        <span className="text-zinc-200 font-extrabold">{formatCOP(totals.subtotal)}</span>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 font-semibold">IVA</span>
                                        <span className="text-zinc-200 font-extrabold">{formatCOP(totals.tax)}</span>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                                        <span className="text-zinc-500 font-semibold">Total</span>
                                        <span className="text-zinc-100 text-lg font-extrabold">{formatCOP(totals.total)}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-3">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Notas</h3>
                                <textarea
                                    rows={3}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Observaciones (opcional)"
                                    className={cn(inputClass, 'resize-none')}
                                />
                            </section>

                            {invoice && invoice.status !== 'paid' && invoice.status !== 'void' && (
                                <section className="space-y-3">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Registrar pago</h3>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Método</label>
                                        <Select value={payMethod} onValueChange={(v) => setPayMethod(v ?? 'cash')}>
                                            <SelectTrigger className="w-full h-[52px] border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-semibold rounded-xl">
                                                <SelectValue placeholder="Selecciona...">
                                                    {(v) => PAYMENT_METHOD_LABELS[String(v ?? 'cash')] ?? 'Selecciona...'}
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
                                        <button
                                            onClick={handleRegisterPayment}
                                            className="w-full inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                                        >
                                            <CreditCard className="h-4 w-4" /> Registrar pago en Contabilidad
                                        </button>
                                        <p className="text-[10px] text-zinc-600">
                                            Esto crea una transacción de ingreso y marca la factura como pagada.
                                        </p>
                                    </div>
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
                                <CheckCircle2 className="h-4 w-4 mr-2" /> {invoiceId ? 'Guardar cambios' : 'Crear factura'}
                            </button>

                            {invoiceId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ok = window.confirm('¿Eliminar esta factura?');
                                        if (!ok) return;
                                        deleteInvoice(invoiceId);
                                        toast.success('Factura eliminada.');
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
