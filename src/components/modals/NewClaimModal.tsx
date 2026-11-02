import React, { useState } from 'react';
import { X, Check, AlertCircle, FileCheck2 } from 'lucide-react';
import { Policy, Claim, ClaimChecklistItem } from '../../types/insurance';
import { formatKES } from '../../lib/money';

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  onAddClaim: (claim: Claim) => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({
  isOpen,
  onClose,
  policies,
  onAddClaim,
}) => {
  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || '');
  const [dateOfLoss, setDateOfLoss] = useState('2026-10-31');
  const [estimatedAmountKES, setEstimatedAmountKES] = useState<number>(180000);
  const [lossDescription, setLossDescription] = useState('Front bumper & headlight damage in minor collision along Mombasa Road.');
  const [assessorName, setAssessorName] = useState('Benchmark Loss Adjusters Ltd');

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.id === selectedPolicyId) || policies[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPolicy) return;

    const claimNo = `CLM/2026/${Math.floor(100 + Math.random() * 900)}`;

    const defaultChecklist: ClaimChecklistItem[] = [
      { id: 'chk-1', name: 'Police Abstract', required: true, received: true, receivedDate: '2026-11-01' },
      { id: 'chk-2', name: 'Duly Signed Underwriter Claim Form', required: true, received: true, receivedDate: '2026-11-01' },
      { id: 'chk-3', name: 'Driver License & National ID Copy', required: true, received: true, receivedDate: '2026-11-01' },
      { id: 'chk-4', name: 'Garage Repair Estimate', required: true, received: false },
      { id: 'chk-5', name: 'Scene & Damage Photos', required: false, received: true, receivedDate: '2026-11-01' },
    ];

    const newClaim: Claim = {
      id: `clm-${Date.now()}`,
      claimNumber: claimNo,
      policyId: currentPolicy.id,
      policyNumber: currentPolicy.policyNumber,
      clientName: currentPolicy.clientName,
      clientPhone: '+254712345678',
      product: currentPolicy.product,
      insurerName: currentPolicy.insurerName,
      dateOfLoss,
      dateReported: '2026-11-02',
      daysOpen: 1,
      lossDescription: lossDescription.trim() || 'Accidental damage reported. Initial assessment required.',
      lossType: 'Accidental Damage',
      estimatedAmountKES,
      status: 'Reported',
      assignedOfficer: 'Claims Officer',
      checklist: defaultChecklist,
      timeline: [
        {
          id: `act-${Date.now()}-1`,
          timestamp: new Date().toISOString(),
          user: 'Claims Officer',
          action: 'Claim Lodged',
          note: `Claim notification lodged. Initial estimate ${formatKES(estimatedAmountKES)}.`,
        },
      ],
      tasks: [
        {
          id: `tsk-${Date.now()}-1`,
          title: 'Request garage assessment report from loss adjuster',
          dueDate: '2026-11-05',
          assignee: 'Claims Officer',
          completed: false,
        },
      ],
      lastActivityDate: '2026-11-02',
    };

    onAddClaim(newClaim);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Intake New Insurance Claim
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Log claim notification, assign loss adjuster, and set document checklist
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Covered Policy
            </label>
            <select
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              required
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.policyNumber} &bull; {p.clientName} ({p.insurerName} &bull; {p.product})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Date of Loss
              </label>
              <input
                type="date"
                required
                value={dateOfLoss}
                onChange={(e) => setDateOfLoss(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Estimated Loss (KES)
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                value={estimatedAmountKES}
                onChange={(e) => setEstimatedAmountKES(Number(e.target.value) || 0)}
                className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Loss Adjuster / Assessor Firm
            </label>
            <input
              type="text"
              value={assessorName}
              onChange={(e) => setAssessorName(e.target.value)}
              placeholder="e.g. Benchmark Loss Adjusters Ltd"
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Incident Particulars &amp; Description
            </label>
            <textarea
              rows={3}
              required
              value={lossDescription}
              onChange={(e) => setLossDescription(e.target.value)}
              placeholder="Detailed description of loss circumstances, damage sustained, location of incident..."
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              Register Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
