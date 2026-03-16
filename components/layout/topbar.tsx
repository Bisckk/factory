'use client';

/**
 * Topbar for the Dashboard layout (Dark Theme).
 * Includes mobile menu toggle, quick notifications, and user dropdown.
 */

import { Bell, Menu, Search, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { USER_ROLE_LABELS } from '@/types/app.types';

export function Topbar() {
    const { user, role } = useAuthStore();
    const { toggleMobileSidebar, mobileSidebarOpen } = useUIStore();

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-[#0A0A0B]/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">

            {/* Left side: Mobile menu & Global Search */}
            <div className="flex flex-1 items-center gap-4">
                <button
                    onClick={toggleMobileSidebar}
                    className="lg:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100 focus:outline-none"
                    aria-label="Toggle menu"
                >
                    {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>

                {/* Global Search */}
                <div className="hidden sm:block w-full max-w-sm">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar órdenes, clientes, placas (⌘K)"
                            className="h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/50 pl-9 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-red-500/50 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Right side: Notifications & Profile */}
            <div className="flex items-center gap-4">

                <button className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 transition-colors focus:outline-none">
                    <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#0A0A0B]" />
                    <Bell className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 border-l border-zinc-800 pl-4 ml-1">
                    <div className="hidden flex-col items-end sm:flex text-right">
                        <span className="text-xs font-bold text-zinc-200 leading-none">
                            {user?.full_name || 'Cargando...'}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-500 mt-1 font-semibold">
                            {role ? (USER_ROLE_LABELS as Record<string, string>)[role] || role : ''}
                        </span>
                    </div>

                    {/* Avatar */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-sm ring-2 ring-zinc-800">
                        {user?.full_name?.charAt(0) || '?'}
                    </div>
                </div>

            </div>
        </header>
    );
}
