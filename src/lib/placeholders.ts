/**
 * SMS & WhatsApp template placeholder parser and validation
 */

export const ALLOWED_PLACEHOLDERS = [
  '{{client_name}}',
  '{{policy_number}}',
  '{{product}}',
  '{{insurer}}',
  '{{expiry_date}}',
  '{{days_to_expiry}}',
  '{{premium}}',
  '{{balance}}',
  '{{claim_number}}',
  '{{claim_status}}',
  '{{agent_name}}',
  '{{agency_name}}',
  '{{agency_phone}}',
  '{{paybill}}',
  '{{account_ref}}',
] as const;

export type PlaceholderKey = typeof ALLOWED_PLACEHOLDERS[number];

export function validatePlaceholders(text: string): { isValid: boolean; invalidPlaceholders: string[] } {
  const matches = text.match(/\{\{[a-zA-Z0-9_\-]+\}\}/g) || [];
  const invalid: string[] = [];

  for (const match of matches) {
    if (!ALLOWED_PLACEHOLDERS.includes(match as any)) {
      invalid.push(match);
    }
  }

  return {
    isValid: invalid.length === 0,
    invalidPlaceholders: invalid,
  };
}

export function renderTemplate(template: string, values: Record<string, string>): string {
  let rendered = template;
  for (const [key, val] of Object.entries(values)) {
    const placeholder = key.startsWith('{{') ? key : `{{${key}}}`;
    rendered = rendered.split(placeholder).join(val || '');
  }
  return rendered;
}

export function calculateSmsSegments(text: string): { charCount: number; segmentCount: number } {
  const charCount = text.length;
  if (charCount <= 160) {
    return { charCount, segmentCount: charCount === 0 ? 0 : 1 };
  }
  // Multi-part SMS allows 153 chars per segment
  const segmentCount = Math.ceil(charCount / 153);
  return { charCount, segmentCount };
}
