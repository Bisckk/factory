'use client';

/**
 * Slide-over drawer for viewing and editing client details.
 * Allows managing client personal information and viewing/adding their registered motorcycles.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Bike, Save, Calendar, Wrench, Edit3, Plus } from 'lucide-react';

interface ClientDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string | null;
}

export function ClientDetailDrawer({ isOpen, onClose, clientId }: ClientDetailDrawerProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Mock client data (this would come from a query using clientId)
    const client = {
        name: 'Carlos Martínez',
        phone: '300 123 4567',
        cedula: '1020304050',
        email: 'carlos@ejemplo.com',
        registered: '10 Feb 2025',
        motorcycles: [
            { id: 'm_1', brand: 'Yamaha', model: 'DT 175', plate: 'ABC-123' },
            { id: 'm_2', brand: 'Honda', model: 'XR 150', plate: 'XYZ-987' }
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
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <User className="h-5 w-5 text-red-500" />
                                    Perfil del Cliente
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">ID: {clientId}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                </button>
                                <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-300 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Personal Info */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Información Personal</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre Completo</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                defaultValue={client.name}
                                                readOnly={!isEditing}
                                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium disabled:opacity-50 read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:pl-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Teléfono</label>
                                            <div className="relative group flex items-center">
                                                {!isEditing && <Phone className="h-4 w-4 text-zinc-600 mr-2" />}
                                                <input
                                                    type="tel"
                                                    defaultValue={client.phone}
                                                    readOnly={!isEditing}
                                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cédula</label>
                                            <input
                                                type="text"
                                                defaultValue={client.cedula}
                                                readOnly={!isEditing}
                                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Correo Electrónico</label>
                                        <div className="relative group flex items-center">
                                            {!isEditing && <Mail className="h-4 w-4 text-zinc-600 mr-2" />}
                                            <input
                                                type="email"
                                                defaultValue={client.email}
                                                readOnly={!isEditing}
                                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {isEditing && (
                                    <button
                                        type="button"
                                        className="w-full flex justify-center py-3 mt-4 rounded-xl text-xs font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10 transition-all"
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                                    </button>
                                )}
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Motocicletas Registradas</h3>
                                    <button className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                                        <Plus className="h-3 w-3" /> Agregar Moto
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {client.motorcycles.map((moto) => (
                                        <div key={moto.id} className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-[#141417] border border-zinc-800 rounded-lg flex items-center justify-center">
                                                    <Bike className="h-5 w-5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-200">{moto.brand} {moto.model}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] uppercase tracking-widest font-mono font-bold bg-[#141417] text-amber-500 px-2 rounded-sm border border-zinc-800">{moto.plate}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-zinc-500 hover:text-zinc-200 transition-colors">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Resumen de Actividad</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                                        <Wrench className="h-6 w-6 text-zinc-600 mb-2" />
                                        <p className="text-xs text-zinc-400 font-medium">Órdenes Totales</p>
                                        <p className="text-lg font-bold text-zinc-200 mt-1">5</p>
                                    </div>
                                    <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                                        <Calendar className="h-6 w-6 text-zinc-600 mb-2" />
                                        <p className="text-xs text-zinc-400 font-medium">Cliente Desde</p>
                                        <p className="text-[10px] font-bold uppercase text-zinc-200 mt-2">{client.registered}</p>
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
