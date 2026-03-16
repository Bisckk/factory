import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Wrench } from 'lucide-react';
import Link from 'next/link';

export default async function ClientPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    return (
        <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex flex-col">
            <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-[#0A0A0B]/80 px-6 backdrop-blur-md">
                <Link href="/client" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 shadow-lg shadow-red-600/20">
                        <Wrench className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold tracking-tight text-white leading-none">Mi Garaje</span>
                    </div>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-l border-zinc-800 pl-4 ml-2">
                        <div className="hidden sm:block text-right mr-2">
                            <p className="text-xs font-bold text-zinc-100 leading-none">{user.user_metadata?.full_name}</p>
                            <p className="text-[10px] uppercase font-bold text-zinc-600 mt-1">Cliente</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300 uppercase border border-zinc-700 shrink-0">
                            {user.user_metadata?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 md:p-8 w-full max-w-5xl mx-auto">
                {children}
            </main>
        </div>
    );
}
