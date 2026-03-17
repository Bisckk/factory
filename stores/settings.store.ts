import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaymentMethod } from '@/types/app.types';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type BusinessProfile = {
    workshopName: string;
    legalName?: string;
    nit?: string;
    phone?: string;
    address?: string;
    city?: string;
};

export type BusinessHoursDay = {
    enabled: boolean;
    start: string;
    end: string;
};

export type BusinessHours = Record<DayKey, BusinessHoursDay>;

export type NotificationsSettings = {
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    emailEnabled: boolean;
    lowStockAlerts: boolean;
    appointmentReminders: boolean;
};

export type PreferencesSettings = {
    currency: 'COP';
    defaultTaxPercent: number;
    appointmentDurationMin: number;
};

export type CatalogSettings = {
    serviceTypes: string[];
    inventoryCategories: string[];
    paymentMethods: PaymentMethod[];
};

export type AppSettings = {
    profile: BusinessProfile;
    hours: BusinessHours;
    notifications: NotificationsSettings;
    preferences: PreferencesSettings;
    catalogs: CatalogSettings;
    updatedAt: number;
};

type SettingsState = {
    settings: AppSettings;
    updateProfile: (patch: Partial<BusinessProfile>) => void;
    updatePreferences: (patch: Partial<PreferencesSettings>) => void;
    updateNotifications: (patch: Partial<NotificationsSettings>) => void;
    setDayHours: (day: DayKey, patch: Partial<BusinessHoursDay>) => void;
    addServiceType: (name: string) => void;
    removeServiceType: (name: string) => void;
    addInventoryCategory: (name: string) => void;
    removeInventoryCategory: (name: string) => void;
    setPaymentMethods: (methods: PaymentMethod[]) => void;
    resetToDefaults: () => void;
};

const defaultSettings: AppSettings = {
    profile: {
        workshopName: 'Mototaller',
        legalName: '',
        nit: '',
        phone: '',
        address: '',
        city: '',
    },
    hours: {
        mon: { enabled: true, start: '08:00', end: '18:00' },
        tue: { enabled: true, start: '08:00', end: '18:00' },
        wed: { enabled: true, start: '08:00', end: '18:00' },
        thu: { enabled: true, start: '08:00', end: '18:00' },
        fri: { enabled: true, start: '08:00', end: '18:00' },
        sat: { enabled: true, start: '08:00', end: '14:00' },
        sun: { enabled: false, start: '08:00', end: '14:00' },
    },
    notifications: {
        smsEnabled: false,
        whatsappEnabled: true,
        emailEnabled: false,
        lowStockAlerts: true,
        appointmentReminders: true,
    },
    preferences: {
        currency: 'COP',
        defaultTaxPercent: 0,
        appointmentDurationMin: 30,
    },
    catalogs: {
        serviceTypes: [
            'Mantenimiento General',
            'Diagnóstico',
            'Revisión Eléctrica',
            'Frenos',
            'Suspensión',
            'Kit de arrastre',
            'Cambio de aceite',
        ],
        inventoryCategories: ['Motor', 'Eléctrico', 'Frenos', 'Suspensión', 'Aceites', 'Accesorios'],
        paymentMethods: ['cash', 'transfer', 'card', 'advance'],
    },
    updatedAt: Date.now(),
};

function normalizeName(input: string) {
    return input.trim().replace(/\s+/g, ' ');
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            settings: defaultSettings,
            updateProfile: (patch) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        profile: {
                            ...s.settings.profile,
                            ...patch,
                            workshopName: patch.workshopName != null ? normalizeName(patch.workshopName) : s.settings.profile.workshopName,
                            legalName: patch.legalName != null ? normalizeName(patch.legalName) : s.settings.profile.legalName,
                            nit: patch.nit != null ? normalizeName(patch.nit) : s.settings.profile.nit,
                            phone: patch.phone != null ? normalizeName(patch.phone) : s.settings.profile.phone,
                            address: patch.address != null ? normalizeName(patch.address) : s.settings.profile.address,
                            city: patch.city != null ? normalizeName(patch.city) : s.settings.profile.city,
                        },
                        updatedAt: Date.now(),
                    },
                }));
            },
            updatePreferences: (patch) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        preferences: {
                            ...s.settings.preferences,
                            ...patch,
                            defaultTaxPercent: patch.defaultTaxPercent != null ? Math.max(0, Math.min(100, patch.defaultTaxPercent)) : s.settings.preferences.defaultTaxPercent,
                            appointmentDurationMin: patch.appointmentDurationMin != null ? Math.max(10, Math.min(240, patch.appointmentDurationMin)) : s.settings.preferences.appointmentDurationMin,
                        },
                        updatedAt: Date.now(),
                    },
                }));
            },
            updateNotifications: (patch) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        notifications: { ...s.settings.notifications, ...patch },
                        updatedAt: Date.now(),
                    },
                }));
            },
            setDayHours: (day, patch) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        hours: { ...s.settings.hours, [day]: { ...s.settings.hours[day], ...patch } },
                        updatedAt: Date.now(),
                    },
                }));
            },
            addServiceType: (name) => {
                const n = normalizeName(name);
                if (!n) return;
                const current = get().settings.catalogs.serviceTypes;
                if (current.some((x) => x.toLowerCase() === n.toLowerCase())) return;
                set((s) => ({
                    settings: {
                        ...s.settings,
                        catalogs: { ...s.settings.catalogs, serviceTypes: [n, ...s.settings.catalogs.serviceTypes] },
                        updatedAt: Date.now(),
                    },
                }));
            },
            removeServiceType: (name) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        catalogs: { ...s.settings.catalogs, serviceTypes: s.settings.catalogs.serviceTypes.filter((x) => x !== name) },
                        updatedAt: Date.now(),
                    },
                }));
            },
            addInventoryCategory: (name) => {
                const n = normalizeName(name);
                if (!n) return;
                const current = get().settings.catalogs.inventoryCategories;
                if (current.some((x) => x.toLowerCase() === n.toLowerCase())) return;
                set((s) => ({
                    settings: {
                        ...s.settings,
                        catalogs: { ...s.settings.catalogs, inventoryCategories: [n, ...s.settings.catalogs.inventoryCategories] },
                        updatedAt: Date.now(),
                    },
                }));
            },
            removeInventoryCategory: (name) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        catalogs: { ...s.settings.catalogs, inventoryCategories: s.settings.catalogs.inventoryCategories.filter((x) => x !== name) },
                        updatedAt: Date.now(),
                    },
                }));
            },
            setPaymentMethods: (methods) => {
                set((s) => ({
                    settings: {
                        ...s.settings,
                        catalogs: { ...s.settings.catalogs, paymentMethods: methods },
                        updatedAt: Date.now(),
                    },
                }));
            },
            resetToDefaults: () => {
                set(() => ({ settings: { ...defaultSettings, updatedAt: Date.now() } }));
            },
        }),
        {
            name: 'mototaller_settings_v1',
            version: 1,
        }
    )
);

