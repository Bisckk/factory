'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, User, Phone, Mail, IdCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useClientsStore } from '@/stores/clients.store';

type CreateClientDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: (clientId: string) => void;
};

export function CreateClientDrawer({ isOpen, onClose, onCreated }: CreateClientDrawerProps) {
    const addClient = useClientsStore((s) => s.addClient);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        cedula: '',
        email: '',
    });

    const canSubmit = useMemo(() => {
        return Boolean(form.name.trim() && form.phone.trim() && form.cedula.trim());
    }, [form]);

    const reset = () => {
        setForm({ name: '', phone: '', cedula: '', email: '' });
    };

    const handleClose = () => {
        onClose();
        setTimeout(reset, 250);
    };

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
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
                                    <UserPlus className="h-5 w-5 text-red-500" />
                                    Nuevo Cliente
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">
                                    Registra un cliente para órdenes, citas y contabilidad.
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                    Nombre Completo *
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        placeholder="Ej. Juan Pérez"
                                        className={cn(inputClass, 'pl-11')}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                        Teléfono *
                                    </label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            value={form.phone}
                                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                            placeholder="300 000 0000"
                                            className={cn(inputClass, 'pl-11')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                        Cédula *
                                    </label>
                                    <div className="relative group">
                                        <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                        <input
                                            value={form.cedula}
                                            onChange={(e) => setForm((p) => ({ ...p, cedula: e.target.value }))}
                                            placeholder="1020304050"
                                            className={cn(inputClass, 'pl-11 font-mono')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                    Correo (opcional)
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        value={form.email}
                                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                        placeholder="correo@ejemplo.com"
                                        className={cn(inputClass, 'pl-11')}
                                    />
                                </div>
                            </div>

                            <div className="text-[10px] text-zinc-600">
                                Los clientes nuevos se registran aquí. En Órdenes solo se seleccionan clientes existentes.
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0">
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (!canSubmit) {
                                        toast.error('Completa nombre, teléfono y cédula.');
                                        return;
                                    }
                                    const clientId = addClient({
                                        name: form.name.trim(),
                                        phone: form.phone.trim(),
                                        cedula: form.cedula.trim(),
                                        email: form.email.trim() || '-',
                                    });
                                    toast.success('Cliente registrado.', {
                                        description: 'Ya puedes crear órdenes y asociar motos.',
                                    });
                                    onCreated?.(clientId);
                                    handleClose();
                                }}
                                className={cn(
                                    'w-full flex justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                    canSubmit
                                        ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                        : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                )}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Crear Cliente
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

