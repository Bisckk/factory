import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'advance' | 'other';

export type TransactionCategory =
    | 'service'
    | 'parts'
    | 'payroll'
    | 'rent'
    | 'utilities'
    | 'tools'
    | 'supplies'
    | 'marketing'
    | 'taxes'
    | 'other';

export type Transaction = {
    id: string;
    type: TransactionType;
    category: TransactionCategory;
    amount: number;
    occurredAt: number;
    paymentMethod: PaymentMethod;
    description: string;
    reference?: string;
    clientId?: string;
    inventoryItemId?: string;
    staffId?: string;
    appointmentId?: string;
    createdAt: number;
    updatedAt: number;
};

type CreateTransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransactionInput = Partial<Omit<Transaction, 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initialTransactions: Transaction[] = [
    {
        id: 'trx_1',
        type: 'income',
        category: 'service',
        amount: 850000,
        occurredAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        paymentMethod: 'cash',
        description: 'Pago de servicio - Orden ORD-2025-0003',
        reference: 'ORD-2025-0003',
        clientId: 'c_1',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: 'trx_2',
        type: 'expense',
        category: 'parts',
        amount: 2450000,
        occurredAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        paymentMethod: 'transfer',
        description: 'Compra de repuestos - Aeron C Cia',
        reference: 'FACT-AC-0291',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        updatedAt: Date.now() - 1000 * 60 * 60 * 60 * 24 * 4,
    },
    {
        id: 'trx_3',
        type: 'income',
        category: 'service',
        amount: 500000,
        occurredAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        paymentMethod: 'card',
        description: 'Anticipo - Orden ORD-2025-0001',
        reference: 'ORD-2025-0001',
        clientId: 'c_4',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    },
];

type TransactionsState = {
    transactions: Transaction[];
    addTransaction: (input: CreateTransactionInput) => string;
    updateTransaction: (input: UpdateTransactionInput) => void;
    deleteTransaction: (id: string) => void;
};

export const useTransactionsStore = create<TransactionsState>()(
    persist(
        (set) => ({
            transactions: initialTransactions,
            addTransaction: (input) => {
                const id = createId('trx');
                const now = Date.now();
                const tx: Transaction = { ...input, id, createdAt: now, updatedAt: now };
                set((s) => ({ transactions: [tx, ...s.transactions] }));
                return id;
            },
            updateTransaction: (input) => {
                const now = Date.now();
                set((s) => ({
                    transactions: s.transactions.map((t) => {
                        if (t.id !== input.id) return t;
                        return {
                            ...t,
                            ...input,
                            description: input.description != null ? input.description : t.description,
                            reference: input.reference != null ? input.reference : t.reference,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteTransaction: (id) => {
                set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
            },
        }),
        {
            name: 'mototaller_transactions_v1',
            version: 1,
        }
    )
);

