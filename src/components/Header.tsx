import React from 'react';
import {
  Search,
  Eye,
  EyeOff,
  Sun,
  Moon,
  FileSpreadsheet,
  Plus,
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Role, ROLES } from '../lib/permissions';

interface HeaderProps {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeModule: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isSensitiveUnmasked: boolean;
  onToggleUnmaskSensitive: () => void;
  onOpenReportPack: () => void;
  onOpenStkPush: () => void;
  onOpenNewPolicy: () => void;
}

const MODULE_TITLES: Record<string, { title: string; breadcrumb: string }> = {
  dashboard: { title: 'Executive Operations Dashboard', breadcrumb: 'Dashboard' },
  clients: { title: 'Client Register & CRM', breadcrumb: 'Clients' },
  policies: { title: 'Policies & Renewal Management', breadcrumb: 'Policies' },
  endorsements: { title: 'Policy Endorsements & Pro-Rata Notes', breadcrumb: 'Endorsements' },
  claims: { title: 'Claims Follow-Up & Ageing Register', breadcrumb: 'Claims' },
  mpesa: { title: 'Safaricom M-Pesa Daraja Tracking & C2B Inbox', breadcrumb: 'M-Pesa Payments' },
  messaging: { title: 'SMS & WhatsApp Automation & Templates', breadcrumb: 'Messaging' },
  finance: { title: 'Finance, Commissions & Premium Ageing', breadcrumb: 'Finance' },
  audit: { title: 'Security & Immutable Audit Trail', breadcrumb: 'Audit Log' },
  settings: { title: 'Agency Admin Settings & Levies', breadcrumb: 'Settings' },
};

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  activeModule,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  setIsDarkMode,
  isSensitiveUnmasked,
  onToggleUnmaskSensitive,
  onOpenReportPack,
  onOpenStkPush,
  onOpenNewPolicy,
}) => {
  const current = MODULE_TITLES[activeModule] || MODULE_TITLES.dashboard;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between gap-6 shrink-0 transition-colors">
      {/* Zone 1: Context & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium text-amber-700 dark:text-amber-400">Goldfinch Agency</span>
            <span>/</span>
            <span className="capitalize">{current.breadcrumb}</span>
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {current.title}
          </h2>
        </div>
      </div>

      {/* Zone 2: Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client, KRA PIN, vehicle reg (e.g. KDF 402H), or policy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
          />
        </div>
      </div>

      {/* Zone 3: Controls (Role Switcher, Sensitive Toggle, Theme, Actions) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Sensitive PII Toggle */}
        <button
          onClick={onToggleUnmaskSensitive}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isSensitiveUnmasked
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
          title={isSensitiveUnmasked ? 'Sensitive data unmasked (Audit logged)' : 'Click to unmask ID & PIN (Audit logged)'}
        >
          {isSensitiveUnmasked ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isSensitiveUnmasked ? 'Mask PII' : 'Unmask PII'}</span>
        </button>

        {/* Dark/Light Switch */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Shield className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as Role)}
            aria-label="Active RBAC Role"
            className="text-xs font-semibold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Management Pack Export Trigger */}
        <button
          onClick={onOpenReportPack}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          title="Export multi-sheet Monthly Management Pack in real .xlsx format"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Report Pack</span>
        </button>

        {/* STK Push Shortcut */}
        <button
          onClick={onOpenStkPush}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
          title="Collect premium via Safaricom M-Pesa STK Push"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>STK Push</span>
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenNewPolicy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue Policy</span>
        </button>
      </div>
    </header>
  );
};
