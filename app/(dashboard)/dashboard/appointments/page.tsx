'use client';

/**
 * Appointments & Agenda — Dark Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { format, addDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreateAppointmentDrawer } from '@/components/dashboard/appointments/create-appointment-drawer';

export default function AppointmentsPage() {
    const { role } = useAuthStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

    const isMechanic = role === 'mechanic';
    const canCreate = role === 'admin' || role === 'receptionist';

    const MOCK_APPOINTMENTS = [
        { time: "08:00 AM", type: "Mantenimiento General", client: "Carlos Martínez", moto: "Yamaha DT 175", status: "confirmed" },
        { time: "10:30 AM", type: "Revisión Eléctrica", client: "Valentina Torres", moto: "Honda CBR 250", status: "arrived" },
        { time: "02:00 PM", type: "Porteo y Preparación", client: "Miguel Hernández", moto: "Kawasaki KX 250", status: "pending" },
    ];

    const renderMiniCalendar = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(start, i);
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const isSelected = format(date, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
            return (
                <button key={i} onClick={() => setCurrentDate(date)}
                    className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200",
                        isSelected
                            ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20 transform scale-105"
                            : (isToday ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700")
                    )}>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">{format(date, "EEE", { locale: es })}</span>
                    <span className={cn("font-mono text-xl font-bold", isSelected ? "text-white" : "text-zinc-200")}>{format(date, "dd")}</span>
                </button>
            );
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">
                            {isMechanic ? 'Mi Agenda' : 'Agenda del Taller'}
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        {isMechanic ? 'Citas y servicios asignados a ti para el día.' : 'Administra citas programadas y controla el flujo de recepción.'}
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsCreateDrawerOpen(true)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Agendar Cita
                    </button>
                )}
            </header>

            {/* Calendar Strip */}
            <div className="rounded-xl border border-zinc-800 bg-[#141417] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 border-r border-zinc-800 pr-6">
                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-500 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="text-center min-w-[140px]">
                        <p className="text-lg font-bold text-zinc-100 capitalize leading-none">{format(currentDate, "MMMM", { locale: es })}</p>
                        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mt-1">{format(currentDate, "yyyy")}</p>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-500 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-7 gap-2">{renderMiniCalendar()}</div>
            </div>

            {/* Daily Schedule */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                        Citas para el {format(currentDate, "dd 'de' MMMM", { locale: es })}
                    </h2>
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-600">{MOCK_APPOINTMENTS.length} Citas</span>
                </div>

                <div className="space-y-3 relative">
                    <div className="absolute left-[88px] top-6 bottom-6 w-px border-l-2 border-dashed border-zinc-800 -z-10" />
                    {MOCK_APPOINTMENTS.map((apt, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 group">
                            <div className="w-[64px] shrink-0 text-right pt-4">
                                <span className="font-mono text-xs font-bold text-zinc-400 block leading-none">{apt.time.split(' ')[0]}</span>
                                <span className="font-mono text-[10px] text-zinc-600 uppercase">{apt.time.split(' ')[1]}</span>
                            </div>
                            <div className="pt-4 relative flex items-center justify-center w-6">
                                <span className={cn(
                                    "h-3 w-3 rounded-full border-2 border-[#0A0A0B] absolute shadow-sm transition-transform group-hover:scale-125",
                                    apt.status === 'arrived' ? 'bg-emerald-500' : apt.status === 'confirmed' ? 'bg-blue-500' : 'bg-zinc-600'
                                )} />
                            </div>
                            <div className="flex-1 rounded-xl border border-zinc-800 bg-[#141417] p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:border-zinc-700 transition-colors cursor-pointer">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-zinc-200">{apt.type}</p>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {apt.client}</span>
                                        <span className="flex items-center gap-1 font-semibold border-l border-zinc-800 pl-3"><span className="text-amber-400 font-mono tracking-widest uppercase">{apt.moto}</span></span>
                                    </div>
                                </div>
                                <span className={cn(
                                    "mt-3 sm:mt-0 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full",
                                    apt.status === 'confirmed' ? "bg-blue-500/10 text-blue-400" :
                                        apt.status === 'arrived' ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"
                                )}>
                                    {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'arrived' ? 'En Taller' : 'Pendiente'}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <CreateAppointmentDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
            />
        </div >
    );
}
