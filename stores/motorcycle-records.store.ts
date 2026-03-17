import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MotorcycleRecordStatus = 'completed' | 'in_progress' | 'pending';

export type MotorcycleRecord = {
    id: string;
    motoId: string;
    occurredAt: number;
    serviceType: string;
    mileage?: number;
    mechanic?: string;
    notes: string;
    status: MotorcycleRecordStatus;
    createdAt: number;
    updatedAt: number;
};

type CreateMotorcycleRecordInput = Omit<MotorcycleRecord, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateMotorcycleRecordInput = Partial<Omit<MotorcycleRecord, 'createdAt' | 'motoId'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initialRecords: MotorcycleRecord[] = [
    {
        id: 'rec_1',
        motoId: 'm_1',
        occurredAt: Date.parse('2024-11-15T10:00:00Z'),
        serviceType: 'Mantenimiento General',
        mileage: 42000,
        mechanic: 'Roberto',
        notes: 'Se realizó cambio de aceite, ajuste de cadena, limpieza de carburador y revisión de frenos. Se recomienda cambio de pastillas en 3,000 km.',
        status: 'completed',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 120,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    },
    {
        id: 'rec_2',
        motoId: 'm_1',
        occurredAt: Date.parse('2024-06-10T14:30:00Z'),
        serviceType: 'Cambio de Llantas',
        mileage: 38500,
        mechanic: 'Carlos',
        notes: 'Instalación de llantas pisteras Michelin Pilot Street, se balancearon los rines.',
        status: 'completed',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 180,
    },
];

type MotorcycleRecordsState = {
    records: MotorcycleRecord[];
    getByMoto: (motoId: string) => MotorcycleRecord[];
    addRecord: (input: CreateMotorcycleRecordInput) => string;
    updateRecord: (input: UpdateMotorcycleRecordInput) => void;
    deleteRecord: (id: string) => void;
};

export const useMotorcycleRecordsStore = create<MotorcycleRecordsState>()(
    persist(
        (set, get) => ({
            records: initialRecords,
            getByMoto: (motoId) => get().records.filter((r) => r.motoId === motoId).slice().sort((a, b) => b.occurredAt - a.occurredAt),
            addRecord: (input) => {
                const id = createId('rec');
                const now = Date.now();
                const record: MotorcycleRecord = { ...input, id, createdAt: now, updatedAt: now };
                set((s) => ({ records: [record, ...s.records] }));
                return id;
            },
            updateRecord: (input) => {
                const now = Date.now();
                set((s) => ({
                    records: s.records.map((r) => {
                        if (r.id !== input.id) return r;
                        return {
                            ...r,
                            ...input,
                            serviceType: input.serviceType ? input.serviceType.trim() : r.serviceType,
                            notes: input.notes != null ? input.notes : r.notes,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteRecord: (id) => {
                set((s) => ({ records: s.records.filter((r) => r.id !== id) }));
            },
        }),
        {
            name: 'mototaller_motorcycle_records_v1',
            version: 1,
        }
    )
);

