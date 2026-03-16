import type { Metadata } from 'next';
import { Outfit, Geist_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const outfit = Outfit({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: {
        default: 'MotoTaller — Taller Especializado en Motores 2T',
        template: '%s | MotoTaller',
    },
    description:
        'Taller de motos especializado en motores de 2 tiempos. Diagnóstico, reparación y mantenimiento con seguimiento en tiempo real de tu moto.',
    keywords: [
        'taller de motos',
        'motores 2 tiempos',
        'reparación de motos',
        'taller Colombia',
        'mantenimiento motos',
    ],
    openGraph: {
        title: 'MotoTaller — Taller Especializado en Motores 2T',
        description:
            'Diagnóstico, reparación y mantenimiento con seguimiento en tiempo real.',
        type: 'website',
        locale: 'es_CO',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body
                className={`${outfit.variable} ${geistMono.variable} font-sans antialiased`}
            >
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
