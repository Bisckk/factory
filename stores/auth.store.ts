/**
 * Auth store — tracks the active user session and role.
 *
 * Hydrated on app mount from Supabase auth state.
 * Used across the app for:
 * - Conditional UI rendering based on role
 * - Quick access to user profile without re-fetching
 */
import { create } from 'zustand';
import type { UserRole } from '@/types/app.types';
import type { Profile } from '@/types/database.types';

interface AuthState {
    user: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    role: UserRole | null;
    setUser: (user: Profile | null) => void;
    setLoading: (loading: boolean) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,
    setUser: (user) =>
        set({
            user,
            isAuthenticated: !!user,
            role: user?.role ?? null,
            isLoading: false,
        }),
    setLoading: (isLoading) => set({ isLoading }),
    clear: () =>
        set({
            user: null,
            isAuthenticated: false,
            role: null,
            isLoading: false,
        }),
}));
