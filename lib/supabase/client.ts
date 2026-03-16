/**
 * Supabase browser client.
 * Used in Client Components for real-time subscriptions,
 * auth state, and client-side data mutations.
 */
import { createBrowserClient as createClient } from '@supabase/ssr';

export function hasSupabaseBrowserEnv() {
    return Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
}

export function createBrowserClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
