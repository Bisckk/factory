export function PortfolioGallery() {
    return (
        <section id="portafolio" className="py-24 bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-black">
                        Resultados <br /> Implacables.
                    </h2>
                    <a href="#" className="hidden md:inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-red-600 hover:text-black transition-colors border-b-2 border-red-600 pb-1">Ver todos los proyectos</a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="group relative aspect-[4/5] bg-black overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop&sig=${item}`} alt="Proyecto" className="w-full h-full object-cover opacity-70 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <h3 className="text-white font-bold uppercase tracking-wider text-xl">Yamaha DT175</h3>
                                <p className="text-red-400 text-xs font-mono uppercase mt-2">Restauración Completa</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
