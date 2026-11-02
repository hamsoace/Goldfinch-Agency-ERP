import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  FileCheck2,
  Smartphone,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Client, Policy, Claim, MpesaTransaction, MessageLog } from '../../types/insurance';
import { maskSensitive } from '../../lib/permissions';
import { formatKenyanPhone } from '../../lib/phone';
import { formatKES } from '../../lib/money';
import { formatDate, formatDateTime } from '../../lib/dates';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  policies: Policy[];
  claims: Claim[];
  transactions: MpesaTransaction[];
  messageLogs: MessageLog[];
  isSensitiveUnmasked: boolean;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  policies,
  claims,
  transactions,
  messageLogs,
  isSensitiveUnmasked,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'payments' | 'communications' | 'documents'>('overview');

  if (!isOpen || !client) return null;

  const clientPolicies = policies.filter((p) => p.clientId === client.id);
  const clientClaims = claims.filter((c) => c.clientName === client.name);
  const clientTransactions = transactions.filter((t) => t.payerName.toLowerCase().includes(client.name.split(' ')[0].toLowerCase()));
  const clientMessages = messageLogs.filter((m) => m.clientName === client.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                {client.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {client.id}</span>
            </div>
            <h2 className="text-lg font-bold text-white">{client.name}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                {formatKenyanPhone(client.phone)}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                {client.email}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {client.county}, Kenya
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 overflow-x-auto text-xs">
          {[
            { id: 'overview', label: 'Overview & Profile' },
            { id: 'policies', label: `Policies (${clientPolicies.length})` },
            { id: 'claims', label: `Claims (${clientClaims.length})` },
            { id: 'payments', label: `Payments & M-Pesa (${clientTransactions.length})` },
            { id: 'communications', label: `Communications (${clientMessages.length})` },
            { id: 'documents', label: 'Documents' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 text-xs max-h-[60vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                    Identity &amp; Tax Information
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">National ID / Passport:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-white">
                        {maskSensitive(client.idOrPassport, isSensitiveUnmasked)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">KRA PIN:</span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-white">
                        {maskSensitive(client.kraPin, isSensitiveUnmasked)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Assigned Manager:</span>
                      <span className="font-medium text-slate-800 dark:text-white">{client.assignedManager}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                    Next of Kin Contact
                  </h4>
                  {client.nextOfKin ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Name:</span>
                        <span className="font-medium text-slate-800 dark:text-white">{client.nextOfKin.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Relationship:</span>
                        <span className="text-slate-700 dark:text-slate-300">{client.nextOfKin.relation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-mono text-slate-800 dark:text-white">{formatKenyanPhone(client.nextOfKin.phone)}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No next of kin recorded.</p>
                  )}
                </div>
              </div>

              {/* Data Protection (ODPC) */}
              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold">ODPC Kenya Consent Status: </span>
                    <span>{client.odpcConsent ? `Granted on ${formatDate(client.odpcConsentDate)}` : 'Pending Consent'}</span>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                  SMS Opt-Out: {client.smsOptOut ? 'Opted-Out' : 'Active Opt-In'}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div className="space-y-3">
              {clientPolicies.length === 0 ? (
                <p className="text-slate-400 italic">No policies linked to this client.</p>
              ) : (
                clientPolicies.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white font-mono">{p.policyNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-700 font-medium">{p.product}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{p.subjectMatter}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{formatKES(p.totalPayableKES)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Exp: {formatDate(p.expiryDate)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-3">
              {clientClaims.length === 0 ? (
                <p className="text-slate-400 italic">No claims filed by this client.</p>
              ) : (
                clientClaims.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-750 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white font-mono">{c.claimNumber}</div>
                      <p className="text-slate-600 dark:text-slate-300">{c.lossDescription}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white block">{formatKES(c.estimatedAmountKES)}</span>
                      <span className="text-[10px] font-semibold text-amber-600">{c.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              {clientTransactions.length === 0 ? (
                <p className="text-slate-400 italic">No direct M-Pesa receipts recorded.</p>
              ) : (
                clientTransactions.map((t) => (
                  <div key={t.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{t.receiptCode}</span>
                      <span className="text-slate-400 ml-2 font-sans">{formatDateTime(t.timestamp)}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{formatKES(t.amountKES)}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-2">
              {clientMessages.length === 0 ? (
                <p className="text-slate-400 italic">No messages sent to this client yet.</p>
              ) : (
                clientMessages.map((m) => (
                  <div key={m.id} className="p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{m.channel} · {m.templateTitle}</span>
                      <span className="font-mono">{formatDateTime(m.timestamp)}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{m.renderedText}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-2 text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span>DPA_Consent_Declaration_{client.name.replace(/\s+/g, '_')}.pdf</span>
                <span className="text-slate-400 font-mono">145 KB</span>
              </div>
              <div className="p-3 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span>KYC_National_ID_Copy.pdf</span>
                <span className="text-slate-400 font-mono">280 KB</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
