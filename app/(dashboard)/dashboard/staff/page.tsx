'use client';

/**
 * Staff Management Page — Dark Theme
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Mail, Shield, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

import { CreateStaffDrawer } from '@/components/dashboard/staff/create-staff-drawer';

export default function StaffPage() {
    const { role } = useAuthStore();
    const [search, setSearch] = useState('');
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

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

    const MOCK_STAFF = [
        { id: "u_1", name: "Administrador Garage", role: "admin", email: "admin@garage.com", status: "active" },
        { id: "u_2", name: "Recepcionista 1", role: "receptionist", email: "receive@garage.com", status: "active" },
        { id: "u_3", name: "Mecánico Principal", role: "mechanic", email: "mechanic@garage.com", status: "active" },
        { id: "u_4", name: "Segundo Mecánico", role: "mechanic", email: "mechanic2@garage.com", status: "active" },
    ];

    const roleLabels = {
        admin: 'Administrador',
        receptionist: 'Recepcionista',
        mechanic: 'Mecánico',
        client: 'Cliente'
    };

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

                <div className="overflow-x-auto">
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
                            {MOCK_STAFF.map((member, i) => (
                                <motion.tr key={member.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    className="group hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                                                <UserCircle className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-200 leading-none">{member.name}</p>
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
                                                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        )}>
                                            {roleLabels[member.role as keyof typeof roleLabels]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs text-zinc-400">Activo</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 hover:text-zinc-100 transition-colors py-1.5 px-3 border border-zinc-800 rounded-lg hover:bg-zinc-800">
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
        </div>
    );
}
