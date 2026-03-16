/**
 * Generate a tracking token for service orders.
 * Format: 8-character alphanumeric string, uppercase.
 * Example: "A7K3M9X2"
 *
 * Why not UUID? Because this token is shared with clients
 * via SMS/email and needs to be human-readable and easy to type.
 */
export function generateTrackingToken(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous: 0, O, 1, I
    let token = '';
    for (let i = 0; i < 8; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Generate an order number: ORD-2025-0001
 */
export function generateOrderNumber(year: number, sequence: number): string {
    return `ORD-${year}-${String(sequence).padStart(4, '0')}`;
}

/**
 * Generate an invoice number: FAC-2025-0001
 */
export function generateInvoiceNumber(year: number, sequence: number): string {
    return `FAC-${year}-${String(sequence).padStart(4, '0')}`;
}
