'use client';

/**
 * Main application Sidebar
 * 
 * Adapts its navigation links based on the active user's role.
 * On mobile, it's hidden behind a hamburger menu.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wrench,
    LayoutDashboard,
    ClipboardList,
    Box,
    CalendarDays,
    Settings,
    Users,
    DollarSign,
    LogOut,
    Menu,
    X
} from 'lucide-react';

import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { createBrowserClient, hasSupabaseBrowserEnv } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { NavSection, UserRole } from '@/types/app.types';

const ADMIN_NAV: NavSection[] = [
    {
        label: 'Operación',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin'] },
            { label: 'Órdenes', href: '/dashboard/orders', icon: 'ClipboardList', roles: ['admin'] },
            { label: 'Inventario', href: '/dashboard/inventory', icon: 'Box', roles: ['admin'] },
            { label: 'Agenda', href: '/dashboard/appointments', icon: 'CalendarDays', roles: ['admin'] },
            { label: 'Motos', href: '/dashboard/motorcycles', icon: 'Wrench', roles: ['admin'] },
        ]
    },
    {
        label: 'Administración',
        items: [
            { label: 'Contabilidad', href: '/dashboard/accounting', icon: 'DollarSign', roles: ['admin'] },
            { label: 'Personal', href: '/dashboard/staff', icon: 'Users', roles: ['admin'] },
            { label: 'Configuración', href: '/dashboard/settings', icon: 'Settings', roles: ['admin'] },
        ]
    }
];

const MECHANIC_NAV: NavSection[] = [
    {
        label: 'Área de Trabajo',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['mechanic'] },
            { label: 'Agenda', href: '/dashboard/appointments', icon: 'CalendarDays', roles: ['mechanic'] },
            { label: 'Servicios', href: '/dashboard/orders', icon: 'Wrench', roles: ['mechanic'] },
            { label: 'Inventario', href: '/dashboard/inventory', icon: 'Box', roles: ['mechanic'] },
        ]
    }
];

const ACCOUNTANT_NAV: NavSection[] = [
    {
        label: 'Finanzas',
        items: [
            { label: 'Resumen Financiero', href: '/dashboard/accounting', icon: 'DollarSign', roles: ['accountant'] },
            { label: 'Facturación externa', href: '/dashboard/invoices', icon: 'ClipboardList', roles: ['accountant'] },
            { label: 'Nómina', href: '/dashboard/payroll', icon: 'Users', roles: ['accountant'] },
        ]
    }
];

const RECEPTIONIST_NAV: NavSection[] = [
    {
        label: 'Operación Recepción',
        items: [
            { label: 'Dashboard General', href: '/dashboard', icon: 'LayoutDashboard', roles: ['receptionist'] },
            { label: 'Órdenes', href: '/dashboard/orders', icon: 'ClipboardList', roles: ['receptionist'] },
            { label: 'Agenda', href: '/dashboard/appointments', icon: 'CalendarDays', roles: ['receptionist'] },
            { label: 'Motos y Clientes', href: '/dashboard/motorcycles', icon: 'Wrench', roles: ['receptionist'] },
            { label: 'Inventario de Repuestos', href: '/dashboard/inventory', icon: 'Box', roles: ['receptionist'] },
        ]
    }
];

const getNavForRole = (role: UserRole | null): NavSection[] => {
    switch (role) {
        case 'admin': return ADMIN_NAV;
        case 'mechanic': return MECHANIC_NAV;
        case 'accountant': return ACCOUNTANT_NAV;
        case 'receptionist': return RECEPTIONIST_NAV;
        default: return [];
    }
};

const iconMap: Record<string, React.ElementType> = {
    Wrench,
    LayoutDashboard,
    ClipboardList,
    Box,
    CalendarDays,
    Settings,
    Users,
    DollarSign,
};

export function Sidebar() {
    const pathname = usePathname();
    const { role } = useAuthStore();
    const { sidebarOpen, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
    const sections = getNavForRole(role);

    const handleLogout = async () => {
        if (!hasSupabaseBrowserEnv()) {
            window.location.href = '/login';
            return;
        }
        const supabase = createBrowserClient();
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const sidebarContent = (
        <div className="flex h-full flex-col bg-[#0F0F12] border-r border-zinc-800">
            {/* Logo Header */}
            <div className="flex h-16 shrink-0 items-center px-6">
                <div className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 transition-transform group-hover:scale-105">
                        <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-zinc-100 leading-none">MotoTaller<span className="text-red-500">.</span></span>
                </div>
            </div>

            {/* Navigation Lists */}
            <div className="flex-1 overflow-y-auto py-4 px-3 hide-scrollbar">
                {sections.map((section, idx) => (
                    <div key={idx} className="mb-8">
                        <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            {section.label}
                        </h3>
                        <ul className="space-y-0.5">
                            {section.items.map((item) => {
                                const Icon = iconMap[item.icon];
                                const isActive = item.href === '/dashboard'
                                    ? pathname === '/dashboard'
                                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                                return (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            onClick={() => setMobileSidebarOpen(false)}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-red-600/10 text-red-500 font-bold"
                                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                                            )}
                                        >
                                            {Icon && (
                                                <Icon className={cn(
                                                    "h-4 w-4 shrink-0 transition-colors",
                                                    isActive ? "text-red-500" : "text-zinc-500 group-hover:text-zinc-300"
                                                )} />
                                            )}
                                            {item.label}
                                            {item.badge && (
                                                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-red-600/20 px-2 py-0.5 text-xs font-medium text-red-400">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer Area (Logout/User stub) */}
            <div className="p-4 border-t border-zinc-800">
                <button
                    onClick={handleLogout}
                    className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-800/50 hover:text-red-500 transition-colors"
                >
                    <LogOut className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-red-500" />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col transition-transform duration-300 shadow-sm",
                !sidebarOpen && "-translate-x-full"
            )}>
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSidebarOpen(false)}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
