export function ProcessSection() {
    return (
        <section id="proceso" className="py-24 bg-black text-white">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-16 text-center">
                    El Método.
                </h2>

                <div className="grid md:grid-cols-4 gap-8">
                    {[
                        { title: 'Recepción y Diagnóstico', desc: 'Análisis profundo de compresión y componentes vitales. No adivinamos, medimos.' },
                        { title: 'Presupuesto y Aprobación', desc: 'Recibes un reporte detallado. Tú decides qué intervenimos y cuándo.' },
                        { title: 'Cirugía de Motor', desc: 'Desarme milimétrico. Lavado por ultrasonido y ensamble a torque de manual.' },
                        { title: 'Pruebas y Entrega', desc: 'Control de calidad. Asentado inicial en banco. Lista para derretir llantas.' }
                    ].map((step, i) => (
                        <div key={i} className="relative group">
                            <div className="text-red-600 font-mono text-5xl font-black opacity-20 group-hover:opacity-100 transition-opacity absolute -top-10 left-0 -z-10 tracking-tighter">
                                0{i + 1}
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-wide mb-3">{step.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>

                            {i < 3 && (
                                <div className="hidden md:block absolute top-6 right-0 translate-x-1/2 w-full h-[1px] bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
