import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

import { AuthProvider } from '@/components/providers/auth-provider';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    // The middleware ensures only authorized users hit this layout,
    // but we can fetch profile data in the layout to ensure the client-side
    // Zustand store can be hydrated contextually, though we use an implicit layout offset.

    return (
        <AuthProvider>
            <div className="dark dashboard-dark min-h-screen bg-[#0A0A0B] flex">
                {/* Sidebar acts as left panel on large screens */}
                <Sidebar />

                {/* Main content wrapper respects sidebar width on large screens */}
                <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
                    <Topbar />
                    {/* Main Content padding constraints */}
                    <main className="flex-1 p-4 sm:p-6 md:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </AuthProvider>
    );
}
