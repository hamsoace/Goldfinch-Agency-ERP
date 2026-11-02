import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  FileSpreadsheet,
  Printer,
  RefreshCw,
  Landmark,
  Check,
  Split,
  Search,
  Filter,
} from 'lucide-react';
import { MpesaTransaction, Policy, ManualPayment } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDateTime } from '../../lib/dates';
import { formatKenyanPhone } from '../../lib/phone';
import { exportToExcel } from '../../lib/exportExcel';
import { Role } from '../../lib/permissions';

interface MpesaPaymentsViewProps {
  currentRole: Role;
  transactions: MpesaTransaction[];
  policies: Policy[];
  onOpenStkPush: () => void;
  onOpenManualPayment: () => void;
  onAllocateTransaction: (
    transId: string,
    allocations: { policyNumber: string; amountKES: number }[]
  ) => void;
  onMarkReconciled: () => void;
  onPrintReceipt: (trans: MpesaTransaction) => void;
}

export const MpesaPaymentsView: React.FC<MpesaPaymentsViewProps> = ({
  currentRole,
  transactions,
  policies,
  onOpenStkPush,
  onOpenManualPayment,
  onAllocateTransaction,
  onMarkReconciled,
  onPrintReceipt,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'reconciliation'>('inbox');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [allocatingTrans, setAllocatingTrans] = useState<MpesaTransaction | null>(null);
  const [selectedPolicyNo, setSelectedPolicyNo] = useState<string>(policies[0]?.policyNumber || '');
  const [reconciledSuccess, setReconciledSuccess] = useState(false);

  const filtered = transactions.filter((t) => {
    if (statusFilter === 'All') return true;
    return t.status === statusFilter;
  });

  // Reconciliations totals
  const totalReceiptsKES = transactions.reduce((acc, t) => acc + t.amountKES, 0);
  const totalAllocatedKES = transactions
    .filter((t) => t.status === 'Allocated')
    .reduce((acc, t) => acc + t.amountKES, 0);
  const totalUnallocatedKES = transactions
    .filter((t) => t.status === 'Unallocated')
    .reduce((acc, t) => acc + t.amountKES, 0);

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'M-Pesa Receipt', key: 'receiptCode' },
        { header: 'Amount (KES)', key: 'amountKES', formatter: (t) => t.amountKES },
        { header: 'Payer Name', key: 'payerName' },
        { header: 'Payer Phone', key: 'payerPhone' },
        { header: 'Account Ref', key: 'accountReference' },
        { header: 'Timestamp (EAT)', key: 'timestamp' },
        { header: 'Status', key: 'status' },
      ],
      'Goldfinch_Mpesa_C2B_Transactions',
      'M-Pesa Collections'
    );
  };

  const handleConfirmAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingTrans || !selectedPolicyNo) return;
    onAllocateTransaction(allocatingTrans.id, [
      { policyNumber: selectedPolicyNo, amountKES: allocatingTrans.amountKES },
    ]);
    setAllocatingTrans(null);
  };

  const handleRunReconcile = () => {
    onMarkReconciled();
    setReconciledSuccess(true);
    setTimeout(() => setReconciledSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <span>Proposal Section 5.6: Safaricom Daraja API</span>
            <span>·</span>
            <span>Paybill 522123</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            M-Pesa Payment Collections &amp; Auto-Reconciliation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Real-time Lipa Na M-Pesa Online (STK Push) and C2B Paybill feed. Auto-matches policy account references and provides multi-policy split allocation with duplicate callback protection.
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
            onClick={onOpenManualPayment}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Record Bank / Cheque</span>
          </button>
          <button
            onClick={onOpenStkPush}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Initiate STK Push</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total M-Pesa Collections</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatKES(totalReceiptsKES)}
          </p>
          <span className="text-[11px] text-slate-500 font-mono">{transactions.length} Transactions</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Allocated to Policies</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatKES(totalAllocatedKES)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium">Reconciled to client ledgers</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 dark:text-slate-400">Unallocated Inbox Variance</span>
          <p className={`text-xl font-bold font-mono tabular-nums ${totalUnallocatedKES > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
            {formatKES(totalUnallocatedKES)}
          </p>
          <span className="text-[11px] text-amber-700 font-medium">
            {transactions.filter((t) => t.status === 'Unallocated').length} unallocated payments
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Payments Inbox (C2B Confirmation Log)
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'reconciliation'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Daily Reconciliation View
          </button>
        </div>

        {activeTab === 'inbox' && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-slate-500">Status:</span>
            {['All', 'Unallocated', 'Allocated'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white dark:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Payments Inbox */}
      {activeTab === 'inbox' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              M-Pesa Receipts Feed ({filtered.length})
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Shortcode: 522123 (Goldfinch Paybill)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Receipt Code</th>
                  <th className="py-2.5 px-4">Payer Name &amp; Phone</th>
                  <th className="py-2.5 px-4">Bill Account Ref</th>
                  <th className="py-2.5 px-4">Timestamp (EAT)</th>
                  <th className="py-2.5 px-4 text-right">Amount (KES)</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((t) => {
                  const isUnallocated = t.status === 'Unallocated';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {t.receiptCode}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{t.payerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{formatKenyanPhone(t.payerPhone)}</div>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {t.accountReference}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {formatDateTime(t.timestamp)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatKES(t.amountKES)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            isUnallocated
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isUnallocated ? (
                            <button
                              onClick={() => setAllocatingTrans(t)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors shadow-xs"
                            >
                              Allocate
                            </button>
                          ) : (
                            <button
                              onClick={() => onPrintReceipt(t)}
                              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded transition-colors"
                              title="Print Goldfinch Official Payment Receipt"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Reconciliation View */}
      {activeTab === 'reconciliation' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily M-Pesa C2B Statement vs Policy Allocations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Audit period: 02 November 2026 · Safaricom Paybill: 522123
              </p>
            </div>

            {currentRole === 'accountant' || currentRole === 'admin' ? (
              <button
                onClick={handleRunReconcile}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{reconciledSuccess ? 'Reconciled & Logged!' : 'Mark Day as Reconciled'}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">
                Only Accountant role can mark as reconciled
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs text-slate-500">M-Pesa Statement Gross</span>
              <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {formatKES(totalReceiptsKES)}
              </p>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs text-slate-500">Allocated to Client Policies</span>
              <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatKES(totalAllocatedKES)}
              </p>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-750">
              <span className="text-xs text-slate-500">Unallocated Variance</span>
              <p className="text-xl font-bold font-mono text-amber-600 mt-1">
                {formatKES(totalUnallocatedKES)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Allocation Drawer Modal */}
      {allocatingTrans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Allocate M-Pesa Payment ({allocatingTrans.receiptCode})
              </h3>
              <button
                onClick={() => setAllocatingTrans(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-xs space-y-1">
              <div>Amount: <strong className="font-mono text-slate-900 dark:text-white">{formatKES(allocatingTrans.amountKES)}</strong></div>
              <div>Payer: <strong>{allocatingTrans.payerName}</strong> ({allocatingTrans.payerPhone})</div>
              <div>Account Input: <code>{allocatingTrans.accountReference}</code></div>
            </div>

            <form onSubmit={handleConfirmAllocation} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Target Policy
                </label>
                <select
                  value={selectedPolicyNo}
                  onChange={(e) => setSelectedPolicyNo(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.policyNumber}>
                      {p.clientName} · {p.policyNumber} ({formatKES(p.totalPayableKES)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAllocatingTrans(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
