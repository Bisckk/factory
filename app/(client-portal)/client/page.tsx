'use client';

/**
 * Client Portal Main Page — Dark Theme
 * 
 * Shows their active motorcycle status immediately upon login.
 */

import { motion } from 'framer-motion';
import { Package, ArrowRight, Gauge, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';

export default function ClientDashboardPage() {
    const { user } = useAuthStore();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Hola, {user?.full_name?.split(' ')[0] || 'motero'}.
                </h1>
                <p className="mt-2 text-sm text-zinc-500 font-medium">
                    Este es tu garaje digital. Revisa el estado de tus motos o tu historial de reparaciones.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Active Order Card */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Órdenes Activas</h2>

                    <motion.div
                        className="rounded-3xl border border-zinc-800 bg-[#141417] overflow-hidden shadow-2xl"
                        whileHover={{ y: -2 }}
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-bold tracking-widest text-blue-400 uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    En reparación
                                </span>
                                <span className="font-mono text-xs font-bold text-zinc-600 uppercase tracking-tighter">
                                    ORD-2025-0001
                                </span>
                            </div>

                            <div className="flex items-start gap-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 shrink-0 shadow-inner">
                                    <Package className="h-10 w-10 text-zinc-700" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-zinc-100">Yamaha DT 175</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Placa: <span className="text-amber-500 font-mono font-bold tracking-widest">ABC-123</span> · Ingreso: 10 Mar 2025</p>
                                    <div className="mt-4 p-4 rounded-xl bg-zinc-900/50 border-l-4 border-red-600">
                                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                                            Cambiando cilindro y afinando carburador. Se espera finalizar hoy por la tarde.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="bg-black/20 px-8 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-zinc-800 gap-4">
                            <span className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                Última actualización: <span className="text-zinc-400 font-bold">Hace 2 horas</span>
                            </span>
                            <a href={`/tracking/ORD-2025-0001`} className="inline-flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-400 transition-colors group">
                                Ver tracker en vivo
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Sidemenu Options */}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 ml-1">Tu Garaje</h2>

                    <div className="space-y-3">
                        <button className="w-full flex items-center gap-4 group rounded-2xl border border-zinc-800 bg-[#141417] p-5 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 text-zinc-600 transition-transform group-hover:scale-110">
                                <Gauge className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-100">Mis Motos</p>
                                <p className="text-xs text-zinc-600 mt-0.5 font-medium">2 Vehículos registrados</p>
                            </div>
                        </button>

                        <button className="w-full flex items-center gap-4 group rounded-2xl border border-zinc-800 bg-[#141417] p-5 hover:border-zinc-700 hover:bg-zinc-800 transition-all text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 shrink-0 text-zinc-600 transition-transform group-hover:scale-110">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-zinc-100">Historial Médico</p>
                                <p className="text-xs text-zinc-600 mt-0.5 font-medium">Ver trabajos anteriores</p>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
