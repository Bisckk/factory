'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { AlertCircle, Bike, Check, CheckCircle2, Crop, IdCard, ImagePlus, Phone, Plus, Save, Search, Star, Trash2, Upload, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useClientsStore, type MotorcycleImage } from '@/stores/clients.store';

type MotorcycleDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    motoId?: string | null;
};

function createId(prefix: string) {
    const uuid = globalThis.crypto?.randomUUID?.();
    if (uuid) return `${prefix}_${uuid}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

async function fileToCompressedDataUrl(file: File) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('read_error'));
        reader.onload = () => resolve(String(reader.result || ''));
        reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = () => reject(new Error('image_error'));
        i.src = dataUrl;
    });

    const maxW = 1400;
    const scale = img.width > maxW ? maxW / img.width : 1;
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);

    const webp = canvas.toDataURL('image/webp', 0.86);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', 0.9);
}

async function createImage(dataUrl: string) {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('image_error'));
        img.src = dataUrl;
    });
}

async function getCroppedDataUrl(imageSrc: string, crop: { x: number; y: number; width: number; height: number }) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageSrc;
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

    const maxW = 1400;
    const scale = canvas.width > maxW ? maxW / canvas.width : 1;
    if (scale < 1) {
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(canvas.width * scale));
        out.height = Math.max(1, Math.round(canvas.height * scale));
        const outCtx = out.getContext('2d');
        if (outCtx) outCtx.drawImage(canvas, 0, 0, out.width, out.height);
        const webp = out.toDataURL('image/webp', 0.88);
        if (webp.startsWith('data:image/webp')) return webp;
        return out.toDataURL('image/jpeg', 0.92);
    }

    const webp = canvas.toDataURL('image/webp', 0.88);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', 0.92);
}

export function MotorcycleDrawer({ isOpen, onClose, motoId }: MotorcycleDrawerProps) {
    const isEdit = Boolean(motoId);

    const clients = useClientsStore((s) => s.clients);
    const getMotorcycle = useClientsStore((s) => s.getMotorcycle);
    const addClient = useClientsStore((s) => s.addClient);
    const addMotorcycle = useClientsStore((s) => s.addMotorcycle);
    const updateMotorcycle = useClientsStore((s) => s.updateMotorcycle);
    const deleteMotorcycle = useClientsStore((s) => s.deleteMotorcycle);
    const transferMotorcycle = useClientsStore((s) => s.transferMotorcycle);

    const ctx = useMemo(() => (motoId ? getMotorcycle(motoId) : undefined), [getMotorcycle, motoId]);
    const originalClientIdRef = useRef<string | null>(null);

    const [clientSearch, setClientSearch] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', phone: '', cedula: '', email: '' });

    const [form, setForm] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        engineCc: '',
        vin: '',
        km: '',
        notes: '',
    });

    const [images, setImages] = useState<MotorcycleImage[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [isCropOpen, setIsCropOpen] = useState(false);
    const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const [isSaving, setIsSaving] = useState(false);
    const closeRequestedRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;
        closeRequestedRef.current = false;
        setClientSearch('');
        setIsCreatingClient(false);
        setNewClient({ name: '', phone: '', cedula: '', email: '' });

        if (isEdit && ctx) {
            originalClientIdRef.current = ctx.client.id;
            setSelectedClientId(ctx.client.id);
            setForm({
                plate: ctx.moto.plate,
                brand: ctx.moto.brand,
                model: ctx.moto.model,
                year: ctx.moto.year ?? '',
                color: ctx.moto.color ?? '',
                engineCc: ctx.moto.engineCc ?? '',
                vin: ctx.moto.vin ?? '',
                km: ctx.moto.km ?? '',
                notes: ctx.moto.notes ?? '',
            });
            const imgs = ctx.moto.images ?? [];
            setImages(imgs);
            setSelectedImageId(imgs[0]?.id ?? null);
        }
        if (!isEdit) {
            originalClientIdRef.current = null;
            setSelectedClientId(null);
            setForm({
                plate: '',
                brand: '',
                model: '',
                year: '',
                color: '',
                engineCc: '',
                vin: '',
                km: '',
                notes: '',
            });
            setImages([]);
            setSelectedImageId(null);
        }
    }, [ctx, isEdit, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (images.length === 0) {
            if (selectedImageId !== null) setSelectedImageId(null);
            return;
        }
        if (!selectedImageId || !images.some((i) => i.id === selectedImageId)) {
            setSelectedImageId(images[0].id);
        }
    }, [images, isOpen, selectedImageId]);

    const selectedClient = clients.find((c) => c.id === selectedClientId);

    const filteredClients = useMemo(() => {
        const q = clientSearch.trim().toLowerCase();
        const base = [...clients].sort((a, b) => a.name.localeCompare(b.name));
        const list = q
            ? base.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.cedula.includes(q))
            : base;
        return list.slice(0, 12);
    }, [clientSearch, clients]);

    const canCreateClient = useMemo(() => {
        if (!isCreatingClient) return false;
        return Boolean(newClient.name.trim() && newClient.phone.trim() && newClient.cedula.trim());
    }, [isCreatingClient, newClient]);

    const canSubmit = useMemo(() => {
        if (!selectedClientId) return false;
        if (!form.plate.trim()) return false;
        if (!form.brand.trim()) return false;
        if (!form.model.trim()) return false;
        return true;
    }, [form.brand, form.model, form.plate, selectedClientId]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const slots = Math.max(0, 6 - images.length);
        if (slots === 0) {
            toast.error('Máximo 6 fotos por moto.');
            return;
        }
        const files = acceptedFiles.slice(0, slots);
        if (files.length === 0) return;
        try {
            const next = await Promise.all(
                files.map(async (file) => {
                    const dataUrl = await fileToCompressedDataUrl(file);
                    return { id: createId('img'), dataUrl };
                })
            );
            setImages((prev) => [...prev, ...next].slice(0, 6));
        } catch {
            toast.error('No se pudo procesar la imagen.');
        }
    }, [images.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        maxFiles: 6,
    });

    const handleClose = () => {
        if (isSaving) {
            closeRequestedRef.current = true;
            return;
        }
        onClose();
    };

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
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <Bike className="h-5 w-5 text-red-500" />
                                    {isEdit ? 'Editar Moto' : 'Registrar Moto'}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {isEdit ? 'Actualiza datos, fotos y propietario.' : 'Vincula una moto a un cliente del taller.'}
                                </p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-7">
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Fotos</h3>
                                    <span className="text-[10px] text-zinc-600">{images.length}/6</span>
                                </div>

                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        'rounded-xl border border-dashed p-4 transition-all cursor-pointer select-none',
                                        isDragActive ? 'border-red-500/40 bg-red-500/10' : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/30'
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-11 w-11 rounded-xl border flex items-center justify-center',
                                            isDragActive ? 'border-red-500/30 bg-red-500/10' : 'border-zinc-800 bg-[#141417]'
                                        )}>
                                            {isDragActive ? <Upload className="h-5 w-5 text-red-400" /> : <ImagePlus className="h-5 w-5 text-zinc-500" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-zinc-200 truncate">{isDragActive ? 'Suelta para subir' : 'Arrastra fotos o haz clic'}</p>
                                            <p className="text-[10px] text-zinc-600 mt-0.5">Se optimizan automáticamente.</p>
                                        </div>
                                    </div>
                                </div>

                                {images.length > 0 && (
                                    <div className="space-y-3">
                                        {(() => {
                                            const active = images.find((i) => i.id === selectedImageId) ?? images[0];
                                            const isCover = active.id === images[0].id;
                                            return (
                                                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                                                    <div className="relative aspect-video bg-black/20">
                                                        <img src={active.dataUrl} alt="Foto de la moto" className="absolute inset-0 h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

                                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setImages((prev) => {
                                                                        const cover = prev.find((p) => p.id === active.id);
                                                                        if (!cover) return prev;
                                                                        const rest = prev.filter((p) => p.id !== active.id);
                                                                        return [cover, ...rest];
                                                                    });
                                                                    toast.success('Portada actualizada.');
                                                                }}
                                                                className={cn(
                                                                    'h-9 w-9 rounded-xl border flex items-center justify-center transition-colors',
                                                                    isCover ? 'bg-red-500/15 text-red-300 border-red-500/25' : 'bg-zinc-900/60 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                                                                )}
                                                                title="Marcar como portada"
                                                            >
                                                                <Star className="h-4.5 w-4.5" fill={isCover ? 'currentColor' : 'none'} />
                                                            </button>
                                                        </div>

                                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setCrop({ x: 0, y: 0 });
                                                                    setZoom(1);
                                                                    setCroppedAreaPixels(null);
                                                                    setIsCropOpen(true);
                                                                }}
                                                                className="h-9 w-9 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center justify-center"
                                                                title="Recortar"
                                                            >
                                                                <Crop className="h-4.5 w-4.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setImages((prev) => prev.filter((p) => p.id !== active.id));
                                                                    toast.success('Foto eliminada.');
                                                                }}
                                                                className="h-9 w-9 rounded-xl bg-zinc-900/60 border border-zinc-700 text-zinc-200 hover:text-red-200 hover:bg-red-500/10 hover:border-red-500/20 transition-colors flex items-center justify-center"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                            {images.map((img) => {
                                                const isActive = img.id === selectedImageId;
                                                const isCover = img.id === images[0].id;
                                                return (
                                                    <button
                                                        key={img.id}
                                                        type="button"
                                                        onClick={() => setSelectedImageId(img.id)}
                                                        className={cn(
                                                            'relative shrink-0 h-16 w-20 rounded-xl overflow-hidden border transition-all',
                                                            isActive ? 'border-red-500/35 ring-1 ring-red-500/20' : 'border-zinc-800 hover:border-zinc-700 opacity-90 hover:opacity-100'
                                                        )}
                                                    >
                                                        <img src={img.dataUrl} alt="Miniatura" className="h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                                                        <div className="absolute top-1.5 left-1.5">
                                                            <Star className={cn('h-4 w-4', isCover ? 'text-amber-300' : 'text-zinc-500')} fill={isCover ? 'currentColor' : 'none'} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Propietario</h3>

                                {!selectedClient ? (
                                    <div className="space-y-3">
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
                                                {!clientSearch.trim() && <span className="text-[10px] text-zinc-600">Escribe para buscar</span>}
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
                                                                    <input value={newClient.name} onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))} className={cn(inputClass, 'pl-11')} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Teléfono *</label>
                                                                <div className="relative group">
                                                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                                                    <input value={newClient.phone} onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))} className={cn(inputClass, 'pl-11')} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Cédula *</label>
                                                                <div className="relative group">
                                                                    <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                                                                    <input value={newClient.cedula} onChange={(e) => setNewClient((p) => ({ ...p, cedula: e.target.value }))} className={cn(inputClass, 'pl-11 font-mono')} />
                                                                </div>
                                                            </div>
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
                                                                <Check className="h-4 w-4 mr-2" /> Vincular
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedClientId(null)}
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

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">Datos de la Moto</h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Placa *</label>
                                        <input value={form.plate} onChange={(e) => setForm((p) => ({ ...p, plate: e.target.value }))} className={cn(inputClass, 'font-mono uppercase tracking-widest')} placeholder="ABC-123" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Marca *</label>
                                        <input value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} className={inputClass} placeholder="Yamaha" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Modelo *</label>
                                        <input value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} className={inputClass} placeholder="DT 175" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Año</label>
                                        <input value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} className={cn(inputClass, 'font-mono')} placeholder="2021" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Color</label>
                                        <input value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} className={inputClass} placeholder="Azul" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Cilindraje</label>
                                        <input value={form.engineCc} onChange={(e) => setForm((p) => ({ ...p, engineCc: e.target.value }))} className={cn(inputClass, 'font-mono')} placeholder="200" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Kilometraje</label>
                                        <input value={form.km} onChange={(e) => setForm((p) => ({ ...p, km: e.target.value }))} className={cn(inputClass, 'font-mono')} placeholder="0" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">VIN (opcional)</label>
                                        <input value={form.vin} onChange={(e) => setForm((p) => ({ ...p, vin: e.target.value }))} className={cn(inputClass, 'font-mono')} placeholder="N° de chasis" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Notas</label>
                                        <textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} className={cn(inputClass, 'resize-none')} placeholder="Observaciones, referencias, particularidades..." />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0 space-y-3">
                            {isEdit && motoId && ctx && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const ok = window.confirm('¿Eliminar esta moto del sistema?');
                                        if (!ok) return;
                                        deleteMotorcycle(ctx.client.id, motoId);
                                        toast.success('Moto eliminada.');
                                        onClose();
                                    }}
                                    className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar Moto
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={!canSubmit || isSaving}
                                onClick={async () => {
                                    if (!canSubmit) {
                                        toast.error('Completa propietario, placa, marca y modelo.');
                                        return;
                                    }
                                    if (!selectedClientId) return;
                                    setIsSaving(true);
                                    try {
                                        const payload = {
                                            plate: form.plate.trim().toUpperCase(),
                                            brand: form.brand.trim(),
                                            model: form.model.trim(),
                                            year: form.year.trim() || undefined,
                                            color: form.color.trim() || undefined,
                                            engineCc: form.engineCc.trim() || undefined,
                                            vin: form.vin.trim() || undefined,
                                            km: form.km.trim() || undefined,
                                            notes: form.notes.trim() || undefined,
                                            images,
                                        };

                                        if (isEdit && motoId && ctx) {
                                            const originalClientId = originalClientIdRef.current;
                                            if (originalClientId && originalClientId !== selectedClientId) {
                                                transferMotorcycle(motoId, selectedClientId);
                                            }
                                            updateMotorcycle(selectedClientId, motoId, payload);
                                            toast.success('Moto actualizada.');
                                        } else {
                                            addMotorcycle(selectedClientId, payload);
                                            toast.success('Moto registrada.');
                                        }

                                        onClose();
                                    } finally {
                                        setIsSaving(false);
                                        if (closeRequestedRef.current) onClose();
                                    }
                                }}
                                className={cn(
                                    'w-full flex justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                    canSubmit && !isSaving ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10' : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                )}
                            >
                                {isEdit ? (
                                    <>
                                        <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Registrar Moto
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {isCropOpen && images.length > 0 && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsCropOpen(false)}
                                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="fixed inset-x-4 top-16 z-[70] mx-auto max-w-xl rounded-2xl border border-zinc-800 bg-[#141417] shadow-2xl overflow-hidden"
                                >
                                    {(() => {
                                        const active = images.find((i) => i.id === selectedImageId) ?? images[0];
                                        return (
                                            <>
                                                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                                                    <div className="flex items-center gap-2">
                                                        <Crop className="h-4 w-4 text-red-500" />
                                                        <p className="text-sm font-bold text-zinc-100">Recortar foto</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsCropOpen(false)}
                                                        className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>

                                                <div className="relative h-[340px] bg-black">
                                                    <Cropper
                                                        image={active.dataUrl}
                                                        crop={crop}
                                                        zoom={zoom}
                                                        aspect={4 / 3}
                                                        onCropChange={setCrop}
                                                        onZoomChange={setZoom}
                                                        onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                                                    />
                                                </div>

                                                <div className="p-5 border-t border-zinc-800 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Zoom</span>
                                                        <span className="text-[10px] font-mono text-zinc-500">{zoom.toFixed(2)}x</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min={1}
                                                        max={3}
                                                        step={0.01}
                                                        value={zoom}
                                                        onChange={(e) => setZoom(Number(e.target.value))}
                                                        className="w-full accent-red-500"
                                                    />

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsCropOpen(false)}
                                                            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
                                                        >
                                                            Cancelar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (!croppedAreaPixels) {
                                                                    toast.error('Ajusta el recorte antes de guardar.');
                                                                    return;
                                                                }
                                                                try {
                                                                    const nextDataUrl = await getCroppedDataUrl(active.dataUrl, croppedAreaPixels);
                                                                    setImages((prev) => prev.map((img) => (img.id === active.id ? { ...img, dataUrl: nextDataUrl } : img)));
                                                                    toast.success('Recorte guardado.');
                                                                    setIsCropOpen(false);
                                                                } catch {
                                                                    toast.error('No se pudo recortar la imagen.');
                                                                }
                                                            }}
                                                            className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-white bg-red-600 hover:bg-red-700 border border-red-500/20"
                                                        >
                                                            Guardar recorte
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
