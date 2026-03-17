'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Mail, Shield, Hash, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { USER_ROLE_LABELS, type UserRole } from '@/types/app.types';
import { useStaffStore } from '@/stores/staff.store';

interface CreateStaffDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateStaffDrawer({ isOpen, onClose }: CreateStaffDrawerProps) {
    const rolesToCreate: UserRole[] = ['mechanic', 'receptionist', 'admin'];
    const addStaff = useStaffStore((s) => s.addStaff);

    const [form, setForm] = useState({
        fullName: '',
        documentId: '',
        phone: '',
        address: '',
        email: '',
        role: 'mechanic' as UserRole,
    });

    const canSubmit = useMemo(() => {
        return Boolean(
            form.fullName.trim() &&
            form.documentId.trim() &&
            form.phone.trim() &&
            form.email.trim() &&
            form.role
        );
    }, [form]);

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setForm({ fullName: '', documentId: '', phone: '', address: '', email: '', role: 'mechanic' });
        }, 250);
    };

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
                                    Nuevo Empleado
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Registra personal y asigna roles de acceso.</p>
                            </div>
                            <button onClick={handleClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            <section className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        placeholder="Ej. Roberto Sánchez"
                                        value={form.fullName}
                                        onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Documento *</label>
                                        <div className="relative group flex items-center">
                                            <Hash className="absolute left-4 h-4 w-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                placeholder="Ej. 10203040"
                                                value={form.documentId}
                                                onChange={(e) => setForm((p) => ({ ...p, documentId: e.target.value }))}
                                                className={cn(inputClass, 'pl-10 pr-4 font-mono')}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Teléfono / Celular *</label>
                                        <div className="relative group flex items-center">
                                            <Phone className="absolute left-4 h-4 w-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                placeholder="Ej. 300 123 4567"
                                                value={form.phone}
                                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                                className={cn(inputClass, 'pl-10 pr-4')}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Dirección de Residencia</label>
                                    <div className="relative group flex items-center">
                                        <MapPin className="absolute left-4 h-4 w-4 text-zinc-600" />
                                        <input
                                            type="text"
                                            placeholder="Ej. Calle 123 #45-67"
                                            value={form.address}
                                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                            className={cn(inputClass, 'pl-10 pr-4')}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Correo Electrónico (Usuario) *</label>
                                    <div className="relative group flex items-center">
                                        <Mail className="absolute left-4 h-4 w-4 text-zinc-600" />
                                        <input
                                            type="email"
                                            placeholder="ejemplo@taller.com"
                                            value={form.email}
                                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                            className={cn(inputClass, 'pl-10 pr-4')}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 pt-2">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Acceso y Permisos</h3>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Rol en el Sistema *</label>
                                    <div className="relative group flex items-center">
                                        <Shield className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                        <Select value={form.role} onValueChange={(value) => setForm((p) => ({ ...p, role: (value ?? 'mechanic') as UserRole }))}>
                                            <SelectTrigger className="w-full h-[46px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-medium rounded-xl">
                                                <SelectValue placeholder="Selecciona un rol..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl">
                                                {rolesToCreate.map(role => (
                                                    <SelectItem key={role} value={role} className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg">
                                                        {USER_ROLE_LABELS[role]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <p className="text-xs text-red-400 font-medium">Nota de Seguridad</p>
                                    <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                                        Una contraseña temporal generada aleatoriamente será enviada al correo del empleado. El empleado deberá cambiarla en su primer inicio de sesión.
                                    </p>
                                </div>
                            </section>

                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0">
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (!canSubmit) {
                                        toast.error('Completa nombre, documento, teléfono, correo y rol.');
                                        return;
                                    }
                                    addStaff({
                                        fullName: form.fullName.trim(),
                                        documentId: form.documentId.trim(),
                                        phone: form.phone.trim(),
                                        address: form.address.trim() || undefined,
                                        email: form.email.trim().toLowerCase(),
                                        role: form.role,
                                        status: 'active',
                                    });
                                    toast.success('Empleado registrado.');
                                    handleClose();
                                }}
                                className={cn(
                                    "w-full flex items-center justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    canSubmit
                                        ? "text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10"
                                        : "text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed"
                                )}
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" /> Contratar / Registrar
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
