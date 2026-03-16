'use client';

/**
 * Register Page — Dark Theme
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, UserPlus, Mail, KeyRound, User, Phone } from 'lucide-react';
import { createBrowserClient, hasSupabaseBrowserEnv } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password || !formData.full_name) {
            toast.error('Por favor completa los campos obligatorios.');
            return;
        }

        setLoading(true);

        try {
            if (!hasSupabaseBrowserEnv()) {
                toast.error('Falta configuración de Supabase en el entorno.');
                return;
            }

            const supabase = createBrowserClient();
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.full_name,
                        phone: formData.phone,
                    }
                }
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Cuenta creada exitosamente. Bienvenido al Garaje Digital.');
            router.push('/client');
            router.refresh();

        } catch (err: unknown) {
            console.error('Registration error:', err);
            toast.error('Ocurrió un error al crear la cuenta. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex h-14 w-14 items-center justify-center bg-zinc-800 rounded-br-2xl rounded-tl-2xl shadow-xl shadow-black/50 mb-6 hover:scale-105 transition-transform">
                        <UserPlus className="h-7 w-7 text-white" />
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                        Nuevo Cliente
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 font-medium tracking-wide">
                        Crea tu perfil para gestionar tus motocicletas.
                    </p>
                </div>

                <div className="bg-[#141417] rounded-3xl border border-zinc-800 p-8 sm:p-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-red-600/5 rounded-br-full -z-10 blur-xl pointer-events-none" />

                    <form onSubmit={handleRegister} className="space-y-5">

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    Nombre Completo *
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    Teléfono Móvil
                                </label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Ej. 300 000 0000"
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    Correo Electrónico *
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="tucorreo@ejemplo.com"
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    Contraseña *
                                </label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Mínimo 6 caracteres"
                                        minLength={6}
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-mono"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-zinc-100 hover:bg-white text-zinc-900 focus:outline-none shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group active:scale-[0.98] mt-6"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Crear Cuenta <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-zinc-500 mt-10 font-medium">
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" className="font-bold text-zinc-200 hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] ml-1.5 border-b border-zinc-800 pb-0.5">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
