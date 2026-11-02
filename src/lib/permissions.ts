/**
 * Role-Based Access Control (RBAC) & Permissions Matrix
 * Roles: Admin/Director, Agent, Accountant, Claims Officer, Read-only Auditor
 */

export type Role = 'admin' | 'agent' | 'accountant' | 'claims_officer' | 'auditor';

export interface RoleDefinition {
  id: Role;
  name: string;
  tagline: string;
}

export const ROLES: RoleDefinition[] = [
  { id: 'admin', name: 'Admin / Director', tagline: 'Full access to all modules, settings & audit logs' },
  { id: 'agent', name: 'Agent / Relationship Mgr', tagline: 'Clients, policies, renewals, endorsements & reminders' },
  { id: 'accountant', name: 'Accountant', tagline: 'Finance, M-Pesa tracking, reconciliations & exports' },
  { id: 'claims_officer', name: 'Claims Officer', tagline: 'Claims register, police abstracts, assessor workflows' },
  { id: 'auditor', name: 'Read-only Auditor', tagline: 'Read-only visibility everywhere including audit trail' },
];

export type Permission =
  | 'viewDashboard'
  | 'viewClients'
  | 'editClients'
  | 'viewPolicies'
  | 'editPolicies'
  | 'viewEndorsements'
  | 'editEndorsements'
  | 'viewClaims'
  | 'editClaims'
  | 'viewFinance'
  | 'editFinance'
  | 'viewMpesa'
  | 'manageMpesa'
  | 'viewMessaging'
  | 'sendMessaging'
  | 'manageTemplates'
  | 'viewAudit'
  | 'viewSensitive'
  | 'manageSettings'
  | 'exportData';

export const PERMISSIONS_MATRIX: Record<Role, Record<Permission, boolean>> = {
  admin: {
    viewDashboard: true,
    viewClients: true,
    editClients: true,
    viewPolicies: true,
    editPolicies: true,
    viewEndorsements: true,
    editEndorsements: true,
    viewClaims: true,
    editClaims: true,
    viewFinance: true,
    editFinance: true,
    viewMpesa: true,
    manageMpesa: true,
    viewMessaging: true,
    sendMessaging: true,
    manageTemplates: true,
    viewAudit: true,
    viewSensitive: true,
    manageSettings: true,
    exportData: true,
  },
  agent: {
    viewDashboard: true,
    viewClients: true,
    editClients: true,
    viewPolicies: true,
    editPolicies: true,
    viewEndorsements: true,
    editEndorsements: true,
    viewClaims: false,
    editClaims: false,
    viewFinance: false,
    editFinance: false,
    viewMpesa: false,
    manageMpesa: false,
    viewMessaging: true,
    sendMessaging: true,
    manageTemplates: false,
    viewAudit: false,
    viewSensitive: false,
    manageSettings: false,
    exportData: true,
  },
  accountant: {
    viewDashboard: true,
    viewClients: true,
    editClients: false,
    viewPolicies: true, // Read-only policies
    editPolicies: false,
    viewEndorsements: true,
    editEndorsements: false,
    viewClaims: false,
    editClaims: false,
    viewFinance: true,
    editFinance: true,
    viewMpesa: true,
    manageMpesa: true,
    viewMessaging: false,
    sendMessaging: false,
    manageTemplates: false,
    viewAudit: false,
    viewSensitive: false,
    manageSettings: false,
    exportData: true,
  },
  claims_officer: {
    viewDashboard: true,
    viewClients: true,
    editClients: false,
    viewPolicies: true, // Read-only policies
    editPolicies: false,
    viewEndorsements: false,
    editEndorsements: false,
    viewClaims: true,
    editClaims: true,
    viewFinance: false,
    editFinance: false,
    viewMpesa: false,
    manageMpesa: false,
    viewMessaging: true,
    sendMessaging: true,
    manageTemplates: false,
    viewAudit: false,
    viewSensitive: false,
    manageSettings: false,
    exportData: true,
  },
  auditor: {
    viewDashboard: true,
    viewClients: true,
    editClients: false,
    viewPolicies: true,
    editPolicies: false,
    viewEndorsements: true,
    editEndorsements: false,
    viewClaims: true,
    editClaims: false,
    viewFinance: true,
    editFinance: false,
    viewMpesa: true,
    manageMpesa: false,
    viewMessaging: true,
    sendMessaging: false,
    manageTemplates: false,
    viewAudit: true,
    viewSensitive: false,
    manageSettings: false,
    exportData: true,
  },
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return PERMISSIONS_MATRIX[role]?.[permission] ?? false;
}

/**
 * Mask sensitive string (e.g. KRA PIN or National ID)
 * e.g. A004819231B -> A00****231B
 * e.g. 24891043 -> 24****43
 */
export function maskSensitive(value: string | undefined | null, isUnmasked: boolean = false): string {
  if (!value) return '—';
  if (isUnmasked) return value;

  const len = value.length;
  if (len <= 4) return '****';
  const prefix = value.substring(0, 2);
  const suffix = value.substring(len - 2);
  return `${prefix}${'*'.repeat(Math.max(4, len - 4))}${suffix}`;
}
