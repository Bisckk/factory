import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@/types/app.types';

export type StaffStatus = 'active' | 'inactive';

export type StaffMember = {
    id: string;
    fullName: string;
    role: UserRole;
    email: string;
    phone: string;
    documentId: string;
    address?: string;
    status: StaffStatus;
    hourlyRate?: number;
    monthlySalary?: number;
    createdAt: number;
    updatedAt: number;
};

type CreateStaffInput = Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateStaffInput = Partial<Omit<StaffMember, 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initialStaff: StaffMember[] = [
    {
        id: 'stf_1',
        fullName: 'Administrador Garage',
        role: 'admin',
        email: 'admin@garage.com',
        phone: '300 000 0000',
        documentId: '1000000000',
        status: 'active',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        id: 'stf_2',
        fullName: 'Recepción Taller',
        role: 'receptionist',
        email: 'recepcion@taller.com',
        phone: '300 111 2233',
        documentId: '1000000001',
        status: 'active',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: 'stf_3',
        fullName: 'Mecánico Principal',
        role: 'mechanic',
        email: 'mecanico@taller.com',
        phone: '300 222 3344',
        documentId: '1000000002',
        status: 'active',
        hourlyRate: 20000,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        id: 'stf_4',
        fullName: 'Segundo Mecánico',
        role: 'mechanic',
        email: 'mecanico2@taller.com',
        phone: '300 333 4455',
        documentId: '1000000003',
        status: 'active',
        hourlyRate: 18000,
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 18,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
];

type StaffState = {
    staff: StaffMember[];
    getStaff: (id: string) => StaffMember | undefined;
    listByRole: (role: UserRole) => StaffMember[];
    addStaff: (input: CreateStaffInput) => string;
    updateStaff: (input: UpdateStaffInput) => void;
    deleteStaff: (id: string) => void;
    toggleStatus: (id: string) => void;
};

export const useStaffStore = create<StaffState>()(
    persist(
        (set, get) => ({
            staff: initialStaff,
            getStaff: (id) => get().staff.find((s) => s.id === id),
            listByRole: (role) => get().staff.filter((s) => s.role === role && s.status === 'active').slice().sort((a, b) => a.fullName.localeCompare(b.fullName)),
            addStaff: (input) => {
                const id = createId('stf');
                const now = Date.now();
                const member: StaffMember = { ...input, id, createdAt: now, updatedAt: now };
                set((s) => ({ staff: [member, ...s.staff] }));
                return id;
            },
            updateStaff: (input) => {
                const now = Date.now();
                set((s) => ({
                    staff: s.staff.map((m) => {
                        if (m.id !== input.id) return m;
                        return {
                            ...m,
                            ...input,
                            fullName: input.fullName ? input.fullName.trim() : m.fullName,
                            email: input.email ? input.email.trim() : m.email,
                            phone: input.phone ? input.phone.trim() : m.phone,
                            documentId: input.documentId ? input.documentId.trim() : m.documentId,
                            address: input.address != null ? (input.address.trim() || undefined) : m.address,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteStaff: (id) => {
                set((s) => ({ staff: s.staff.filter((m) => m.id !== id) }));
            },
            toggleStatus: (id) => {
                const now = Date.now();
                set((s) => ({
                    staff: s.staff.map((m) => m.id === id ? { ...m, status: m.status === 'active' ? 'inactive' : 'active', updatedAt: now } : m),
                }));
            },
        }),
        {
            name: 'mototaller_staff_v1',
            version: 1,
        }
    )
);

