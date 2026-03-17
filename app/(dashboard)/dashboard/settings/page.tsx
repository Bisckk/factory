'use client';

/**
 * Settings view for the internal SaaS dashboard (Theme mapping to business context) — Dark Theme.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Settings, Shield, User, Bell, Database, Store, Clock3, Wrench, Save, Trash2, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useSettingsStore, type DayKey } from '@/stores/settings.store';
import { Switch } from '@/components/ui/switch';

type SettingsSection = 'business' | 'hours' | 'catalogs' | 'roles' | 'notifications';

const DAY_LABELS: Record<DayKey, string> = {
    mon: 'Lunes',
    tue: 'Martes',
    wed: 'Miércoles',
    thu: 'Jueves',
    fri: 'Viernes',
    sat: 'Sábado',
    sun: 'Domingo',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Efectivo',
    transfer: 'Transferencia',
    card: 'Tarjeta',
    advance: 'Anticipo',
};

export default function SettingsPage() {
    const { user, role } = useAuthStore();
    const settings = useSettingsStore((s) => s.settings);
    const updateProfile = useSettingsStore((s) => s.updateProfile);
    const updatePreferences = useSettingsStore((s) => s.updatePreferences);
    const updateNotifications = useSettingsStore((s) => s.updateNotifications);
    const setDayHours = useSettingsStore((s) => s.setDayHours);
    const addServiceType = useSettingsStore((s) => s.addServiceType);
    const removeServiceType = useSettingsStore((s) => s.removeServiceType);
    const addInventoryCategory = useSettingsStore((s) => s.addInventoryCategory);
    const removeInventoryCategory = useSettingsStore((s) => s.removeInventoryCategory);
    const setPaymentMethods = useSettingsStore((s) => s.setPaymentMethods);
    const resetToDefaults = useSettingsStore((s) => s.resetToDefaults);

    const isRestricted = role !== 'admin';
    const [section, setSection] = useState<SettingsSection>('business');

    const [profileForm, setProfileForm] = useState(settings.profile);
    const [serviceTypeDraft, setServiceTypeDraft] = useState('');
    const [categoryDraft, setCategoryDraft] = useState('');

    useEffect(() => {
        setProfileForm(settings.profile);
    }, [settings.profile]);

    if (isRestricted) {
        return (
            <div className="max-w-2xl mx-auto mt-20 text-center">
                <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold tracking-tight text-white">Acceso Restringido</h1>
                <p className="mt-2 text-zinc-500">Solo administradores pueden modificar los ajustes del sistema.</p>
            </div>
        );
    }

    const navItems: { key: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
        { key: 'business', label: 'Negocio', icon: Store },
        { key: 'hours', label: 'Horarios', icon: Clock3 },
        { key: 'catalogs', label: 'Catálogos', icon: Database },
        { key: 'roles', label: 'Equipo y Roles', icon: Shield },
        { key: 'notifications', label: 'Notificaciones', icon: Bell },
    ];

    const inputClass =
        'h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:border-zinc-700 focus:bg-zinc-900 focus:outline-none transition-colors';

    const sectionTitle = useMemo(() => {
        return navItems.find((x) => x.key === section)?.label ?? 'Configuración';
    }, [section]);

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-4 sm:px-6">
            <header className="pt-2">
                <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-zinc-500" />
                    <h1 className="text-2xl font-extrabold tracking-tight text-zinc-100">Configuración</h1>
                </div>
                <p className="text-sm text-zinc-500">Define parámetros del negocio, horarios, catálogos y notificaciones del taller.</p>
            </header>

            <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.key === section;
                    return (
                        <button
                            key={item.key}
                            onClick={() => setSection(item.key)}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest border transition-colors shrink-0",
                                active
                                    ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                                    : "bg-[#141417] text-zinc-500 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100"
                            )}
                        >
                            <Icon className="h-4 w-4" /> {item.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="hidden md:block md:col-span-1 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.key === section;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setSection(item.key)}
                                className={cn(
                                    "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold border transition-colors",
                                    active
                                        ? "bg-zinc-100 text-zinc-900 border-zinc-100"
                                        : "text-zinc-500 border-transparent hover:bg-zinc-800 hover:text-zinc-100"
                                )}
                            >
                                <Icon className="h-4 w-4" /> {item.label}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => {
                            const ok = window.confirm('¿Restablecer configuración a valores por defecto?');
                            if (!ok) return;
                            resetToDefaults();
                            toast.success('Configuración restablecida.');
                        }}
                        className="w-full mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 transition-colors"
                    >
                        <Trash2 className="h-4 w-4" /> Restablecer
                    </button>
                </div>

                <div className="md:col-span-3 rounded-xl border border-zinc-800 bg-[#141417] p-5 sm:p-6 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100 leading-none">{sectionTitle}</h2>
                            <p className="text-sm text-zinc-500 mt-2">
                                Última actualización: <span className="text-zinc-400 font-semibold">{new Date(settings.updatedAt).toLocaleString('es-CO')}</span>
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                            <User className="h-4 w-4 text-zinc-500" />
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-200 truncate">{user?.full_name || 'Administrador'}</p>
                                <p className="text-[10px] uppercase tracking-widest text-zinc-600">Admin</p>
                            </div>
                        </div>
                    </div>

                    {section === 'business' && (
                        <div className="space-y-5 pt-6 border-t border-zinc-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre del Taller *</label>
                                    <input
                                        value={profileForm.workshopName}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, workshopName: e.target.value }))}
                                        placeholder="Ej. Mototaller Central"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Razón Social</label>
                                    <input
                                        value={profileForm.legalName ?? ''}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, legalName: e.target.value }))}
                                        placeholder="Ej. Mototaller Central S.A.S."
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">NIT</label>
                                    <input
                                        value={profileForm.nit ?? ''}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, nit: e.target.value }))}
                                        placeholder="Ej. 900123456-7"
                                        className={cn(inputClass, 'font-mono')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Teléfono</label>
                                    <input
                                        value={profileForm.phone ?? ''}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                                        placeholder="Ej. 300 123 4567"
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Dirección</label>
                                    <input
                                        value={profileForm.address ?? ''}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, address: e.target.value }))}
                                        placeholder="Ej. Calle 123 #45-67"
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ciudad</label>
                                    <input
                                        value={profileForm.city ?? ''}
                                        onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                                        placeholder="Ej. Medellín"
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        if (!profileForm.workshopName.trim()) {
                                            toast.error('Define el nombre del taller.');
                                            return;
                                        }
                                        updateProfile(profileForm);
                                        toast.success('Datos del negocio guardados.');
                                    }}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                >
                                    <Save className="h-4 w-4" /> Guardar
                                </button>
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
                                    Estos datos se usan en documentos como facturas y reportes internos.
                                </div>
                            </div>
                        </div>
                    )}

                    {section === 'hours' && (
                        <div className="space-y-5 pt-6 border-t border-zinc-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Duración de cita</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={settings.preferences.appointmentDurationMin}
                                            onChange={(e) => updatePreferences({ appointmentDurationMin: Number(e.target.value || 0) })}
                                            className={cn(inputClass, 'w-32 font-mono')}
                                        />
                                        <span className="text-sm text-zinc-400 font-semibold">minutos</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Impuesto por defecto</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <input
                                            type="number"
                                            value={settings.preferences.defaultTaxPercent}
                                            onChange={(e) => updatePreferences({ defaultTaxPercent: Number(e.target.value || 0) })}
                                            className={cn(inputClass, 'w-32 font-mono')}
                                        />
                                        <span className="text-sm text-zinc-400 font-semibold">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                                    <Clock3 className="h-4 w-4 text-zinc-500" />
                                    <p className="text-sm font-bold text-zinc-100">Horario del taller</p>
                                </div>
                                <div className="divide-y divide-zinc-800/60">
                                    {(Object.keys(DAY_LABELS) as DayKey[]).map((day) => {
                                        const d = settings.hours[day];
                                        return (
                                            <div key={day} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className="flex items-center gap-3 sm:w-48">
                                                    <Switch
                                                        checked={d.enabled}
                                                        onCheckedChange={(checked) => setDayHours(day, { enabled: Boolean(checked) })}
                                                    />
                                                    <span className="text-sm font-semibold text-zinc-200">{DAY_LABELS[day]}</span>
                                                </div>
                                                <div className={cn("flex-1 grid grid-cols-2 gap-3", !d.enabled && "opacity-40 pointer-events-none")}>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Apertura</label>
                                                        <input
                                                            type="time"
                                                            value={d.start}
                                                            onChange={(e) => setDayHours(day, { start: e.target.value })}
                                                            className={cn(inputClass, 'font-mono')}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cierre</label>
                                                        <input
                                                            type="time"
                                                            value={d.end}
                                                            onChange={(e) => setDayHours(day, { end: e.target.value })}
                                                            className={cn(inputClass, 'font-mono')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {section === 'catalogs' && (
                        <div className="space-y-5 pt-6 border-t border-zinc-800">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-zinc-500" />
                                        <p className="text-sm font-bold text-zinc-100">Tipos de servicio</p>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                value={serviceTypeDraft}
                                                onChange={(e) => setServiceTypeDraft(e.target.value)}
                                                placeholder="Ej. Sincronización"
                                                className={inputClass}
                                            />
                                            <button
                                                onClick={() => {
                                                    addServiceType(serviceTypeDraft);
                                                    setServiceTypeDraft('');
                                                }}
                                                className="shrink-0 inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                        <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 overflow-hidden">
                                            {settings.catalogs.serviceTypes.map((t) => (
                                                <div key={t} className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900/40">
                                                    <span className="text-sm font-semibold text-zinc-200">{t}</span>
                                                    <button
                                                        onClick={() => removeServiceType(t)}
                                                        className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-red-400 transition-colors"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                                        <Database className="h-4 w-4 text-zinc-500" />
                                        <p className="text-sm font-bold text-zinc-100">Categorías de inventario</p>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        <div className="flex gap-2">
                                            <input
                                                value={categoryDraft}
                                                onChange={(e) => setCategoryDraft(e.target.value)}
                                                placeholder="Ej. Llantas"
                                                className={inputClass}
                                            />
                                            <button
                                                onClick={() => {
                                                    addInventoryCategory(categoryDraft);
                                                    setCategoryDraft('');
                                                }}
                                                className="shrink-0 inline-flex h-10 items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                        <div className="divide-y divide-zinc-800/60 rounded-xl border border-zinc-800 overflow-hidden">
                                            {settings.catalogs.inventoryCategories.map((t) => (
                                                <div key={t} className="flex items-center justify-between gap-3 px-4 py-3 bg-zinc-900/40">
                                                    <span className="text-sm font-semibold text-zinc-200">{t}</span>
                                                    <button
                                                        onClick={() => removeInventoryCategory(t)}
                                                        className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-red-400 transition-colors"
                                                    >
                                                        Quitar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-zinc-500" />
                                    <p className="text-sm font-bold text-zinc-100">Métodos de pago</p>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(['cash', 'transfer', 'card', 'advance'] as const).map((m) => {
                                        const checked = settings.catalogs.paymentMethods.includes(m);
                                        return (
                                            <div key={m} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-200">{PAYMENT_METHOD_LABELS[m]}</p>
                                                    <p className="text-[11px] text-zinc-600">Disponible en cobros y transacciones.</p>
                                                </div>
                                                <Switch
                                                    checked={checked}
                                                    onCheckedChange={(value) => {
                                                        const next = value
                                                            ? Array.from(new Set([...settings.catalogs.paymentMethods, m]))
                                                            : settings.catalogs.paymentMethods.filter((x) => x !== m);
                                                        setPaymentMethods(next);
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {section === 'roles' && (
                        <div className="space-y-5 pt-6 border-t border-zinc-800">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-red-400 mt-0.5" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-zinc-100">Control de accesos</p>
                                        <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
                                            Los permisos se basan en roles (Admin, Mecánico, Recepción, Contador). Para registrar o cambiar roles del equipo, gestiona el personal desde el módulo correspondiente.
                                        </p>
                                        <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href="/dashboard/staff"
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                                            >
                                                Ir a Personal
                                            </Link>
                                            <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
                                                Este módulo resume reglas, pero la edición se hace en Personal para mantener consistencia.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {section === 'notifications' && (
                        <div className="space-y-5 pt-6 border-t border-zinc-800">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">WhatsApp</p>
                                        <p className="text-[11px] text-zinc-600 mt-1">Recordatorios y actualizaciones.</p>
                                    </div>
                                    <Switch checked={settings.notifications.whatsappEnabled} onCheckedChange={(v) => updateNotifications({ whatsappEnabled: Boolean(v) })} />
                                </div>
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">SMS</p>
                                        <p className="text-[11px] text-zinc-600 mt-1">Para clientes sin WhatsApp.</p>
                                    </div>
                                    <Switch checked={settings.notifications.smsEnabled} onCheckedChange={(v) => updateNotifications({ smsEnabled: Boolean(v) })} />
                                </div>
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">Email</p>
                                        <p className="text-[11px] text-zinc-600 mt-1">Alertas y reportes.</p>
                                    </div>
                                    <Switch checked={settings.notifications.emailEnabled} onCheckedChange={(v) => updateNotifications({ emailEnabled: Boolean(v) })} />
                                </div>
                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">Alertas de inventario</p>
                                        <p className="text-[11px] text-zinc-600 mt-1">Bajo stock y reposición.</p>
                                    </div>
                                    <Switch checked={settings.notifications.lowStockAlerts} onCheckedChange={(v) => updateNotifications({ lowStockAlerts: Boolean(v) })} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-bold text-zinc-200">Recordatorios de citas</p>
                                        <p className="text-[11px] text-zinc-600 mt-1">Envío automático según la Agenda.</p>
                                    </div>
                                    <Switch checked={settings.notifications.appointmentReminders} onCheckedChange={(v) => updateNotifications({ appointmentReminders: Boolean(v) })} />
                                </div>
                                <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-xs text-zinc-500">
                                    La conexión con proveedores (WhatsApp/SMS) se activará cuando se configure credenciales en producción.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
