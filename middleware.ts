/**
 * Root middleware — route protection by role.
 *
 * Decision matrix:
 * - Public routes (/, /tracking, /login, /register): no auth required
 * - /dashboard/*: requires admin, mechanic, or accountant role
 * - /client/*: requires client role
 * - Role mismatch → redirect to appropriate dashboard
 * - No session → redirect to /login
 */
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import type { UserRole } from '@/types/app.types';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/tracking'];

const ROLE_ROUTES: Record<UserRole, string[]> = {
    admin: ['/dashboard'],
    mechanic: ['/dashboard/orders', '/dashboard/inventory', '/dashboard/appointments', '/dashboard'],
    client: ['/client'],
    accountant: ['/dashboard/accounting', '/dashboard/invoices', '/dashboard/payroll', '/dashboard'],
    receptionist: ['/dashboard/orders', '/dashboard/inventory', '/dashboard/appointments', '/dashboard/motorcycles', '/dashboard', '/dashboard/clients'],
};

const ROLE_DEFAULT_REDIRECT: Record<UserRole, string> = {
    admin: '/dashboard',
    mechanic: '/dashboard/orders',
    client: '/client',
    accountant: '/dashboard/accounting',
    receptionist: '/dashboard/appointments',
};

function hasSupabaseEnv() {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

function hasRouteAccess(role: UserRole, pathname: string): boolean {
    const allowedRoutes = ROLE_ROUTES[role];
    if (!allowedRoutes) return false;
    return allowedRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (!hasSupabaseEnv()) {
        if (isPublicRoute(pathname) || pathname.startsWith('/api')) {
            return NextResponse.next();
        }
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // 1. Always refresh the session
    const { supabaseResponse, user, supabase } = await updateSession(request);

    // 2. Public routes — always accessible
    if (isPublicRoute(pathname)) {
        return supabaseResponse;
    }

    // 3. API routes — handled by their own auth
    if (pathname.startsWith('/api')) {
        return supabaseResponse;
    }

    // 4. No user → login
    if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // 5. Get the user's role from the profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = (profile?.role as UserRole) ?? 'client';

    // 6. Check role-based access
    if (!hasRouteAccess(role, pathname)) {
        const redirectPath = ROLE_DEFAULT_REDIRECT[role] ?? '/';
        const url = request.nextUrl.clone();
        url.pathname = redirectPath;
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - Public assets
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
