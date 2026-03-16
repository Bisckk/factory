/**
 * UI store — controls client-side UI state.
 *
 * Manages:
 * - Sidebar open/close (desktop persists, mobile overlays)
 * - Active modal tracking
 * - Mobile navigation state
 */
import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    mobileSidebarOpen: boolean;
    activeModal: string | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleMobileSidebar: () => void;
    setMobileSidebarOpen: (open: boolean) => void;
    openModal: (id: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    mobileSidebarOpen: false,
    activeModal: null,
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    toggleMobileSidebar: () =>
        set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
    setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
    openModal: (id) => set({ activeModal: id }),
    closeModal: () => set({ activeModal: null }),
}));
