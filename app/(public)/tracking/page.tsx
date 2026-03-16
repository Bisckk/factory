import { Search, ShieldCheck } from 'lucide-react';

export default function TrackingPage({ searchParams }: { searchParams: { code?: string } }) {
    if (searchParams.code) {
        // Validation could happen here
    }

    return (
        <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex h-16 w-16 items-center justify-center bg-red-600 rounded-2xl shadow-xl shadow-red-600/20 mb-6">
                        <ShieldCheck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Monitor Médico</h1>
                    <p className="mt-2 text-sm text-zinc-500 font-medium">Consulta el progreso vital de tu motocicleta en tiempo real.</p>
                </div>

                <div className="bg-[#141417] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full -z-10 blur-xl pointer-events-none" />

                    <form action="/tracking" method="GET" className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 mb-4 text-center">Código de Seguimiento</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-700" />
                                <input
                                    type="text"
                                    name="code"
                                    placeholder="Ej. A7K3M9X2"
                                    className="w-full pl-12 pr-4 py-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center text-xl font-mono text-white placeholder:text-zinc-800 uppercase focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all tracking-[0.3em]"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-[0.2em] py-5 rounded-2xl text-xs transition-all shadow-lg shadow-red-600/10 active:scale-[0.98]">
                            Iniciar Escaneo
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
                    MotoTaller · Professional Care System
                </p>
            </div>
        </div>
    );
}
