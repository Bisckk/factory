import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PayrollStatus = 'draft' | 'paid' | 'void';

export type PayrollLine = {
    id: string;
    staffId: string;
    concept: string;
    amount: number;
};

export type PayrollRun = {
    id: string;
    reference: string;
    periodStart: number;
    periodEnd: number;
    status: PayrollStatus;
    lines: PayrollLine[];
    transactionIds: string[];
    createdAt: number;
    updatedAt: number;
};

type CreatePayrollInput = Omit<PayrollRun, 'id' | 'createdAt' | 'updatedAt' | 'transactionIds' | 'status' | 'reference'> & {
    status?: PayrollStatus;
    reference?: string;
};

type UpdatePayrollInput = Partial<Omit<PayrollRun, 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeLine(input: string) {
    return input.trim().replace(/\s+/g, ' ');
}

function formatPayrollReference(now: Date, counter: number) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const n = String(counter).padStart(3, '0');
    return `PAY-${y}${m}-${n}`;
}

type PayrollState = {
    runs: PayrollRun[];
    getRun: (id: string) => PayrollRun | undefined;
    addRun: (input: CreatePayrollInput) => string;
    updateRun: (input: UpdatePayrollInput) => void;
    deleteRun: (id: string) => void;
    linkTransactions: (runId: string, transactionIds: string[]) => void;
    setStatus: (runId: string, status: PayrollStatus) => void;
};

const initialRuns: PayrollRun[] = [];

export const usePayrollStore = create<PayrollState>()(
    persist(
        (set, get) => ({
            runs: initialRuns,
            getRun: (id) => get().runs.find((r) => r.id === id),
            addRun: (input) => {
                const now = Date.now();
                const counter = get().runs.length + 1;
                const reference = input.reference?.trim() || formatPayrollReference(new Date(now), counter);
                const run: PayrollRun = {
                    id: createId('pay'),
                    reference,
                    periodStart: input.periodStart,
                    periodEnd: input.periodEnd,
                    status: input.status ?? 'draft',
                    lines: input.lines.map((l) => ({
                        ...l,
                        concept: normalizeLine(l.concept),
                        amount: Math.max(0, Math.round(l.amount)),
                    })),
                    transactionIds: [],
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ runs: [run, ...s.runs] }));
                return run.id;
            },
            updateRun: (input) => {
                const now = Date.now();
                set((s) => ({
                    runs: s.runs.map((r) => {
                        if (r.id !== input.id) return r;
                        const lines = input.lines
                            ? input.lines.map((l) => ({
                                ...l,
                                concept: normalizeLine(l.concept),
                                amount: Math.max(0, Math.round(l.amount)),
                            }))
                            : r.lines;
                        return {
                            ...r,
                            ...input,
                            reference: input.reference != null ? normalizeLine(input.reference) : r.reference,
                            lines,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteRun: (id) => set((s) => ({ runs: s.runs.filter((r) => r.id !== id) })),
            linkTransactions: (runId, transactionIds) => {
                const now = Date.now();
                set((s) => ({
                    runs: s.runs.map((r) => r.id === runId ? { ...r, transactionIds, updatedAt: now } : r),
                }));
            },
            setStatus: (runId, status) => {
                const now = Date.now();
                set((s) => ({
                    runs: s.runs.map((r) => r.id === runId ? { ...r, status, updatedAt: now } : r),
                }));
            },
        }),
        {
            name: 'mototaller_payroll_v1',
            version: 1,
        }
    )
);

export function computePayrollTotal(run: Pick<PayrollRun, 'lines'>) {
    return run.lines.reduce((sum, l) => sum + l.amount, 0);
}

