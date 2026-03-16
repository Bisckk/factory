export function ContactSection() {
    return (
        <section id="contacto" className="py-24 bg-white text-black">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="bg-black text-white p-12 pr-16 space-y-8 rounded-br-[100px]">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-red-600">
                        Agenda tu Cita.
                    </h2>
                    <p className="text-gray-400">
                        Nuestra capacidad es limitada porque no trabajamos a volumen, trabajamos a detalle. Contáctanos para evaluar tu máquina.
                    </p>
                    <div className="pt-8">
                        <button className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 group">
                            Contactar por WhatsApp
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="border border-gray-100 p-8 flex items-start gap-6 hover:border-red-600/30 transition-colors group">
                        <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold uppercase tracking-wide">Dirección</h3>
                            <p className="text-gray-500 text-sm mt-2">Medellín, Colombia.<br />Visitas únicamente con cita previa.</p>
                        </div>
                    </div>

                    <div className="border border-gray-100 p-8 flex items-start gap-6 hover:border-red-600/30 transition-colors group">
                        <div className="w-12 h-12 bg-red-50 text-red-600 flex items-center justify-center rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold uppercase tracking-wide">Email</h3>
                            <p className="text-gray-500 text-sm mt-2">admisiones@mototaller.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
