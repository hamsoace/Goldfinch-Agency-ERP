import React, { useState } from 'react';
import { X, Check, Shield, Car, HeartPulse, Calculator } from 'lucide-react';
import { Policy, Client, ProductLine, Insurer } from '../../types/insurance';
import { KENYA_INSURERS } from '../../data/seedData';
import { formatKES, calculatePolicyCharges, DEFAULT_STATUTORY_CONFIG } from '../../lib/money';

interface NewPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  insurers?: Insurer[];
  onAddPolicy: (policy: Policy) => void;
}

const PRODUCT_LINES: ProductLine[] = [
  'Motor Private',
  'Motor Commercial',
  'Motor Comprehensive',
  'Medical',
  'Group Life',
  'Personal Accident',
  'Fire & Perils',
  'Domestic Package',
  'Marine',
  'Other',
];

export const NewPolicyModal: React.FC<NewPolicyModalProps> = ({
  isOpen,
  onClose,
  clients,
  insurers = KENYA_INSURERS,
  onAddPolicy,
}) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [product, setProduct] = useState<ProductLine>('Motor Private');
  const [insurerId, setInsurerId] = useState(insurers[0]?.id || 'ins-britam');
  const [subjectMatter, setSubjectMatter] = useState('Toyota Prado TX 2022');
  const [sumInsuredKES, setSumInsuredKES] = useState<number>(3800000);
  const [grossPremiumKES, setGrossPremiumKES] = useState<number>(95000);
  const [startDate, setStartDate] = useState('2026-11-02');
  const [expiryDate, setExpiryDate] = useState('2027-11-01');

  // Motor details
  const [motorReg, setMotorReg] = useState('KDQ 718P');
  const [motorMake, setMotorMake] = useState('Toyota');
  const [motorModel, setMotorModel] = useState('Prado TX');
  const [motorYear, setMotorYear] = useState<number>(2022);
  const [motorChassis, setMotorChassis] = useState('TRJ150-0091823');

  // Medical details
  const [medMembers, setMedMembers] = useState<number>(4);
  const [medInpatient, setMedInpatient] = useState<number>(2000000);
  const [medOutpatient, setMedOutpatient] = useState<number>(100000);

  if (!isOpen) return null;

  const selectedInsurer = insurers.find((i) => i.id === insurerId) || insurers[0];
  const commissionRate = selectedInsurer?.commissionRates[product] || 10;

  // Real statutory calculation using Kenya rates
  const charges = calculatePolicyCharges(
    grossPremiumKES,
    DEFAULT_STATUTORY_CONFIG,
    commissionRate
  );

  const isMotor = product.startsWith('Motor');
  const isMedical = product === 'Medical';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId) || clients[0];
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = selectedInsurer.code.toUpperCase();
    const prodCode = product.substring(0, 3).toUpperCase();
    const policyNumber = `${prefix}/${prodCode}/2026/${randomSuffix}`;

    const newPolicy: Policy = {
      id: `pol-${Date.now()}`,
      policyNumber,
      clientId: client.id,
      clientName: client.name,
      insurerId: selectedInsurer.id,
      insurerName: selectedInsurer.name,
      product,
      subjectMatter: subjectMatter.trim() || `${product} Cover`,
      sumInsuredKES,
      grossPremiumKES: charges.grossPremiumKES,
      trainingLevyKES: charges.trainingLevyKES,
      phcfLevyKES: charges.phcfLevyKES,
      stampDutyKES: charges.stampDutyKES,
      totalPayableKES: charges.totalPayableKES,
      premiumPaidKES: 0,
      commissionRatePct: commissionRate,
      agencyCommissionKES: charges.agencyCommissionKES,
      whtKES: charges.whtKES,
      netCommissionDueKES: charges.netCommissionDueKES,
      startDate,
      expiryDate,
      daysToExpiry: 365,
      status: 'Active',
      paymentStatus: 'Unpaid',
      motorDetails: isMotor
        ? {
            registration: motorReg.toUpperCase(),
            make: motorMake,
            model: motorModel,
            yearOfManufacture: motorYear,
            chassisOrLogbook: motorChassis,
          }
        : undefined,
      medicalDetails: isMedical
        ? {
            membersCount: medMembers,
            inpatientLimitKES: medInpatient,
            outpatientLimitKES: medOutpatient,
          }
        : undefined,
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          title: 'Cover Schedule & Policy Certificate',
          type: 'Schedule',
          fileName: `Schedule_${policyNumber.replace(/\//g, '_')}.pdf`,
          fileSizeKB: 320,
          uploadedAt: new Date().toISOString(),
        },
      ],
    };

    onAddPolicy(newPolicy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-100 dark:bg-gold-950/60 flex items-center justify-center text-gold-600 dark:text-gold-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Underwrite New Policy Record
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Goldfinch Agency underwriting with automatic Kenya statutory levies &amp; WHT
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Client (Policyholder)
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
                required
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type} &bull; {c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Insurance Underwriter
              </label>
              <select
                value={insurerId}
                onChange={(e) => setInsurerId(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {insurers.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} (Code: {i.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Line
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as ProductLine)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              >
                {PRODUCT_LINES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Subject Matter Description
              </label>
              <input
                type="text"
                required
                value={subjectMatter}
                onChange={(e) => setSubjectMatter(e.target.value)}
                placeholder="e.g. Toyota Prado TX / Warehouse Stock / Family Medical"
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Motor Section */}
          {isMotor && (
            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900/60 space-y-2.5">
              <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <Car className="w-4 h-4" />
                Motor Vehicle Schedule Particulars
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Reg No</label>
                  <input
                    type="text"
                    value={motorReg}
                    onChange={(e) => setMotorReg(e.target.value)}
                    placeholder="e.g. KDQ 718P"
                    className="w-full text-xs font-mono font-bold uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Make</label>
                  <input
                    type="text"
                    value={motorMake}
                    onChange={(e) => setMotorMake(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Model</label>
                  <input
                    type="text"
                    value={motorModel}
                    onChange={(e) => setMotorModel(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Year</label>
                  <input
                    type="number"
                    value={motorYear}
                    onChange={(e) => setMotorYear(Number(e.target.value) || 2022)}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Chassis / Logbook No</label>
                  <input
                    type="text"
                    value={motorChassis}
                    onChange={(e) => setMotorChassis(e.target.value)}
                    className="w-full text-xs font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Section */}
          {isMedical && (
            <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900/60 space-y-2.5">
              <span className="font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4" />
                Medical Cover Limits
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Members Covered</label>
                  <input
                    type="number"
                    value={medMembers}
                    onChange={(e) => setMedMembers(Number(e.target.value) || 1)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Inpatient Limit (KES)</label>
                  <input
                    type="number"
                    value={medInpatient}
                    onChange={(e) => setMedInpatient(Number(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 dark:text-slate-400">Outpatient Limit (KES)</label>
                  <input
                    type="number"
                    value={medOutpatient}
                    onChange={(e) => setMedOutpatient(Number(e.target.value) || 0)}
                    className="w-full text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Financials & Statutory Levies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Sum Insured (KES)
              </label>
              <input
                type="number"
                min="0"
                step="10000"
                value={sumInsuredKES}
                onChange={(e) => setSumInsuredKES(Number(e.target.value) || 0)}
                className="w-full text-xs font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gross Premium (KES)
              </label>
              <input
                type="number"
                min="100"
                step="500"
                value={grossPremiumKES}
                onChange={(e) => setGrossPremiumKES(Number(e.target.value) || 0)}
                className="w-full text-xs font-mono font-bold bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Real-time Kenya Statutory Calculation Summary */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-500">
              <span>Gross Premium:</span>
              <span>{formatKES(charges.grossPremiumKES)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Training Levy (0.2%):</span>
              <span>{formatKES(charges.trainingLevyKES)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>PHCF Levy (0.25%):</span>
              <span>{formatKES(charges.phcfLevyKES)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Stamp Duty:</span>
              <span>{formatKES(charges.stampDutyKES)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white text-sm">
              <span>Total Payable by Client:</span>
              <span className="text-gold-600 dark:text-gold-400">{formatKES(charges.totalPayableKES)}</span>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-1 text-[11px] text-teal-700 dark:text-teal-300 flex justify-between">
              <span>Agency Comm ({commissionRate}%):</span>
              <span>{formatKES(charges.agencyCommissionKES)} (Net after 5% WHT: {formatKES(charges.netCommissionDueKES)})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
          </div>

          {/* Footer */}
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
              Underwrite &amp; Save Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
