import React, { useState } from 'react';
import { X, Check, Landmark, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { Policy, PaymentReceipt } from '../../types/insurance';
import { formatKES } from '../../lib/money';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  onRecordPayment: (receipt: PaymentReceipt, updatedPolicy: Policy) => void;
}

export const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
  isOpen,
  onClose,
  policy,
  onRecordPayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'M-Pesa Paybill' | 'Bank Transfer (EFT/RTGS)' | 'Cheque' | 'Cash'>('M-Pesa Paybill');
  const [paymentReference, setPaymentReference] = useState('');
  const [amountKES, setAmountKES] = useState<number>(0);
  const [receivedBy, setReceivedBy] = useState('Amina Finance');
  const [notes, setNotes] = useState('Standard premium settlement.');

  if (!isOpen || !policy) return null;

  // Initialize amount when modal is shown
  if (amountKES === 0) {
    const outstanding = Math.max(0, policy.totalPayableKES - policy.premiumPaidKES);
    setAmountKES(outstanding > 0 ? outstanding : policy.totalPayableKES);
  }
  if (!paymentReference) {
    setPaymentReference(`MP-${Math.floor(100000 + Math.random() * 900000)}`);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newReceipt: PaymentReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber: `RCP-2026-${Math.floor(2000 + Math.random() * 8000)}`,
      clientId: policy.clientId,
      clientName: policy.clientName,
      policyNumber: policy.policyNumber,
      amountKES,
      paymentMethod,
      paymentReference: paymentReference.toUpperCase().trim(),
      paymentDate: new Date().toISOString().split('T')[0],
      matchedStatus: 'Reconciled',
      receivedBy,
      allocatedToPremium: amountKES,
    };

    const newPaidTotal = policy.premiumPaidKES + amountKES;
    const isFullyPaid = newPaidTotal >= policy.totalPayableKES;

    const updatedPolicy: Policy = {
      ...policy,
      premiumPaidKES: newPaidTotal,
      paymentStatus: isFullyPaid ? 'Paid' : 'Partly paid',
    };

    onRecordPayment(newReceipt, updatedPolicy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Record Manual Premium Payment
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Allocate offline bank wire, cheque, cash, or C2B M-Pesa receipt
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
          {/* Policy context */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Policy:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{policy.policyNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Client:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{policy.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Due / Outstanding:</span>
              <span className="font-mono text-gold-600 dark:text-gold-400 font-bold">
                {formatKES(policy.totalPayableKES)} (Paid: {formatKES(policy.premiumPaidKES)})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="M-Pesa Paybill">M-Pesa Paybill / Till (Manual Entry)</option>
              <option value="Bank Transfer (EFT/RTGS)">Bank Transfer (KCB / Stanbic RTGS)</option>
              <option value="Cheque">Banker's Cheque</option>
              <option value="Cash">Cash Receipt (Office Till)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Transaction Reference / Cheque No
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SKL839210B or CHQ-4091"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              className="w-full text-xs font-mono uppercase bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount to Allocate (KES)
            </label>
            <input
              type="number"
              required
              min="100"
              step="50"
              value={amountKES}
              onChange={(e) => setAmountKES(Number(e.target.value) || 0)}
              className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Officer Recording Payment
            </label>
            <input
              type="text"
              value={receivedBy}
              onChange={(e) => setReceivedBy(e.target.value)}
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
              Allocate Payment &amp; Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
