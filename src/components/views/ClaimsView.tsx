import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  Plus,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  Check,
  Send,
  User,
  Filter,
} from 'lucide-react';
import { Claim, ClaimStatus, Policy, ClaimTask } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDate, getClaimAgeingBucket, ClaimAgeingBucket } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface ClaimsViewProps {
  claims: Claim[];
  policies: Policy[];
  onOpenNewClaim: () => void;
  onUpdateStatus: (claimId: string, newStatus: ClaimStatus) => void;
  onToggleChecklist: (claimId: string, itemId: string) => void;
  onAddTimelineNote: (claimId: string, note: string) => void;
  onToggleClaimTask: (claimId: string, taskId: string) => void;
}

const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  'Reported': ['Documents Pending', 'Submitted to Insurer'],
  'Documents Pending': ['Submitted to Insurer', 'Declined'],
  'Submitted to Insurer': ['Under Assessment', 'Declined'],
  'Under Assessment': ['Approved', 'Declined'],
  'Approved': ['Settled'],
  'Declined': ['Closed'],
  'Settled': ['Closed'],
  'Closed': [],
};

export const ClaimsView: React.FC<ClaimsViewProps> = ({
  claims,
  policies,
  onOpenNewClaim,
  onUpdateStatus,
  onToggleChecklist,
  onAddTimelineNote,
  onToggleClaimTask,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeClaim, setActiveClaim] = useState<Claim | null>(claims[0] || null);
  const [newNote, setNewNote] = useState('');

  const filtered = claims.filter((c) => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  // Ageing report summary
  const ageingCounts: Record<ClaimAgeingBucket, number> = {
    '0-7': 0,
    '8-30': 0,
    '31-60': 0,
    '60+': 0,
  };
  claims.forEach((c) => {
    if (c.status !== 'Settled' && c.status !== 'Closed') {
      const bucket = getClaimAgeingBucket(c.daysOpen);
      ageingCounts[bucket] = (ageingCounts[bucket] || 0) + 1;
    }
  });

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Claim Number', key: 'claimNumber' },
        { header: 'Policy Number', key: 'policyNumber' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Product', key: 'product' },
        { header: 'Insurer', key: 'insurerName' },
        { header: 'Date of Loss', key: 'dateOfLoss' },
        { header: 'Days Open', key: 'daysOpen' },
        { header: 'Loss Type', key: 'lossType' },
        { header: 'Estimated Loss (KES)', key: 'estimatedAmountKES', formatter: (c) => c.estimatedAmountKES },
        { header: 'Approved Amount (KES)', key: 'approvedAmountKES', formatter: (c) => c.approvedAmountKES || 0 },
        { header: 'Status', key: 'status' },
        { header: 'Assigned Officer', key: 'assignedOfficer' },
      ],
      'Goldfinch_Claims_Register',
      'Claims'
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaim || !newNote.trim()) return;
    onAddTimelineNote(activeClaim.id, newNote.trim());
    setNewNote('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Proposal Section 5.5: Claims Follow-Up</span>
            <span>·</span>
            <span>Ageing &amp; Checklist Engine</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Claims Support Register &amp; Turnaround Monitor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Enforces transition rules, document checklists (Police abstracts, assessor reports, invoices), follow-up tasks, and ageing tracking to accelerate insurer settlements.
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
            onClick={onOpenNewClaim}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Intimate Claim</span>
          </button>
        </div>
      </div>

      {/* Ageing Report Bar (Mandated in Section 5.5) */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Open Claims Ageing Breakdown
          </span>
          <span className="text-slate-500 font-mono">
            Target SLA: &lt; 30 Days from Intimation
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">0 - 7 Days (Fresh)</span>
            <p className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-100 mt-1">{ageingCounts['0-7']}</p>
          </div>
          <div className="p-3 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40">
            <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300">8 - 30 Days (Active)</span>
            <p className="text-xl font-bold font-mono text-sky-900 dark:text-sky-100 mt-1">{ageingCounts['8-30']}</p>
          </div>
          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">31 - 60 Days (Delayed)</span>
            <p className="text-xl font-bold font-mono text-amber-900 dark:text-amber-100 mt-1">{ageingCounts['31-60']}</p>
          </div>
          <div className="p-3 rounded-lg border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">60+ Days (Critical)</span>
            <p className="text-xl font-bold font-mono text-rose-900 dark:text-rose-100 mt-1">{ageingCounts['60+']}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Claims Register (7 cols) + Claim Dossier (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Area */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Claims Register ({filtered.length})
            </span>
            <span className="text-slate-500 dark:text-slate-400">Click to inspect checklist &amp; timeline</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Claim / Policy</th>
                  <th className="py-2.5 px-4">Client Name</th>
                  <th className="py-2.5 px-4">Loss Type</th>
                  <th className="py-2.5 px-4 text-right">Estimated Loss</th>
                  <th className="py-2.5 px-4 text-center">Days Open</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((c) => {
                  const isSelected = activeClaim?.id === c.id;
                  const isCritical = c.daysOpen >= 30;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setActiveClaim(c)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 font-medium'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-750'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white font-mono">{c.claimNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.policyNumber}</div>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-200">
                        {c.clientName}
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {c.lossType}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {formatKES(c.estimatedAmountKES)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCritical ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                          {c.daysOpen}d
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            c.status === 'Settled'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : c.status === 'Approved'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Dossier & Checklist Area */}
        <div className="lg:col-span-5 space-y-4">
          {activeClaim ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <span>{activeClaim.claimNumber}</span>
                    <span>·</span>
                    <span className="text-amber-700 dark:text-amber-400 font-semibold">{activeClaim.insurerClaimRef || 'Underwriter Ref Pending'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {activeClaim.clientName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeClaim.insurerName} · Loss Date: {formatDate(activeClaim.dateOfLoss)}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Loss</span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                    {formatKES(activeClaim.estimatedAmountKES)}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Allowed Status Transitions (Section 5.5) */}
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                    Enforced Status Transitions (Current: {activeClaim.status})
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {(ALLOWED_TRANSITIONS[activeClaim.status] || []).length === 0 ? (
                      <span className="text-slate-400 italic">No further transitions (Claim closed)</span>
                    ) : (
                      (ALLOWED_TRANSITIONS[activeClaim.status] || []).map((target) => (
                        <button
                          key={target}
                          onClick={() => onUpdateStatus(activeClaim.id, target)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                        >
                          Advance to: {target} &rarr;
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Document Checklist (Section 5.5) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase text-slate-400">
                      Document Checklist ({activeClaim.lossType})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeClaim.checklist.filter((i) => i.received).length} of {activeClaim.checklist.length} received
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {activeClaim.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onToggleChecklist(activeClaim.id, item.id)}
                        className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          item.received
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                            : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              item.received
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-500'
                            }`}
                          >
                            {item.received && <Check className="w-3 h-3" />}
                          </div>
                          <span>{item.name}</span>
                        </div>
                        {item.required && (
                          <span className="text-[10px] text-slate-400 font-mono">Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up Tasks */}
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                    Follow-Up Action Items
                  </span>
                  <div className="space-y-1.5">
                    {activeClaim.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onToggleClaimTask(activeClaim.id, task.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              task.completed
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3" />}
                          </div>
                          <span className={task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Due {formatDate(task.dueDate)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline Notes */}
                <div>
                  <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">
                    Timeline &amp; Communications
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {activeClaim.timeline.map((act) => (
                      <div key={act.id} className="p-2 rounded bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>{act.action}</span>
                          <span>{act.timestamp}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 font-sans mt-0.5">{act.note}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddNote} className="mt-2 flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Add follow-up call note or assessor update..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-amber-600 rounded-lg hover:bg-slate-800"
                    >
                      Log Note
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              Select a claim row to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
