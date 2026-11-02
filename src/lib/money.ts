/**
 * Money utilities for Kenyan Insurance Agency ERP (InsureERP / Goldfinch)
 * Currency is KES everywhere, formatted as KES 1,234,567
 */

export interface StatutoryConfig {
  trainingLevyRate: number; // e.g. 0.002 (0.2%)
  phcfLevyRate: number;     // e.g. 0.0025 (0.25%)
  stampDutyKES: number;     // e.g. 40
  whtRate: number;          // e.g. 0.05 (5%)
}

export const DEFAULT_STATUTORY_CONFIG: StatutoryConfig = {
  trainingLevyRate: 0.002, // 0.2%
  phcfLevyRate: 0.0025,    // 0.25%
  stampDutyKES: 40,        // KES 40 standard
  whtRate: 0.05,           // 5% Withholding Tax on agency commissions
};

/**
 * Format KES amount with commas and no decimals if whole number
 * e.g. formatKES(1234567) -> "KES 1,234,567"
 * e.g. formatKES(1234567.5) -> "KES 1,234,567.50"
 */
export function formatKES(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'KES 0';
  }
  const isWhole = amount % 1 === 0;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('Ksh', 'KES').replace('KES', 'KES ');
}

export function formatCompactKES(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    return `KES ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `KES ${(amount / 1_000).toFixed(0)}K`;
  }
  return formatKES(amount);
}

/**
 * Calculate full statutory breakdown from gross basic premium
 */
export function calculateStatutoryBreakdown(
  grossPremium: number,
  commissionRatePct: number,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG
) {
  const trainingLevy = Math.round(grossPremium * config.trainingLevyRate * 100) / 100;
  const phcfLevy = Math.round(grossPremium * config.phcfLevyRate * 100) / 100;
  const stampDuty = config.stampDutyKES;
  const totalPayable = grossPremium + trainingLevy + phcfLevy + stampDuty;

  const agencyCommission = Math.round(grossPremium * (commissionRatePct / 100) * 100) / 100;
  const wht = Math.round(agencyCommission * config.whtRate * 100) / 100;
  const netCommissionDue = agencyCommission - wht;

  return {
    grossPremium,
    trainingLevy,
    phcfLevy,
    stampDuty,
    totalPayable,
    agencyCommission,
    wht,
    netCommissionDue,
  };
}

/**
 * Pro-rata calculation helper for endorsements:
 * premium * remainingDays / totalDays
 * Returns the amount and an audit string showing the mathematical working
 */
export function calculateProRataPremium(
  annualPremium: number,
  remainingDays: number,
  totalDays: number = 365
): { amount: number; working: string } {
  if (totalDays <= 0 || remainingDays <= 0) {
    return {
      amount: 0,
      working: `KES 0 (0 unexpired days)`,
    };
  }

  const factor = remainingDays / totalDays;
  const calculated = Math.round(annualPremium * factor);

  return {
    amount: calculated,
    working: `${formatKES(annualPremium)} × (${remainingDays} days remaining / ${totalDays} total days) = ${formatKES(calculated)}`,
  };
}

/**
 * Convenient wrapper returning fields in KES suffix for policy state
 */
export function calculatePolicyCharges(
  grossPremium: number,
  config: StatutoryConfig = DEFAULT_STATUTORY_CONFIG,
  commissionRatePct: number = 10
) {
  const result = calculateStatutoryBreakdown(grossPremium, commissionRatePct, config);
  return {
    grossPremiumKES: result.grossPremium,
    trainingLevyKES: result.trainingLevy,
    phcfLevyKES: result.phcfLevy,
    stampDutyKES: result.stampDuty,
    totalPayableKES: result.totalPayable,
    agencyCommissionKES: result.agencyCommission,
    whtKES: result.wht,
    netCommissionDueKES: result.netCommissionDue,
  };
}

