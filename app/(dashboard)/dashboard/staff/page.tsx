'use client';

/**
 * Staff Management Page — Dark Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Mail, Shield, UserCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useStaffStore } from '@/stores/staff.store';
import { USER_ROLE_LABELS } from '@/types/app.types';

import { CreateStaffDrawer } from '@/components/dashboard/staff/create-staff-drawer';
import { StaffDetailDrawer } from '@/components/dashboard/staff/staff-detail-drawer';

export default function StaffPage() {
    const { role } = useAuthStore();
    const staff = useStaffStore((s) => s.staff);
    const [search, setSearch] = useState('');
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);

    const isRestricted = role !== 'admin';

    if (isRestricted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Acceso Restringido</h1>
                <p className="mt-2 text-zinc-500">Solo administradores pueden gestionar el personal del taller.</p>
            </div>
        );
    }

    const q = search.trim().toLowerCase();
    const filteredStaff = staff
        .filter((m) => {
            if (!q) return true;
            return (
                m.fullName.toLowerCase().includes(q) ||
                m.email.toLowerCase().includes(q) ||
                m.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
                m.documentId.includes(q)
            );
        })
        .slice()
        .sort((a, b) => {
            if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
            if (a.role !== b.role) return a.role.localeCompare(b.role);
            return a.fullName.localeCompare(b.fullName);
        });

    const counts = filteredStaff.reduce(
        (acc, m) => {
            acc.total += 1;
            if (m.status === 'active') acc.active += 1;
            if (m.role === 'mechanic') acc.mechanics += 1;
            if (m.role === 'receptionist') acc.receptionists += 1;
            if (m.role === 'admin') acc.admins += 1;
            if (m.role === 'accountant') acc.accountants += 1;
            return acc;
        },
        { total: 0, active: 0, mechanics: 0, receptionists: 0, admins: 0, accountants: 0 }
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-zinc-500" />
                        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Gestión de Personal</h1>
                    </div>
                    <p className="text-sm text-zinc-500">Administra los usuarios del sistema, asigna roles y controla accesos.</p>
                </div>
                <button
                    onClick={() => setIsCreateDrawerOpen(true)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-all"
                >
                    <Plus className="h-4 w-4" /> Nuevo Miembro
                </button>
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-100">{counts.total}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Activos</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-emerald-400">{counts.active}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Mecánicos</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-100">{counts.mechanics}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Recepción</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-100">{counts.receptionists}</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-[#141417] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Contabilidad</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-tight text-zinc-100">{counts.accountants}</p>
                </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-[#141417] overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        <input type="text" placeholder="Buscar por nombre o email..."
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                </div>

                <div className="p-4 space-y-3 md:hidden">
                    {filteredStaff.length === 0 ? (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
                            <Users className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm font-medium text-zinc-500">No se encontraron usuarios</p>
                            <p className="text-[11px] text-zinc-600 mt-1">Prueba con otro nombre, correo o documento.</p>
                        </div>
                    ) : (
                        filteredStaff.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => {
                                    setSelectedStaffId(member.id);
                                    setIsDetailOpen(true);
                                }}
                                className="w-full text-left rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-800/30 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0">
                                        <UserCircle className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-extrabold text-zinc-200 truncate">{member.fullName}</p>
                                            <span className={cn(
                                                "text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border shrink-0",
                                                member.status === 'active'
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-zinc-800 text-zinc-500 border-zinc-700"
                                            )}>
                                                {member.status === 'active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-600">{USER_ROLE_LABELS[member.role]}</p>
                                        <div className="mt-2 grid grid-cols-1 gap-1">
                                            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                <Mail className="h-3.5 w-3.5" /> <span className="truncate">{member.email}</span>
                                            </p>
                                            {member.status !== 'active' && (
                                                <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                                    <Ban className="h-3.5 w-3.5" /> Usuario desactivado
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900/50 text-xs uppercase tracking-widest text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Usuario</th>
                                <th className="px-6 py-4 font-semibold">Rol</th>
                                <th className="px-6 py-4 font-semibold">Estado</th>
                                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {filteredStaff.map((member, i) => (
                                <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                                                <UserCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-200 leading-none">{member.fullName}</p>
                                                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {member.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide",
                                            member.role === 'admin' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                                                member.role === 'receptionist' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                                                    member.role === 'accountant' ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                                        "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        )}>
                                            {USER_ROLE_LABELS[member.role]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("h-2 w-2 rounded-full", member.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-zinc-600")} />
                                            <span className="text-xs text-zinc-400">{member.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedStaffId(member.id);
                                                setIsDetailOpen(true);
                                            }}
                                            className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-100 transition-colors py-1.5 px-3 border border-zinc-800 rounded-lg hover:bg-zinc-800"
                                        >
                                            Gestionar
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateStaffDrawer
                isOpen={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
            />

            <StaffDetailDrawer
                isOpen={isDetailOpen}
                staffId={selectedStaffId}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedStaffId(null);
                }}
            />
        </div>
    );
}
