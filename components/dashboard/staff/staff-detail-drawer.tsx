'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, CheckCircle2, Mail, MapPin, Phone, Save, Shield, Trash2, UserCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { USER_ROLE_LABELS, type UserRole } from '@/types/app.types';
import { useStaffStore } from '@/stores/staff.store';

type StaffDetailDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    staffId: string | null;
};

export function StaffDetailDrawer({ isOpen, onClose, staffId }: StaffDetailDrawerProps) {
    const member = useStaffStore((s) => (staffId ? s.getStaff(staffId) : undefined));
    const updateStaff = useStaffStore((s) => s.updateStaff);
    const toggleStatus = useStaffStore((s) => s.toggleStatus);
    const deleteStaff = useStaffStore((s) => s.deleteStaff);

    const [form, setForm] = useState({
        fullName: '',
        role: 'mechanic' as UserRole,
        email: '',
        phone: '',
        documentId: '',
        address: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (!member) return;
        setForm({
            fullName: member.fullName,
            role: member.role,
            email: member.email,
            phone: member.phone,
            documentId: member.documentId,
            address: member.address ?? '',
        });
    }, [isOpen, member?.id]);

    const canSave = useMemo(() => {
        return Boolean(form.fullName.trim() && form.email.trim() && form.phone.trim() && form.documentId.trim());
    }, [form]);

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
                                    <UserCircle className="h-5 w-5 text-red-500" />
                                    Gestionar Usuario
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Actualiza rol, contacto y estado del empleado.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {!member ? (
                                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
                                    <p className="text-sm font-medium text-zinc-500">Usuario no encontrado.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-11 w-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                <UserCircle className="h-6 w-6 text-zinc-500" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-zinc-200 truncate">{member.fullName}</p>
                                                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mt-1">{USER_ROLE_LABELS[member.role]}</p>
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border",
                                            member.status === 'active'
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                        )}>
                                            {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>

                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                            Datos
                                        </h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre *</label>
                                                <input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} className={inputClass} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Documento *</label>
                                                    <input value={form.documentId} onChange={(e) => setForm((p) => ({ ...p, documentId: e.target.value }))} className={cn(inputClass, 'font-mono')} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Rol *</label>
                                                    <div className="relative group flex items-center">
                                                        <Shield className="absolute left-4 h-4 w-4 text-zinc-600 pointer-events-none z-10" />
                                                        <Select value={form.role} onValueChange={(value) => setForm((p) => ({ ...p, role: (value ?? 'mechanic') as UserRole }))}>
                                                            <SelectTrigger className="w-full h-[46px] pl-10 border-zinc-800 bg-zinc-900/50 text-zinc-200 focus:ring-red-500/30 font-medium rounded-xl">
                                                                <SelectValue placeholder="Selecciona..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-200 rounded-xl">
                                                                {(['mechanic', 'receptionist', 'admin', 'accountant'] as UserRole[]).map((r) => (
                                                                    <SelectItem key={r} value={r} className="focus:bg-zinc-800 focus:text-white cursor-pointer rounded-lg">
                                                                        {USER_ROLE_LABELS[r]}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Correo *</label>
                                                    <div className="relative group flex items-center">
                                                        <Mail className="absolute left-4 h-4 w-4 text-zinc-600" />
                                                        <input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className={cn(inputClass, 'pl-10 pr-4')} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Teléfono *</label>
                                                    <div className="relative group flex items-center">
                                                        <Phone className="absolute left-4 h-4 w-4 text-zinc-600" />
                                                        <input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className={cn(inputClass, 'pl-10 pr-4')} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Dirección</label>
                                                <div className="relative group flex items-center">
                                                    <MapPin className="absolute left-4 h-4 w-4 text-zinc-600" />
                                                    <input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className={cn(inputClass, 'pl-10 pr-4')} />
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0 space-y-3">
                            {member && (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toggleStatus(member.id);
                                            toast.success(member.status === 'active' ? 'Usuario desactivado.' : 'Usuario activado.');
                                        }}
                                        className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                                    >
                                        <Ban className="h-4 w-4 mr-2" /> {member.status === 'active' ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!canSave}
                                        onClick={() => {
                                            if (!staffId) return;
                                            if (!canSave) {
                                                toast.error('Completa nombre, documento, correo y teléfono.');
                                                return;
                                            }
                                            updateStaff({
                                                id: staffId,
                                                fullName: form.fullName.trim(),
                                                role: form.role,
                                                email: form.email.trim().toLowerCase(),
                                                phone: form.phone.trim(),
                                                documentId: form.documentId.trim(),
                                                address: form.address.trim() || undefined,
                                            });
                                            toast.success('Cambios guardados.');
                                            onClose();
                                        }}
                                        className={cn(
                                            "w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                            canSave
                                                ? "text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10"
                                                : "text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed"
                                        )}
                                    >
                                        <Save className="h-4 w-4 mr-2" /> Guardar
                                    </button>
                                </div>
                            )}

                            {member && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ok = window.confirm('¿Eliminar este usuario del módulo de Personal?');
                                        if (!ok) return;
                                        deleteStaff(member.id);
                                        toast.success('Usuario eliminado.');
                                        onClose();
                                    }}
                                    className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

