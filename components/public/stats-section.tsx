import { motion } from 'framer-motion';

export function StatsSection() {
    return (
        <section className="bg-red-600 py-12 border-y border-white/10">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-red-700">
                {[
                    { label: 'Años Restaurando', value: '15+' },
                    { label: 'Motos Revividas', value: '2.5K' },
                    { label: 'Precisión Mecánica', value: '100%' },
                    { label: 'Especialistas 2T', value: '#1' },
                ].map((stat, i) => (
                    <div key={i} className="text-center px-4">
                        <p className="text-4xl md:text-5xl font-black text-white">{stat.value}</p>
                        <p className="text-xs font-bold text-red-100 uppercase tracking-widest mt-2">{stat.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
