import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Plus,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Clock,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
} from 'lucide-react';
import { MessageTemplate, AutomationRule, MessageLog, Policy, Client } from '../../types/insurance';
import { Role } from '../../lib/permissions';
import {
  calculateSmsSegments,
  validatePlaceholders,
  renderTemplate,
  ALLOWED_PLACEHOLDERS,
} from '../../lib/placeholders';
import { formatDateTime } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface MessagingViewProps {
  currentRole: Role;
  templates: MessageTemplate[];
  automationRules: AutomationRule[];
  messageLogs: MessageLog[];
  policies: Policy[];
  clients: Client[];
  onSaveTemplate: (template: MessageTemplate) => void;
  onToggleAutomation: (ruleId: string) => void;
  onRetryMessage: (logId: string) => void;
  onOpenBulkSend: () => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentRole,
  templates,
  automationRules,
  messageLogs,
  policies,
  clients,
  onSaveTemplate,
  onToggleAutomation,
  onRetryMessage,
  onOpenBulkSend,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'automation' | 'logs'>('templates');
  const [languageFilter, setLanguageFilter] = useState<'All' | 'English' | 'Kiswahili'>('All');
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Template editor form state
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WhatsApp'>('WhatsApp');
  const [category, setCategory] = useState<MessageTemplate['category']>('Renewal');
  const [language, setLanguage] = useState<'English' | 'Kiswahili'>('English');
  const [text, setText] = useState('');
  const [placeholderError, setPlaceholderError] = useState<string | null>(null);

  const filteredTemplates = templates.filter((t) => {
    if (languageFilter === 'All') return true;
    return t.language === languageFilter;
  });

  const smsMetrics = calculateSmsSegments(text);

  const handleStartEdit = (t: MessageTemplate) => {
    setEditingTemplate(t);
    setTitle(t.title);
    setChannel(t.channel);
    setCategory(t.category);
    setLanguage(t.language);
    setText(t.text);
    setPlaceholderError(null);
  };

  const handleStartNew = () => {
    setEditingTemplate({
      id: `tpl-${Date.now()}`,
      title: 'New Template',
      channel: 'WhatsApp',
      category: 'Renewal',
      language: 'English',
      text: 'Dear {{client_name}}, your {{product}} policy {{policy_number}} expires on {{expiry_date}}. Settle {{premium}} via Paybill {{paybill}}.',
    });
    setTitle('New Custom Reminder');
    setChannel('WhatsApp');
    setCategory('Renewal');
    setLanguage('English');
    setText('Dear {{client_name}}, your {{product}} policy {{policy_number}} expires on {{expiry_date}}. Settle {{premium}} via Paybill {{paybill}}.');
    setPlaceholderError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePlaceholders(text);
    if (!validation.isValid) {
      setPlaceholderError(`Unknown placeholders: ${validation.invalidPlaceholders.join(', ')}`);
      return;
    }

    if (!editingTemplate) return;

    const saved: MessageTemplate = {
      ...editingTemplate,
      title: title.trim(),
      channel,
      category,
      language,
      text: text.trim(),
    };

    onSaveTemplate(saved);
    setEditingTemplate(null);
  };

  const handleExportLogs = () => {
    exportToExcel(
      messageLogs,
      [
        { header: 'Recipient Name', key: 'clientName' },
        { header: 'Phone Number', key: 'phone' },
        { header: 'Channel', key: 'channel' },
        { header: 'Template', key: 'templateTitle' },
        { header: 'Rendered Message', key: 'renderedText' },
        { header: 'Status', key: 'status' },
        { header: 'Timestamp', key: 'timestamp' },
        { header: 'Sender', key: 'sender' },
      ],
      'Goldfinch_Message_Delivery_Logs',
      'Message Logs'
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <span>Proposal Section 5.7: Messaging Engine</span>
            <span>·</span>
            <span>English &amp; Kiswahili Templates</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            SMS &amp; WhatsApp Automation &amp; Dispatcher
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Proactive renewal notices at 30, 14, 7 and 1 days before expiry, payment receipts, claim updates, and bulk dispatcher with client opt-out safeguards and quiet hours (8pm-7am EAT).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Delivery Log</span>
          </button>
          <button
            onClick={onOpenBulkSend}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Bulk Send Renewals</span>
          </button>
          {currentRole === 'admin' && (
            <button
              onClick={handleStartNew}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Template</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Message Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('automation')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'automation'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Scheduled Automation Rules ({automationRules.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'logs'
                ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Delivery Audit Log ({messageLogs.length})
          </button>
        </div>

        {activeTab === 'templates' && (
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-xs text-slate-500">Language:</span>
            {['All', 'English', 'Kiswahili'].map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguageFilter(lang as any)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  languageFilter === lang
                    ? 'bg-slate-900 text-white dark:bg-emerald-700'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Templates Grid */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {t.channel} · {t.category}
                  </span>
                  <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 font-mono">
                    {t.language}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                  {t.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                  {t.text}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  {t.text.length} chars ({Math.ceil(t.text.length / 160)} SMS)
                </span>
                {currentRole === 'admin' && (
                  <button
                    onClick={() => handleStartEdit(t)}
                    className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit Template</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Automation Rules */}
      {activeTab === 'automation' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Automated Dispatch Schedules
            </span>
            <span className="text-slate-500 font-mono">
              Quiet hours enforced: 20:00 - 07:00 EAT
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {automationRules.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{r.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                      Trigger: {r.triggerDaysBeforeExpiry} days before expiry
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Channel: {r.channel} · Next scheduled run: {r.nextScheduledRun} · Last run: {r.lastRun || 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleAutomation(r.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      r.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r.isActive ? 'Active (Running)' : 'Paused'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Recipient</th>
                  <th className="py-2.5 px-4">Channel</th>
                  <th className="py-2.5 px-4">Template Title</th>
                  <th className="py-2.5 px-4">Rendered Message</th>
                  <th className="py-2.5 px-4">Timestamp (EAT)</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {messageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{log.clientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium">{log.channel}</td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{log.templateTitle}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.renderedText}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          log.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : log.status === 'Failed'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* WhatsApp click-to-chat fallback link */}
                      <a
                        href={`https://wa.me/${log.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(log.renderedText)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                        title="Open Click-to-Chat in WhatsApp"
                      >
                        <span>wa.me</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Template Editor (Admin)
              </h3>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Template Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Channel
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Renewal">Renewal</option>
                    <option value="Payment">Payment</option>
                    <option value="Claim">Claim</option>
                    <option value="Endorsement">Endorsement</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as any)}
                    className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="English">English</option>
                    <option value="Kiswahili">Kiswahili</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Message Body &amp; Placeholders
                </label>
                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setPlaceholderError(null);
                  }}
                  className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-600 p-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>
                    Length: {smsMetrics.charCount} chars · {smsMetrics.segmentCount} SMS segment(s)
                  </span>
                  <span>Allowed: {ALLOWED_PLACEHOLDERS.slice(0, 4).join(' ')}...</span>
                </div>
              </div>

              {placeholderError && (
                <div className="p-2 rounded bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {placeholderError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
