import React, { useState } from 'react';
import { X, Check, Calculator, FilePenLine } from 'lucide-react';
import { Policy, Endorsement, EndorsementType } from '../../types/insurance';
import { formatKES, calculateProRataPremium } from '../../lib/money';
import { calculateDaysDifference } from '../../lib/dates';

interface NewEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  onAddEndorsement: (endorsement: Endorsement) => void;
}

export const NewEndorsementModal: React.FC<NewEndorsementModalProps> = ({
  isOpen,
  onClose,
  policies,
  onAddEndorsement,
}) => {
  const [selectedPolicyNo, setSelectedPolicyNo] = useState(policies[0]?.policyNumber || '');
  const [type, setType] = useState<EndorsementType>('change_cover_sum');
  const [effectiveDate, setEffectiveDate] = useState('2026-11-02');
  const [description, setDescription] = useState('');
  const [impactType, setImpactType] = useState<'Additional' | 'Return' | 'Nil'>('Additional');
  const [annualBasisKES, setAnnualBasisKES] = useState<number>(20000);
  const [requestedBy, setRequestedBy] = useState('Sarah Wambui');

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.policyNumber === selectedPolicyNo) || policies[0];

  // Calculate pro-rata working
  const remainingDays = currentPolicy
    ? Math.max(0, calculateDaysDifference(currentPolicy.expiryDate, effectiveDate))
    : 0;
  const proRata = calculateProRataPremium(annualBasisKES, remainingDays, 365);
  const finalImpactKES = impactType === 'Nil' ? 0 : proRata.amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPolicy) return;

    const newEndorsement: Endorsement = {
      id: `end-${Date.now().toString().slice(-4)}`,
      endorsementNumber: `END/2026/${Math.floor(100 + Math.random() * 900)}`,
      policyId: currentPolicy.id,
      policyNumber: currentPolicy.policyNumber,
      clientName: currentPolicy.clientName,
      insurerName: currentPolicy.insurerName,
      type,
      effectiveDate,
      description: description.trim() || 'Policy specification endorsement',
      premiumImpactType: impactType,
      premiumImpactAmountKES: finalImpactKES,
      proRataWorking: impactType === 'Nil' ? 'Administrative endorsement (Nil premium)' : proRata.working,
      requestedBy,
      status: 'Draft',
      supportingDocuments: ['Endorsement_Request_Slip.pdf'],
      history: [
        {
          fromStatus: 'Draft',
          toStatus: 'Draft',
          user: requestedBy,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          note: 'Draft endorsement created with pro-rata tariff math',
        },
      ],
    };

    onAddEndorsement(newEndorsement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilePenLine className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Draft Policy Endorsement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-xs space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Policy to Amend
            </label>
            <select
              value={selectedPolicyNo}
              onChange={(e) => setSelectedPolicyNo(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.policyNumber}>
                  {p.clientName} · {p.policyNumber} ({p.product} · {p.insurerName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Endorsement Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EndorsementType)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="add_vehicle">Add Vehicle to Fleet</option>
                <option value="remove_vehicle">Remove Vehicle from Fleet</option>
                <option value="change_vehicle_details">Change Vehicle Details / Reg</option>
                <option value="change_cover_sum">Change Cover / Sum Insured</option>
                <option value="add_remove_member">Add / Remove Member (Medical/Life)</option>
                <option value="change_client_details">Change Client Details</option>
                <option value="cancellation">Cancellation of Policy</option>
                <option value="extension_of_period">Extension of Period / Territory</option>
                <option value="other">Other Amendment</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Effective Date
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description of Changes &amp; Reasons
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Addition of 2 new Isuzu trucks (KDL 401A and KDL 402A) to commercial fleet cover..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Financial Premium Impact
              </label>
              <select
                value={impactType}
                onChange={(e) => setImpactType(e.target.value as any)}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Additional">Additional Premium (Debit Note)</option>
                <option value="Return">Return Premium (Credit Note)</option>
                <option value="Nil">Nil (Administrative only)</option>
              </select>
            </div>

            {impactType !== 'Nil' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Annual Basis Rate (KES)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={annualBasisKES}
                  onChange={(e) => setAnnualBasisKES(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>
            )}
          </div>

          {/* Pro-Rata Math Working Box (Mandated in Section 5.4) */}
          {impactType !== 'Nil' && (
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200">
                <Calculator className="w-4 h-4 text-amber-700" />
                <span>Automatic Pro-Rata Premium Calculation:</span>
              </div>
              <p className="font-mono text-[11px] text-amber-950 dark:text-amber-100 bg-white dark:bg-slate-900 p-2 rounded border border-amber-200 dark:border-amber-800">
                {proRata.working}
              </p>
              <div className="flex justify-between text-[11px] text-amber-800 dark:text-amber-300 font-semibold pt-1">
                <span>Unexpired Policy Term: {remainingDays} days</span>
                <span>Pro-Rata Impact: {formatKES(finalImpactKES)}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              Create Endorsement Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
