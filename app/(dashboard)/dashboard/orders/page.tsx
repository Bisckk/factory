'use client';

/**
 * Service Orders List View — Dark Theme
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, ClipboardList, Filter, Search, Plus, MoreHorizontal, Clock, Eye, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from '@/types/app.types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CreateOrderDrawer } from '@/components/dashboard/orders/create-order-drawer';

type DeliveryFilter = 'all' | 'today' | 'this_week' | 'overdue';

export default function OrdersPage() {
    const { role } = useAuthStore();
    const [search, setSearch] = useState('');
    const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>('all');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isMechanic = role === 'mechanic';
    const canCreate = role === 'admin' || role === 'receptionist';

    const MOCK_ORDERS = [
        {
            id: "ord_1", order_number: "ORD-2025-0001", status: "in_repair" as OrderStatus,
            client: "Carlos Martínez", motorcycle: "Yamaha DT 175 (Placa: ABC-123)",
            mechanic: "Mecánico Principal", created_at: "10 Mar 2025",
            delivery_date: "Hoy", delivery_urgency: "today" as DeliveryFilter,
        },
        {
            id: "ord_2", order_number: "ORD-2025-0002", status: "diagnosing" as OrderStatus,
            client: "Andrea López", motorcycle: "Pulsar NS200 (Placa: XYZ-987)",
            mechanic: "Mecánico Principal", created_at: "12 Mar 2025",
            delivery_date: "18 Mar 2025", delivery_urgency: "this_week" as DeliveryFilter,
        },
        {
            id: "ord_3", order_number: "ORD-2025-0003", status: "ready" as OrderStatus,
            client: "Diego Ramírez", motorcycle: "Suzuki AX 100 (Placa: QWE-456)",
            mechanic: "Juan Pérez", created_at: "08 Mar 2025",
            delivery_date: "Atrasada", delivery_urgency: "overdue" as DeliveryFilter,
        }
    ];

    const [statusFilters, setStatusFilters] = useState<OrderStatus[]>([]);

    const filteredOrders = MOCK_ORDERS.filter((order) => {
        if (isMechanic && order.mechanic !== 'Mecánico Principal') return false;
        if (deliveryFilter !== 'all' && order.delivery_urgency !== deliveryFilter) return false;
        if (statusFilters.length > 0 && !statusFilters.includes(order.status)) return false;
        if (search) {
            const query = search.toLowerCase();
            return (
                order.order_number.toLowerCase().includes(query) ||
                order.client.toLowerCase().includes(query) ||
                order.motorcycle.toLowerCase().includes(query)
            );
        }
        return true;
    });

    const deliveryFilters: { value: DeliveryFilter; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'overdue', label: 'Atrasados' },
        { value: 'today', label: 'Entrega hoy' },
        { value: 'this_week', label: 'Esta semana' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        {isMechanic
                            ? <Wrench className="h-5 w-5 text-zinc-500" />
                            : <ClipboardList className="h-5 w-5 text-zinc-500" />
                        }
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                            {isMechanic ? 'Mis Servicios Activos' : 'Centro de Operaciones'}
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        {isMechanic
                            ? 'Servicios asignados a ti. Actualiza el estado y documenta el progreso.'
                            : 'Gestiona los servicios activos e históricos del taller.'
                        }
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nueva Orden
                    </button>
                )}
            </header>

            <AnimatePresence mode="wait">
                <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {/* Delivery Time Filter */}
                        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
                            {deliveryFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setDeliveryFilter(filter.value)}
                                    className={cn(
                                        "px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                                        deliveryFilter === filter.value
                                            ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-300"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-zinc-800 gap-4">
                                <div className="relative w-full sm:max-w-xs">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        placeholder={isMechanic ? "Buscar por placa..." : "Buscar por cliente, placa o ID..."}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="inline-flex h-10 items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm font-medium text-zinc-300 hover:bg-zinc-800 focus:border-zinc-700 focus:outline-none transition-colors shrink-0">
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-4 w-4 text-zinc-500" />
                                                Filtrar Estados {statusFilters.length > 0 && <span className="text-zinc-500 font-bold">({statusFilters.length})</span>}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[260px] bg-[#141417] border-zinc-800 text-zinc-200 rounded-xl p-2 shadow-xl">
                                            <div className="px-2 py-1.5 mb-1 flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Filtro de Estados</span>
                                                {statusFilters.length > 0 && (
                                                    <button onClick={() => setStatusFilters([])} className="text-[10px] text-zinc-400 hover:text-red-400 uppercase tracking-widest font-bold transition-colors">Limpiar</button>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => {
                                                    const status = key as OrderStatus;
                                                    const isSelected = statusFilters.includes(status);
                                                    const colorClass = ORDER_STATUS_COLORS[status];

                                                    const textColMatch = colorClass.match(/text-([a-z]+-[0-9]+)/);
                                                    const textCol = textColMatch ? textColMatch[0] : 'text-zinc-400';
                                                    const activeContainerClass = colorClass.replace(/\/10/g, '/40').replace(/\/20/g, '/50');

                                                    return (
                                                        <DropdownMenuItem
                                                            key={key}
                                                            closeOnClick={false}
                                                            onClick={() => {
                                                                setStatusFilters(prev =>
                                                                    isSelected ? prev.filter(s => s !== status) : [...prev, status]
                                                                );
                                                            }}
                                                            className={cn(
                                                                "flex items-center justify-between w-full cursor-pointer rounded-lg py-2.5 px-3 outline-none transition-all my-px border",
                                                                isSelected
                                                                    ? activeContainerClass
                                                                    : cn("border-transparent hover:bg-zinc-800/40 opacity-70 hover:opacity-100", textCol)
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                                                <span className="font-semibold text-sm tracking-wide">{label}</span>
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

                            {/* Active Filters Bar — appears above the table when filters are selected */}
                            <div
                                className="grid transition-all duration-300 ease-in-out border-b border-zinc-800"
                                style={{
                                    gridTemplateRows: statusFilters.length > 0 ? '1fr' : '0fr',
                                    opacity: statusFilters.length > 0 ? 1 : 0,
                                    borderBottomWidth: statusFilters.length > 0 ? 1 : 0,
                                }}
                            >
                                <div className="overflow-hidden">
                                    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/30">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 shrink-0">
                                            Filtros activos
                                        </span>
                                        <div className="h-4 w-px bg-zinc-800 shrink-0" />
                                        <div className="flex items-center flex-wrap gap-2">
                                            {statusFilters.map((status) => {
                                                const colorClass = ORDER_STATUS_COLORS[status];
                                                return (
                                                    <button
                                                        key={status}
                                                        onClick={() => setStatusFilters(prev => prev.filter(s => s !== status))}
                                                        className={cn(
                                                            "group inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold tracking-wide cursor-pointer transition-all duration-200 hover:brightness-125",
                                                            colorClass
                                                        )}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                                        {ORDER_STATUS_LABELS[status]}
                                                        <X className="h-3 w-3 ml-0.5 opacity-50 group-hover:opacity-100 transition-opacity" strokeWidth={2.5} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setStatusFilters([])}
                                            className="ml-auto text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                                        >
                                            Limpiar todos
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Orden</th>
                                            <th className="px-6 py-4 font-semibold">Estado</th>
                                            <th className="px-6 py-4 font-semibold">Cliente</th>
                                            <th className="px-6 py-4 font-semibold">Moto</th>
                                            <th className="px-6 py-4 font-semibold"><div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Entrega</div></th>
                                            {!isMechanic && <th className="px-6 py-4 font-semibold">Mecánico</th>}
                                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {filteredOrders.length === 0 ? (
                                            <tr><td colSpan={isMechanic ? 6 : 7} className="px-6 py-16 text-center">
                                                <Wrench className="h-8 w-8 text-zinc-700 mb-3 mx-auto" />
                                                <p className="text-sm font-medium text-zinc-500">No se encontraron servicios</p>
                                            </td></tr>
                                        ) : (
                                            filteredOrders.map((order, i) => (
                                                <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                                    className="group hover:bg-zinc-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-mono text-xs font-bold text-zinc-200">{order.order_number}</div>
                                                        <div className="text-[10px] text-zinc-600 mt-0.5">{order.created_at}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide", ORDER_STATUS_COLORS[order.status])}>
                                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                            {ORDER_STATUS_LABELS[order.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-zinc-200">{order.client}</td>
                                                    <td className="px-6 py-4 text-zinc-400">{order.motorcycle}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("text-xs font-semibold",
                                                            order.delivery_urgency === 'overdue' ? "text-red-400" :
                                                                order.delivery_urgency === 'today' ? "text-amber-400" : "text-zinc-400"
                                                        )}>{order.delivery_date}</span>
                                                    </td>
                                                    {!isMechanic && (
                                                        <td className="px-6 py-4">
                                                            <span className={cn("text-xs", order.mechanic === 'Sin asignar' ? "text-red-400 font-semibold italic" : "text-zinc-400")}>{order.mechanic}</span>
                                                        </td>
                                                    )}
                                                    <td className="px-6 py-4 text-right">
                                                        {isMechanic ? (
                                                            <button className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-md transition-colors">
                                                                <Eye className="h-3 w-3" /> Ver detalle
                                                            </button>
                                                        ) : (
                                                            <button className="p-2 text-zinc-600 hover:text-zinc-200 rounded-lg hover:bg-zinc-800 transition-colors">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                </motion.div>
            </AnimatePresence>

            <CreateOrderDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </div>
    );
}
