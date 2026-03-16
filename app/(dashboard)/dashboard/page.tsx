'use client';

/**
 * Main Dashboard / KPI Page — Dark Theme
 * 
 * - Admin/Owner: Full stats, quick actions, priority orders, agenda
 * - Mechanic: Read-only summary (daily / weekly / monthly)
 * - Receptionist: Operational overview
 */

import { useState } from 'react';
import Link from 'next/link';
import {
    Wrench, ClipboardList, AlertCircle, TrendingUp, CalendarDays,
    Clock, CheckCircle2, Box, DollarSign, Users, Settings,
    Plus, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type TimeRange = 'today' | 'week' | 'month';

export default function DashboardPage() {
    const { user, role } = useAuthStore();
    const [timeRange, setTimeRange] = useState<TimeRange>('today');

    const getGreetingTime = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    // Admin KPIs — vibrant colors on dark backgrounds
    const ADMIN_KPIs = [
        { label: 'Órdenes activas', value: '14', icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Motos listas', value: '5', icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Ingresos del día', value: '$850K', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'Alertas de stock', value: '3', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    ];

    // Mechanic KPIs
    const MECHANIC_KPIs = [
        { label: 'Servicios asignados', value: '3', icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
        { label: 'Completados hoy', value: '1', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
        { label: 'Próxima entrega', value: '2h 30m', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
        { label: 'Agenda pendiente', value: '2', icon: CalendarDays, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ];

    // Admin quick actions
    const QUICK_ACTIONS = [
        {
            label: 'Crear Orden de Servicio',
            description: 'Registrar un nuevo servicio o reparación',
            href: '/dashboard/orders',
            icon: Plus,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-400',
        },
        {
            label: 'Agregar Artículo',
            description: 'Añadir repuesto o producto al inventario',
            href: '/dashboard/inventory',
            icon: Box,
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-400',
        },
        {
            label: 'Agendar Cita',
            description: 'Programar una cita de mantenimiento',
            href: '/dashboard/appointments',
            icon: CalendarDays,
            iconBg: 'bg-emerald-500/10',
            iconColor: 'text-emerald-400',
        },
        {
            label: 'Ver Contabilidad',
            description: 'Revisar ingresos, ventas y estadísticas',
            href: '/dashboard/accounting',
            icon: DollarSign,
            iconBg: 'bg-amber-500/10',
            iconColor: 'text-amber-400',
        },
        {
            label: 'Gestionar Personal',
            description: 'Administrar mecánicos y empleados',
            href: '/dashboard/staff',
            icon: Users,
            iconBg: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
        },
        {
            label: 'Configuración',
            description: 'Ajustes del taller y del sistema',
            href: '/dashboard/settings',
            icon: Settings,
            iconBg: 'bg-zinc-700/50',
            iconColor: 'text-zinc-400',
        },
    ];

    const KPIs = role === 'mechanic' ? MECHANIC_KPIs : ADMIN_KPIs;
    const isAdmin = role === 'admin';
    const isMechanic = role === 'mechanic';

    const timeRangeLabels: Record<TimeRange, string> = {
        today: 'Hoy',
        week: 'Esta semana',
        month: 'Este mes',
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Welcome Hero */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
                        {getGreetingTime()}, {user?.full_name?.split(' ')[0] || 'equipo'}.
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        {isMechanic
                            ? 'Resumen de tu actividad en el taller.'
                            : 'Aquí tienes el resumen operativo del taller para hoy.'
                        }
                    </p>
                </div>
            </header>

            {/* Time Range Selector (for mechanic summary view) */}
            {isMechanic && (
                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
                    {(['today', 'week', 'month'] as TimeRange[]).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
                                timeRange === range
                                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {timeRangeLabels[range]}
                        </button>
                    ))}
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {KPIs.map((kpi, i) => (
                    <motion.div
                        key={kpi.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className={cn(
                            "rounded-xl border p-6 flex items-center justify-between bg-[#141417]",
                            kpi.border
                        )}
                    >
                        <div>
                            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                                {kpi.label}
                            </p>
                            <p className={cn("mt-2 font-mono text-3xl font-bold", kpi.color)}>
                                {kpi.value}
                            </p>
                        </div>
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", kpi.bg)}>
                            <kpi.icon className={cn("h-6 w-6", kpi.color)} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions (Admin only) */}
            {isAdmin && (
                <div className="space-y-4">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {QUICK_ACTIONS.map((action, i) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, delay: 0.4 + i * 0.06 }}
                            >
                                <Link
                                    href={action.href}
                                    className="group rounded-xl border border-zinc-800 bg-[#141417] p-4 flex items-center gap-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200"
                                >
                                    <div className={cn(
                                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                                        action.iconBg
                                    )}>
                                        <action.icon className={cn("h-5 w-5", action.iconColor)} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-zinc-200 group-hover:text-red-400 transition-colors">
                                            {action.label}
                                        </p>
                                        <p className="text-xs text-zinc-600 mt-0.5 truncate">
                                            {action.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-zinc-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all shrink-0" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Orders / Activity */}
                <div className="rounded-xl border border-zinc-800 bg-[#141417] col-span-1 lg:col-span-2 flex flex-col h-96 p-6">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">
                        {isMechanic ? 'Mis servicios recientes' : 'Órdenes prioritarias'}
                    </h2>
                    <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center flex-col p-6 bg-zinc-900/30">
                        <ClipboardList className="h-8 w-8 text-zinc-700 mb-3" />
                        <p className="text-sm font-medium text-zinc-400">
                            {isMechanic ? 'Sin servicios recientes' : 'Todo bajo control'}
                        </p>
                        <p className="text-xs text-zinc-600 mt-1 max-w-[250px] text-center">
                            {isMechanic
                                ? 'No tienes servicios pendientes asignados en este momento.'
                                : 'No hay órdenes en estado crítico o retrasadas en este momento.'
                            }
                        </p>
                    </div>
                </div>

                {/* Schedule List */}
                <div className="rounded-xl border border-zinc-800 bg-[#141417] col-span-1 flex flex-col h-96 p-6">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-6">Agenda de hoy</h2>
                    <div className="flex-1 flex flex-col items-center justify-center opacity-80">
                        <div className="h-16 w-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                            <Wrench className="h-6 w-6 text-zinc-600 rotate-45" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500">Agenda libre</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
