import React, { useState } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react';
import { Policy, Client, MessageTemplate } from '../../types/insurance';
import { renderTemplate } from '../../lib/placeholders';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { INITIAL_SETTINGS } from '../../data/seedData';

interface BulkSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: Policy[];
  clients: Client[];
  templates: MessageTemplate[];
  onDispatchBulk: (
    messages: {
      clientName: string;
      phone: string;
      channel: 'SMS' | 'WhatsApp';
      templateTitle: string;
      renderedText: string;
    }[]
  ) => void;
}

export const BulkSendModal: React.FC<BulkSendModalProps> = ({
  isOpen,
  onClose,
  policies,
  clients,
  templates,
  onDispatchBulk,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(
    policies.filter((p) => p.daysToExpiry <= 30 && p.status !== 'Renewed').map((p) => p.id)
  );
  const [dispatchedSummary, setDispatchedSummary] = useState<{
    sent: number;
    skipped: number;
  } | null>(null);

  if (!isOpen) return null;

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleTogglePolicy = (policyId: string) => {
    setSelectedPolicyIds((prev) =>
      prev.includes(policyId) ? prev.filter((id) => id !== policyId) : [...prev, policyId]
    );
  };

  const handleSelectAll = () => {
    setSelectedPolicyIds(policies.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedPolicyIds([]);
  };

  const handleConfirmBulkDispatch = () => {
    if (!currentTemplate) return;

    let sentCount = 0;
    let skippedCount = 0;
    const messagesToDispatch: {
      clientName: string;
      phone: string;
      channel: 'SMS' | 'WhatsApp';
      templateTitle: string;
      renderedText: string;
    }[] = [];

    selectedPolicyIds.forEach((pid) => {
      const policy = policies.find((p) => p.id === pid);
      if (!policy) return;

      const client = clients.find((c) => c.id === policy.clientId);

      // Check opt-out flag (Crucial acceptance criterion from Section 5.7 & 10!)
      if (client?.smsOptOut) {
        skippedCount += 1;
        return;
      }

      const rendered = renderTemplate(currentTemplate.text, {
        client_name: policy.clientName,
        policy_number: policy.policyNumber,
        product: policy.product,
        insurer: policy.insurerName,
        expiry_date: formatDate(policy.expiryDate),
        days_to_expiry: Math.max(0, policy.daysToExpiry).toString(),
        premium: formatKES(policy.totalPayableKES),
        agency_name: INITIAL_SETTINGS.agencyName,
        agency_phone: INITIAL_SETTINGS.phone,
        paybill: INITIAL_SETTINGS.mpesaPaybill,
        account_ref: policy.policyNumber,
      });

      messagesToDispatch.push({
        clientName: policy.clientName,
        phone: client?.phone || '+254700000000',
        channel: currentTemplate.channel,
        templateTitle: currentTemplate.title,
        renderedText: rendered,
      });

      sentCount += 1;
    });

    onDispatchBulk(messagesToDispatch);
    setDispatchedSummary({ sent: sentCount, skipped: skippedCount });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-6">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bulk Renewal Reminders Dispatcher
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
          {dispatchedSummary ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Dispatch Completed!
              </h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg inline-block text-left space-y-1">
                <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                  &bull; Messages Dispatched: {dispatchedSummary.sent} clients
                </p>
                <p className="text-rose-600 dark:text-rose-400 font-semibold">
                  &bull; Skipped (Opt-Out): {dispatchedSummary.skipped} clients
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-emerald-700 rounded-lg"
                >
                  Close Dispatcher
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Template Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Select Template (English / Kiswahili)
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.channel}] {t.title} ({t.language})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sample Rendered Preview */}
              {currentTemplate && (
                <div className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Preview Sample Message
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-mono text-[11px] leading-relaxed">
                    {renderTemplate(currentTemplate.text, {
                      client_name: 'Johnstone Kamau',
                      policy_number: 'BRT/MOT/2025/08941',
                      product: 'Motor Comprehensive',
                      insurer: 'Britam',
                      expiry_date: '09 Nov 2026',
                      days_to_expiry: '7',
                      premium: 'KES 87,432',
                      agency_name: INITIAL_SETTINGS.agencyName,
                      agency_phone: INITIAL_SETTINGS.phone,
                      paybill: INITIAL_SETTINGS.mpesaPaybill,
                      account_ref: 'BRT/MOT/2025/08941',
                    })}
                  </p>
                </div>
              )}

              {/* Policy Selection Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Select Target Policies ({selectedPolicyIds.length} of {policies.length} chosen)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-amber-600 hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-slate-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700">
                  {policies.map((p) => {
                    const client = clients.find((c) => c.id === p.clientId);
                    const isOptedOut = client?.smsOptOut;
                    const isChecked = selectedPolicyIds.includes(p.id);

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePolicy(p.id)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-amber-50/60 dark:bg-amber-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {p.clientName}
                            </span>
                            <span className="text-slate-400 ml-2 font-mono">{p.policyNumber}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {formatKES(p.totalPayableKES)}
                          </span>
                          {isOptedOut && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                              Opted Out (Will Skip)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                  type="button"
                  disabled={selectedPolicyIds.length === 0}
                  onClick={handleConfirmBulkDispatch}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs disabled:opacity-50"
                >
                  Dispatch to {selectedPolicyIds.length} Clients
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
