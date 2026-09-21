import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RentStatus } from '@/types/database';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes any Nigerian phone number format to standard E.164 (+234...)
 * Handles 080..., 23480..., +23480...
 */
export function normalizePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+234')) {
    return cleaned;
  }
  if (cleaned.startsWith('234')) {
    return '+' + cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.slice(1);
  }
  if (cleaned.length === 10) {
    return '+234' + cleaned;
  }
  return cleaned;
}

/**
 * Formats amount in Nigerian Naira (NGN)
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates rent status and days remaining relative to today
 */
export function calculateRentStatus(paidUntil: string | null): {
  status: RentStatus;
  daysRemaining: number;
} {
  if (!paidUntil) {
    return { status: 'overdue', daysRemaining: -999 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(paidUntil);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { status: 'overdue', daysRemaining };
  } else if (daysRemaining <= 3) {
    return { status: 'expiring_soon', daysRemaining };
  } else {
    return { status: 'current', daysRemaining };
  }
}

/**
 * Generates wa.me pre-filled message URL for 1-tap WhatsApp reminders
 */
export function getWhatsAppReminderUrl(phone: string, tenantName: string, shopName: string, daysRemaining: number): string {
  const cleanPhone = normalizePhoneNumber(phone).replace('+', '');
  const message = daysRemaining < 0
    ? `Hello ${tenantName}, gentle reminder that rent for ${shopName} expired ${Math.abs(daysRemaining)} days ago. Please update via the plaza portal.`
    : `Hello ${tenantName}, quick reminder that rent for ${shopName} is due in ${daysRemaining} days.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
