import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileCheck,
  Calculator,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { Policy } from '../../types/insurance';
import { formatKES, calculatePolicyCharges, StatutoryConfig, DEFAULT_STATUTORY_CONFIG } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface RenewalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  statutoryConfig?: StatutoryConfig;
  onIssueRenewal: (renewedPolicy: Policy, oldPolicyId: string) => void;
}

export const RenewalWorkflowModal: React.FC<RenewalWorkflowModalProps> = ({
  isOpen,
  onClose,
  policy,
  statutoryConfig = DEFAULT_STATUTORY_CONFIG,
  onIssueRenewal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Renewal Form State
  const [renewalPremium, setRenewalPremium] = useState<number>(policy ? policy.grossPremiumKES : 50000);
  const [insurerQuoteRef, setInsurerQuoteRef] = useState<string>('');
  const [confirmationDate, setConfirmationDate] = useState<string>('2026-11-02');
  const [underwriterOfficer, setUnderwriterOfficer] = useState<string>('Grace Muriuki (Underwriter)');
  const [renewalTermsNotes, setRenewalTermsNotes] = useState<string>('No-claims discount 10% retained. Zero excess endorsement applied.');

  if (!isOpen || !policy) return null;

  // Initialize quote ref when modal opens
  if (!insurerQuoteRef) {
    setInsurerQuoteRef(`QT-${policy.insurerName.substring(0, 3).toUpperCase()}-2027-${Math.floor(1000 + Math.random() * 9000)}`);
  }

  // Recalculate charges with configurable levies
  const charges = calculatePolicyCharges(
    renewalPremium,
    statutoryConfig,
    policy.commissionRatePct
  );

  const calculateNewExpiry = (currentExpiry: string) => {
    try {
      const d = new Date(currentExpiry);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return '2027-11-01';
    }
  };

  const newStartDate = policy.expiryDate;
  const newExpiryDate = calculateNewExpiry(policy.expiryDate);

  const handleFinalIssue = () => {
    // Generate new policy number with /RN2027 suffix or incremented year
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const renewedPolicyNumber = policy.policyNumber.replace(/\/202[0-9]\//, '/2027/');

    const renewedPolicy: Policy = {
      ...policy,
      id: `pol-${Date.now()}`,
      policyNumber: renewedPolicyNumber.includes('2027') ? renewedPolicyNumber : `${renewedPolicyNumber}-RN`,
      grossPremiumKES: charges.grossPremiumKES,
      trainingLevyKES: charges.trainingLevyKES,
      phcfLevyKES: charges.phcfLevyKES,
      stampDutyKES: charges.stampDutyKES,
      totalPayableKES: charges.totalPayableKES,
      agencyCommissionKES: charges.agencyCommissionKES,
      whtKES: charges.whtKES,
      netCommissionDueKES: charges.netCommissionDueKES,
      startDate: newStartDate,
      expiryDate: newExpiryDate,
      daysToExpiry: 365,
      status: 'Active',
      paymentStatus: 'Unpaid',
      premiumPaidKES: 0,
      previousPolicyId: policy.id,
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          title: 'Renewal Certificate & Schedule',
          type: 'Schedule',
          fileName: `Schedule_${renewedPolicyNumber.replace(/\//g, '_')}.pdf`,
          fileSizeKB: 412,
          uploadedAt: new Date().toISOString(),
        },
        {
          id: `doc-${Date.now()}-2`,
          title: 'Insurer Confirmation Slip',
          type: 'Endorsement Slip',
          fileName: `Insurer_Quote_${insurerQuoteRef}.pdf`,
          fileSizeKB: 245,
          uploadedAt: new Date().toISOString(),
        },
      ],
    };

    onIssueRenewal(renewedPolicy, policy.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-950/60 flex items-center justify-center text-gold-600 dark:text-gold-400">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Policy Renewal Workflow
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Draft &rarr; Premium Revision &rarr; Insurer Confirmation &rarr; Issue Renewal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-900/40 text-xs">
          <div className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-medium ${step === 1 ? 'bg-gold-400 text-slate-900 font-bold' : 'text-slate-500'}`}>
            1. Policy Review
          </div>
          <div className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-medium ${step === 2 ? 'bg-gold-400 text-slate-900 font-bold' : 'text-slate-500'}`}>
            2. Update Premium
          </div>
          <div className={`py-2 px-3 text-center border-r border-slate-200 dark:border-slate-700 font-medium ${step === 3 ? 'bg-gold-400 text-slate-900 font-bold' : 'text-slate-500'}`}>
            3. Insurer Quote
          </div>
          <div className={`py-2 px-3 text-center font-medium ${step === 4 ? 'bg-gold-400 text-slate-900 font-bold' : 'text-slate-500'}`}>
            4. Issue &amp; Bind
          </div>
        </div>

        {/* Step Body */}
        <div className="p-6 space-y-4">
          {/* STEP 1: REVIEW EXPIRING TERM */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expiring Policy No:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{policy.policyNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Insured Client:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{policy.clientName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Insurance Company:</span>
                  <span className="text-slate-800 dark:text-slate-200">{policy.insurerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Cover / Product:</span>
                  <span className="text-slate-800 dark:text-slate-200">{policy.product} &bull; {policy.subjectMatter}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{formatDate(policy.expiryDate)} ({policy.daysToExpiry} days left)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Previous Term Gross Premium:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatKES(policy.grossPremiumKES)}</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-200 dark:border-teal-900 flex items-start gap-2 text-teal-800 dark:text-teal-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Claim History Check: Clean claims record on this term. Client qualifies for standard renewal terms with full renewal discounts.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg transition"
                >
                  Proceed to Update Premium <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: UPDATE PREMIUM & LEVIES */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Term Gross Annual Premium (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-mono text-slate-400">KES</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    value={renewalPremium}
                    onChange={(e) => setRenewalPremium(Number(e.target.value) || 0)}
                    className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-12 pr-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Statutory Training Levy (0.2%), PHCF (0.25%), and Stamp Duty (KES 40) will automatically calculate.
                </p>
              </div>

              {/* Automatic Statutory Calculations Box */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Premium:</span>
                  <span>{formatKES(charges.grossPremiumKES)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Training Levy (0.2%):</span>
                  <span>{formatKES(charges.trainingLevyKES)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>PHCF Levy (0.25%):</span>
                  <span>{formatKES(charges.phcfLevyKES)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Stamp Duty:</span>
                  <span>{formatKES(charges.stampDutyKES)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
                  <span>Total Payable by Client:</span>
                  <span className="text-gold-600 dark:text-gold-400">{formatKES(charges.totalPayableKES)}</span>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1 text-[11px] text-teal-700 dark:text-teal-300 flex justify-between">
                  <span>Agency Comm ({policy.commissionRatePct}%):</span>
                  <span>{formatKES(charges.agencyCommissionKES)} (Net after 5% WHT: {formatKES(charges.netCommissionDueKES)})</span>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg transition"
                >
                  Record Insurer Confirmation <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RECORD INSURER CONFIRMATION */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Insurer Quote / Endorsement Ref
                  </label>
                  <input
                    type="text"
                    value={insurerQuoteRef}
                    onChange={(e) => setInsurerQuoteRef(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirmation Date
                  </label>
                  <input
                    type="date"
                    value={confirmationDate}
                    onChange={(e) => setConfirmationDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Underwriter Contact / Approving Officer
                </label>
                <input
                  type="text"
                  value={underwriterOfficer}
                  onChange={(e) => setUnderwriterOfficer(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Renewal Endorsement Notes &amp; Special Conditions
                </label>
                <textarea
                  rows={2}
                  value={renewalTermsNotes}
                  onChange={(e) => setRenewalTermsNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg transition"
                >
                  Review &amp; Issue Renewal <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ISSUE & BIND */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gold-50/60 dark:bg-gold-950/20 rounded-xl border border-gold-300 dark:border-gold-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gold-500" />
                  Renewal Summary for Issuance
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Client:</span>
                    <span className="font-semibold">{policy.clientName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Underwriter:</span>
                    <span>{policy.insurerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">New Period:</span>
                    <span className="font-mono">{newStartDate} &rarr; {newExpiryDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Payable:</span>
                    <span className="font-bold font-mono text-gold-600 dark:text-gold-400">{formatKES(charges.totalPayableKES)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Insurer Quote Ref:</span>
                    <span className="font-mono font-medium">{insurerQuoteRef}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                &bull; Expiring policy ({policy.policyNumber}) will be transitioned to status <strong className="text-emerald-600">Renewed</strong>.<br />
                &bull; New active policy term will be generated with full audit trail linked to the previous term.<br />
                &bull; Automatic renewal debit note will be created for the accounting ledger.
              </div>

              <div className="flex justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinalIssue}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg shadow-sm transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Issue &amp; Activate Renewal Cover
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
