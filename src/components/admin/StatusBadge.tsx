import React from 'react';
import { RentStatus } from '@/types/database';

interface StatusBadgeProps {
  status: RentStatus | 'vacant';
  daysRemaining?: number;
  paidUntil?: string | null;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, daysRemaining = 0, paidUntil, size = 'sm' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (status === 'vacant') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-stone-100 text-stone-600 border border-stone-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mr-1.5" />
        Vacant
      </span>
    );
  }

  if (status === 'overdue') {
    const overdueDays = Math.abs(daysRemaining);
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-pulse" />
        {overdueDays > 0 ? `Overdue (${overdueDays}d)` : 'Overdue'}
      </span>
    );
  }

  if (status === 'expiring_soon') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
        {daysRemaining > 0 ? `Due in ${daysRemaining}d` : 'Due Today'}
      </span>
    );
  }

  // Current / Paid Up
  const formattedDate = paidUntil
    ? new Date(paidUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null;

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
      {formattedDate ? `Paid to ${formattedDate}` : 'Paid Up'}
    </span>
  );
}
