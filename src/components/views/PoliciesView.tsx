import React, { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  Car,
  HeartPulse,
  Flame,
  Briefcase,
  Users,
  Ship,
  FileText,
  Plus,
  RefreshCw,
  Smartphone,
  Printer,
  FileSpreadsheet,
  ChevronRight,
  X,
  Upload,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Policy, ProductLine, Client, Insurer } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface PoliciesViewProps {
  policies: Policy[];
  clients: Client[];
  insurers: Insurer[];
  onOpenNewPolicy: () => void;
  onOpenRenewalWorkflow: (policy: Policy) => void;
  onOpenStkPush: (policy: Policy) => void;
  onOpenManualPayment: (policy: Policy) => void;
  onOpenPrintReceipt: (policy: Policy) => void;
  onOpenSendTemplate: (policy: Policy) => void;
  onOpenNewEndorsement: (policy: Policy) => void;
}

export const PoliciesView: React.FC<PoliciesViewProps> = ({
  policies,
  clients,
  insurers,
  onOpenNewPolicy,
  onOpenRenewalWorkflow,
  onOpenStkPush,
  onOpenManualPayment,
  onOpenPrintReceipt,
  onOpenSendTemplate,
  onOpenNewEndorsement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(policies[0] || null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Filter policies
  const filteredPolicies = policies.filter((p) => {
    if (productFilter !== 'All' && p.product !== productFilter) return false;
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (paymentFilter !== 'All' && p.paymentStatus !== paymentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = p.policyNumber.toLowerCase().includes(q);
      const matchClient = p.clientName.toLowerCase().includes(q);
      const matchSubject = p.subjectMatter.toLowerCase().includes(q);
      const matchInsurer = p.insurerName.toLowerCase().includes(q);
      const matchReg = p.motorDetails?.registration.toLowerCase().includes(q);
      if (!matchNumber && !matchClient && !matchSubject && !matchInsurer && !matchReg) {
        return false;
      }
    }
    return true;
  });

  // KPI calculations
  const totalInForce = policies.filter((p) => p.status === 'Active').length;
  const renewalsDue30Days = policies.filter((p) => p.daysToExpiry <= 30 && p.daysToExpiry >= 0 && p.status !== 'Renewed').length;
  const totalPremiumWritten = policies.reduce((acc, p) => acc + p.totalPayableKES, 0);
  const totalOutstanding = policies.reduce((acc, p) => acc + Math.max(0, p.totalPayableKES - p.premiumPaidKES), 0);

  const getProductIcon = (product: ProductLine) => {
    switch (product) {
      case 'Motor Private':
      case 'Motor Commercial':
      case 'Motor Comprehensive':
        return <Car className="w-4 h-4 text-amber-500" />;
      case 'Medical':
        return <HeartPulse className="w-4 h-4 text-rose-500" />;
      case 'Fire & Perils':
      case 'Domestic Package':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Group Life':
      case 'Personal Accident':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'Marine':
        return <Ship className="w-4 h-4 text-sky-500" />;
      default:
        return <Shield className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string, daysToExpiry: number) => {
    if (status === 'Renewed') {
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">Renewed</span>;
    }
    if (status === 'Cancelled') {
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">Cancelled</span>;
    }
    if (daysToExpiry < 0) {
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">Lapsed ({Math.abs(daysToExpiry)}d ago)</span>;
    }
    if (daysToExpiry <= 14) {
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">Urgent ({daysToExpiry}d left)</span>;
    }
    if (daysToExpiry <= 30) {
      return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300">Due ({daysToExpiry}d left)</span>;
    }
    return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">Active</span>;
  };

  const getPaymentBadge = (status: string, total: number, paid: number) => {
    if (paid >= total) {
      return <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Paid in Full</span>;
    }
    if (paid > 0) {
      return <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Partly Paid</span>;
    }
    return <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Unpaid</span>;
  };

  const handleExportExcel = () => {
    const exportData = filteredPolicies.map((p) => ({
      'Policy Number': p.policyNumber,
      'Client Name': p.clientName,
      'Insurer': p.insurerName,
      'Product': p.product,
      'Subject Matter': p.subjectMatter,
      'Sum Insured (KES)': p.sumInsuredKES,
      'Gross Premium (KES)': p.grossPremiumKES,
      'Training Levy (KES)': p.trainingLevyKES,
      'PHCF Levy (KES)': p.phcfLevyKES,
      'Stamp Duty (KES)': p.stampDutyKES,
      'Total Payable (KES)': p.totalPayableKES,
      'Premium Paid (KES)': p.premiumPaidKES,
      'Balance Due (KES)': Math.max(0, p.totalPayableKES - p.premiumPaidKES),
      'Agency Commission (KES)': p.agencyCommissionKES,
      'WHT 5% (KES)': p.whtKES,
      'Net Commission Due (KES)': p.netCommissionDueKES,
      'Start Date': p.startDate,
      'Expiry Date': p.expiryDate,
      'Days to Expiry': p.daysToExpiry,
      'Policy Status': p.status,
      'Payment Status': p.paymentStatus,
    }));
    exportToExcel(exportData, 'Goldfinch_Policies_Register');
  };

  const handleSimulatedUpload = (docType: string) => {
    setUploadSuccess(`Uploaded valid PDF for ${docType} (Validated: < 5MB).`);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-gold-500 dark:text-gold-400" />
            Policies &amp; Underwriting Register
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end insurance policy lifecycle, motor vehicle details, medical schedules, and renewal management.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Export Register (.xlsx)
          </button>
          <button
            onClick={onOpenNewPolicy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-gold-400 hover:bg-gold-500 rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            New Policy
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Policies In-Force</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalInForce}</p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">Active covers</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Renewals Due (&le;30d)</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{renewalsDue30Days}</p>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">Expiring soon</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Premium Written</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatKES(totalPremiumWritten)}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Gross portfolio</span>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding Premium</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{formatKES(totalOutstanding)}</p>
          <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">Cash-and-carry target</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by policy no, client, vehicle reg (e.g. KDL 382M), or underwriter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="All">All Products</option>
              <option value="Motor Private">Motor Private</option>
              <option value="Motor Commercial">Motor Commercial</option>
              <option value="Motor Comprehensive">Motor Comprehensive</option>
              <option value="Medical">Medical</option>
              <option value="Group Life">Group Life</option>
              <option value="Personal Accident">Personal Accident</option>
              <option value="Fire & Perils">Fire &amp; Perils</option>
              <option value="Domestic Package">Domestic Package</option>
              <option value="Marine">Marine</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="All">All Policy Statuses</option>
              <option value="Active">Active</option>
              <option value="Due">Due (&le;30d)</option>
              <option value="Lapsed">Lapsed</option>
              <option value="Renewed">Renewed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Policies Table (2/3) + Policy Inspection Drawer (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Policies ({filteredPolicies.length})
            </span>
            <span className="text-[11px] text-slate-400">Click a policy to inspect full details</span>
          </div>

          <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-900/60 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="p-3">Policy &amp; Underwriter</th>
                  <th className="p-3">Client</th>
                  <th className="p-3 text-right">Payable (KES)</th>
                  <th className="p-3 text-center">Expiry</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredPolicies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      No policies found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPolicies.map((policy) => {
                    const isSelected = selectedPolicy?.id === policy.id;
                    return (
                      <tr
                        key={policy.id}
                        onClick={() => setSelectedPolicy(policy)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-gold-50/60 dark:bg-gold-950/20 border-l-4 border-l-gold-500'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-700/40'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {getProductIcon(policy.product)}
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white font-mono">
                                {policy.policyNumber}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {policy.insurerName} · {policy.product}
                              </p>
                              {policy.motorDetails && (
                                <p className="text-[11px] text-gold-700 dark:text-gold-400 font-mono font-medium">
                                  {policy.motorDetails.registration} ({policy.motorDetails.make} {policy.motorDetails.model})
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-900 dark:text-white">{policy.clientName}</p>
                          <p className="text-[11px] text-slate-500">{policy.subjectMatter}</p>
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatKES(policy.totalPayableKES)}
                          </p>
                          {getPaymentBadge(policy.paymentStatus, policy.totalPayableKES, policy.premiumPaidKES)}
                        </td>
                        <td className="p-3 text-center">
                          <p className="text-slate-900 dark:text-white font-mono">{formatDate(policy.expiryDate)}</p>
                          <p className="text-[10px] text-slate-500">
                            {policy.daysToExpiry < 0
                              ? `${Math.abs(policy.daysToExpiry)}d overdue`
                              : `${policy.daysToExpiry}d left`}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          {getStatusBadge(policy.status, policy.daysToExpiry)}
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            {policy.status !== 'Renewed' && (
                              <button
                                title="Start Renewal Workflow"
                                onClick={() => onOpenRenewalWorkflow(policy)}
                                className="p-1 text-slate-600 dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              title="Request Daraja M-Pesa Payment"
                              onClick={() => onOpenStkPush(policy)}
                              className="p-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>
                            <button
                              title="Send WhatsApp/SMS Notice"
                              onClick={() => onOpenSendTemplate(policy)}
                              className="p-1 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Policy Detail Inspector (1/3) */}
        <div className="bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 p-5 space-y-5">
          {selectedPolicy ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                      {selectedPolicy.product}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                      {selectedPolicy.policyNumber}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedPolicy.clientName} · {selectedPolicy.insurerName}
                    </p>
                  </div>
                  {getStatusBadge(selectedPolicy.status, selectedPolicy.daysToExpiry)}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => onOpenRenewalWorkflow(selectedPolicy)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gold-400 hover:bg-gold-500 text-slate-900 shadow-xs transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew Policy
                  </button>
                  <button
                    onClick={() => onOpenStkPush(selectedPolicy)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    M-Pesa STK
                  </button>
                  <button
                    onClick={() => onOpenNewEndorsement(selectedPolicy)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                    Endorsement
                  </button>
                  <button
                    onClick={() => onOpenPrintReceipt(selectedPolicy)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    Print Receipt
                  </button>
                </div>
              </div>

              {/* Motor Specific Details if present */}
              {selectedPolicy.motorDetails && (
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/50 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-semibold">
                    <Car className="w-4 h-4" />
                    <span>Motor Vehicle Schedule Details</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Registration:</span>
                      <span className="font-mono font-bold">{selectedPolicy.motorDetails.registration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Make &amp; Model:</span>
                      <span>{selectedPolicy.motorDetails.make} {selectedPolicy.motorDetails.model} ({selectedPolicy.motorDetails.yearOfManufacture})</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px]">Chassis / Logbook:</span>
                      <span className="font-mono text-[11px]">{selectedPolicy.motorDetails.chassisOrLogbook}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Specific Details if present */}
              {selectedPolicy.medicalDetails && (
                <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900/50 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-900 dark:text-rose-200 font-semibold">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medical Cover Limits</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Members Covered:</span>
                      <span className="font-bold">{selectedPolicy.medicalDetails.membersCount} Persons</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Inpatient Limit:</span>
                      <span className="font-bold">{formatKES(selectedPolicy.medicalDetails.inpatientLimitKES)}</span>
                    </div>
                    {selectedPolicy.medicalDetails.outpatientLimitKES && (
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px]">Outpatient Limit:</span>
                        <span>{formatKES(selectedPolicy.medicalDetails.outpatientLimitKES)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statutory Breakdown */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200 block">
                  Kenya Premium &amp; Statutory Levies Breakdown
                </span>
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Premium:</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatKES(selectedPolicy.grossPremiumKES)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Training Levy (0.2%):</span>
                    <span>{formatKES(selectedPolicy.trainingLevyKES)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>PHCF Levy (0.25%):</span>
                    <span>{formatKES(selectedPolicy.phcfLevyKES)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Stamp Duty:</span>
                    <span>{formatKES(selectedPolicy.stampDutyKES)}</span>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Client Payable:</span>
                    <span className="text-gold-600 dark:text-gold-400">{formatKES(selectedPolicy.totalPayableKES)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800 text-teal-700 dark:text-teal-300">
                    <span>Agency Comm ({selectedPolicy.commissionRatePct}%):</span>
                    <span>{formatKES(selectedPolicy.agencyCommissionKES)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Withholding Tax (5% WHT):</span>
                    <span>-{formatKES(selectedPolicy.whtKES)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-teal-900 dark:text-teal-200">
                    <span>Net Commission Due:</span>
                    <span>{formatKES(selectedPolicy.netCommissionDueKES)}</span>
                  </div>
                </div>
              </div>

              {/* Upload & Documents Section */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Policy Documents</span>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG &le; 5MB</span>
                </div>

                {uploadSuccess && (
                  <div className="p-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 rounded flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  {selectedPolicy.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.fileName} · {doc.fileSizeKB} KB</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono shrink-0">Verified</span>
                    </div>
                  ))}

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => handleSimulatedUpload('Digital Motor Certificate')}
                      className="w-full py-1.5 text-center text-[11px] font-medium border border-dashed border-slate-300 dark:border-slate-700 hover:border-gold-500 rounded text-slate-600 dark:text-slate-300 transition flex items-center justify-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      Attach Schedule / Certificate
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-400">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Select a policy from the table to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
