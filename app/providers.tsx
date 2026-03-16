'use client';

/**
 * Client-side providers wrapper.
 * Wraps the app with:
 * - TanStack Query for data fetching/caching
 * - Sonner for toast notifications
 * - TooltipProvider from shadcn/ui
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // 1 minute
                        refetchOnWindowFocus: false,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                {children}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            fontFamily: 'var(--font-geist-sans)',
                            fontSize: '14px',
                        },
                        classNames: {
                            success: 'border-green-200 bg-green-50 text-green-800',
                            error: 'border-red-200 bg-red-50 text-red-800',
                            warning: 'border-amber-200 bg-amber-50 text-amber-800',
                            info: 'border-blue-200 bg-blue-50 text-blue-800',
                        },
                    }}
                    richColors
                />
            </TooltipProvider>
        </QueryClientProvider>
    );
}
