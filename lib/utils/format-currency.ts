/**
 * Format a number as Colombian Pesos (COP).
 * Output: "$1.250.000"
 *
 * Uses Intl.NumberFormat with es-CO locale for
 * correct thousand separators (.) and no decimals
 * (COP doesn't use cents in practice).
 */
export function formatCOP(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format a number as a compact COP value for
 * dashboard metrics. Example: "$1.2M" or "$850K"
 */
export function formatCOPCompact(amount: number): string {
    if (amount >= 1_000_000) {
        return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `$${(amount / 1_000).toFixed(0)}K`;
    }
    return formatCOP(amount);
}

/**
 * Calculate margin percentage between purchase and sale price.
 */
export function calculateMargin(purchasePrice: number, salePrice: number): number {
    if (salePrice === 0) return 0;
    return Math.round(((salePrice - purchasePrice) / salePrice) * 100);
}
