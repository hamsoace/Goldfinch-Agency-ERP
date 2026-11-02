import React, { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Policy, MessageTemplate } from '../../types/insurance';
import { renderTemplate } from '../../lib/placeholders';
import { formatKES } from '../../lib/money';
import { formatDate } from '../../lib/dates';
import { INITIAL_SETTINGS } from '../../data/seedData';

interface SendTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: Policy | null;
  templates: MessageTemplate[];
  onSendMessage: (log: {
    clientName: string;
    phone: string;
    channel: 'SMS' | 'WhatsApp';
    templateTitle: string;
    renderedText: string;
  }) => void;
}

export const SendTemplateModal: React.FC<SendTemplateModalProps> = ({
  isOpen,
  onClose,
  policy,
  templates,
  onSendMessage,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [sentFeedback, setSentFeedback] = useState(false);

  if (!isOpen || !policy) return null;

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const rendered = currentTemplate
    ? renderTemplate(currentTemplate.text, {
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
      })
    : '';

  const handleSend = () => {
    if (!currentTemplate) return;

    onSendMessage({
      clientName: policy.clientName,
      phone: '+254721445901',
      channel: currentTemplate.channel,
      templateTitle: currentTemplate.title,
      renderedText: rendered,
    });

    setSentFeedback(true);
    setTimeout(() => {
      setSentFeedback(false);
      onClose();
    }, 1500);
  };

  const cleanPhone = '254721445901';
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(rendered)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Send Reminder to {policy.clientName}
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
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Select Message Template
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

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Rendered Message Body
            </span>
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 font-mono text-[11px] leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
              {rendered}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 pt-1">
              <span>Channel: {currentTemplate?.channel} ({currentTemplate?.language})</span>
              <span>Length: {rendered.length} characters</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
            {/* Click-to-chat WhatsApp fallback */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:underline"
            >
              <span>Click-to-Chat (wa.me)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sentFeedback ? 'Dispatched!' : 'Dispatch Message'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
