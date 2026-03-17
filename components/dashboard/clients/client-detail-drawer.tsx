'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, Mail, Bike, Save, Calendar, Wrench, Edit3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useClientsStore, type ClientMotorcycle } from '@/stores/clients.store';

type ClientDetailDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    clientId: string | null;
};

export function ClientDetailDrawer({ isOpen, onClose, clientId }: ClientDetailDrawerProps) {
    const client = useClientsStore((s) => (clientId ? s.getClient(clientId) : undefined));
    const updateClient = useClientsStore((s) => s.updateClient);
    const addMotorcycle = useClientsStore((s) => s.addMotorcycle);
    const updateMotorcycle = useClientsStore((s) => s.updateMotorcycle);
    const deleteMotorcycle = useClientsStore((s) => s.deleteMotorcycle);

    const [isEditing, setIsEditing] = useState(false);
    const [isAddingMoto, setIsAddingMoto] = useState(false);

    const [form, setForm] = useState({
        name: '',
        phone: '',
        cedula: '',
        email: '',
    });

    const [newMoto, setNewMoto] = useState({
        plate: '',
        brand: '',
        model: '',
        km: '',
    });

    const [editingMotoId, setEditingMotoId] = useState<string | null>(null);
    const [editingMoto, setEditingMoto] = useState<Partial<ClientMotorcycle>>({});

    useEffect(() => {
        if (!isOpen) return;
        setIsEditing(false);
        setIsAddingMoto(false);
        setEditingMotoId(null);
        setEditingMoto({});
        setNewMoto({ plate: '', brand: '', model: '', km: '' });
        if (client) {
            setForm({
                name: client.name,
                phone: client.phone,
                cedula: client.cedula,
                email: client.email,
            });
        }
    }, [isOpen, clientId, client?.name, client?.phone, client?.cedula, client?.email]);

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

    const canSaveClient = useMemo(() => {
        return Boolean(form.name.trim() && form.phone.trim() && form.cedula.trim());
    }, [form]);

    const canAddMoto = useMemo(() => {
        return Boolean(newMoto.plate.trim() && newMoto.brand.trim() && newMoto.model.trim());
    }, [newMoto]);

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
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <User className="h-5 w-5 text-red-500" />
                                    Perfil del Cliente
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">ID: {clientId ?? '-'}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditing((v) => !v)}
                                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    disabled={!client}
                                >
                                    {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {!client ? (
                                <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
                                    <p className="text-sm font-medium text-zinc-500">Cliente no encontrado.</p>
                                </div>
                            ) : (
                                <>
                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                            Información Personal
                                        </h3>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                                    Nombre Completo *
                                                </label>
                                                <input
                                                    value={form.name}
                                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                                    readOnly={!isEditing}
                                                    className={cn(
                                                        inputClass,
                                                        !isEditing &&
                                                            'read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:pl-0'
                                                    )}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                                        Teléfono *
                                                    </label>
                                                    <div className="flex items-center">
                                                        {!isEditing && <Phone className="h-4 w-4 text-zinc-600 mr-2" />}
                                                        <input
                                                            value={form.phone}
                                                            onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                                                            readOnly={!isEditing}
                                                            className={cn(
                                                                inputClass,
                                                                !isEditing &&
                                                                    'read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0'
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                                        Cédula *
                                                    </label>
                                                    <input
                                                        value={form.cedula}
                                                        onChange={(e) => setForm((p) => ({ ...p, cedula: e.target.value }))}
                                                        readOnly={!isEditing}
                                                        className={cn(
                                                            inputClass,
                                                            !isEditing &&
                                                                'read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                                                    Correo
                                                </label>
                                                <div className="flex items-center">
                                                    {!isEditing && <Mail className="h-4 w-4 text-zinc-600 mr-2" />}
                                                    <input
                                                        value={form.email}
                                                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                                        readOnly={!isEditing}
                                                        className={cn(
                                                            inputClass,
                                                            !isEditing &&
                                                                'read-only:outline-none read-only:ring-0 read-only:border-transparent read-only:bg-transparent read-only:p-0'
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {isEditing && (
                                            <button
                                                type="button"
                                                disabled={!canSaveClient}
                                                onClick={() => {
                                                    if (!clientId) return;
                                                    if (!canSaveClient) {
                                                        toast.error('Completa nombre, teléfono y cédula.');
                                                        return;
                                                    }
                                                    updateClient({
                                                        id: clientId,
                                                        name: form.name.trim(),
                                                        phone: form.phone.trim(),
                                                        cedula: form.cedula.trim(),
                                                        email: form.email.trim() || '-',
                                                    });
                                                    toast.success('Cambios guardados.');
                                                    setIsEditing(false);
                                                }}
                                                className={cn(
                                                    'w-full flex justify-center py-3 mt-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                                    canSaveClient
                                                        ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                                        : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                                )}
                                            >
                                                <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                                            </button>
                                        )}
                                    </section>

                                    <section className="space-y-4">
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                Motocicletas Registradas
                                            </h3>
                                            <button
                                                onClick={() => setIsAddingMoto((v) => !v)}
                                                className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" /> Agregar Moto
                                            </button>
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isAddingMoto && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="col-span-2">
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                                                    Placa *
                                                                </label>
                                                                <input
                                                                    value={newMoto.plate}
                                                                    onChange={(e) => setNewMoto((p) => ({ ...p, plate: e.target.value }))}
                                                                    placeholder="ABC-123"
                                                                    className={cn(inputClass, 'font-mono uppercase tracking-widest')}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                                                    Marca *
                                                                </label>
                                                                <input
                                                                    value={newMoto.brand}
                                                                    onChange={(e) => setNewMoto((p) => ({ ...p, brand: e.target.value }))}
                                                                    placeholder="Yamaha"
                                                                    className={inputClass}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                                                    Modelo *
                                                                </label>
                                                                <input
                                                                    value={newMoto.model}
                                                                    onChange={(e) => setNewMoto((p) => ({ ...p, model: e.target.value }))}
                                                                    placeholder="DT 175"
                                                                    className={inputClass}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">
                                                                Kilometraje (opcional)
                                                            </label>
                                                            <input
                                                                value={newMoto.km}
                                                                onChange={(e) => setNewMoto((p) => ({ ...p, km: e.target.value }))}
                                                                placeholder="0"
                                                                className={cn(inputClass, 'font-mono')}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            disabled={!canAddMoto}
                                                            onClick={() => {
                                                                if (!clientId) return;
                                                                if (!canAddMoto) {
                                                                    toast.error('Completa placa, marca y modelo.');
                                                                    return;
                                                                }
                                                                addMotorcycle(clientId, {
                                                                    plate: newMoto.plate.trim().toUpperCase(),
                                                                    brand: newMoto.brand.trim(),
                                                                    model: newMoto.model.trim(),
                                                                    km: newMoto.km.trim() || undefined,
                                                                });
                                                                toast.success('Moto agregada.');
                                                                setNewMoto({ plate: '', brand: '', model: '', km: '' });
                                                                setIsAddingMoto(false);
                                                            }}
                                                            className={cn(
                                                                'w-full flex justify-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                                                canAddMoto
                                                                    ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                                                    : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                                            )}
                                                        >
                                                            Agregar Moto
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-3">
                                            {client.motorcycles.length === 0 ? (
                                                <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center space-y-2">
                                                    <Bike className="h-6 w-6 text-zinc-700 mx-auto" />
                                                    <p className="text-xs text-zinc-500 font-medium">
                                                        Este cliente no tiene motos registradas.
                                                    </p>
                                                </div>
                                            ) : (
                                                client.motorcycles.map((moto) => {
                                                    const isMotoEditing = editingMotoId === moto.id;
                                                    return (
                                                        <div
                                                            key={moto.id}
                                                            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex items-start gap-4">
                                                                    <div className="h-10 w-10 bg-[#141417] border border-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                                                                        <Bike className="h-5 w-5 text-zinc-500" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        {isMotoEditing ? (
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div className="col-span-2">
                                                                                    <input
                                                                                        value={String(editingMoto.plate ?? '')}
                                                                                        onChange={(e) =>
                                                                                            setEditingMoto((p) => ({ ...p, plate: e.target.value }))
                                                                                        }
                                                                                        className={cn(inputClass, 'font-mono uppercase tracking-widest')}
                                                                                        placeholder="PLACA"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <input
                                                                                        value={String(editingMoto.brand ?? '')}
                                                                                        onChange={(e) =>
                                                                                            setEditingMoto((p) => ({ ...p, brand: e.target.value }))
                                                                                        }
                                                                                        className={inputClass}
                                                                                        placeholder="Marca"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <input
                                                                                        value={String(editingMoto.model ?? '')}
                                                                                        onChange={(e) =>
                                                                                            setEditingMoto((p) => ({ ...p, model: e.target.value }))
                                                                                        }
                                                                                        className={inputClass}
                                                                                        placeholder="Modelo"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <p className="text-sm font-bold text-zinc-200">
                                                                                    {moto.brand} {moto.model}
                                                                                </p>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold bg-[#141417] text-amber-500 px-2 rounded-sm border border-zinc-800">
                                                                                        {moto.plate}
                                                                                    </span>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {isMotoEditing ? (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (!clientId) return;
                                                                                    const plate = String(editingMoto.plate ?? '').trim();
                                                                                    const brand = String(editingMoto.brand ?? '').trim();
                                                                                    const model = String(editingMoto.model ?? '').trim();
                                                                                    if (!plate || !brand || !model) {
                                                                                        toast.error('Completa placa, marca y modelo.');
                                                                                        return;
                                                                                    }
                                                                                    updateMotorcycle(clientId, moto.id, {
                                                                                        plate: plate.toUpperCase(),
                                                                                        brand,
                                                                                        model,
                                                                                    });
                                                                                    toast.success('Moto actualizada.');
                                                                                    setEditingMotoId(null);
                                                                                    setEditingMoto({});
                                                                                }}
                                                                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                                            >
                                                                                <Save className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingMotoId(null);
                                                                                    setEditingMoto({});
                                                                                }}
                                                                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingMotoId(moto.id);
                                                                                    setEditingMoto({ plate: moto.plate, brand: moto.brand, model: moto.model });
                                                                                }}
                                                                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-200 transition-colors"
                                                                            >
                                                                                <Edit3 className="h-4 w-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (!clientId) return;
                                                                                    deleteMotorcycle(clientId, moto.id);
                                                                                    toast.success('Moto eliminada.');
                                                                                }}
                                                                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-300 transition-colors"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </section>

                                    <section className="space-y-4">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                            Resumen de Actividad
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                                                <Wrench className="h-6 w-6 text-zinc-600 mb-2" />
                                                <p className="text-xs text-zinc-400 font-medium">Órdenes Activas</p>
                                                <p className="text-lg font-bold text-zinc-200 mt-1">{client.active_orders}</p>
                                            </div>
                                            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center">
                                                <Calendar className="h-6 w-6 text-zinc-600 mb-2" />
                                                <p className="text-xs text-zinc-400 font-medium">Cliente Desde</p>
                                                <p className="text-[10px] font-bold uppercase text-zinc-200 mt-2">{client.registered}</p>
                                            </div>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

