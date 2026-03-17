import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'void';

export type InvoiceItem = {
    id: string;
    description: string;
    qty: number;
    unitPrice: number;
};

export type Invoice = {
    id: string;
    number: string;
    clientId: string;
    issuedAt: number;
    dueAt?: number;
    status: InvoiceStatus;
    items: InvoiceItem[];
    taxPercent: number;
    notes?: string;
    transactionId?: string;
    createdAt: number;
    updatedAt: number;
};

type CreateInvoiceInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'transactionId' | 'status' | 'number'> & {
    status?: InvoiceStatus;
    number?: string;
};

type UpdateInvoiceInput = Partial<Omit<Invoice, 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function formatInvoiceNumber(now: Date, counter: number) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const n = String(counter).padStart(4, '0');
    return `INV-${y}${m}-${n}`;
}

function normalizeLine(input: string) {
    return input.trim().replace(/\s+/g, ' ');
}

type InvoicesState = {
    invoices: Invoice[];
    getInvoice: (id: string) => Invoice | undefined;
    addInvoice: (input: CreateInvoiceInput) => string;
    updateInvoice: (input: UpdateInvoiceInput) => void;
    deleteInvoice: (id: string) => void;
    linkTransaction: (invoiceId: string, transactionId: string) => void;
    setStatus: (invoiceId: string, status: InvoiceStatus) => void;
};

const initialInvoices: Invoice[] = [];

export const useInvoicesStore = create<InvoicesState>()(
    persist(
        (set, get) => ({
            invoices: initialInvoices,
            getInvoice: (id) => get().invoices.find((x) => x.id === id),
            addInvoice: (input) => {
                const now = Date.now();
                const counter = get().invoices.length + 1;
                const number = input.number?.trim() || formatInvoiceNumber(new Date(now), counter);
                const invoice: Invoice = {
                    id: createId('inv'),
                    number,
                    clientId: input.clientId,
                    issuedAt: input.issuedAt,
                    dueAt: input.dueAt,
                    status: input.status ?? 'issued',
                    items: input.items.map((it) => ({
                        ...it,
                        description: normalizeLine(it.description),
                        qty: Math.max(1, Math.floor(it.qty)),
                        unitPrice: Math.max(0, Math.round(it.unitPrice)),
                    })),
                    taxPercent: Math.max(0, Math.min(100, input.taxPercent)),
                    notes: input.notes ? normalizeLine(input.notes) : undefined,
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ invoices: [invoice, ...s.invoices] }));
                return invoice.id;
            },
            updateInvoice: (input) => {
                const now = Date.now();
                set((s) => ({
                    invoices: s.invoices.map((inv) => {
                        if (inv.id !== input.id) return inv;
                        const items = input.items
                            ? input.items.map((it) => ({
                                ...it,
                                description: normalizeLine(it.description),
                                qty: Math.max(1, Math.floor(it.qty)),
                                unitPrice: Math.max(0, Math.round(it.unitPrice)),
                            }))
                            : inv.items;
                        return {
                            ...inv,
                            ...input,
                            number: input.number != null ? normalizeLine(input.number) : inv.number,
                            notes: input.notes != null ? (normalizeLine(input.notes) || undefined) : inv.notes,
                            taxPercent: input.taxPercent != null ? Math.max(0, Math.min(100, input.taxPercent)) : inv.taxPercent,
                            items,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteInvoice: (id) => set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),
            linkTransaction: (invoiceId, transactionId) => {
                const now = Date.now();
                set((s) => ({
                    invoices: s.invoices.map((inv) => inv.id === invoiceId ? { ...inv, transactionId, updatedAt: now } : inv),
                }));
            },
            setStatus: (invoiceId, status) => {
                const now = Date.now();
                set((s) => ({
                    invoices: s.invoices.map((inv) => inv.id === invoiceId ? { ...inv, status, updatedAt: now } : inv),
                }));
            },
        }),
        {
            name: 'mototaller_invoices_v1',
            version: 1,
        }
    )
);

export function computeInvoiceTotals(invoice: Pick<Invoice, 'items' | 'taxPercent'>) {
    const subtotal = invoice.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0);
    const tax = Math.round((subtotal * invoice.taxPercent) / 100);
    const total = subtotal + tax;
    return { subtotal, tax, total };
}

