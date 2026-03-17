'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AnimatePresence, motion } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { CheckCircle2, Crop, ImagePlus, Package, Pencil, Save, Star, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useInventoryStore, type InventoryImage } from '@/stores/inventory.store';
import { useAuthStore } from '@/stores/auth.store';

type InventoryItemDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    itemId?: string | null;
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

    const maxW = 1200;
    const scale = img.width > maxW ? maxW / img.width : 1;
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);

    const webp = canvas.toDataURL('image/webp', 0.82);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', 0.86);
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

    const maxW = 1200;
    const scale = canvas.width > maxW ? maxW / canvas.width : 1;
    if (scale < 1) {
        const out = document.createElement('canvas');
        out.width = Math.max(1, Math.round(canvas.width * scale));
        out.height = Math.max(1, Math.round(canvas.height * scale));
        const outCtx = out.getContext('2d');
        if (outCtx) outCtx.drawImage(canvas, 0, 0, out.width, out.height);
        const webp = out.toDataURL('image/webp', 0.86);
        if (webp.startsWith('data:image/webp')) return webp;
        return out.toDataURL('image/jpeg', 0.9);
    }

    const webp = canvas.toDataURL('image/webp', 0.86);
    if (webp.startsWith('data:image/webp')) return webp;
    return canvas.toDataURL('image/jpeg', 0.9);
}

export function InventoryItemDrawer({ isOpen, onClose, itemId }: InventoryItemDrawerProps) {
    const isEdit = Boolean(itemId);
    const { role } = useAuthStore();
    const canEdit = role === 'admin' || role === 'receptionist';

    const item = useInventoryStore((s) => (itemId ? s.getItem(itemId) : undefined));
    const addItem = useInventoryStore((s) => s.addItem);
    const updateItem = useInventoryStore((s) => s.updateItem);
    const deleteItem = useInventoryStore((s) => s.deleteItem);

    const [form, setForm] = useState({
        name: '',
        category: '',
        location: '',
        stock_quantity: '0',
        min_stock_level: '0',
        price: '',
        cost: '',
        supplier: '',
        notes: '',
    });

    const [images, setImages] = useState<InventoryImage[]>([]);
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
        if (isEdit && item) {
            setForm({
                name: item.name,
                category: item.category,
                location: item.location,
                stock_quantity: String(item.stock_quantity),
                min_stock_level: String(item.min_stock_level),
                price: String(item.price),
                cost: item.cost != null ? String(item.cost) : '',
                supplier: item.supplier ?? '',
                notes: item.notes ?? '',
            });
            setImages(item.images ?? []);
            setSelectedImageId((item.images?.[0]?.id as string | undefined) ?? null);
        }
        if (!isEdit) {
            setForm({
                name: '',
                category: '',
                location: '',
                stock_quantity: '0',
                min_stock_level: '0',
                price: '',
                cost: '',
                supplier: '',
                notes: '',
            });
            setImages([]);
            setSelectedImageId(null);
        }
    }, [isOpen, isEdit, itemId, item]);

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

    const canSubmit = useMemo(() => {
        if (!form.name.trim()) return false;
        if (!form.category.trim()) return false;
        if (!form.location.trim()) return false;
        const stock = Number(form.stock_quantity);
        const min = Number(form.min_stock_level);
        const price = Number(form.price);
        if (!Number.isFinite(stock) || stock < 0) return false;
        if (!Number.isFinite(min) || min < 0) return false;
        if (!Number.isFinite(price) || price < 0) return false;
        return true;
    }, [form]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!canEdit) {
            toast.error('Solo administración puede editar el inventario.');
            return;
        }
        const slots = Math.max(0, 6 - images.length);
        if (slots === 0) {
            toast.error('Máximo 6 fotos por artículo.');
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
            setImages((prev) => {
                const merged = [...prev, ...next].slice(0, 6);
                return merged;
            });
        } catch {
            toast.error('No se pudo procesar la imagen.');
        }
    }, [canEdit, images.length]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true,
        maxFiles: 6,
        disabled: !canEdit,
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
                                    {isEdit ? (
                                        <Pencil className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <Package className="h-5 w-5 text-red-500" />
                                    )}
                                    {isEdit ? 'Editar Artículo' : 'Nuevo Artículo'}
                                </h2>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {isEdit ? 'Actualiza stock, precio y fotos del repuesto.' : 'Registra un repuesto en el inventario.'}
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
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                        Fotos del Artículo
                                    </h3>
                                    <span className="text-[10px] text-zinc-600">{images.length}/6</span>
                                </div>

                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        'rounded-xl border border-dashed p-4 transition-all cursor-pointer select-none',
                                        isDragActive
                                            ? 'border-red-500/40 bg-red-500/10'
                                            : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/30'
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'h-11 w-11 rounded-xl border flex items-center justify-center',
                                            isDragActive ? 'border-red-500/30 bg-red-500/10' : 'border-zinc-800 bg-[#141417]'
                                        )}>
                                            {isDragActive ? (
                                                <Upload className="h-5 w-5 text-red-400" />
                                            ) : (
                                                <ImagePlus className="h-5 w-5 text-zinc-500" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-zinc-200 truncate">
                                                {isDragActive ? 'Suelta para subir' : 'Arrastra fotos o haz clic'}
                                            </p>
                                            <p className="text-[10px] text-zinc-600 mt-0.5">
                                                Se optimizan automáticamente para el dashboard.
                                            </p>
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
                                                        <img src={active.dataUrl} alt="Foto del artículo" className="absolute inset-0 h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />

                                                        <div className="absolute top-3 left-3 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!canEdit) {
                                                                        toast.error('Solo administración puede editar el inventario.');
                                                                        return;
                                                                    }
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
                                                                    isCover
                                                                        ? 'bg-red-500/15 text-red-300 border-red-500/25'
                                                                        : 'bg-zinc-900/60 text-zinc-200 border-zinc-700 hover:bg-zinc-800'
                                                                )}
                                                                title="Marcar como portada"
                                                            >
                                                                <Star className="h-4.5 w-4.5" fill={isCover ? 'currentColor' : 'none'} />
                                                            </button>
                                                        </div>

                                                        <div className="absolute top-3 right-3 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!canEdit) {
                                                                        toast.error('Solo administración puede editar el inventario.');
                                                                        return;
                                                                    }
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
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (!canEdit) {
                                                                        toast.error('Solo administración puede editar el inventario.');
                                                                        return;
                                                                    }
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
                                                            isActive
                                                                ? 'border-red-500/35 ring-1 ring-red-500/20'
                                                                : 'border-zinc-800 hover:border-zinc-700 opacity-90 hover:opacity-100'
                                                        )}
                                                    >
                                                        <img src={img.dataUrl} alt="Miniatura" className="h-full w-full object-cover" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                                                        <div className="absolute top-1.5 left-1.5">
                                                            <Star
                                                                className={cn('h-4 w-4', isCover ? 'text-amber-300' : 'text-zinc-500')}
                                                                fill={isCover ? 'currentColor' : 'none'}
                                                            />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                    Información
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Nombre *</label>
                                        <input
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            placeholder="Ej. Bujía NGK Racing"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Categoría *</label>
                                        <input
                                            value={form.category}
                                            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                            placeholder="Motor, Eléctrico..."
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Ubicación *</label>
                                        <input
                                            value={form.location}
                                            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                                            placeholder="Estante A-1"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                    Stock y Precios
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Stock actual *</label>
                                        <input
                                            type="number"
                                            value={form.stock_quantity}
                                            onChange={(e) => setForm((p) => ({ ...p, stock_quantity: e.target.value }))}
                                            className={cn(inputClass, 'font-mono')}
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Stock mínimo *</label>
                                        <input
                                            type="number"
                                            value={form.min_stock_level}
                                            onChange={(e) => setForm((p) => ({ ...p, min_stock_level: e.target.value }))}
                                            className={cn(inputClass, 'font-mono')}
                                            min={0}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Precio base (COP) *</label>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                            placeholder="0"
                                            className={cn(inputClass, 'font-mono')}
                                            min={0}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Costo (opcional)</label>
                                        <input
                                            type="number"
                                            value={form.cost}
                                            onChange={(e) => setForm((p) => ({ ...p, cost: e.target.value }))}
                                            placeholder="0"
                                            className={cn(inputClass, 'font-mono')}
                                            min={0}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 pb-2">
                                    Detalles
                                </h3>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Proveedor (opcional)</label>
                                        <input
                                            value={form.supplier}
                                            onChange={(e) => setForm((p) => ({ ...p, supplier: e.target.value }))}
                                            placeholder="Nombre del proveedor"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Notas (opcional)</label>
                                        <textarea
                                            rows={3}
                                            value={form.notes}
                                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                                            placeholder="Compatibilidad, referencias, observaciones..."
                                            className={cn(inputClass, 'resize-none')}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-zinc-800 bg-[#141417] shrink-0 space-y-3">
                            {isEdit && itemId && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!canEdit) {
                                            toast.error('Solo administración puede editar el inventario.');
                                            return;
                                        }
                                        const ok = window.confirm('¿Eliminar este artículo del inventario?');
                                        if (!ok) return;
                                        deleteItem(itemId);
                                        toast.success('Artículo eliminado.');
                                        onClose();
                                    }}
                                    className="w-full flex justify-center py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-red-300 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar Artículo
                                </button>
                            )}

                            <button
                                type="button"
                                disabled={!canEdit || !canSubmit || isSaving}
                                onClick={async () => {
                                    if (!canEdit) {
                                        toast.error('Solo administración puede editar el inventario.');
                                        return;
                                    }
                                    if (!canSubmit) {
                                        toast.error('Completa nombre, categoría, ubicación, stock y precio.');
                                        return;
                                    }
                                    setIsSaving(true);
                                    try {
                                        const payload = {
                                            name: form.name.trim(),
                                            category: form.category.trim(),
                                            location: form.location.trim(),
                                            stock_quantity: Number(form.stock_quantity),
                                            min_stock_level: Number(form.min_stock_level),
                                            price: Number(form.price),
                                            cost: form.cost.trim() ? Number(form.cost) : undefined,
                                            supplier: form.supplier.trim() || undefined,
                                            notes: form.notes.trim() || undefined,
                                            images,
                                        };

                                        if (isEdit && itemId) {
                                            updateItem({ id: itemId, ...payload });
                                            toast.success('Cambios guardados.');
                                        } else {
                                            addItem(payload);
                                            toast.success('Artículo creado.', { description: 'Ya aparece en tu inventario.' });
                                        }

                                        onClose();
                                    } finally {
                                        setIsSaving(false);
                                        if (closeRequestedRef.current) onClose();
                                    }
                                }}
                                className={cn(
                                    'w-full flex justify-center py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all',
                                    canEdit && canSubmit && !isSaving
                                        ? 'text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/10'
                                        : 'text-zinc-600 bg-zinc-800 border border-zinc-700 cursor-not-allowed'
                                )}
                            >
                                {isEdit ? (
                                    <>
                                        <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Crear Artículo
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
                                                        aspect={1}
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
                                                                    setImages((prev) =>
                                                                        prev.map((img) =>
                                                                            img.id === active.id ? { ...img, dataUrl: nextDataUrl } : img
                                                                        )
                                                                    );
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
