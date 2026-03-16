/**
 * Date formatting utilities using date-fns with Spanish locale.
 * All dates in the app are displayed in Colombian Spanish.
 */
import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Full date: "14 de marzo de 2025"
 */
export function formatFullDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Short date: "14 mar 2025"
 */
export function formatShortDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'd MMM yyyy', { locale: es });
}

/**
 * Date and time: "14 mar 2025, 2:30 PM"
 */
export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, "d MMM yyyy, h:mm a", { locale: es });
}

/**
 * Relative time: "hace 3 horas", "en 2 días"
 */
export function formatRelativeTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

/**
 * Check if a warranty has expired.
 */
export function isExpired(expiresAt: string | Date): boolean {
    const d = typeof expiresAt === 'string' ? parseISO(expiresAt) : expiresAt;
    return isBefore(d, new Date());
}

/**
 * Check if a date is in the future.
 */
export function isFutureDate(date: string | Date): boolean {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isAfter(d, new Date());
}

/**
 * Time only: "2:30 PM"
 */
export function formatTime(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'h:mm a', { locale: es });
}

/**
 * ISO date for inputs: "2025-03-14"
 */
export function toInputDate(date: string | Date): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
}
