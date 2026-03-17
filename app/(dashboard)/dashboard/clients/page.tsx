'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Hash, Phone, User, Plus, X, Check, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useClientsStore } from '@/stores/clients.store';
import { ClientDetailDrawer } from '@/components/dashboard/clients/client-detail-drawer';
import { CreateClientDrawer } from '@/components/dashboard/clients/create-client-drawer';

type OrderCountRange = '0' | '1' | '2-3' | '4+';

const ORDER_COUNT_OPTIONS: { value: OrderCountRange; label: string; color: string }[] = [
    { value: '0', label: 'Sin órdenes', color: 'bg-zinc-800 text-zinc-400 border border-zinc-700' },
    { value: '1', label: '1 orden', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
    { value: '2-3', label: '2–3 órdenes', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    { value: '4+', label: '4+ órdenes', color: 'bg-red-500/10 text-red-400 border border-red-500/20' },
];

function matchesOrderCount(count: number, range: OrderCountRange) {
    switch (range) {
        case '0':
            return count === 0;
        case '1':
            return count === 1;
        case '2-3':
            return count >= 2 && count <= 3;
        case '4+':
            return count >= 4;
    }
}

export default function ClientsPage() {
    const { role } = useAuthStore();
    const clients = useClientsStore((s) => s.clients);

    const [search, setSearch] = useState('');
    const [orderCountFilters, setOrderCountFilters] = useState<OrderCountRange[]>([]);
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

    const canCreate = role === 'admin' || role === 'receptionist';

    const filteredClients = useMemo(() => {
        return clients.filter((client) => {
            if (orderCountFilters.length > 0 && !orderCountFilters.some((r) => matchesOrderCount(client.active_orders, r))) {
                return false;
            }
            if (search) {
                const query = search.toLowerCase();
                return client.name.toLowerCase().includes(query) || client.phone.includes(query) || client.cedula.includes(query);
            }
            return true;
        });
    }, [clients, orderCountFilters, search]);

    const stats = useMemo(() => {
        const total = clients.length;
        const activeOrders = clients.reduce((acc, c) => acc + c.active_orders, 0);
        const withActive = clients.filter((c) => c.active_orders > 0).length;
        const highLoad = clients.filter((c) => c.active_orders >= 4).length;
        const noOrders = clients.filter((c) => c.active_orders === 0).length;
        return { total, activeOrders, withActive, highLoad, noOrders };
    }, [clients]);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                            Clientes
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Base central de clientes del taller. Gestiona perfiles y motos registradas.
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nuevo Cliente
                    </button>
                )}
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.total}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Órdenes Activas</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.activeOrders}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Con Actividad</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.withActive}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Alta Carga (4+)</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.highLoad}</p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-[#141417]">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sin Órdenes</p>
                    <p className="mt-2 text-2xl font-black text-zinc-100">{stats.noOrders}</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden"
            >
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-zinc-800 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Buscar por cédula, teléfono o nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors shrink-0">
                                <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-zinc-500" />
                                    Filtrar Órdenes {orderCountFilters.length > 0 && <span className="text-zinc-500 font-bold">({orderCountFilters.length})</span>}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[260px] bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl p-2 shadow-xl">
                                <div className="px-2 py-1.5 mb-1 flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Nº de Órdenes</span>
                                    {orderCountFilters.length > 0 && (
                                        <button onClick={() => setOrderCountFilters([])} className="text-[10px] text-zinc-400 hover:text-red-400 uppercase tracking-widest font-bold transition-colors">Limpiar</button>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    {ORDER_COUNT_OPTIONS.map((opt) => {
                                        const isSelected = orderCountFilters.includes(opt.value);
                                        const textColMatch = opt.color.match(/text-([a-z]+-[0-9]+)/);
                                        const textCol = textColMatch ? textColMatch[0] : 'text-zinc-400';
                                        const activeContainerClass = opt.color.replace(/\/10/g, '/40').replace(/\/20/g, '/50');

                                        return (
                                            <DropdownMenuItem
                                                key={opt.value}
                                                closeOnClick={false}
                                                onClick={() => {
                                                    setOrderCountFilters((prev) =>
                                                        isSelected ? prev.filter((v) => v !== opt.value) : [...prev, opt.value]
                                                    );
                                                }}
                                                className={cn(
                                                    'flex items-center justify-between w-full cursor-pointer rounded-lg py-2.5 px-3 outline-none transition-all my-px border',
                                                    isSelected ? activeContainerClass : cn('border-transparent hover:bg-zinc-800/40 opacity-70 hover:opacity-100', textCol)
                                                )}
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                                    <span className="font-semibold text-sm tracking-wide">{opt.label}</span>
                                                </div>
                                                {isSelected && (
                                                    <div className="flex items-center justify-center p-0.5 mr-1 text-current">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div
                    className="grid transition-all duration-300 ease-in-out border-b border-zinc-800"
                    style={{
                        gridTemplateRows: orderCountFilters.length > 0 ? '1fr' : '0fr',
                        opacity: orderCountFilters.length > 0 ? 1 : 0,
                        borderBottomWidth: orderCountFilters.length > 0 ? 1 : 0,
                    }}
                >
                    <div className="overflow-hidden">
                        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/30">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 shrink-0">
                                Filtros activos
                            </span>
                            <div className="h-4 w-px bg-zinc-800 shrink-0" />
                            <div className="flex items-center flex-wrap gap-2">
                                {orderCountFilters.map((range) => {
                                    const opt = ORDER_COUNT_OPTIONS.find((o) => o.value === range)!;
                                    return (
                                        <button
                                            key={range}
                                            onClick={() => setOrderCountFilters((prev) => prev.filter((v) => v !== range))}
                                            className={cn(
                                                'group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:brightness-125',
                                                opt.color
                                            )}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                            {opt.label}
                                            <X className="h-3 w-3 ml-0.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setOrderCountFilters([])}
                                className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                            >
                                Limpiar todos
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3 md:hidden">
                    {filteredClients.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
                            <User className="h-8 w-8 text-zinc-700 mb-3 mx-auto" />
                            <p className="text-sm font-medium text-zinc-500">No se encontraron clientes</p>
                        </div>
                    ) : (
                        filteredClients.map((client) => (
                            <button
                                key={client.id}
                                onClick={() => {
                                    setSelectedClientId(client.id);
                                    setIsClientDrawerOpen(true);
                                }}
                                className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-800/30 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-extrabold text-zinc-200 truncate">{client.name}</p>
                                        <p className="text-[10px] text-zinc-600 mt-1 font-mono">C.C. {client.cedula}</p>
                                    </div>
                                    <span
                                        className={cn(
                                            'inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full font-extrabold border text-[11px]',
                                            client.active_orders === 0
                                                ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                : client.active_orders >= 4
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                    : client.active_orders >= 2
                                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                        )}
                                        title="Órdenes activas"
                                    >
                                        {client.active_orders}
                                    </span>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                        <Phone className="h-3.5 w-3.5" /> {client.phone}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-600">
                                        {client.motorcycles.length} moto{client.motorcycles.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Cliente</th>
                                <th className="px-6 py-4 font-semibold">Contacto</th>
                                <th className="px-6 py-4 font-semibold border-x border-zinc-800/50 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Wrench className="h-3.5 w-3.5" />
                                        Órdenes
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-semibold">Registro</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <User className="h-8 w-8 text-zinc-700 mb-3 mx-auto" />
                                        <p className="text-sm font-medium text-zinc-500">No se encontraron clientes</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client, i) => (
                                    <motion.tr
                                        key={client.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="group hover:bg-zinc-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-4 font-bold text-zinc-200">
                                            {client.name}
                                            <div className="text-[10px] text-zinc-600 mt-1 font-mono">C.C. {client.cedula}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                    <Phone className="h-3 w-3" /> {client.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 border-x border-zinc-800/50 text-center">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center justify-center h-6 w-6 rounded-full font-bold border',
                                                    client.active_orders === 0
                                                        ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                        : client.active_orders >= 4
                                                            ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                            : client.active_orders >= 2
                                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                )}
                                            >
                                                {client.active_orders}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs font-semibold">{client.registered}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedClientId(client.id);
                                                    setIsClientDrawerOpen(true);
                                                }}
                                                className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 hover:text-zinc-100 transition-colors py-1.5 px-3 border border-zinc-800 rounded-lg hover:bg-zinc-800"
                                            >
                                                Ver Perfil
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <ClientDetailDrawer
                isOpen={isClientDrawerOpen}
                onClose={() => setIsClientDrawerOpen(false)}
                clientId={selectedClientId}
            />

            <CreateClientDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onCreated={(clientId) => {
                    setSelectedClientId(clientId);
                    setIsClientDrawerOpen(true);
                }}
            />
        </div>
    );
}
