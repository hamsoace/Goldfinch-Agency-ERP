import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { Policy, Claim, MpesaTransaction, CommissionEntry } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { exportMonthlyManagementPack } from '../../lib/exportExcel';

interface ReportPackModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  claims: Claim[];
  transactions: MpesaTransaction[];
  commissions: CommissionEntry[];
  onLogExport: (moduleName: string, rowCount: number) => void;
}

export const ReportPackModal: React.FC<ReportPackModalProps> = ({
  isOpen,
  onClose,
  policies,
  claims,
  transactions,
  commissions,
  onLogExport,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPack = () => {
    // 1. Summary Sheet
    const summaryRows = [
      { Metric: 'Agency Name', Value: 'Goldfinch Insurance Agency' },
      { Metric: 'Audit Period', Value: 'November 2026' },
      { Metric: 'Total Policies in Force', Value: policies.length },
      { Metric: 'Gross Written Premium (KES)', Value: policies.reduce((a, b) => a + b.grossPremiumKES, 0) },
      { Metric: 'Total Premium Collected (KES)', Value: policies.reduce((a, b) => a + b.premiumPaidKES, 0) },
      { Metric: 'Outstanding Premium (KES)', Value: policies.reduce((a, b) => a + Math.max(0, b.totalPayableKES - b.premiumPaidKES), 0) },
      { Metric: 'Total Net Commissions Earned (KES)', Value: policies.reduce((a, b) => a + b.netCommissionDueKES, 0) },
      { Metric: 'Total Open Claims', Value: claims.filter((c) => c.status !== 'Settled' && c.status !== 'Closed').length },
      { Metric: 'Unallocated M-Pesa (KES)', Value: transactions.filter((t) => t.status === 'Unallocated').reduce((a, b) => a + b.amountKES, 0) },
    ];

    // 2. Renewals Sheet
    const renewalsRows = policies
      .filter((p) => p.daysToExpiry <= 60)
      .map((p) => ({
        PolicyNumber: p.policyNumber,
        ClientName: p.clientName,
        Product: p.product,
        Insurer: p.insurerName,
        ExpiryDate: p.expiryDate,
        DaysRemaining: p.daysToExpiry,
        GrossPremiumKES: p.grossPremiumKES,
        TotalPayableKES: p.totalPayableKES,
        Status: p.status,
      }));

    // 3. Premium by Product Sheet
    const prodMap: Record<string, number> = {};
    policies.forEach((p) => {
      prodMap[p.product] = (prodMap[p.product] || 0) + p.grossPremiumKES;
    });
    const productRows = Object.entries(prodMap).map(([product, total]) => ({
      ProductLine: product,
      GrossPremiumKES: total,
    }));

    // 4. Commissions Sheet
    const commissionsRows = commissions.map((c) => ({
      Insurer: c.insurer,
      Period: c.period,
      PolicyNumber: c.policyNumber,
      Client: c.clientName,
      ContractCommissionKES: c.contractCommissionKES,
      RemittedCommissionKES: c.remittedCommissionKES,
      VarianceKES: c.varianceKES,
      WhtDeductedKES: c.whtDeductedKES,
      Status: c.status,
    }));

    // 5. Claims Ageing Sheet
    const claimsAgeingRows = claims.map((c) => ({
      ClaimNumber: c.claimNumber,
      PolicyNumber: c.policyNumber,
      Client: c.clientName,
      LossType: c.lossType,
      DateReported: c.dateReported,
      DaysOpen: c.daysOpen,
      EstimatedAmountKES: c.estimatedAmountKES,
      Status: c.status,
    }));

    // 6. M-Pesa Reconciliation Sheet
    const mpesaReconRows = transactions.map((t) => ({
      ReceiptCode: t.receiptCode,
      PayerName: t.payerName,
      PayerPhone: t.payerPhone,
      AccountRef: t.accountReference,
      AmountKES: t.amountKES,
      Timestamp: t.timestamp,
      Status: t.status,
    }));

    exportMonthlyManagementPack({
      summaryRows,
      renewalsRows,
      productRows,
      commissionsRows,
      claimsAgeingRows,
      mpesaReconRows,
    });

    onLogExport('Monthly Management Pack', summaryRows.length + renewalsRows.length + productRows.length);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Goldfinch Monthly Management Pack
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs space-y-4">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Exports a formatted, audit-ready multi-sheet Excel workbook (<code>.xlsx</code>) containing all operational statements for executive review and board presentation.
          </p>

          <div className="bg-slate-50 dark:bg-slate-700/50 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] block">
              Sheets Included in Workbook:
            </span>
            <ul className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-1.5">&bull; 1. Executive Summary</li>
              <li className="flex items-center gap-1.5">&bull; 2. 60-Day Renewals</li>
              <li className="flex items-center gap-1.5">&bull; 3. Premium by Product</li>
              <li className="flex items-center gap-1.5">&bull; 4. Commissions Ledger</li>
              <li className="flex items-center gap-1.5">&bull; 5. Claims Ageing (0-60+d)</li>
              <li className="flex items-center gap-1.5">&bull; 6. M-Pesa Reconciliation</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadPack}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Workbook Exported!' : 'Download .xlsx Pack'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
