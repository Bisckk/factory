export function ReviewsSection() {
    return (
        <section className="py-24 bg-gray-50 text-black border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-16">
                    Aullidos del Asfalto.
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { name: 'S. Restrepo', moto: 'KMX 125', review: 'Me resucitaron el cilindro. Pensé que estaba para chatarra pero la dejaron caminando durísimo.' },
                        { name: 'C. González', moto: 'DT 175', review: 'La mejor carburación que le han hecho a mi moto. Prende a la primera y no bota una sola gota.' },
                        { name: 'L. Jaramillo', moto: 'NS 200', review: 'Taller muy organizado. El tracker en vivo para ver cómo van arreglando la moto es otro nivel.' }
                    ].map((review, i) => (
                        <div key={i} className="bg-white p-8 border border-gray-100 rounded-br-3xl hover:-translate-y-2 transition-transform shadow-sm">
                            <div className="flex text-yellow-500 mb-6">
                                {[1, 2, 3, 4, 5].map(star => <span key={star}>★</span>)}
                            </div>
                            <p className="text-gray-600 italic mb-6 leading-relaxed">&quot;{review.review}&quot;</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-600 flex items-center justify-center font-bold text-white rounded-tl-xl text-sm">
                                    {review.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-sm uppercase tracking-wide">{review.name}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{review.moto}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
