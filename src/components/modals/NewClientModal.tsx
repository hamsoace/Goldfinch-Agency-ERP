import React, { useState } from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { Client, ClientType } from '../../types/insurance';
import { normalizeKenyanPhone, formatKenyanPhone } from '../../lib/phone';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
}

export const NewClientModal: React.FC<NewClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<ClientType>('Individual');
  const [phone, setPhone] = useState('07');
  const [email, setEmail] = useState('');
  const [idOrPassport, setIdOrPassport] = useState('');
  const [kraPin, setKraPin] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [address, setAddress] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinRelation, setNextOfKinRelation] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('07');
  const [odpcConsent, setOdpcConsent] = useState(true);
  const [assignedManager, setAssignedManager] = useState('Brian Tanui');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const normalizedPhone = normalizeKenyanPhone(phone);
    const normalizedKinPhone = nextOfKinPhone.trim() ? normalizeKenyanPhone(nextOfKinPhone) : '';

    const newClient: Client = {
      id: `cli-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      type,
      phone: normalizedPhone,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.ke`,
      idOrPassport: idOrPassport.trim() || Math.floor(10000000 + Math.random() * 90000000).toString(),
      kraPin: kraPin.trim() ? kraPin.toUpperCase() : undefined,
      address: address.trim() || 'Central Business District',
      county,
      nextOfKin: nextOfKinName.trim()
        ? {
            name: nextOfKinName.trim(),
            relation: nextOfKinRelation.trim() || 'Next of Kin',
            phone: normalizedKinPhone,
          }
        : undefined,
      odpcConsent,
      odpcConsentDate: odpcConsent ? '2026-11-02' : '',
      smsOptOut: false,
      assignedManager,
      createdAt: '2026-11-02',
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Create Client Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name / Registered Entity Name
              </label>
              <input
                type="text"
                placeholder="e.g. Johnstone Kamau Ndung'u"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Entity Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ClientType)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Individual">Individual</option>
                <option value="SME">SME</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Phone Number (Kenyan Normalized)
              </label>
              <input
                type="text"
                placeholder="0712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Formatted: {formatKenyanPhone(phone)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="johnstone@example.co.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                National ID / Passport / Reg No
              </label>
              <input
                type="text"
                placeholder="e.g. 24891043"
                value={idOrPassport}
                onChange={(e) => setIdOrPassport(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                KRA PIN (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. A004819231B"
                value={kraPin}
                onChange={(e) => setKraPin(e.target.value)}
                className="w-full text-xs font-mono uppercase p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                County
              </label>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {['Nairobi', 'Mombasa', 'Nakuru', 'Uasin Gishu', 'Kiambu', 'Kisumu', 'Kericho', 'Machakos', 'Nyeri', 'Kilifi'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Town / Physical Address
              </label>
              <input
                type="text"
                placeholder="e.g. Kileleshwa, Ring Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Next of Kin */}
          <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
              Next of Kin (Optional)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Kin Full Name"
                value={nextOfKinName}
                onChange={(e) => setNextOfKinName(e.target.value)}
                className="text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={nextOfKinRelation}
                onChange={(e) => setNextOfKinRelation(e.target.value)}
                className="text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                placeholder="Kin Phone"
                value={nextOfKinPhone}
                onChange={(e) => setNextOfKinPhone(e.target.value)}
                className="text-xs font-mono p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="odpcConsentCheck"
              checked={odpcConsent}
              onChange={(e) => setOdpcConsent(e.target.checked)}
              className="rounded text-amber-600"
            />
            <label htmlFor="odpcConsentCheck" className="text-slate-700 dark:text-slate-300 text-xs">
              Client has given express consent for data processing under Kenya Data Protection Act 2019
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              Create Client Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
