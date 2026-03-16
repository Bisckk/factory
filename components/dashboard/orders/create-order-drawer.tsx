'use client';

/**
 * Slide-over drawer for creating a new Service Order.
 * Focuses exclusively on order creation with an existing client.
 * Client / motorcycle creation is handled in the Clients module.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Bike, Wrench, ChevronDown,
    User, Phone, Plus, Check, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateOrderDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

// ─── Mock Data ───
const MOCK_MECHANICS = [
    { id: 'mech_1', name: 'Juan Pérez', speciality: 'Motor 2T / 4T' },
    { id: 'mech_2', name: 'Andrés Gómez', speciality: 'Electricidad' },
    { id: 'mech_3', name: 'Luis Torres', speciality: 'Suspensión' },
];

const MOCK_EXISTING_CLIENTS = [
    {
        id: 'c_1', name: 'Carlos Martínez', phone: '300 123 4567', cedula: '1020304050',
        motorcycles: [
            { id: 'm_1', brand: 'Yamaha', model: 'DT 175', plate: 'ABC-123' },
            { id: 'm_2', brand: 'Honda', model: 'XR 150', plate: 'XYZ-987' },
        ],
    },
    {
        id: 'c_2', name: 'Andrea López', phone: '310 987 6543', cedula: '1098765432',
        motorcycles: [
            { id: 'm_3', brand: 'Pulsar', model: 'NS200', plate: 'QWE-456' },
        ],
    },
    {
        id: 'c_3', name: 'Diego Ramírez', phone: '320 456 7890', cedula: '1076543210',
        motorcycles: [],
    },
    {
        id: 'c_4', name: 'Sofía Hernández', phone: '315 222 3344', cedula: '1112223344',
        motorcycles: [
            { id: 'm_4', brand: 'Suzuki', model: 'AX 100', plate: 'RTY-789' },
            { id: 'm_5', brand: 'KTM', model: 'Duke 200', plate: 'UIO-321' },
            { id: 'm_6', brand: 'Bajaj', model: 'Boxer CT100', plate: 'PAS-654' },
        ],
    },
];

export function CreateOrderDrawer({ isOpen, onClose }: CreateOrderDrawerProps) {
    // ─── Client Selection ───
    const [clientSearch, setClientSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

    // ─── Motorcycle Selection ───
    const [selectedMotoId, setSelectedMotoId] = useState<string | null>(null);
    const [isAddingNewMoto, setIsAddingNewMoto] = useState(false);
    const [newMoto, setNewMoto] = useState({ plate: '', brand: '', model: '', km: '' });

    // ─── Mechanic Selection ───
    const [isMechanicOpen, setIsMechanicOpen] = useState(false);
    const [selectedMechanicId, setSelectedMechanicId] = useState<string | null>(null);

    // Derived data
    const selectedClient = MOCK_EXISTING_CLIENTS.find(c => c.id === selectedClientId);
    const selectedMechanic = MOCK_MECHANICS.find(m => m.id === selectedMechanicId);

    const filteredClients = MOCK_EXISTING_CLIENTS.filter(c => {
        if (!clientSearch.trim()) return false;
        const q = clientSearch.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.phone.includes(q) ||
            c.cedula.includes(q)
        );
    });

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setClientSearch('');
            setSelectedClientId(null);
            setSelectedMotoId(null);
            setIsAddingNewMoto(false);
            setNewMoto({ plate: '', brand: '', model: '', km: '' });
            setSelectedMechanicId(null);
            setIsMechanicOpen(false);
        }, 300);
    };

    const inputClass = "w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-700 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-red-500/30 focus:border-red-500/50 transition-all font-medium";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-[#141417] border-l border-zinc-800 z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-red-500" />
                                    Nueva Orden de Servicio
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">Registra el ingreso de un vehículo al taller.</p>
                            </div>
                            <button onClick={handleClose} className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">

                            {/* ── STEP 1: Select Client ── */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                    Seleccionar Cliente
                                </h3>

                                {!selectedClient ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por cédula, nombre o teléfono..."
                                                value={clientSearch}
                                                onChange={(e) => setClientSearch(e.target.value)}
                                                className={cn(inputClass, "pl-9")}
                                            />
                                        </div>

                                        {/* Search Results */}
                                        {clientSearch.trim() && (
                                            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/50">
                                                {filteredClients.length === 0 ? (
                                                    <div className="p-6 text-center space-y-2">
                                                        <AlertCircle className="h-6 w-6 text-zinc-600 mx-auto" />
                                                        <p className="text-xs text-zinc-500 font-medium">No se encontró ningún cliente</p>
                                                        <p className="text-[10px] text-zinc-600">Puedes registrar nuevos clientes desde el módulo de Clientes.</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-zinc-800/50 max-h-48 overflow-y-auto">
                                                        {filteredClients.map((client) => (
                                                            <button
                                                                key={client.id}
                                                                onClick={() => {
                                                                    setSelectedClientId(client.id);
                                                                    setClientSearch('');
                                                                    setSelectedMotoId(null);
                                                                    setIsAddingNewMoto(false);
                                                                }}
                                                                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800/50 transition-colors text-left"
                                                            >
                                                                <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                                                                    <User className="h-4 w-4 text-zinc-400" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold text-zinc-200 truncate">{client.name}</p>
                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                        <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {client.phone}</span>
                                                                        <span className="text-[10px] text-zinc-600">•</span>
                                                                        <span className="text-[10px] text-zinc-500">{client.motorcycles.length} moto{client.motorcycles.length !== 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Selected Client Card */
                                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                        <button
                                            onClick={() => {
                                                setSelectedClientId(null);
                                                setSelectedMotoId(null);
                                                setIsAddingNewMoto(false);
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
                                )}
                            </section>

                            {/* ── STEP 2: Select Motorcycle (only after client selected) ── */}
                            <AnimatePresence>
                                {selectedClient && (
                                    <motion.section
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                            Seleccionar Motocicleta
                                        </h3>

                                        {/* Client's existing motorcycles */}
                                        {selectedClient.motorcycles.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedClient.motorcycles.map((moto) => {
                                                    const isSelected = selectedMotoId === moto.id && !isAddingNewMoto;
                                                    return (
                                                        <button
                                                            key={moto.id}
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
                                        ) : (
                                            <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center space-y-2">
                                                <Bike className="h-6 w-6 text-zinc-700 mx-auto" />
                                                <p className="text-xs text-zinc-500 font-medium">Este cliente no tiene motos registradas.</p>
                                            </div>
                                        )}

                                        {/* Add New Moto Toggle */}
                                        {!isAddingNewMoto ? (
                                            <button
                                                onClick={() => {
                                                    setIsAddingNewMoto(true);
                                                    setSelectedMotoId(null);
                                                }}
                                                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-all"
                                            >
                                                <Plus className="h-4 w-4" /> Agregar Moto Nueva
                                            </button>
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400">Nueva Motocicleta</span>
                                                    <button
                                                        onClick={() => {
                                                            setIsAddingNewMoto(false);
                                                            setNewMoto({ plate: '', brand: '', model: '', km: '' });
                                                        }}
                                                        className="text-zinc-600 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Placa *</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Ej. ABC-123"
                                                        value={newMoto.plate}
                                                        onChange={(e) => setNewMoto(prev => ({ ...prev, plate: e.target.value }))}
                                                        className={cn(inputClass, "font-mono uppercase tracking-widest")}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Marca *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Yamaha"
                                                            value={newMoto.brand}
                                                            onChange={(e) => setNewMoto(prev => ({ ...prev, brand: e.target.value }))}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Modelo *</label>
                                                        <input
                                                            type="text"
                                                            placeholder="DT 175"
                                                            value={newMoto.model}
                                                            onChange={(e) => setNewMoto(prev => ({ ...prev, model: e.target.value }))}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Kilometraje *</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0"
                                                        value={newMoto.km}
                                                        onChange={(e) => setNewMoto(prev => ({ ...prev, km: e.target.value }))}
                                                        className={cn(inputClass, "font-mono")}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-zinc-600">
                                                    Esta moto quedará vinculada automáticamente al cliente <span className="text-zinc-400 font-semibold">{selectedClient.name}</span>.
                                                </p>
                                            </motion.div>
                                        )}
                                    </motion.section>
                                )}
                            </AnimatePresence>

                            {/* ── STEP 3: Service Details (only after moto is selected) ── */}
                            <AnimatePresence>
                                {(selectedMotoId || isAddingNewMoto) && (
                                    <motion.section
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-4"
                                    >
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Detalles del Servicio</h3>

                                        {/* Reason / Failures */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Motivo de Ingreso / Fallas *</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Describe los fallos reportados por el cliente o el servicio solicitado..."
                                                className={cn(inputClass, "resize-none")}
                                            />
                                        </div>

                                        {/* Mechanic Selector — Custom Dropdown */}
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Asignar Mecánico</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsMechanicOpen(!isMechanicOpen)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 border rounded-xl text-sm transition-all cursor-pointer",
                                                        isMechanicOpen
                                                            ? "border-red-500/50 ring-1 ring-red-500/30 bg-zinc-900"
                                                            : "border-zinc-800 hover:border-zinc-700"
                                                    )}
                                                >
                                                    {selectedMechanic ? (
                                                        <span className="text-zinc-200 font-medium">{selectedMechanic.name}</span>
                                                    ) : (
                                                        <span className="text-zinc-600">Selecciona un mecánico...</span>
                                                    )}
                                                    <ChevronDown className={cn(
                                                        "h-4 w-4 text-zinc-500 transition-transform duration-200",
                                                        isMechanicOpen && "rotate-180"
                                                    )} />
                                                </button>

                                                <AnimatePresence>
                                                    {isMechanicOpen && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -4, scale: 0.98 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                                                            transition={{ duration: 0.15 }}
                                                            className="absolute z-10 top-full left-0 right-0 mt-2 rounded-xl border border-zinc-800 bg-[#1a1a1e] shadow-2xl overflow-hidden"
                                                        >
                                                            {/* Unassigned option */}
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMechanicId(null);
                                                                    setIsMechanicOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-b border-zinc-800/50",
                                                                    !selectedMechanicId
                                                                        ? "bg-zinc-800/40 text-zinc-300"
                                                                        : "text-zinc-500 hover:bg-zinc-800/30 hover:text-zinc-300 italic"
                                                                )}
                                                            >
                                                                <span>Dejar sin asignar (Pendiente)</span>
                                                                {!selectedMechanicId && <Check className="h-4 w-4 text-zinc-400" />}
                                                            </button>

                                                            {/* Mechanic list */}
                                                            {MOCK_MECHANICS.map((mech) => {
                                                                const isActive = selectedMechanicId === mech.id;
                                                                return (
                                                                    <button
                                                                        key={mech.id}
                                                                        onClick={() => {
                                                                            setSelectedMechanicId(mech.id);
                                                                            setIsMechanicOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "w-full flex items-center justify-between px-4 py-3 transition-colors",
                                                                            isActive
                                                                                ? "bg-red-500/10 text-red-400"
                                                                                : "text-zinc-300 hover:bg-zinc-800/40"
                                                                        )}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={cn(
                                                                                "h-8 w-8 rounded-full border flex items-center justify-center text-[10px] font-bold uppercase",
                                                                                isActive
                                                                                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                                                                                    : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                                                            )}>
                                                                                {mech.name.split(' ').map(n => n[0]).join('')}
                                                                            </div>
                                                                            <div className="text-left">
                                                                                <p className="text-sm font-semibold">{mech.name}</p>
                                                                                <p className="text-[10px] text-zinc-500">{mech.speciality}</p>
                                                                            </div>
                                                                        </div>
                                                                        {isActive && <Check className="h-4 w-4 text-red-400" />}
                                                                    </button>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                            <p className="text-[10px] text-zinc-600 mt-1.5 ml-1">Solo el Administrador puede registrar nuevos mecánicos en el sistema.</p>
                                        </div>
                                    </motion.section>
                                )}
                            </AnimatePresence>

                        </div>

                        {/* Footer CTA */}
                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0">
                            <button
                                type="button"
                                disabled={!selectedClient || (!selectedMotoId && !isAddingNewMoto)}
                                className={cn(
                                    "w-full flex justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                                    selectedClient && (selectedMotoId || isAddingNewMoto)
                                        ? "text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10"
                                        : "text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed"
                                )}
                            >
                                Crear Orden de Servicio
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
