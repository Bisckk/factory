'use client';

/**
 * Settings view for the internal SaaS dashboard (Theme mapping to business context) — Dark Theme.
 */

import { Settings, Shield, User, Bell, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

export default function SettingsPage() {
    const { user, role } = useAuthStore();

    const isRestricted = role !== 'admin';

    if (isRestricted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Acceso Restringido</h1>
                <p className="mt-2 text-zinc-500">Solo administradores pueden modificar los ajustes del sistema.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 lg:px-4">

            {/* Page Header */}
            <header className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-zinc-500" />
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Configuración General</h1>
                </div>
                <p className="text-sm text-zinc-500">Administra personal, catálogos del sistema y detalles operativos.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-1">
                    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold bg-zinc-100 text-zinc-900 border border-zinc-100">
                        <User className="h-4 w-4" /> Ajustes de Perfil
                    </button>
                    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                        <Database className="h-4 w-4" /> Catálogos de Sistema
                    </button>
                    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                        <Shield className="h-4 w-4" /> Equipo y Roles
                    </button>
                    <button className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                        <Bell className="h-4 w-4" /> Notificaciones SMS
                    </button>
                </div>

                <div className="md:col-span-3 rounded-xl border border-zinc-800 bg-[#141417] p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-100 leading-none">Perfil de Administrador</h3>
                        <p className="text-sm text-zinc-500 mt-2">Información técnica y permisos absolutos según el esquema de base de datos.</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-zinc-800">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Nombre</label>
                                <input type="text" defaultValue={user?.full_name || ''}
                                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">Email</label>
                                <input type="email" disabled defaultValue={''}
                                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-800 px-3 text-sm text-zinc-500 cursor-not-allowed opacity-50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 mt-4">Nivel de Autorización</label>
                            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                                <Shield className="h-3.5 w-3.5" /> Super Admin
                            </div>
                        </div>

                        <div className="pt-6">
                            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition-colors">
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
