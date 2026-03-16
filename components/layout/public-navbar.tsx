'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight, Wrench } from 'lucide-react';
import Link from 'next/link';

export function PublicNavbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const LINKS = [
        { label: 'Especialidad 2T', href: '/#especialidades' },
        { label: 'El Proceso', href: '/#proceso' },
        { label: 'Portafolio', href: '/#portafolio' },
        { label: 'Contacto', href: '/#contacto' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 pointer-events-none">

            {/* Logo Area */}
            <div className="pointer-events-auto">
                <Link href="/" className="group flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center bg-red-600 rounded-bl-xl rounded-tr-xl rounded-tl-sm rounded-br-sm transition-transform group-hover:scale-110">
                        <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase text-white mix-blend-difference">
                        MotoTaller
                    </span>
                </Link>
            </div>

            {/* Desktop Navigation (Center absolute positioning for perfect center) */}
            <nav className="hidden md:absolute md:left-1/2 md:-translate-x-1/2 md:flex items-center gap-8 pointer-events-auto bg-black/10 backdrop-blur-md px-8 py-3 rounded-full border border-white/10">
                {LINKS.map(link => (
                    <Link
                        key={link.label}
                        href={link.href}
                        className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-red-500 transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4 pointer-events-auto">
                <Link
                    href="/tracking"
                    className="text-xs font-bold text-white hover:text-red-500 transition-colors uppercase tracking-wider"
                >
                    Rastrear Orden
                </Link>
                <div className="h-4 w-px bg-white/20"></div>
                <Link
                    href="/login"
                    className="group relative inline-flex items-center justify-center bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-black overflow-hidden transition-all hover:bg-red-600 hover:text-white"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        Mi Garaje <ArrowRight className="h-3 w-3" />
                    </span>
                </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden pointer-events-auto">
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="h-10 w-10 bg-white flex items-center justify-center text-black"
                    aria-label="Abrir menú"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                        animate={{ opacity: 1, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                        exit={{ opacity: 0, clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
                        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed inset-0 z-50 bg-black text-white pointer-events-auto flex flex-col pt-24 px-6 pb-6"
                    >
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="absolute top-6 right-6 h-10 w-10 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex-1 flex flex-col justify-center">
                            <nav className="space-y-6">
                                {LINKS.map((link, i) => (
                                    <motion.div
                                        key={link.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + (i * 0.1) }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="text-4xl sm:text-5xl font-black uppercase tracking-tighter hover:text-red-600 transition-colors flex items-center gap-4 group"
                                        >
                                            <span className="text-sm font-mono text-white/30 group-hover:text-red-600/50">0{i + 1}</span>
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </nav>
                        </div>

                        <div className="space-y-4 pt-12 border-t border-white/10">
                            <Link
                                href="/tracking"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full py-4 text-center border-2 border-white/20 uppercase tracking-widest font-bold text-sm hover:bg-white/10 transition-colors"
                            >
                                Rastrear Orden en Vivo
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full py-4 text-center bg-red-600 text-white uppercase tracking-widest font-bold text-sm"
                            >
                                Acceder al Garaje Digital
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
