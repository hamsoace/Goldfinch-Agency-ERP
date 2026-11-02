import React, { useState } from 'react';
import {
  FilePenLine,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  Calculator,
  Filter,
  Check,
  XCircle,
  FileText,
} from 'lucide-react';
import { Endorsement, Policy, EndorsementStatus } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface EndorsementsViewProps {
  endorsements: Endorsement[];
  policies: Policy[];
  onOpenNewEndorsement: () => void;
  onTransitionStatus: (
    endorsementId: string,
    newStatus: EndorsementStatus,
    note?: string
  ) => void;
}

export const EndorsementsView: React.FC<EndorsementsViewProps> = ({
  endorsements,
  policies,
  onOpenNewEndorsement,
  onTransitionStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [activeEndorsement, setActiveEndorsement] = useState<Endorsement | null>(
    endorsements[0] || null
  );
  const [transitionNote, setTransitionNote] = useState('');

  const filtered = endorsements.filter((e) => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesType = typeFilter === 'All' || e.type === typeFilter;
    return matchesStatus && matchesType;
  });

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Endorsement No', key: 'endorsementNumber' },
        { header: 'Policy No', key: 'policyNumber' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Insurer', key: 'insurerName' },
        { header: 'Type', key: 'type' },
        { header: 'Effective Date', key: 'effectiveDate' },
        { header: 'Premium Impact', key: 'premiumImpactType' },
        {
          header: 'Impact Amount (KES)',
          key: 'premiumImpactAmountKES',
          formatter: (e) => e.premiumImpactAmountKES,
        },
        { header: 'Status', key: 'status' },
        { header: 'Requested By', key: 'requestedBy' },
      ],
      'Goldfinch_Endorsements',
      'Endorsements'
    );
  };

  const handleApply = (e: Endorsement) => {
    onTransitionStatus(e.id, 'Applied', 'Applied endorsement to policy & issued financial note');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* View Header */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Proposal Section 5.4: Endorsement Engine</span>
            <span>·</span>
            <span>Policy Amendments &amp; Pro-Rata Notes</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Endorsement History &amp; Insurer Submissions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Manage additions/removals of fleet vehicles, sum insured changes, member updates, and period extensions. Automatically generates Debit Notes (additional premium) or Credit Notes (return premium).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenNewEndorsement}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Endorsement</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Status:</span>
          {['All', 'Draft', 'Submitted to Insurer', 'Approved', 'Applied', 'Rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-slate-900 text-white dark:bg-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Endorsements List (7 cols) + Detail & Transition Workspace (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Endorsements Table */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Endorsements ({filtered.length})
            </span>
            <span className="text-slate-500 dark:text-slate-400">Click to view audit &amp; pro-rata math</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Endorsement / Policy</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4 text-right">Premium Impact</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((e) => {
                  const isSelected = activeEndorsement?.id === e.id;
                  return (
                    <tr
                      key={e.id}
                      onClick={() => setActiveEndorsement(e)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 font-medium'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-750'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{e.endorsementNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{e.policyNumber}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                        {e.clientName}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 capitalize">
                        {e.type.replace(/_/g, ' ')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums">
                        {e.premiumImpactType === 'Nil' ? (
                          <span className="text-slate-400">KES 0 (Nil)</span>
                        ) : e.premiumImpactType === 'Additional' ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            +{formatKES(e.premiumImpactAmountKES)} (DN)
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-700 dark:text-rose-400">
                            -{formatKES(e.premiumImpactAmountKES)} (CN)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            e.status === 'Applied'
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : e.status === 'Approved'
                              ? 'bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                              : e.status === 'Submitted to Insurer'
                              ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Endorsement Dossier & Pro-Rata Math */}
        <div className="lg:col-span-5 space-y-4">
          {activeEndorsement ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{activeEndorsement.endorsementNumber}</span>
                    <span>·</span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold">{activeEndorsement.status}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {activeEndorsement.clientName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Policy: {activeEndorsement.policyNumber} ({activeEndorsement.insurerName})
                  </p>
                </div>

                {activeEndorsement.status === 'Approved' && (
                  <button
                    onClick={() => handleApply(activeEndorsement)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                    title="Apply to policy & generate Debit Note / Credit Note"
                  >
                    Apply Endorsement
                  </button>
                )}
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block">Description of Amendment</span>
                  <p className="mt-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 leading-relaxed border border-slate-200 dark:border-slate-700">
                    {activeEndorsement.description}
                  </p>
                </div>

                {/* Pro-Rata Calculation Working (Mandated in Section 5.4) */}
                <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Pro-Rata Premium Calculation Working</span>
                  </div>
                  <p className="text-amber-950 dark:text-amber-100 font-mono text-[11px] bg-white dark:bg-slate-900 p-2 rounded border border-amber-200 dark:border-amber-800">
                    {activeEndorsement.proRataWorking || 'Pro-rata factor applied: 0 unexpired adjustments'}
                  </p>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    Formula: <code>annual_premium * remaining_days / total_days</code>
                  </p>
                </div>

                {/* Workflow Stepper */}
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-2">Workflow Progression</span>
                  <div className="grid grid-cols-4 gap-1 text-center font-medium text-[10px]">
                    {['Draft', 'Submitted to Insurer', 'Approved', 'Applied'].map((step, idx) => {
                      const isDone =
                        activeEndorsement.status === step ||
                        (step === 'Draft') ||
                        (step === 'Submitted to Insurer' && (activeEndorsement.status === 'Approved' || activeEndorsement.status === 'Applied')) ||
                        (step === 'Approved' && activeEndorsement.status === 'Applied');

                      return (
                        <div
                          key={step}
                          className={`p-1.5 rounded border transition-colors ${
                            activeEndorsement.status === step
                              ? 'bg-amber-600 text-white font-bold border-amber-600'
                              : isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* State Transition Action Buttons */}
                {activeEndorsement.status === 'Draft' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button
                      onClick={() => onTransitionStatus(activeEndorsement.id, 'Submitted to Insurer', 'Submitted via insurer portal')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 rounded-lg"
                    >
                      Submit to Insurer &rarr;
                    </button>
                  </div>
                )}
                {activeEndorsement.status === 'Submitted to Insurer' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                    <button
                      onClick={() => onTransitionStatus(activeEndorsement.id, 'Rejected', 'Underwriter declined endorsement')}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
                    >
                      Record Rejection
                    </button>
                    <button
                      onClick={() => onTransitionStatus(activeEndorsement.id, 'Approved', 'Underwriter approved endorsement')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg"
                    >
                      Record Insurer Approval
                    </button>
                  </div>
                )}

                {/* Audit History */}
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">Transition History</span>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {activeEndorsement.history.map((h, i) => (
                      <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between text-slate-500">
                          <span>{h.fromStatus} &rarr; {h.toStatus}</span>
                          <span>{h.timestamp}</span>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 font-sans mt-0.5">
                          {h.user}: {h.note || 'Status updated'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              Select an endorsement row to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
