import { Search, ArrowRight } from 'lucide-react';

export function HeroSection() {
    return (
        <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center bg-black overflow-hidden pt-20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8">
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                    La Resurrección <br /> <span className="text-red-600">del 2 Tiempos.</span>
                </h1>
                <p className="text-lg text-white/70 max-w-2xl mx-auto font-medium">
                    Taller de alta precisión. Porque reparar no es cambiar piezas, es entender el alma de la máquina.
                </p>

                <div className="pt-8">
                    <form className="max-w-md mx-auto relative group">
                        <input
                            type="text"
                            placeholder="Buscar orden de reparación..."
                            className="w-full bg-white/10 border border-white/20 backdrop-blur-md text-white rounded-full py-4 pl-6 pr-32 focus:outline-none focus:border-red-500 transition-colors uppercase tracking-widest text-sm"
                        />
                        <button className="absolute right-2 top-2 bottom-2 bg-red-600 text-white rounded-full px-6 flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors">
                            Rastrear
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
