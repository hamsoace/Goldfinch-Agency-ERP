import React from 'react';
import {
  Shield,
  Clock,
  AlertTriangle,
  CircleDollarSign,
  TrendingUp,
  FileCheck2,
  Smartphone,
  ArrowRight,
  Send,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Policy, Claim, MpesaTransaction, Endorsement } from '../../types/insurance';
import { Role } from '../../lib/permissions';
import { formatKES, formatCompactKES } from '../../lib/money';
import { formatDate, getRenewalBucket, RenewalBucket } from '../../lib/dates';

interface DashboardViewProps {
  currentRole: Role;
  policies: Policy[];
  claims: Claim[];
  mpesaTransactions: MpesaTransaction[];
  endorsements: Endorsement[];
  onNavigate: (module: string) => void;
  onOpenSendReminder: (policy: Policy) => void;
  onOpenRenewModal: (policy: Policy) => void;
  onOpenStkPush: () => void;
  onOpenReportPack: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentRole,
  policies,
  claims,
  mpesaTransactions,
  endorsements,
  onNavigate,
  onOpenSendReminder,
  onOpenRenewModal,
  onOpenStkPush,
  onOpenReportPack,
}) => {
  // Aggregate Metrics
  const activePolicies = policies.filter((p) => p.status === 'Active');
  const due30Days = policies.filter((p) => p.daysToExpiry >= 0 && p.daysToExpiry <= 30 && p.status !== 'Renewed');
  const lapsedPolicies = policies.filter((p) => p.daysToExpiry < 0 || p.status === 'Lapsed');
  
  const totalPremiumWritten = policies.reduce((acc, p) => acc + p.grossPremiumKES, 0);
  const totalPremiumPaid = policies.reduce((acc, p) => acc + p.premiumPaidKES, 0);
  const outstandingPremium = policies.reduce((acc, p) => acc + Math.max(0, p.totalPayableKES - p.premiumPaidKES), 0);
  const totalCommissionEarned = policies.reduce((acc, p) => acc + p.netCommissionDueKES, 0);

  const openClaims = claims.filter((c) => c.status !== 'Settled' && c.status !== 'Closed');
  const inactiveClaims7Days = openClaims.filter((c) => {
    const diff = Math.ceil((new Date('2026-11-02').getTime() - new Date(c.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 7;
  });

  const unreconciledMpesa = mpesaTransactions.filter((m) => m.status === 'Unallocated');
  const unreconciledMpesaKES = unreconciledMpesa.reduce((acc, m) => acc + m.amountKES, 0);

  // Renewal Pipeline Buckets
  const bucketCounts: Record<RenewalBucket, number> = {
    'overdue': 0,
    '0-7': 0,
    '8-14': 0,
    '15-30': 0,
    '31-60': 0,
    '60+': 0,
  };
  policies.forEach((p) => {
    if (p.status !== 'Renewed' && p.status !== 'Cancelled') {
      const bucket = getRenewalBucket(p.daysToExpiry);
      bucketCounts[bucket] = (bucketCounts[bucket] || 0) + 1;
    }
  });

  // Product Line Breakdown
  const productTotals: Record<string, number> = {};
  policies.forEach((p) => {
    productTotals[p.product] = (productTotals[p.product] || 0) + p.grossPremiumKES;
  });
  const sortedProducts = Object.entries(productTotals).sort((a, b) => b[1] - a[1]);

  // Urgent follow-up list (expiring in <= 14 days or lapsed)
  const urgentFollowUps = policies
    .filter((p) => p.daysToExpiry <= 14 && p.status !== 'Renewed' && p.status !== 'Cancelled')
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Goldfinch Executive Welcome Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-xl p-6 text-white border border-slate-700/60 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <span>Goldfinch Insurance Agency</span>
            <span>·</span>
            <span>InsureERP Executive Operations</span>
            <span>·</span>
            <span>Nairobi, Kenya</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Enterprise Agency Dashboard
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Replacing spreadsheets and manual threads with connected Kenya insurance management. Live tracking of renewals, KES cashflows, Daraja M-Pesa receipts, and claims turnaround.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigate('mpesa')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>M-Pesa Inbox ({unreconciledMpesa.length})</span>
          </button>
          <button
            onClick={onOpenReportPack}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Management Pack</span>
          </button>
        </div>
      </div>

      {/* Role-Aware KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Policies in Force */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Policies in Force</span>
            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
            {activePolicies.length} Active
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
            <span>Total Portfolio Size</span>
            <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{policies.length} Policies</span>
          </div>
        </div>

        {/* Renewals Due in 30 Days */}
        <div className="bg-white dark:bg-slate-800/90 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Due in &le; 30 Days</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 font-mono tabular-nums">
            {due30Days.length} Due
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
            <span>Lapsed / Overdue</span>
            <span className="font-mono text-rose-600 dark:text-rose-400 font-medium">{lapsedPolicies.length} Lapsed</span>
          </div>
        </div>

        {/* Premium Written & Outstanding (Finance/Admin/Auditor view) */}
        {currentRole !== 'claims_officer' && (
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Gross Premium Written</span>
              <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCompactKES(totalPremiumWritten)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
              <span>Outstanding Balances</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">{formatCompactKES(outstandingPremium)}</span>
            </div>
          </div>
        )}

        {/* Net Commission Earned (Finance/Admin) OR Open Claims (Claims role) */}
        {currentRole === 'claims_officer' ? (
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Open Claims Pipeline</span>
              <FileCheck2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {openClaims.length} Open
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
              <span>No Activity &gt; 7 Days</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{inactiveClaims7Days.length} Alerts</span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800/90 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Net Agency Commission</span>
              <span className="text-[10px] text-emerald-600 font-mono">Net 5% WHT</span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCompactKES(totalCommissionEarned)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700">
              <span>Unallocated M-Pesa</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formatKES(unreconciledMpesaKES)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Claims Inactivity Warning Banner (Section 5.5) */}
      {inactiveClaims7Days.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-200">
                Action Required: {inactiveClaims7Days.length} claim(s) have had no activity for over 7 days
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-300">
                Underwriter assessment or police abstract collection is stalled. Follow up to maintain service SLA.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('claims')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-900/80 hover:bg-rose-200 rounded-lg transition-colors whitespace-nowrap"
          >
            Review Stalled Claims &rarr;
          </button>
        </div>
      )}

      {/* 2-Column Visual Charts: Renewal Pipeline Buckets + Product Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: Renewal Pipeline Buckets */}
        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Renewal Pipeline Buckets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Policies by days until expiry</p>
            </div>
            <button
              onClick={() => onNavigate('policies')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              View All Policies &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'overdue', label: 'Overdue (<0d)', count: bucketCounts['overdue'], color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900' },
              { key: '0-7', label: '0 - 7 Days', count: bucketCounts['0-7'], color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900' },
              { key: '8-14', label: '8 - 14 Days', count: bucketCounts['8-14'], color: 'text-amber-600 bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60' },
              { key: '15-30', label: '15 - 30 Days', count: bucketCounts['15-30'], color: 'text-sky-700 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-900' },
              { key: '31-60', label: '31 - 60 Days', count: bucketCounts['31-60'], color: 'text-teal-700 bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900' },
              { key: '60+', label: '60+ Days', count: bucketCounts['60+'], color: 'text-slate-700 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700' },
            ].map((bucket) => (
              <div
                key={bucket.key}
                className={`p-3.5 rounded-lg border flex flex-col justify-between ${bucket.color}`}
              >
                <span className="text-[11px] font-semibold">{bucket.label}</span>
                <span className="text-xl font-bold font-mono tabular-nums mt-2">{bucket.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Chart: Premium by Product Line */}
        <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Gross Premium by Product Line
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution across active portfolios</p>
            </div>
            <button
              onClick={() => onNavigate('finance')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Finance Ledger &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {sortedProducts.slice(0, 5).map(([prod, total]) => {
              const pct = Math.min(100, Math.round((total / (totalPremiumWritten || 1)) * 100));
              return (
                <div key={prod} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{prod}</span>
                    <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300 font-semibold">
                      {formatKES(total)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Follow-Up List: Policies Expiring within 14 Days or Lapsed (Section 5.1) */}
      <div className="bg-white dark:bg-slate-800/90 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Urgent Renewal Follow-Up List (&le; 14 Days or Lapsed)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              One-click WhatsApp/SMS reminders and direct renewal workflow
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {urgentFollowUps.length} Policies Requiring Action
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {urgentFollowUps.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No policies expiring within 14 days. Good retention coverage!
            </div>
          ) : (
            urgentFollowUps.map((p) => {
              const isOverdue = p.daysToExpiry < 0;

              return (
                <div
                  key={p.id}
                  className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.clientName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        · {p.policyNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isOverdue ? `${Math.abs(p.daysToExpiry)} Days Overdue` : `Expires in ${p.daysToExpiry} Days`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span>{p.product}</span>
                      <span>·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{p.insurerName}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{formatKES(p.totalPayableKES)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenSendReminder(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors"
                      title="Send WhatsApp or SMS reminder using configured template"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reminder</span>
                    </button>

                    <button
                      onClick={() => onOpenRenewModal(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
                      title="Start renewal draft workflow"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
