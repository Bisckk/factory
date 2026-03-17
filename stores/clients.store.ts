import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MotorcycleImage = {
    id: string;
    dataUrl: string;
};

export type ClientMotorcycle = {
    id: string;
    plate: string;
    brand: string;
    model: string;
    km?: string;
    year?: string;
    color?: string;
    engineCc?: string;
    vin?: string;
    notes?: string;
    images?: MotorcycleImage[];
};

export type Client = {
    id: string;
    name: string;
    phone: string;
    cedula: string;
    email: string;
    registered: string;
    active_orders: number;
    motorcycles: ClientMotorcycle[];
};

type CreateClientInput = Omit<Client, 'id' | 'registered' | 'active_orders' | 'motorcycles'> & {
    registered?: string;
};

type UpdateClientInput = Partial<Omit<Client, 'id' | 'motorcycles'>> & { id: string };

type AddMotorcycleInput = Omit<ClientMotorcycle, 'id'> & { id?: string };

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const initialClients: Client[] = [
    {
        id: 'c_1',
        name: 'Carlos Martínez',
        phone: '300 123 4567',
        cedula: '1020304050',
        email: 'carlos@ejemplo.com',
        registered: '10 Feb 2025',
        active_orders: 3,
        motorcycles: [
            { id: 'm_1', brand: 'Yamaha', model: 'DT 175', plate: 'ABC-123', year: '2021', color: 'Azul', km: '45000', images: [] },
            { id: 'm_2', brand: 'Honda', model: 'XR 150', plate: 'XYZ-987', year: '2020', color: 'Rojo', km: '23100', images: [] },
        ],
    },
    {
        id: 'c_2',
        name: 'Andrea López',
        phone: '310 987 6543',
        cedula: '1098765432',
        email: 'andrea@ejemplo.com',
        registered: '15 Ene 2025',
        active_orders: 1,
        motorcycles: [{ id: 'm_3', brand: 'Pulsar', model: 'NS200', plate: 'QWE-456', year: '2022', color: 'Negro', km: '58000', images: [] }],
    },
    {
        id: 'c_3',
        name: 'Diego Ramírez',
        phone: '320 456 7890',
        cedula: '1076543210',
        email: '-',
        registered: '05 Mar 2025',
        active_orders: 0,
        motorcycles: [],
    },
    {
        id: 'c_4',
        name: 'Sofía Hernández',
        phone: '315 222 3344',
        cedula: '1112223344',
        email: 'sofia@ejemplo.com',
        registered: '20 Feb 2025',
        active_orders: 5,
        motorcycles: [
            { id: 'm_4', brand: 'Suzuki', model: 'AX 100', plate: 'RTY-789', year: '2019', color: 'Plata', km: '12000', images: [] },
            { id: 'm_5', brand: 'KTM', model: 'Duke 200', plate: 'UIO-321', year: '2023', color: 'Naranja', km: '9000', images: [] },
            { id: 'm_6', brand: 'Bajaj', model: 'Boxer CT100', plate: 'PAS-654', year: '2020', color: 'Azul', km: '64000', images: [] },
        ],
    },
    {
        id: 'c_5',
        name: 'Juan Pérez',
        phone: '301 555 6677',
        cedula: '1002003004',
        email: 'juan@ejemplo.com',
        registered: '02 Mar 2025',
        active_orders: 2,
        motorcycles: [{ id: 'm_7', brand: 'Suzuki', model: 'GN 125', plate: 'MOT-777', year: '2018', color: 'Negro', km: '77000', images: [] }],
    },
];

type MotorcycleContext = { client: Client; moto: ClientMotorcycle };

type ClientsState = {
    clients: Client[];
    getClient: (id: string) => Client | undefined;
    getMotorcycle: (motoId: string) => MotorcycleContext | undefined;
    addClient: (input: CreateClientInput) => string;
    updateClient: (input: UpdateClientInput) => void;
    deleteClient: (id: string) => void;
    addMotorcycle: (clientId: string, input: AddMotorcycleInput) => string;
    updateMotorcycle: (clientId: string, motoId: string, input: Partial<ClientMotorcycle>) => void;
    deleteMotorcycle: (clientId: string, motoId: string) => void;
    transferMotorcycle: (motoId: string, toClientId: string) => void;
};

export const useClientsStore = create<ClientsState>()(
    persist(
        (set, get) => ({
            clients: initialClients,
            getClient: (id) => get().clients.find((c) => c.id === id),
            getMotorcycle: (motoId) => {
                for (const client of get().clients) {
                    const moto = client.motorcycles.find((m) => m.id === motoId);
                    if (moto) return { client, moto };
                }
                return undefined;
            },
            addClient: (input) => {
                const id = createId('c');
                const registered = input.registered ?? new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
                set((s) => ({
                    clients: [
                        { id, registered, active_orders: 0, motorcycles: [], ...input },
                        ...s.clients,
                    ],
                }));
                return id;
            },
            updateClient: (input) => {
                set((s) => ({
                    clients: s.clients.map((c) => (c.id === input.id ? { ...c, ...input } : c)),
                }));
            },
            deleteClient: (id) => {
                set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
            },
            addMotorcycle: (clientId, input) => {
                const motoId = input.id ?? createId('m');
                set((s) => ({
                    clients: s.clients.map((c) =>
                        c.id === clientId
                            ? {
                                ...c,
                                motorcycles: [
                                    ...c.motorcycles,
                                    { id: motoId, images: input.images ?? [], ...input, plate: input.plate.trim().toUpperCase() },
                                ],
                            }
                            : c
                    ),
                }));
                return motoId;
            },
            updateMotorcycle: (clientId, motoId, input) => {
                set((s) => ({
                    clients: s.clients.map((c) =>
                        c.id === clientId
                            ? {
                                ...c,
                                motorcycles: c.motorcycles.map((m) =>
                                    m.id === motoId
                                        ? {
                                            ...m,
                                            ...input,
                                            plate: input.plate ? input.plate.trim().toUpperCase() : m.plate,
                                        }
                                        : m
                                ),
                            }
                            : c
                    ),
                }));
            },
            deleteMotorcycle: (clientId, motoId) => {
                set((s) => ({
                    clients: s.clients.map((c) =>
                        c.id === clientId
                            ? { ...c, motorcycles: c.motorcycles.filter((m) => m.id !== motoId) }
                            : c
                    ),
                }));
            },
            transferMotorcycle: (motoId, toClientId) => {
                const ctx = get().getMotorcycle(motoId);
                if (!ctx) return;
                const fromClientId = ctx.client.id;
                if (fromClientId === toClientId) return;
                set((s) => {
                    const fromClient = s.clients.find((c) => c.id === fromClientId);
                    const toClient = s.clients.find((c) => c.id === toClientId);
                    if (!fromClient || !toClient) return s;
                    const moto = fromClient.motorcycles.find((m) => m.id === motoId);
                    if (!moto) return s;
                    return {
                        clients: s.clients.map((c) => {
                            if (c.id === fromClientId) {
                                return { ...c, motorcycles: c.motorcycles.filter((m) => m.id !== motoId) };
                            }
                            if (c.id === toClientId) {
                                return { ...c, motorcycles: [...c.motorcycles, moto] };
                            }
                            return c;
                        }),
                    };
                });
            },
        }),
        {
            name: 'mototaller_clients_v1',
            version: 1,
        }
    )
);
