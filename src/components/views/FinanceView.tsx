import React, { useState } from 'react';
import {
  CircleDollarSign,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  Filter,
  FileText,
  Clock,
  Landmark,
} from 'lucide-react';
import { Policy, DebitCreditNote, CommissionEntry } from '../../types/insurance';
import { formatKES, formatCompactKES } from '../../lib/money';
import { formatDate, getPremiumAgeingBucket, PremiumAgeingBucket } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface FinanceViewProps {
  policies: Policy[];
  debitCreditNotes: DebitCreditNote[];
  commissions: CommissionEntry[];
  onResolveVariance: (recId: string) => void;
  onOpenReportPack: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  policies,
  debitCreditNotes,
  commissions,
  onResolveVariance,
  onOpenReportPack,
}) => {
  const [activeTab, setActiveTab] = useState<'debitcredit' | 'commissions' | 'ageing'>('commissions');
  const [statementFilter, setStatementFilter] = useState<string>('All');

  const totalGrossPremium = policies.reduce((acc, p) => acc + p.grossPremiumKES, 0);
  const totalReceived = policies.reduce((acc, p) => acc + p.premiumPaidKES, 0);
  const totalOutstanding = policies.reduce((acc, p) => acc + Math.max(0, p.totalPayableKES - p.premiumPaidKES), 0);
  const totalCommissionsEarned = policies.reduce((acc, p) => acc + p.netCommissionDueKES, 0);

  // Outstanding Premium Ageing Buckets (0-30, 31-60, 61-90, 90+)
  const ageingBuckets: Record<PremiumAgeingBucket, { count: number; totalKES: number }> = {
    '0-30': { count: 0, totalKES: 0 },
    '31-60': { count: 0, totalKES: 0 },
    '61-90': { count: 0, totalKES: 0 },
    '90+': { count: 0, totalKES: 0 },
  };

  policies.forEach((p) => {
    const balance = Math.max(0, p.totalPayableKES - p.premiumPaidKES);
    if (balance > 0) {
      // Days since policy start
      const daysSinceStart = Math.max(0, Math.ceil((new Date('2026-11-02').getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24)));
      const bucket = getPremiumAgeingBucket(daysSinceStart);
      ageingBuckets[bucket].count += 1;
      ageingBuckets[bucket].totalKES += balance;
    }
  });

  const filteredCommissions = commissions.filter((c) => {
    if (statementFilter === 'All') return true;
    return c.status === statementFilter;
  });

  const handleExportCommissions = () => {
    exportToExcel(
      filteredCommissions,
      [
        { header: 'Insurer', key: 'insurer' },
        { header: 'Period', key: 'period' },
        { header: 'Policy Number', key: 'policyNumber' },
        { header: 'Client Name', key: 'clientName' },
        { header: 'Gross Premium (KES)', key: 'grossPremiumKES', formatter: (c) => c.grossPremiumKES },
        { header: 'Contract Commission (KES)', key: 'contractCommissionKES', formatter: (c) => c.contractCommissionKES },
        { header: 'Remitted Commission (KES)', key: 'remittedCommissionKES', formatter: (c) => c.remittedCommissionKES },
        { header: 'Variance (KES)', key: 'varianceKES', formatter: (c) => c.varianceKES },
        { header: '5% WHT Deducted', key: 'whtDeductedKES', formatter: (c) => c.whtDeductedKES },
        { header: 'Status', key: 'status' },
      ],
      'Goldfinch_Commission_Reconciliations',
      'Commissions'
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Proposal Section 5.8: Finance &amp; Commissions</span>
            <span>·</span>
            <span>Debit/Credit Notes &amp; Ageing</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Financial Ledger &amp; Insurer Reconciliation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Reconcile contract commissions against monthly underwriter remittances, track 5% KRA Withholding Tax certificates, and manage premium receivables ageing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCommissions}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenReportPack}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Generate Management Pack</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Premium Incepted</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatKES(totalGrossPremium)}
          </p>
          <span className="text-[11px] text-slate-500">{policies.length} Total Policies</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Client Premium Collected</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatKES(totalReceived)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Remitted to underwriters</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Outstanding Premium Receivables</span>
          <p className={`text-xl font-bold font-mono tabular-nums ${totalOutstanding > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {formatKES(totalOutstanding)}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">Requires collection follow-up</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Net Agency Commission</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatKES(totalCommissionsEarned)}
          </p>
          <span className="text-[11px] text-slate-500">Net of 5% KRA Withholding Tax</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('commissions')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'commissions'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Insurer Statement Reconciliations ({commissions.length})
          </button>
          <button
            onClick={() => setActiveTab('debitcredit')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'debitcredit'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Debit Notes &amp; Credit Notes ({debitCreditNotes.length})
          </button>
          <button
            onClick={() => setActiveTab('ageing')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ageing'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Premium Ageing Analysis (0-30, 31-60, 61-90, 90+)
          </button>
        </div>

        {activeTab === 'commissions' && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-slate-500">Status:</span>
            {['All', 'Matched', 'Under Query'].map((s) => (
              <button
                key={s}
                onClick={() => setStatementFilter(s)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  statementFilter === s
                    ? 'bg-slate-900 text-white dark:bg-amber-600'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Underwriter Statement Reconciliations */}
      {activeTab === 'commissions' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Underwriter Statements Matching &amp; Variance Analysis
            </span>
            <span className="text-slate-500 font-mono">
              5% WHT certificates tracked for KRA iTax
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Insurer &amp; Period</th>
                  <th className="py-2.5 px-4">Policy / Client</th>
                  <th className="py-2.5 px-4 text-right">Gross (KES)</th>
                  <th className="py-2.5 px-4 text-right">Agreed Comm</th>
                  <th className="py-2.5 px-4 text-right">Remitted</th>
                  <th className="py-2.5 px-4 text-right">Variance (KES)</th>
                  <th className="py-2.5 px-4 text-center">WHT Cert</th>
                  <th className="py-2.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCommissions.map((rec) => {
                  const isQuery = rec.status === 'Under Query';

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-amber-800 dark:text-amber-400">{rec.insurer}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rec.period}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{rec.clientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{rec.policyNumber}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                        {formatKES(rec.grossPremiumKES)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {formatKES(rec.contractCommissionKES)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                        {formatKES(rec.remittedCommissionKES)}
                      </td>

                      <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold ${rec.varianceKES > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {rec.varianceKES > 0 ? `+${formatKES(rec.varianceKES)}` : 'KES 0'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            rec.whtCertificateReceived
                              ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {rec.whtCertificateReceived ? 'Cert Received' : 'Awaiting'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isQuery ? (
                          <button
                            onClick={() => onResolveVariance(rec.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded shadow-xs"
                          >
                            Resolve Variance
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Debit Notes & Credit Notes */}
      {activeTab === 'debitcredit' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Note Number</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Client / Policy</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Date Issued</th>
                  <th className="py-2.5 px-4 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-4 text-center">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {debitCreditNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {note.noteNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          note.type === 'Debit Note'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {note.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">{note.clientName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{note.policyNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{note.reason}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{formatDate(note.dateIssued)}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatKES(note.amountKES)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {note.isPaid ? 'Settled' : 'Unpaid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Outstanding Premium Ageing Analysis (Mandated in Section 5.8) */}
      {activeTab === 'ageing' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Outstanding Premium Receivables Ageing Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of uncollected client balances categorized by days past inception
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">0 - 30 Days (Current)</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatKES(ageingBuckets['0-30'].totalKES)}
              </p>
              <span className="text-[11px] text-slate-400">{ageingBuckets['0-30'].count} policies</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">31 - 60 Days (Warning)</span>
              <p className="text-xl font-bold font-mono text-amber-600 mt-1">
                {formatKES(ageingBuckets['31-60'].totalKES)}
              </p>
              <span className="text-[11px] text-slate-400">{ageingBuckets['31-60'].count} policies</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">61 - 90 Days (Overdue)</span>
              <p className="text-xl font-bold font-mono text-amber-700 mt-1">
                {formatKES(ageingBuckets['61-90'].totalKES)}
              </p>
              <span className="text-[11px] text-slate-400">{ageingBuckets['61-90'].count} policies</span>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">90+ Days (Critical)</span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1">
                {formatKES(ageingBuckets['90+'].totalKES)}
              </p>
              <span className="text-[11px] text-slate-400">{ageingBuckets['90+'].count} policies</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
