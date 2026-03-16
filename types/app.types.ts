/**
 * Domain types and enums for the Mototaller platform.
 * These mirror the PostgreSQL enums and provide
 * type-safe constants for the application layer.
 */

// ─── Enums ───

export const USER_ROLES = ['admin', 'mechanic', 'client', 'accountant', 'receptionist'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ENGINE_TYPES = ['two_stroke', 'four_stroke'] as const;
export type EngineType = (typeof ENGINE_TYPES)[number];

export const ORDER_STATUSES = [
  'received',
  'diagnosing',
  'waiting_parts',
  'in_repair',
  'quality_check',
  'ready',
  'delivered',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type OrderPriority = (typeof ORDER_PRIORITIES)[number];

export const PAYMENT_METHODS = ['cash', 'transfer', 'card', 'advance'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const TRANSACTION_TYPES = ['income', 'expense'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const INVENTORY_MOVEMENT_TYPES = [
  'purchase',
  'used_in_repair',
  'adjustment',
  'returned',
] as const;
export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const MEDIA_TYPES = [
  'photo_before',
  'photo_after',
  'photo_process',
  'video',
] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'cancelled',
  'walk_in',
  'completed',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

// ─── Display Labels (Spanish) ───

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: 'Recibida',
  diagnosing: 'En diagnóstico',
  waiting_parts: 'Esperando repuestos',
  in_repair: 'En reparación',
  quality_check: 'Control de calidad',
  ready: 'Lista para entrega',
  delivered: 'Entregada',
};

export const ORDER_PRIORITY_LABELS: Record<OrderPriority, string> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  two_stroke: '2 Tiempos',
  four_stroke: '4 Tiempos',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrador (Owner)',
  mechanic: 'Mecánico',
  client: 'Cliente',
  accountant: 'Contador',
  receptionist: 'Recepcionista',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  transfer: 'Transferencia',
  card: 'Tarjeta',
  advance: 'Anticipo',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  walk_in: 'Sin cita',
  completed: 'Completada',
};

// ─── Order Status Colors ───

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  received: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  diagnosing: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  waiting_parts: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  in_repair: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
  quality_check: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  ready: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  delivered: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
};

export const ORDER_PRIORITY_COLORS: Record<OrderPriority, string> = {
  low: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
  normal: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  high: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  urgent: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

// ─── Navigation Config ───

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: UserRole[];
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
