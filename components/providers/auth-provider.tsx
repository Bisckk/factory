'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth.store';
import { Profile } from '@/types/database.types';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { setUser, setLoading } = useAuthStore();
    const supabase = createBrowserClient();

    useEffect(() => {
        let mounted = true;

        async function getUserProfile() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (mounted && profile) {
                        // Cast is safe since profile row aligns with Profile type
                        setUser(profile as Profile);
                    }
                } else {
                    if (mounted) setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        getUserProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                getUserProfile();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase, setUser, setLoading]);

    return <>{children}</>;
}
