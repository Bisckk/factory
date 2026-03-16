/**
 * Supabase server client.
 * Used in Server Components, Server Actions, and Route Handlers.
 * Reads/writes auth cookies for session persistence.
 */
import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerClient() {
    const cookieStore = await cookies();

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch {
                        // The `setAll` method is called from a Server Component,
                        // which cannot set cookies. This is fine because the
                        // middleware will handle refreshing the session.
                    }
                },
            },
        }
    );
}
