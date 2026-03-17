'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addMinutes, format } from 'date-fns';
import { AlertCircle, Bike, CalendarPlus, Check, Clock, FileText, IdCard, Phone, Plus, Search, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useClientsStore } from '@/stores/clients.store';
import { useAppointmentsStore } from '@/stores/appointments.store';

interface CreateAppointmentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateAppointmentDrawer({ isOpen, onClose }: CreateAppointmentDrawerProps) {
    const clients = useClientsStore((s) => s.clients);
    const addClient = useClientsStore((s) => s.addClient);
    const addMotorcycle = useClientsStore((s) => s.addMotorcycle);
    const addAppointment = useAppointmentsStore((s) => s.addAppointment);

    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [serviceType, setServiceType] = useState('');

    const [clientSearch, setClientSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        cedula: '',
        email: '',
    });

    const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null);
    const [isAddingNewMoto, setIsAddingNewMoto] = useState(false);
    const [newMoto, setNewMoto] = useState({ plate: '', brand: '', model: '', km: '' });

    const selectedClient = clients.find((c) => c.id === selectedClientId);

    useEffect(() => {
        if (!isOpen) return;
        const now = new Date();
        const rounded = addMinutes(now, 30);
        setDate(format(now, 'yyyy-MM-dd'));
        setTime(format(rounded, 'HH:mm'));
        setServiceType('');
        setClientSearch('');
        setSelectedClientId(null);
        setIsCreatingClient(false);
        setNewClient({ name: '', phone: '', cedula: '', email: '' });
        setSelectedMotoId(null);
        setIsAddingNewMoto(false);
        setNewMoto({ plate: '', brand: '', model: '', km: '' });
    }, [isOpen]);

    useEffect(() => {
        if (!selectedClient) return;
        if (selectedClient.motorcycles.length === 0) {
            setIsAddingNewMoto(true);
            setSelectedMotoId(null);
        }
    }, [selectedClientId, selectedClient?.motorcycles.length]);

    const filteredClients = useMemo(() => {
        const q = clientSearch.trim().toLowerCase();
        const base = [...clients].sort((a, b) => {
            if (b.active_orders !== a.active_orders) return b.active_orders - a.active_orders;
            return a.name.localeCompare(b.name);
        });
        const list = q
            ? base.filter((c) => {
                return (
                    c.name.toLowerCase().includes(q) ||
                    c.phone.includes(q) ||
                    c.cedula.includes(q)
                );
            })
            : base;
        return list.slice(0, 12);
    }, [clientSearch, clients]);

    const canCreateClient = useMemo(() => {
        if (!isCreatingClient) return false;
        return Boolean(newClient.name.trim() && newClient.phone.trim() && newClient.cedula.trim());
    }, [isCreatingClient, newClient]);

    const canAddMoto = useMemo(() => {
        if (!isAddingNewMoto) return false;
        return Boolean(newMoto.plate.trim() && newMoto.brand.trim() && newMoto.model.trim());
    }, [isAddingNewMoto, newMoto]);

    const canSubmit = useMemo(() => {
        if (!date || !time) return false;
        if (!selectedClient) return false;
        if (!serviceType.trim()) return false;
        if (isAddingNewMoto) return canAddMoto;
        return Boolean(selectedMotoId);
    }, [canAddMoto, date, isAddingNewMoto, selectedClient, selectedMotoId, serviceType, time]);

    const inputClass =
        'w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium';

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
                                    <CalendarPlus className="h-5 w-5 text-red-500" />
                                    Agendar Cita
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Bloquea un espacio de tiempo para un servicio.</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* Schedule details */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Fecha y Hora</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Día *</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Hora *</label>
                                        <div className="relative group flex items-center">
                                            <Clock className="absolute left-3 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className={cn(inputClass, 'pl-9 pr-4')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Client & Vehicle */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Cliente y Vehículo</h3>
                                {!selectedClient ? (
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Buscar Cliente</label>
                                        <div className="relative group flex items-center">
                                            <Search className="absolute left-3 w-4 h-4 text-zinc-600" />
                                            <input
                                                type="text"
                                                placeholder="Cédula, nombre o teléfono..."
                                                value={clientSearch}
                                                onChange={(e) => {
                                                    setClientSearch(e.target.value);
                                                    if (isCreatingClient) setIsCreatingClient(false);
                                                }}
                                                className={cn(inputClass, 'pl-9 pr-4')}
                                            />
                                        </div>

                                        <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                                            <div className="px-4 py-3 flex items-center justify-between bg-zinc-900/40 border-b border-zinc-800">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                    {clientSearch.trim() ? 'Resultados' : 'Clientes'}
                                                </span>
                                                {!clientSearch.trim() && (
                                                    <span className="text-[10px] text-zinc-600">Escribe para buscar</span>
                                                )}
                                            </div>

                                            {clientSearch.trim() && filteredClients.length === 0 ? (
                                                <div className="p-6 text-center space-y-2">
                                                    <AlertCircle className="h-6 w-6 text-zinc-600 mx-auto" />
                                                    <p className="text-xs text-zinc-500 font-medium">No se encontró ningún cliente</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsCreatingClient(true);
                                                            setNewClient({ name: clientSearch.trim(), phone: '', cedula: '', email: '' });
                                                        }}
                                                        className="inline-flex items-center justify-center gap-2 mt-2 px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/15 transition-colors"
                                                    >
                                                        <Plus className="h-4 w-4" /> Crear Cliente
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-zinc-800/50 max-h-56 overflow-y-auto">
                                                    {filteredClients.map((client) => (
                                                        <button
                                                            key={client.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedClientId(client.id);
                                                                setClientSearch('');
                                                                setSelectedMotoId(null);
                                                                setIsAddingNewMoto(client.motorcycles.length === 0);
                                                            }}
                                                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-zinc-800/50 transition-colors text-left"
                                                        >
                                                            <div className="h-11 w-11 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                                <User className="h-5 w-5 text-zinc-400" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-[15px] font-extrabold text-zinc-200 truncate leading-tight">{client.name}</p>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[11px] text-zinc-500 flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {client.phone}</span>
                                                                    <span className="text-[11px] text-zinc-600">•</span>
                                                                    <span className="text-[11px] text-zinc-500">{client.motorcycles.length} moto{client.motorcycles.length !== 1 ? 's' : ''}</span>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        <AnimatePresence initial={false}>
                                            {isCreatingClient && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="col-span-2">
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Nombre *</label>
                                                                <div className="relative group">
                                                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                                                    <input
                                                                        value={newClient.name}
                                                                        onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                                                                        className={cn(inputClass, 'pl-11')}
                                                                        placeholder="Ej. Juan Pérez"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Teléfono *</label>
                                                                <div className="relative group">
                                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                                                    <input
                                                                        value={newClient.phone}
                                                                        onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                                                                        className={cn(inputClass, 'pl-11')}
                                                                        placeholder="300 000 0000"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Cédula *</label>
                                                                <div className="relative group">
                                                                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                                                    <input
                                                                        value={newClient.cedula}
                                                                        onChange={(e) => setNewClient((p) => ({ ...p, cedula: e.target.value }))}
                                                                        className={cn(inputClass, 'pl-11 font-mono')}
                                                                        placeholder="1020304050"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Correo (opcional)</label>
                                                            <input
                                                                value={newClient.email}
                                                                onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                                                                className={inputClass}
                                                                placeholder="correo@ejemplo.com"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setIsCreatingClient(false)}
                                                                className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={!canCreateClient}
                                                                onClick={() => {
                                                                    if (!canCreateClient) {
                                                                        toast.error('Completa nombre, teléfono y cédula.');
                                                                        return;
                                                                    }
                                                                    const id = addClient({
                                                                        name: newClient.name.trim(),
                                                                        phone: newClient.phone.trim(),
                                                                        cedula: newClient.cedula.trim(),
                                                                        email: newClient.email.trim() || '-',
                                                                    });
                                                                    setSelectedClientId(id);
                                                                    setClientSearch('');
                                                                    setIsCreatingClient(false);
                                                                    toast.success('Cliente creado y vinculado.');
                                                                }}
                                                                className={cn(
                                                                    'w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                                                    canCreateClient
                                                                        ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                                                        : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                                                )}
                                                            >
                                                                <Check className="h-4 w-4 mr-2" /> Vincular Cliente
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedClientId(null);
                                                    setSelectedMotoId(null);
                                                    setIsAddingNewMoto(false);
                                                    setNewMoto({ plate: '', brand: '', model: '', km: '' });
                                                }}
                                                className="absolute top-3 right-3 p-1 text-zinc-600 hover:text-red-400 transition-colors"
                                                title="Cambiar cliente"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                    <User className="h-5 w-5 text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-100">{selectedClient.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedClient.phone}</span>
                                                        <span className="text-[10px] text-zinc-600">•</span>
                                                        <span className="text-[10px] text-zinc-500">C.C. {selectedClient.cedula}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                                Seleccionar Motocicleta
                                            </h4>

                                            {selectedClient.motorcycles.length > 0 && (
                                                <div className="space-y-2">
                                                    {selectedClient.motorcycles.map((moto) => {
                                                        const isSelected = selectedMotoId === moto.id && !isAddingNewMoto;
                                                        return (
                                                            <button
                                                                key={moto.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedMotoId(moto.id);
                                                                    setIsAddingNewMoto(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left",
                                                                    isSelected
                                                                        ? "border-red-500/40 bg-red-500/5 ring-1 ring-red-500/20"
                                                                        : "border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "h-10 w-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors",
                                                                    isSelected
                                                                        ? "bg-red-500/10 border-red-500/30"
                                                                        : "bg-[#141417] border-zinc-800"
                                                                )}>
                                                                    <Bike className={cn("h-5 w-5", isSelected ? "text-red-400" : "text-zinc-500")} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={cn("text-sm font-bold truncate", isSelected ? "text-zinc-100" : "text-zinc-300")}>{moto.brand} {moto.model}</p>
                                                                    <span className="text-[10px] uppercase tracking-widest font-mono font-bold bg-[#141417] text-amber-500 px-2 py-0.5 rounded-sm border border-zinc-800 inline-block mt-1">{moto.plate}</span>
                                                                </div>
                                                                {isSelected && (
                                                                    <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                                                                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {selectedClient.motorcycles.length > 0 && !isAddingNewMoto && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingNewMoto(true);
                                                        setSelectedMotoId(null);
                                                    }}
                                                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                                >
                                                    <Plus className="h-4 w-4" /> Crear Moto
                                                </button>
                                            )}

                                            {isAddingNewMoto && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Nueva Motocicleta</span>
                                                        {selectedClient.motorcycles.length > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIsAddingNewMoto(false);
                                                                    setNewMoto({ plate: '', brand: '', model: '', km: '' });
                                                                }}
                                                                className="text-zinc-600 hover:text-red-400 transition-colors"
                                                            >
                                                                <X className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="col-span-2">
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Placa *</label>
                                                            <input
                                                                type="text"
                                                                placeholder="ABC-123"
                                                                value={newMoto.plate}
                                                                onChange={(e) => setNewMoto((prev) => ({ ...prev, plate: e.target.value }))}
                                                                className={cn(inputClass, "font-mono uppercase tracking-widest")}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Marca *</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Yamaha"
                                                                value={newMoto.brand}
                                                                onChange={(e) => setNewMoto((prev) => ({ ...prev, brand: e.target.value }))}
                                                                className={inputClass}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Modelo *</label>
                                                            <input
                                                                type="text"
                                                                placeholder="DT 175"
                                                                value={newMoto.model}
                                                                onChange={(e) => setNewMoto((prev) => ({ ...prev, model: e.target.value }))}
                                                                className={inputClass}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Kilometraje (opcional)</label>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            value={newMoto.km}
                                                            onChange={(e) => setNewMoto((prev) => ({ ...prev, km: e.target.value }))}
                                                            className={cn(inputClass, "font-mono")}
                                                        />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Información de la Cita</h3>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Motivo de Cita / Servicio *</label>
                                    <div className="relative group flex items-start">
                                        <FileText className="absolute left-3 top-3.5 w-4 h-4 text-zinc-600" />
                                        <textarea
                                            rows={3}
                                            placeholder="Detalla qué requiere o solicita el cliente..."
                                            value={serviceType}
                                            onChange={(e) => setServiceType(e.target.value)}
                                            className={cn(inputClass, 'pl-9 pr-4 resize-none')}
                                        />
                                    </div>
                                </div>
                            </section>

                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0">
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={() => {
                                    if (!date || !time) {
                                        toast.error('Selecciona fecha y hora.');
                                        return;
                                    }
                                    if (!selectedClient) {
                                        toast.error('Selecciona un cliente.');
                                        return;
                                    }
                                    if (!serviceType.trim()) {
                                        toast.error('Describe el motivo de la cita.');
                                        return;
                                    }

                                    let motorcycleId = selectedMotoId;
                                    if (isAddingNewMoto) {
                                        if (!canAddMoto) {
                                            toast.error('Completa placa, marca y modelo.');
                                            return;
                                        }
                                        motorcycleId = addMotorcycle(selectedClient.id, {
                                            plate: newMoto.plate.trim().toUpperCase(),
                                            brand: newMoto.brand.trim(),
                                            model: newMoto.model.trim(),
                                            km: newMoto.km.trim() || undefined,
                                        });
                                    }
                                    if (!motorcycleId) {
                                        toast.error('Selecciona una moto.');
                                        return;
                                    }

                                    const scheduledAt = new Date(`${date}T${time}`).getTime();
                                    if (!Number.isFinite(scheduledAt)) {
                                        toast.error('Fecha u hora inválida.');
                                        return;
                                    }

                                    addAppointment({
                                        scheduledAt,
                                        clientId: selectedClient.id,
                                        motorcycleId,
                                        serviceType: serviceType.trim(),
                                        status: 'confirmed',
                                    });
                                    toast.success('Cita agendada.');
                                    onClose();
                                }}
                                className={cn(
                                    "w-full flex items-center justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    canSubmit
                                        ? "text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-lg shadow-red-600/10"
                                        : "text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed"
                                )}
                            >
                                Confirmar y Agendar
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
