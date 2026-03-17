import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppointmentStatus = 'pending' | 'confirmed' | 'arrived' | 'cancelled';

export type Appointment = {
    id: string;
    scheduledAt: number;
    clientId: string;
    motorcycleId: string;
    serviceType: string;
    status: AppointmentStatus;
    createdAt: number;
    updatedAt: number;
};

type CreateAppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: AppointmentStatus;
};

type UpdateAppointmentInput = Partial<Omit<Appointment, 'createdAt'>> & { id: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initialAppointments: Appointment[] = [
    {
        id: 'apt_1',
        scheduledAt: new Date().setHours(8, 0, 0, 0),
        clientId: 'c_1',
        motorcycleId: 'm_1',
        serviceType: 'Mantenimiento General',
        status: 'confirmed',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        id: 'apt_2',
        scheduledAt: new Date().setHours(10, 30, 0, 0),
        clientId: 'c_4',
        motorcycleId: 'm_4',
        serviceType: 'Revisión Eléctrica',
        status: 'arrived',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
        id: 'apt_3',
        scheduledAt: new Date().setHours(14, 0, 0, 0),
        clientId: 'c_2',
        motorcycleId: 'm_3',
        serviceType: 'Porteo y Preparación',
        status: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    },
    {
        id: 'apt_4',
        scheduledAt: new Date().setHours(16, 0, 0, 0),
        clientId: 'c_5',
        motorcycleId: 'm_7',
        serviceType: 'Cambio de Aceite',
        status: 'pending',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
        updatedAt: Date.now(),
    },
];

type AppointmentsState = {
    appointments: Appointment[];
    addAppointment: (input: CreateAppointmentInput) => string;
    updateAppointment: (input: UpdateAppointmentInput) => void;
    deleteAppointment: (id: string) => void;
};

export const useAppointmentsStore = create<AppointmentsState>()(
    persist(
        (set) => ({
            appointments: initialAppointments,
            addAppointment: (input) => {
                const id = createId('apt');
                const now = Date.now();
                const appointment: Appointment = {
                    id,
                    scheduledAt: input.scheduledAt,
                    clientId: input.clientId,
                    motorcycleId: input.motorcycleId,
                    serviceType: input.serviceType.trim(),
                    status: input.status ?? 'confirmed',
                    createdAt: now,
                    updatedAt: now,
                };
                set((s) => ({ appointments: [appointment, ...s.appointments] }));
                return id;
            },
            updateAppointment: (input) => {
                const now = Date.now();
                set((s) => ({
                    appointments: s.appointments.map((a) => {
                        if (a.id !== input.id) return a;
                        return {
                            ...a,
                            ...input,
                            serviceType: input.serviceType ? input.serviceType.trim() : a.serviceType,
                            updatedAt: now,
                        };
                    }),
                }));
            },
            deleteAppointment: (id) => {
                set((s) => ({ appointments: s.appointments.filter((a) => a.id !== id) }));
            },
        }),
        {
            name: 'mototaller_appointments_v2',
            version: 2,
        }
    )
);

