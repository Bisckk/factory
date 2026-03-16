'use client';

/**
 * Slide-over drawer to view the complete clinical history of a motorcycle.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Bike, User, Activity, Calendar, Wrench, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MotorcycleDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    motoId: string | null;
}

export function MotorcycleDetailDrawer({ isOpen, onClose, motoId }: MotorcycleDetailDrawerProps) {

    // Mock Moto Document Data
    const motoData = {
        plate: 'ABC-123',
        brand: 'Yamaha',
        model: 'DT 175',
        year: 2021,
        color: 'Azul',
        mileage: 45000,
        client: 'Carlos Martínez',
        clientPhone: '300 123 4567',
        history: [
            {
                id: 'h_1',
                date: '2024-11-15T10:00:00Z',
                type: 'Mantenimiento General',
                mileage: 42000,
                mechanic: 'Roberto',
                notes: 'Se realizó cambio de aceite, ajuste de cadena, limpieza de carburador y revisión de frenos. Se recomienda cambio de pastillas en 3,000 km.',
                status: 'Completado'
            },
            {
                id: 'h_2',
                date: '2024-06-10T14:30:00Z',
                type: 'Cambio de Llantas',
                mileage: 38500,
                mechanic: 'Carlos',
                notes: 'Instalación de llantas pisteras Michelin Pilot Street, se balancearon los rines.',
                status: 'Completado'
            }
        ]
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    Historia Clínica
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Expediente completo y registro de mantenimientos.</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Header Vehicle Info */}
                            <div className="flex items-start gap-5">
                                <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shrink-0">
                                    <Bike className="h-8 w-8 text-zinc-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-zinc-100">{motoData.brand} {motoData.model}</h3>
                                        <span className="inline-flex items-center justify-center rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-sm font-bold text-yellow-500 tracking-widest">
                                            {motoData.plate}
                                        </span>
                                    </div>
                                    <p className="text-zinc-500 text-sm font-medium mt-1">Modelo {motoData.year} • Color {motoData.color}</p>
                                </div>
                            </div>

                            {/* Indicators */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                        <User className="h-4 w-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Propietario</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-200">{motoData.client}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{motoData.clientPhone}</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                        <Activity className="h-4 w-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Kilometraje Actual</span>
                                    </div>
                                    <p className="text-sm font-bold font-mono text-zinc-200">{motoData.mileage.toLocaleString('es-CO')} km</p>
                                </div>
                            </div>

                            {/* Service Timeline */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Línea de Vida</h3>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                                        {motoData.history.length} Registros
                                    </span>
                                </div>

                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">

                                    {motoData.history.map((record, idx) => (
                                        <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Timeline dot */}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#141417] text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-red-500/10 group-hover:text-red-500 group-hover:border-red-500/20">
                                                <Wrench className="w-3.5 h-3.5" />
                                            </div>

                                            {/* Card */}
                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 shadow-sm transition-colors group-hover:border-zinc-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 px-2 py-1 rounded-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(record.date), "MMM yyyy", { locale: es })}
                                                    </span>
                                                    <span className="text-xs font-mono text-zinc-500">{record.mileage.toLocaleString('es-CO')} km</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-200 mb-1">{record.type}</h4>
                                                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                                    {record.notes}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                                    <User className="h-3 w-3" /> Mecánico: {record.mechanic}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Beginning of time */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#141417] text-zinc-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] text-xs font-medium text-zinc-600 text-center md:text-left md:group-even:pr-4 md:group-odd:pl-4">
                                            Inicio de registros en el sistema.
                                        </div>
                                    </div>

                                </div>
                            </section>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
