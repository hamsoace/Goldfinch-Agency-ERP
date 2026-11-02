/**
 * Kenyan phone number normalizer
 * Accepts formats like 0712345678, 0112345678, 712345678, +254712345678, 254712345678
 * Normalizes to +2547XXXXXXXX or +2541XXXXXXXX
 */

export function normalizeKenyanPhone(phone: string): string {
  if (!phone) return '';
  
  // Remove spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  // Handle + prefix
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // Handle 07... or 01... (standard 10 digits)
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`;
  }

  // Handle 7... or 1... (9 digits)
  if ((cleaned.startsWith('7') || cleaned.startsWith('1')) && cleaned.length === 9) {
    return `+254${cleaned}`;
  }

  // Handle 2547... or 2541... (12 digits)
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  // If already prefixed or unrecognized, return with + if numerical
  if (/^\d{12}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  return phone.trim();
}

export function isValidKenyanPhone(phone: string): boolean {
  const normalized = normalizeKenyanPhone(phone);
  // Kenya mobile numbers start with +2547... or +2541... and are 13 chars including +
  return /^\+254(7|1)\d{8}$/.test(normalized);
}

export function formatKenyanPhone(phone: string): string {
  const norm = normalizeKenyanPhone(phone);
  if (norm.length === 13 && norm.startsWith('+254')) {
    // Format: +254 712 345 678
    return `${norm.substring(0, 4)} ${norm.substring(4, 7)} ${norm.substring(7, 10)} ${norm.substring(10)}`;
  }
  return phone;
}
