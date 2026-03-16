import { ShieldCheck, Calendar, User, Bike, Clock } from 'lucide-react';

export default function LiveTrackerPage({ params }: { params: { token: string } }) {
    return (
        <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex flex-col items-center py-12 md:py-24 px-4">
            <div className="max-w-xl w-full">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="h-14 w-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/20 mb-4">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Live Status Tracker</h2>
                    <p className="text-xs text-zinc-600 mt-1 italic tracking-wide">MotoTaller Garage Performance</p>
                </div>

                {/* Main Card */}
                <div className="bg-[#141417] border border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
                    {/* Background glow accent */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-[80px]" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-8 mb-8">
                        <div>
                            <h1 className="text-[10px] font-bold uppercase tracking-[0.3em] text-red-500 mb-2">Orden de Servicio</h1>
                            <p className="font-mono text-3xl font-black text-white tracking-tighter">{params.token}</p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                En Reparación
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Vehicle Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                                    <User className="h-3 w-3" /> Cliente
                                </p>
                                <p className="text-sm font-bold text-zinc-200">Juan Pérez</p>
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 flex items-center gap-1.5">
                                    <Bike className="h-3 w-3" /> Vehículo
                                </p>
                                <p className="text-sm font-bold text-zinc-200">Yamaha DT 175</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="uppercase tracking-[0.2em] text-[10px] font-black mb-6 text-zinc-700 ml-1 border-l-4 border-red-600 pl-4">Línea de Tiempo</h3>

                            <div className="relative space-y-10 pl-6 border-l border-zinc-800">
                                {/* Current Step */}
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-red-600 ring-4 ring-[#141417]" />
                                    <div>
                                        <p className="text-sm font-bold text-zinc-100">Motor desarmado e inspeccionado</p>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Se encontró desgaste en el pistón. Se procede a rectificación de cilindro.</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">
                                                <Clock className="h-3 w-3" /> Hoy 09:30 AM
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Previous Step */}
                                <div className="relative opacity-40">
                                    <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-zinc-700 ring-4 ring-[#141417]" />
                                    <div>
                                        <p className="text-sm font-bold text-zinc-400">Vehículo recibido en patio</p>
                                        <p className="text-xs text-zinc-600 mt-1">Inspección visual y checklist de inventario firmado.</p>
                                        <span className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-700 mt-3">
                                            <Calendar className="h-3 w-3" /> 14 Mar 2025 · 04:15 PM
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-widest text-zinc-600 opacity-60">
                    © 2025 MotoTaller Garage · Professional Workshop Systems
                </p>
            </div>
        </div>
    );
}
