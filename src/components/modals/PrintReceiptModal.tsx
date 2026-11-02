import React, { useRef } from 'react';
import { X, Printer, CheckCircle2, Shield, Download } from 'lucide-react';
import { Policy, PaymentReceipt } from '../../types/insurance';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  receipt?: PaymentReceipt | null;
}

// Convert number to Kenya Shillings words helper
function numberToWords(amount: number): string {
  if (amount <= 0) return 'Zero Shillings Only';
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertGroup(n: number): string {
    let out = '';
    if (n >= 100) {
      out += units[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      out += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      out += units[n] + ' ';
    }
    return out.trim();
  }

  const rounded = Math.floor(amount);
  const thousands = Math.floor(rounded / 1000);
  const millions = Math.floor(thousands / 1000);
  const remThousands = thousands % 1000;
  const remUnits = rounded % 1000;

  let words = '';
  if (millions > 0) words += convertGroup(millions) + ' Million ';
  if (remThousands > 0) words += convertGroup(remThousands) + ' Thousand ';
  if (remUnits > 0) words += convertGroup(remUnits);

  return (words.trim() + ' Kenya Shillings Only').replace(/\s+/g, ' ');
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  policy,
  receipt,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !policy) return null;

  const receiptNumber = receipt?.receiptNumber || `RCP-2026-${Math.floor(2000 + Math.random() * 7000)}`;
  const amountPaid = receipt?.amountKES || policy.premiumPaidKES || policy.totalPayableKES;
  const paymentRef = receipt?.paymentReference || `SKL${Math.floor(100000 + Math.random() * 899999)}KA`;
  const paymentMode = receipt?.paymentMethod || 'M-Pesa Paybill (400200)';
  const balanceOutstanding = Math.max(0, policy.totalPayableKES - amountPaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 text-slate-900">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Printer className="w-4 h-4 text-gold-600" />
            Official Premium Payment Receipt Preview
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gold-400 hover:bg-gold-500 text-slate-900 rounded-lg shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div ref={receiptRef} className="p-8 space-y-6 bg-white">
          {/* Header with Goldfinch Logo & Agency Details */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
            <div className="flex items-center gap-4">
              <img
                src="/public/assets/aistudio/WhatsApp_Image_2026-11-02_at_5.05.33_PM_382c93f3.jpeg"
                alt="Goldfinch Insurance Agency"
                className="w-16 h-16 object-contain rounded-lg"
              />
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight font-serif uppercase">
                  GOLDFINCH INSURANCE AGENCY
                </h1>
                <p className="text-xs text-slate-600">
                  Reliable Underwriting &amp; Intermediary Services
                </p>
                <p className="text-[11px] text-slate-500">
                  IRA License No: <span className="font-mono font-medium">IRA/06/2026/GIA</span> | KRA PIN: <span className="font-mono font-medium">P051982736Z</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Upper Hill, Nairobi &bull; +254 700 123 456 &bull; insure@goldfinch.co.ke
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-gold-100 text-gold-900 rounded border border-gold-300">
                Official Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-800 mt-2">{receiptNumber}</p>
              <p className="text-[11px] text-slate-500">Date: {formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Receipt Body Details */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Received From:
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{policy.clientName}</p>
                <p className="text-xs text-slate-600">Policy Holder Account</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Payment Reference &amp; Channel:
                </span>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{paymentRef}</p>
                <p className="text-xs text-slate-600">{paymentMode}</p>
              </div>
            </div>

            {/* Sum in Words */}
            <div className="p-3 bg-gold-50/50 rounded border border-gold-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">The Sum of Kenya Shillings:</span>
              <p className="text-xs font-bold text-slate-900 italic mt-0.5">
                {numberToWords(amountPaid)}
              </p>
            </div>

            {/* Allocation Table */}
            <table className="w-full text-left border border-slate-200 rounded text-xs">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-2.5">Policy / Underwriter Particulars</th>
                  <th className="p-2.5 text-center">Cover Term</th>
                  <th className="p-2.5 text-right">Amount Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2.5">
                    <p className="font-bold text-slate-900">{policy.policyNumber}</p>
                    <p className="text-[11px] text-slate-500 font-sans">
                      {policy.insurerName} &bull; {policy.product} ({policy.subjectMatter})
                      {policy.motorDetails && ` &bull; Reg: ${policy.motorDetails.registration}`}
                    </p>
                  </td>
                  <td className="p-2.5 text-center text-slate-600">
                    {formatDate(policy.startDate)} &ndash; {formatDate(policy.expiryDate)}
                  </td>
                  <td className="p-2.5 text-right font-bold text-slate-900">
                    {formatKES(amountPaid)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                <tr>
                  <td colSpan={2} className="p-2.5 text-right font-sans text-slate-600">
                    Total Amount Received:
                  </td>
                  <td className="p-2.5 text-right font-mono text-base font-bold text-gold-600">
                    {formatKES(amountPaid)}
                  </td>
                </tr>
                {balanceOutstanding > 0 && (
                  <tr>
                    <td colSpan={2} className="p-2.5 text-right font-sans text-rose-600 text-xs">
                      Outstanding Policy Balance:
                    </td>
                    <td className="p-2.5 text-right font-mono text-xs font-bold text-rose-600">
                      {formatKES(balanceOutstanding)}
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>

          {/* Footer & Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Important Notice:</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Subject to Section 156 of the Kenya Insurance Act (Cap 487) Cash &amp; Carry Rule. Cheques are accepted subject to clearance. Thank you for your business.
              </p>
            </div>

            <div className="text-right flex flex-col justify-end items-end">
              <div className="w-48 border-b border-slate-400 mb-1"></div>
              <p className="text-[10px] font-semibold text-slate-700">For: GOLDFINCH INSURANCE AGENCY</p>
              <p className="text-[9px] text-slate-400 font-mono">Authorized Intermediary Officer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
