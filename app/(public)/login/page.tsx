'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowRight, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { createBrowserClient, hasSupabaseBrowserEnv } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Por favor ingresa correo y contraseña.');
            return;
        }

        setLoading(true);

        try {
            if (!hasSupabaseBrowserEnv()) {
                toast.error('Falta configuración de Supabase en el entorno.');
                return;
            }

            const supabase = createBrowserClient();
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                toast.error(error.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
                    : error.message);
                return;
            }

            toast.success('Sesión iniciada correctamente.');

            const redirectTo = searchParams.get('redirect');
            if (redirectTo) {
                router.push(redirectTo);
            } else {
                window.location.href = '/dashboard';
            }

        } catch (err: unknown) {
            console.error('Login error:', err);
            toast.error('Ocurrió un error inesperado. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex h-14 w-14 items-center justify-center bg-red-600 rounded-br-2xl rounded-tl-2xl shadow-xl shadow-red-600/30 mb-6 hover:scale-105 transition-transform">
                        <ShieldCheck className="h-7 w-7 text-white" />
                    </Link>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
                        Acceso al Sistema
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500 font-medium tracking-wide">
                        Ingresa a tu garaje digital o panel administrativo.
                    </p>
                </div>

                <div className="bg-[#141417] rounded-3xl border border-zinc-800 p-8 sm:p-10 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-bl-full -z-10 blur-xl pointer-events-none" />

                    <form onSubmit={handleLogin} className="space-y-6">

                        <div className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    Correo Electrónico
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="usuario@ejemplo.com"
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 ml-1">
                                    <span>Contraseña</span>
                                    <a href="#" className="text-red-500 hover:text-red-400 normal-case tracking-normal text-xs">
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-11 pr-4 py-3.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-mono"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full flex justify-center py-4 px-4 rounded-xl text-sm font-bold uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all group active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    Ingresar <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-zinc-500 mt-10 font-medium">
                    ¿Eres nuevo cliente?{' '}
                    <Link href="/register" className="font-bold text-zinc-200 hover:text-red-500 transition-colors uppercase tracking-widest text-[10px] ml-1.5 border-b border-zinc-800 pb-0.5">
                        Crea tu perfil
                    </Link>
                </p>
            </div>
        </div>
    );
}
