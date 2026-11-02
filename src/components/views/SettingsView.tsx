import React, { useState } from 'react';
import {
  Settings,
  Scale,
  ShieldCheck,
  Save,
  CheckCircle2,
  Clock,
  Trash2,
  Download,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { AgencySettings } from '../../types/insurance';
import { StatutoryConfig, formatKES } from '../../lib/money';

interface SettingsViewProps {
  settings: AgencySettings;
  onUpdateSettings: (newSettings: AgencySettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [trainingLevyPct, setTrainingLevyPct] = useState(
    (settings.statutoryConfig.trainingLevyRate * 100).toString()
  );
  const [phcfLevyPct, setPhcfLevyPct] = useState(
    (settings.statutoryConfig.phcfLevyRate * 100).toString()
  );
  const [stampDutyKES, setStampDutyKES] = useState(
    settings.statutoryConfig.stampDutyKES.toString()
  );
  const [whtPct, setWhtPct] = useState(
    (settings.statutoryConfig.whtRate * 100).toString()
  );

  const [quietStart, setQuietStart] = useState(settings.quietHours.start);
  const [quietEnd, setQuietEnd] = useState(settings.quietHours.end);
  const [dataRetentionYears, setDataRetentionYears] = useState(
    settings.dataRetentionYears.toString()
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportDataSuccess, setExportDataSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedConfig: StatutoryConfig = {
      trainingLevyRate: parseFloat(trainingLevyPct) / 100,
      phcfLevyRate: parseFloat(phcfLevyPct) / 100,
      stampDutyKES: parseFloat(stampDutyKES),
      whtRate: parseFloat(whtPct) / 100,
    };

    const newSettings: AgencySettings = {
      ...settings,
      statutoryConfig: updatedConfig,
      quietHours: {
        start: quietStart,
        end: quietEnd,
      },
      dataRetentionYears: parseInt(dataRetentionYears, 10) || 7,
    };

    onUpdateSettings(newSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSimulateClientDataExport = () => {
    setExportDataSuccess(true);
    setTimeout(() => setExportDataSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Proposal Section 3 &amp; 5.10: Admin Settings</span>
            <span>·</span>
            <span>Configurable Parameters</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Agency Settings &amp; Statutory Levies Configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure IRA statutory tariffs, quiet hours for messaging automation, and Data Protection Act retention policies.
          </p>
        </div>
      </div>

      {/* Mandatory Kenyan Regulatory Notice Box (Section 3) */}
      <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
          <Scale className="w-4 h-4 text-amber-700" />
          <span>IMPORTANT REGULATORY NOTICE (IRA &amp; ODPC KENYA)</span>
        </div>
        <p className="leading-relaxed">
          This system provides enterprise record-keeping, policy schedule management, and reconciliation tools. It does <strong>not automatically make an insurance agency compliant</strong> with the Insurance Regulatory Authority (IRA) licensing requirements or the Kenya Data Protection Act 2019. Always confirm applicable legal and statutory obligations with the IRA and a qualified legal or data protection adviser.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Configurable Statutory Levies & Stamp Duty */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Settings className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Configurable Statutory Levies &amp; Tariffs (IRA / KRA)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            These statutory parameters are applied automatically across all newly issued policies and endorsements.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Insurance Training Levy (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={trainingLevyPct}
                  onChange={(e) => setTrainingLevyPct(e.target.value)}
                  className="w-full text-xs font-mono p-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Standard IRA rate: 0.20% on gross basic premium</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Policyholders Compensation Fund (PHCF) (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="5"
                  value={phcfLevyPct}
                  onChange={(e) => setPhcfLevyPct(e.target.value)}
                  className="w-full text-xs font-mono p-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Standard statutory rate: 0.25%</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Government Stamp Duty (KES)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={stampDutyKES}
                onChange={(e) => setStampDutyKES(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                required
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Standard statutory tariff: KES 40 per contract</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Withholding Tax (WHT) on Agency Commission (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={whtPct}
                  onChange={(e) => setWhtPct(e.target.value)}
                  className="w-full text-xs font-mono p-2 pr-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  required
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">KRA statutory withholding tax rate: 5%</p>
            </div>
          </div>
        </div>

        {/* Section 2: Messaging Quiet Hours */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Automated Messaging Quiet Hours (Section 5.7)
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            No automated renewal alerts or payment reminders will be dispatched between these hours (East Africa Time).
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quiet Hours Start (Evening)
              </label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Quiet Hours End (Morning)
              </label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Data Protection & Retention (Section 5.10) */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Data Retention &amp; Subject Access Requests (ODPC Kenya)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Statutory Document Retention (Years)
              </label>
              <input
                type="number"
                min="5"
                max="12"
                value={dataRetentionYears}
                onChange={(e) => setDataRetentionYears(e.target.value)}
                className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Insurance Act requires minimum 7 years</p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Data Subject Rights Workflow (ODPC)
              </span>
              <button
                type="button"
                onClick={handleSimulateClientDataExport}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exportDataSuccess ? 'Dossier Downloaded!' : 'Export Client Personal Dossier (JSON/ZIP)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Parameters saved &amp; applied to tariff engine!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Agency Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
