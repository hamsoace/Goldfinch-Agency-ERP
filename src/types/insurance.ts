/**
 * Comprehensive TypeScript types for Goldfinch Insurance Agency ERP (InsureERP)
 */

import { Role } from '../lib/permissions';
import { StatutoryConfig } from '../lib/money';

export type ClientType = 'Individual' | 'SME' | 'Corporate';

export interface NextOfKin {
  name: string;
  relation: string;
  phone: string;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  phone: string; // E.164: +254...
  email: string;
  idOrPassport: string; // Masked unless viewSensitive
  kraPin?: string;       // Masked unless viewSensitive
  address: string;
  county: string;
  nextOfKin?: NextOfKin;
  odpcConsent: boolean;
  odpcConsentDate: string;
  smsOptOut: boolean;
  assignedManager: string;
  createdAt: string;
}

export type ProductLine =
  | 'Motor Private'
  | 'Motor Commercial'
  | 'Motor Comprehensive'
  | 'Medical'
  | 'Group Life'
  | 'Personal Accident'
  | 'Fire & Perils'
  | 'Domestic Package'
  | 'Marine'
  | 'Other';

export interface Insurer {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  contactPhone: string;
  commissionRates: Record<ProductLine, number>;
}

export type PolicyStatus = 'Active' | 'Due' | 'Lapsed' | 'Renewed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partly paid' | 'Paid';

export interface MotorDetails {
  registration: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  chassisOrLogbook: string;
}

export interface MedicalDetails {
  membersCount: number;
  inpatientLimitKES: number;
  outpatientLimitKES?: number;
}

export interface PolicyDocument {
  id: string;
  title: string;
  type: 'Schedule' | 'Digital Certificate' | 'Debit Note' | 'Endorsement Slip' | 'Proposal Form';
  fileName: string;
  fileSizeKB: number;
  uploadedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  clientName: string;
  insurerId: string;
  insurerName: string;
  product: ProductLine;
  subjectMatter: string;
  sumInsuredKES: number;
  grossPremiumKES: number;
  trainingLevyKES: number;
  phcfLevyKES: number;
  stampDutyKES: number;
  totalPayableKES: number;
  premiumPaidKES: number;
  commissionRatePct: number;
  agencyCommissionKES: number;
  whtKES: number;
  netCommissionDueKES: number;
  startDate: string;
  expiryDate: string;
  daysToExpiry: number;
  status: PolicyStatus;
  paymentStatus: PaymentStatus;
  motorDetails?: MotorDetails;
  medicalDetails?: MedicalDetails;
  documents: PolicyDocument[];
  previousPolicyId?: string;
  renewalDraftPremiumKES?: number;
}

export type EndorsementType =
  | 'add_vehicle'
  | 'remove_vehicle'
  | 'change_vehicle_details'
  | 'change_cover_sum'
  | 'add_remove_member'
  | 'change_client_details'
  | 'cancellation'
  | 'extension_of_period'
  | 'other';

export type EndorsementStatus =
  | 'Draft'
  | 'Submitted to Insurer'
  | 'Approved'
  | 'Rejected'
  | 'Applied';

export interface EndorsementTransition {
  fromStatus: EndorsementStatus;
  toStatus: EndorsementStatus;
  user: string;
  timestamp: string;
  note?: string;
}

export interface Endorsement {
  id: string;
  endorsementNumber: string;
  policyId: string;
  policyNumber: string;
  clientName: string;
  insurerName: string;
  type: EndorsementType;
  effectiveDate: string;
  description: string;
  premiumImpactType: 'Additional' | 'Return' | 'Nil';
  premiumImpactAmountKES: number;
  proRataWorking?: string;
  requestedBy: string;
  status: EndorsementStatus;
  supportingDocuments: string[];
  history: EndorsementTransition[];
}

export interface DebitCreditNote {
  id: string;
  noteNumber: string; // e.g. DN-2026-0041 or CN-2026-0012
  type: 'Debit Note' | 'Credit Note';
  policyId: string;
  policyNumber: string;
  clientName: string;
  amountKES: number;
  dateIssued: string;
  reason: string;
  isPaid: boolean;
  relatedEndorsementNo?: string;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  clientId: string;
  clientName: string;
  policyNumber: string;
  amountKES: number;
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  matchedStatus: 'Reconciled' | 'Pending' | 'Flagged';
  receivedBy: string;
  allocatedToPremium: number;
}


export type ClaimStatus =
  | 'Reported'
  | 'Documents Pending'
  | 'Submitted to Insurer'
  | 'Under Assessment'
  | 'Approved'
  | 'Declined'
  | 'Settled'
  | 'Closed';

export interface ClaimChecklistItem {
  id: string;
  name: string;
  required: boolean;
  received: boolean;
  receivedDate?: string;
}

export interface ClaimActivity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  note: string;
}

export interface ClaimTask {
  id: string;
  title: string;
  dueDate: string;
  assignee: string;
  completed: boolean;
  outcome?: string;
}

export interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  clientName: string;
  clientPhone: string;
  product: ProductLine;
  insurerName: string;
  insurerClaimRef?: string;
  dateOfLoss: string;
  dateReported: string;
  daysOpen: number;
  lossDescription: string;
  lossType: string;
  estimatedAmountKES: number;
  approvedAmountKES?: number;
  status: ClaimStatus;
  assignedOfficer: string;
  checklist: ClaimChecklistItem[];
  timeline: ClaimActivity[];
  tasks: ClaimTask[];
  lastActivityDate: string;
}

export interface MpesaTransaction {
  id: string;
  receiptCode: string; // Unique e.g. SJD8201KPL
  amountKES: number;
  payerPhone: string;
  payerName: string;
  accountReference: string; // Policy or Debit note no
  timestamp: string;
  status: 'Unallocated' | 'Allocated' | 'Partially allocated' | 'Refunded';
  allocatedPolicies: {
    policyNumber: string;
    amountKES: number;
  }[];
  rawCallbackId?: string;
}

export interface ManualPayment {
  id: string;
  receiptNumber: string;
  clientId: string;
  clientName: string;
  amountKES: number;
  method: 'M-Pesa STK' | 'M-Pesa Paybill C2B' | 'Bank RTGS/EFT' | 'Cheque' | 'Cash';
  referenceCode: string;
  paymentDate: string;
  policyAllocations: {
    policyNumber: string;
    amountKES: number;
  }[];
  receivedBy: string;
}

export interface CommissionEntry {
  id: string;
  insurer: string;
  period: string; // e.g. October 2026
  policyNumber: string;
  clientName: string;
  grossPremiumKES: number;
  contractCommissionKES: number;
  remittedCommissionKES: number;
  varianceKES: number;
  whtDeductedKES: number;
  whtCertificateReceived: boolean;
  status: 'Matched' | 'Under Query' | 'Overdue';
}

export interface MessageTemplate {
  id: string;
  title: string;
  channel: 'SMS' | 'WhatsApp';
  category: 'Renewal' | 'Payment' | 'Claim' | 'Endorsement' | 'General';
  language: 'English' | 'Kiswahili';
  text: string;
  approvedWhatsAppName?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerDaysBeforeExpiry: number;
  templateId: string;
  channel: 'SMS' | 'WhatsApp';
  isActive: boolean;
  lastRun?: string;
  nextScheduledRun: string;
}

export interface MessageLog {
  id: string;
  clientName: string;
  phone: string;
  channel: 'SMS' | 'WhatsApp';
  templateTitle: string;
  renderedText: string;
  status: 'Queued' | 'Sent' | 'Delivered' | 'Failed';
  providerError?: string;
  timestamp: string;
  sender: string;
  retryCount: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  targetRecord: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
}

export interface AgencySettings {
  agencyName: string;
  iraLicenseNo: string;
  kraPin: string;
  physicalAddress: string;
  phone: string;
  email: string;
  mpesaPaybill: string;
  bankAccount: string;
  quietHours: {
    start: string; // "20:00"
    end: string;   // "07:00"
  };
  statutoryConfig: StatutoryConfig;
  dataRetentionYears: number;
  claimInactivityAlertDays: number;
}

// Convenient type aliases
export type AuditLogItem = AuditLogEntry;
export type SystemSettings = AgencySettings;

