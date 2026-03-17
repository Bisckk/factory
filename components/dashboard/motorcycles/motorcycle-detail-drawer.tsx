'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bike, Calendar, Check, ClipboardPlus, Clock, Pencil, ShieldAlert, Trash2, User, Wrench, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useClientsStore } from '@/stores/clients.store';
import { useMotorcycleRecordsStore, type MotorcycleRecordStatus } from '@/stores/motorcycle-records.store';
import { useAppointmentsStore } from '@/stores/appointments.store';
import { MotorcycleDrawer } from '@/components/dashboard/motorcycles/motorcycle-drawer';

interface MotorcycleDetailDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    motoId: string | null;
}

export function MotorcycleDetailDrawer({ isOpen, onClose, motoId }: MotorcycleDetailDrawerProps) {
    const getMotorcycle = useClientsStore((s) => s.getMotorcycle);
    const updateMotorcycle = useClientsStore((s) => s.updateMotorcycle);
    const getByMoto = useMotorcycleRecordsStore((s) => s.getByMoto);
    const addRecord = useMotorcycleRecordsStore((s) => s.addRecord);
    const deleteRecord = useMotorcycleRecordsStore((s) => s.deleteRecord);
    const appointments = useAppointmentsStore((s) => s.appointments);

    const ctx = useMemo(() => (motoId ? getMotorcycle(motoId) : undefined), [getMotorcycle, motoId]);
    const history = useMemo(() => (motoId ? getByMoto(motoId) : []), [getByMoto, motoId]);

    const mileage = useMemo(() => {
        const raw = ctx?.moto.km ? Number(String(ctx.moto.km).replace(/[^\d]/g, '')) : 0;
        return Number.isFinite(raw) ? raw : 0;
    }, [ctx?.moto.km]);

    const upcoming = useMemo(() => {
        if (!motoId) return [];
        const now = Date.now();
        return appointments
            .filter((a) => a.motorcycleId === motoId && a.scheduledAt >= now)
            .slice()
            .sort((a, b) => a.scheduledAt - b.scheduledAt)
            .slice(0, 3);
    }, [appointments, motoId]);

    const cover = ctx?.moto.images?.[0]?.dataUrl;

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm'),
        serviceType: '',
        mileage: '',
        mechanic: '',
        notes: '',
        status: 'completed' as MotorcycleRecordStatus,
    });
    const [isMotoEditOpen, setIsMotoEditOpen] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-red-500" />
                                    Historia Clínica
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Expediente completo y registro de mantenimientos.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {ctx && (
                                    <>
                                        <button
                                            onClick={() => setIsAddOpen(true)}
                                            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                            title="Agregar registro"
                                        >
                                            <ClipboardPlus className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsMotoEditOpen(true)}
                                            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                            title="Editar moto"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </>
                                )}
                                <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Header Vehicle Info */}
                            <div className="flex items-start gap-5">
                                <div className="h-16 w-16 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                                    {cover ? <img src={cover} alt="Foto" className="h-full w-full object-cover" /> : <Bike className="h-8 w-8 text-zinc-500" />}
                                </div>
                                {ctx ? (
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-zinc-100">{ctx.moto.brand} {ctx.moto.model}</h3>
                                            <span className="inline-flex items-center justify-center rounded border border-yellow-500/30 bg-yellow-500/10 px-2 py-0.5 font-mono text-sm font-bold text-yellow-500 tracking-widest">
                                                {ctx.moto.plate}
                                            </span>
                                        </div>
                                        <p className="text-zinc-500 text-sm font-medium mt-1">
                                            {ctx.moto.year ? `Modelo ${ctx.moto.year}` : 'Modelo sin año'}
                                            {ctx.moto.color ? ` • Color ${ctx.moto.color}` : ''}
                                            {ctx.moto.engineCc ? ` • ${ctx.moto.engineCc} cc` : ''}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-zinc-100">Moto no encontrada</h3>
                                        <p className="text-zinc-500 text-sm font-medium mt-1">No existe en el sistema o fue eliminada.</p>
                                    </div>
                                )}
                            </div>

                            {/* Indicators */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                        <User className="h-4 w-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Propietario</span>
                                    </div>
                                    <p className="text-sm font-bold text-zinc-200">{ctx?.client.name ?? '-'}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{ctx?.client.phone ?? ''}</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                        <Activity className="h-4 w-4" />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Kilometraje Actual</span>
                                    </div>
                                    <p className="text-sm font-bold font-mono text-zinc-200">{mileage.toLocaleString('es-CO')} km</p>
                                </div>
                            </div>

                            {upcoming.length > 0 && (
                                <section className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Próximas Citas</h3>
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                                            {upcoming.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {upcoming.map((apt) => (
                                            <div key={apt.id} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-zinc-200 truncate">{apt.serviceType}</p>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(apt.scheduledAt), "dd MMM yyyy", { locale: es })}
                                                        <span className="text-zinc-700">•</span>
                                                        <Clock className="h-3 w-3" />
                                                        {format(new Date(apt.scheduledAt), "HH:mm", { locale: es })}
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full",
                                                    apt.status === 'confirmed' ? "bg-blue-500/10 text-blue-400" :
                                                        apt.status === 'arrived' ? "bg-emerald-500/10 text-emerald-400" :
                                                            apt.status === 'cancelled' ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-500"
                                                )}>
                                                    {apt.status === 'confirmed' ? 'Confirmada' : apt.status === 'arrived' ? 'En Taller' : apt.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Service Timeline */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Línea de Vida</h3>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600 bg-zinc-900 px-2 py-1 rounded-sm border border-zinc-800">
                                        {history.length} Registros
                                    </span>
                                </div>

                                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">

                                    {history.map((record) => (
                                        <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                            {/* Timeline dot */}
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#141417] text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors group-hover:bg-red-500/10 group-hover:text-red-500 group-hover:border-red-500/20">
                                                <Wrench className="w-3.5 h-3.5" />
                                            </div>

                                            {/* Card */}
                                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 shadow-sm transition-colors group-hover:border-zinc-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 px-2 py-1 rounded-sm">
                                                        <Calendar className="h-3 w-3" />
                                                        {format(new Date(record.occurredAt), "MMM yyyy", { locale: es })}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {typeof record.mileage === 'number' && (
                                                            <span className="text-xs font-mono text-zinc-500">{record.mileage.toLocaleString('es-CO')} km</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const ok = window.confirm('¿Eliminar este registro?');
                                                                if (!ok) return;
                                                                deleteRecord(record.id);
                                                                toast.success('Registro eliminado.');
                                                            }}
                                                            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-300 transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-200 mb-1">{record.serviceType}</h4>
                                                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                                    {record.notes}
                                                </p>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                                    <User className="h-3 w-3" /> Mecánico: {record.mechanic ?? '—'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Beginning of time */}
                                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-800 bg-[#141417] text-zinc-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <ShieldAlert className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] text-xs font-medium text-zinc-600 text-center md:text-left md:group-even:pr-4 md:group-odd:pl-4">
                                            Inicio de registros en el sistema.
                                        </div>
                                    </div>

                                </div>
                            </section>

                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {isAddOpen && ctx && motoId && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsAddOpen(false)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="fixed inset-x-4 top-16 z-[70] mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-[#141417] shadow-2xl overflow-hidden"
                                >
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <ClipboardPlus className="h-4 w-4 text-red-500" />
                                            <p className="text-sm font-bold text-zinc-100">Nuevo registro</p>
                                        </div>
                                        <button
                                            onClick={() => setIsAddOpen(false)}
                                            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Día *</label>
                                                <input value={newRecord.date} onChange={(e) => setNewRecord((p) => ({ ...p, date: e.target.value }))} type="date" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Hora *</label>
                                                <input value={newRecord.time} onChange={(e) => setNewRecord((p) => ({ ...p, time: e.target.value }))} type="time" className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Tipo de servicio *</label>
                                            <input value={newRecord.serviceType} onChange={(e) => setNewRecord((p) => ({ ...p, serviceType: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium" placeholder="Ej. Mantenimiento, diagnóstico..." />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Kilometraje</label>
                                                <input value={newRecord.mileage} onChange={(e) => setNewRecord((p) => ({ ...p, mileage: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium font-mono" placeholder="0" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Mecánico</label>
                                                <input value={newRecord.mechanic} onChange={(e) => setNewRecord((p) => ({ ...p, mechanic: e.target.value }))} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium" placeholder="Nombre" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Notas *</label>
                                            <textarea value={newRecord.notes} onChange={(e) => setNewRecord((p) => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all resize-none" placeholder="Detalle de lo realizado..." />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {(['completed', 'in_progress', 'pending'] as MotorcycleRecordStatus[]).map((st) => {
                                                const isActive = newRecord.status === st;
                                                const label = st === 'completed' ? 'Completado' : st === 'in_progress' ? 'En progreso' : 'Pendiente';
                                                return (
                                                    <button
                                                        key={st}
                                                        type="button"
                                                        onClick={() => setNewRecord((p) => ({ ...p, status: st }))}
                                                        className={cn(
                                                            "px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                            isActive ? "bg-red-500/10 text-red-300 border-red-500/20" : "bg-zinc-900/40 text-zinc-500 border-zinc-800 hover:bg-zinc-800/40"
                                                        )}
                                                    >
                                                        {label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-5 border-t border-zinc-800 grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddOpen(false)}
                                            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (!newRecord.date || !newRecord.time) {
                                                    toast.error('Selecciona fecha y hora.');
                                                    return;
                                                }
                                                if (!newRecord.serviceType.trim()) {
                                                    toast.error('Escribe el tipo de servicio.');
                                                    return;
                                                }
                                                if (!newRecord.notes.trim()) {
                                                    toast.error('Escribe las notas del registro.');
                                                    return;
                                                }
                                                const occurredAt = new Date(`${newRecord.date}T${newRecord.time}`).getTime();
                                                const km = newRecord.mileage.trim() ? Number(newRecord.mileage.replace(/[^\d]/g, '')) : undefined;
                                                addRecord({
                                                    motoId,
                                                    occurredAt,
                                                    serviceType: newRecord.serviceType.trim(),
                                                    mileage: typeof km === 'number' && Number.isFinite(km) ? km : undefined,
                                                    mechanic: newRecord.mechanic.trim() || undefined,
                                                    notes: newRecord.notes.trim(),
                                                    status: newRecord.status,
                                                });
                                                if (newRecord.mileage.trim()) {
                                                    updateMotorcycle(ctx.client.id, motoId, { km: newRecord.mileage.trim() });
                                                }
                                                toast.success('Registro agregado.');
                                                setIsAddOpen(false);
                                            }}
                                            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white bg-red-600 hover:bg-red-700 border border-red-500/20"
                                        >
                                            <Check className="h-4 w-4 mr-2" /> Guardar
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <MotorcycleDrawer
                        isOpen={isMotoEditOpen}
                        onClose={() => setIsMotoEditOpen(false)}
                        motoId={motoId}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
