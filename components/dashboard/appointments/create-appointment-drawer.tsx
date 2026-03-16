'use client';

/**
 * Slide-over drawer for creating a new appointment.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarPlus, Clock, User, Bike, FileText } from 'lucide-react';

interface CreateAppointmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateAppointmentDrawer({ isOpen, onClose }: CreateAppointmentDrawerProps) {
    const [isNewClient, setIsNewClient] = useState(false);

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
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <CalendarPlus className="h-5 w-5 text-red-500" />
                                    Agendar Cita
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Bloquea un espacio de tiempo para un servicio.</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Schedule details */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Fecha y Hora</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Día *</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Hora *</label>
                                        <div className="relative group flex items-center">
                                            <Clock className="absolute left-3 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="time"
                                                className="w-full pl-9 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Client & Vehicle */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Cliente y Vehículo</h3>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Buscar Cliente</label>
                                    <div className="relative group flex items-center">
                                        <User className="absolute left-3 w-4 h-4 text-zinc-600" />
                                        <input
                                            type="text"
                                            placeholder="Nombre, cédula o teléfono..."
                                            className="w-full pl-9 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1 ml-1">Para clientes nuevos, por favor regístralos primero en el Centro de Operaciones.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Placa de la Moto *</label>
                                        <div className="relative group flex items-center">
                                            <Bike className="absolute left-3 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                placeholder="Ej. ABC-123"
                                                className="w-full pl-9 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-mono uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Información de la Cita</h3>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Motivo de Cita / Servicio *</label>
                                    <div className="relative group flex items-start">
                                        <FileText className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                                        <textarea
                                            rows={3}
                                            placeholder="Detalla qué requiere o solicita el cliente..."
                                            className="w-full pl-9 pr-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0">
                            <button
                                type="button"
                                className="w-full flex items-center justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10 transition-all"
                            >
                                Confirmar y Agendar
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
