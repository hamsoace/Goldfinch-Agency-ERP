import React, { useState } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Policy, MpesaTransaction } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { normalizeKenyanPhone, formatKenyanPhone } from '../../lib/phone';

interface StkPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  onCompletePayment: (trans: MpesaTransaction) => void;
}

export const StkPushModal: React.FC<StkPushModalProps> = ({
  isOpen,
  onClose,
  policies,
  onCompletePayment,
}) => {
  const [selectedPolicyNo, setSelectedPolicyNo] = useState(policies[0]?.policyNumber || '');
  const [phone, setPhone] = useState('0721445901');
  const [amount, setAmount] = useState<number>(policies[0]?.totalPayableKES || 87432);
  const [status, setStatus] = useState<'idle' | 'push_sent' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedReceipt, setGeneratedReceipt] = useState('');

  if (!isOpen) return null;

  const currentPolicy = policies.find((p) => p.policyNumber === selectedPolicyNo) || policies[0];

  const handlePolicyChange = (policyNo: string) => {
    setSelectedPolicyNo(policyNo);
    const p = policies.find((item) => item.policyNumber === policyNo);
    if (p) {
      setAmount(p.totalPayableKES);
    }
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('push_sent');
  };

  const handleSimulatePinApproved = () => {
    const randomReceipt = 'SJD' + Math.floor(100000 + Math.random() * 900000);
    setGeneratedReceipt(randomReceipt);
    setStatus('success');

    const newTrans: MpesaTransaction = {
      id: `mp-${Date.now()}`,
      receiptCode: randomReceipt,
      amountKES: amount,
      payerPhone: normalizeKenyanPhone(phone),
      payerName: currentPolicy?.clientName.toUpperCase() || 'M-PESA SUBSCRIBER',
      accountReference: currentPolicy?.policyNumber || 'PREMIUM-COLLECT',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Allocated',
      allocatedPolicies: [
        {
          policyNumber: currentPolicy?.policyNumber || '',
          amountKES: amount,
        },
      ],
      rawCallbackId: `ws_CO_${Date.now()}`,
    };

    onCompletePayment(newTrans);
  };

  const handleSimulateFailure = (reason: string) => {
    setStatus('failed');
    setErrorMessage(reason);
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setGeneratedReceipt('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Safaricom Daraja STK Push (Lipa Na M-Pesa)
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
          {status === 'idle' && (
            <form onSubmit={handleSendPush} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Policy
                </label>
                <select
                  value={selectedPolicyNo}
                  onChange={(e) => handlePolicyChange(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.policyNumber}>
                      {p.clientName} · {p.policyNumber} ({formatKES(p.totalPayableKES)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Subscriber Phone (07.., 01.., 254..)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Normalized: {formatKenyanPhone(phone)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Amount to Collect (KES)
                </label>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Send STK Push
                </button>
              </div>
            </form>
          )}

          {status === 'push_sent' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  STK Push Dispatched to Handset
                </h4>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Prompting {formatKenyanPhone(phone)} for {formatKES(amount)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Account: {currentPolicy?.policyNumber} · Paybill: 522123
                </p>
              </div>

              {/* Simulation triggers for testing acceptance criteria in Section 5.6 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Simulate Handset Response (Daraja Mock):
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSimulatePinApproved}
                    className="p-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    User Enters PIN (Success)
                  </button>
                  <button
                    onClick={() => handleSimulateFailure('User cancelled PIN prompt on phone')}
                    className="p-2 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-xs"
                  >
                    Cancel by User
                  </button>
                  <button
                    onClick={() => handleSimulateFailure('Insufficient funds in M-Pesa wallet')}
                    className="p-2 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs"
                  >
                    Insufficient Funds
                  </button>
                  <button
                    onClick={() => handleSimulateFailure('Handset connection timeout')}
                    className="p-2 rounded bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold text-xs"
                  >
                    Timeout / Failed
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Received &amp; Allocated!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Receipt Code: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{generatedReceipt}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                {formatKES(amount)} credited to policy {currentPolicy?.policyNumber}
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-700 rounded-lg"
                >
                  Close &amp; View Ledger
                </button>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                STK Push Failed
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-300 font-mono">
                {errorMessage}
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Retry Push
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
