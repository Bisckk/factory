import { PublicNavbar } from '@/components/layout/public-navbar';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // The public layout encapsulates all marketing/landing pages
    // and provides the shared navbar and footer.
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PublicNavbar />

            {/* Main content takes remaining height */}
            <main className="flex-1">
                {children}
            </main>

            <PublicFooter />
        </div>
    );
}
