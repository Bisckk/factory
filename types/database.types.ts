/**
 * Derived database types for the Mototaller platform.
 * Until we run `supabase gen types`, these serve as our
 * source of truth for table row shapes.
 */

import type {
    UserRole,
    EngineType,
    OrderStatus,
    OrderPriority,
    PaymentMethod,
    TransactionType,
    InventoryMovementType,
    MediaType,
    AppointmentStatus,
} from './app.types';

// ─── Table Row Types ───

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Motorcycle {
    id: string;
    client_id: string;
    plate: string;
    brand: string;
    model: string;
    year: number | null;
    engine_type: EngineType | null;
    cc: number | null;
    color: string | null;
    vin: string | null;
    notes: string | null;
    photo_url: string | null;
    created_at: string;
}

export interface ServiceOrder {
    id: string;
    order_number: string;
    motorcycle_id: string;
    client_id: string;
    assigned_mechanic_id: string | null;
    status: OrderStatus;
    priority: OrderPriority;
    mileage_in: number | null;
    mileage_out: number | null;
    estimated_delivery: string | null;
    delivered_at: string | null;
    client_description: string | null;
    tracking_token: string;
    signature_url: string | null;
    total_labor: number;
    total_parts: number;
    advance_paid: number;
    is_walk_in: boolean;
    appointment_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface ServiceUpdate {
    id: string;
    order_id: string;
    mechanic_id: string;
    status_change: OrderStatus;
    description: string;
    created_at: string;
}

export interface ServiceMedia {
    id: string;
    order_id: string;
    update_id: string | null;
    type: MediaType;
    url: string;
    caption: string | null;
    uploaded_by: string;
    created_at: string;
}

export interface Warranty {
    id: string;
    order_id: string;
    description: string;
    expires_at: string;
    is_active: boolean;
    claimed_at: string | null;
    notes: string | null;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    category: string;
    description: string | null;
    compatible_models: string[];
    stock_quantity: number;
    min_stock: number;
    purchase_price: number;
    sale_price: number;
    location: string | null;
    photo_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface InventoryMovement {
    id: string;
    item_id: string;
    type: InventoryMovementType;
    quantity: number;
    order_id: string | null;
    unit_price: number | null;
    notes: string | null;
    created_by: string;
    created_at: string;
}

export interface Supplier {
    id: string;
    name: string;
    nit: string | null;
    contact: {
        phone?: string;
        email?: string;
        address?: string;
        city?: string;
    } | null;
    notes: string | null;
    is_active: boolean;
    created_at: string;
}

export interface SupplierItem {
    id: string;
    supplier_id: string;
    item_id: string;
    supplier_price: number;
    is_preferred: boolean;
}

export interface Transaction {
    id: string;
    type: TransactionType;
    category: string;
    amount: number;
    payment_method: PaymentMethod;
    order_id: string | null;
    invoice_id: string | null;
    description: string;
    transaction_date: string;
    receipt_url: string | null;
    created_by: string;
    created_at: string;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    client_id: string;
    order_id: string | null;
    subtotal: number;
    tax: number;
    total: number;
    notes: string | null;
    issued_at: string;
    paid_at: string | null;
}

export interface InvoiceItem {
    id: string;
    invoice_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface Payroll {
    id: string;
    employee_id: string;
    period_start: string;
    period_end: string;
    base_salary: number;
    commissions: number;
    deductions: number;
    net_pay: number;
    paid_at: string | null;
    notes: string | null;
    created_at: string;
}

export interface Appointment {
    id: string;
    client_id: string;
    motorcycle_id: string | null;
    mechanic_id: string | null;
    scheduled_at: string;
    status: AppointmentStatus;
    service_type: string | null;
    notes: string | null;
    created_at: string;
}

export interface PortfolioProject {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    before_images: string[];
    after_images: string[];
    is_featured: boolean;
    display_order: number;
    created_at: string;
}

export interface ClientReview {
    id: string;
    client_id: string | null;
    client_name: string;
    order_id: string | null;
    rating: number;
    comment: string | null;
    is_approved: boolean;
    created_at: string;
}

// ─── Composite / View Types ───

export type OrderWithRelations = ServiceOrder & {
    motorcycle: Motorcycle;
    client: Profile;
    mechanic: Profile | null;
    updates: ServiceUpdate[];
    media: ServiceMedia[];
};

export type MotorcycleWithClient = Motorcycle & {
    client: Profile;
};

export type MotorcycleWithHistory = Motorcycle & {
    client: Profile;
    orders: ServiceOrder[];
    warranties: Warranty[];
};

export type InventoryItemWithSuppliers = InventoryItem & {
    suppliers: (SupplierItem & { supplier: Supplier })[];
};

export type InvoiceWithItems = Invoice & {
    items: InvoiceItem[];
    client: Profile;
};

export type AppointmentWithRelations = Appointment & {
    client: Profile;
    motorcycle: Motorcycle | null;
    mechanic: Profile | null;
};

export type PayrollWithEmployee = Payroll & {
    employee: Profile;
};
