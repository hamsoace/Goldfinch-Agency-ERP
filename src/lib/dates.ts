/**
 * Date utilities with Africa/Nairobi timezone context
 */

export const REFERENCE_DATE = '2026-11-02';

export function getTodayEAT(): string {
  return REFERENCE_DATE;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Nairobi',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi',
    });
  } catch {
    return dateStr;
  }
}

export function calculateDaysDifference(targetDate: string, baseDate: string = REFERENCE_DATE): number {
  try {
    const t = new Date(targetDate).getTime();
    const b = new Date(baseDate).getTime();
    const diff = t - b;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export type RenewalBucket = 'overdue' | '0-7' | '8-14' | '15-30' | '31-60' | '60+';

export function getRenewalBucket(daysRemaining: number): RenewalBucket {
  if (daysRemaining < 0) return 'overdue';
  if (daysRemaining <= 7) return '0-7';
  if (daysRemaining <= 14) return '8-14';
  if (daysRemaining <= 30) return '15-30';
  if (daysRemaining <= 60) return '31-60';
  return '60+';
}

export type ClaimAgeingBucket = '0-7' | '8-30' | '31-60' | '60+';

export function getClaimAgeingBucket(daysOpen: number): ClaimAgeingBucket {
  if (daysOpen <= 7) return '0-7';
  if (daysOpen <= 30) return '8-30';
  if (daysOpen <= 60) return '31-60';
  return '60+';
}

export type PremiumAgeingBucket = '0-30' | '31-60' | '61-90' | '90+';

export function getPremiumAgeingBucket(daysPastDue: number): PremiumAgeingBucket {
  if (daysPastDue <= 30) return '0-30';
  if (daysPastDue <= 60) return '31-60';
  if (daysPastDue <= 90) return '61-90';
  return '90+';
}
