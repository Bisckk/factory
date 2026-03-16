import Link from 'next/link';
import { ArrowUpRight, Wrench, MapPin, Phone, Mail, Instagram, Facebook, CalendarPlus } from 'lucide-react';

export function PublicFooter() {
    return (
        <footer className="bg-black text-white py-20 md:py-32 border-t border-white/10">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">

                {/* Top grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-24">

                    {/* Brand Col */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <div className="flex h-10 w-10 items-center justify-center bg-red-600 rounded-br-2xl rounded-tl-2xl">
                                <Wrench className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-black tracking-tighter uppercase">
                                MotoTaller
                            </span>
                        </Link>
                        <p className="text-white/60 text-sm max-w-sm leading-relaxed">
                            No somos un taller convencional. Somos el último refugio para los puristas del 2 tiempos y el quirófano de alta precisión para las máquinas de hoy.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-colors">
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a href="#" className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-600 transition-colors">
                                <Facebook className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="lg:col-span-2 space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Navegación</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link href="/" className="hover:text-red-500 transition-colors flex items-center gap-2 group">Inicio <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" /></Link></li>
                            <li><Link href="/tracking" className="hover:text-red-500 transition-colors flex items-center gap-2 group">Rastreo de Orden <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" /></Link></li>
                            <li><Link href="/login" className="hover:text-red-500 transition-colors flex items-center gap-2 group">Portal de Cliente <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" /></Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Especialidades</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li className="text-white/80">Restauración de Motores 2T</li>
                            <li className="text-white/80">Mantenimiento Preventivo Premium</li>
                            <li className="text-white/80">Afinación de Carburadores</li>
                            <li className="text-white/80">Sistema Eléctrico y Diagnóstico</li>
                            <li className="text-white/80">Reconstrucción de Cilindros</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">Contacto & Horario</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-white/80">
                                <MapPin className="h-5 w-5 text-red-600 shrink-0" />
                                <span>Calle Falsa 123, Barrio Industrial<br />Medellín, Colombia</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/80">
                                <Phone className="h-5 w-5 text-red-600 shrink-0" />
                                <span>+57 300 000 0000</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/80">
                                <Mail className="h-5 w-5 text-red-600 shrink-0" />
                                <span>taller@mototaller.com</span>
                            </li>
                        </ul>

                        <div className="pt-4 border-t border-white/10 mt-6 text-sm text-white/60">
                            <p className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                                <span>Lunes - Viernes</span>
                                <span className="font-bold text-white">8:00 AM - 6:00 PM</span>
                            </p>
                            <p className="flex justify-between items-center py-2 border-b border-dashed border-white/10">
                                <span>Sábados</span>
                                <span className="font-bold text-white">8:00 AM - 2:00 PM</span>
                            </p>
                            <p className="flex justify-between items-center py-2">
                                <span>Domingos / Festivos</span>
                                <span className="text-red-500 font-bold uppercase text-[10px]">Cerrado</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs font-medium text-white/40 uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} MotoTaller. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                    </div>
                </div>

            </div>
        </footer>
    );
}
