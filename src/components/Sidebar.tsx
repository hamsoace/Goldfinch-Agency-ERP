import React from 'react';
import {
  LayoutDashboard,
  Users,
  Shield,
  FilePenLine,
  FileCheck2,
  Smartphone,
  MessageSquare,
  CircleDollarSign,
  History,
  Settings,
  Scale,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Role, hasPermission } from '../lib/permissions';
import { INITIAL_SETTINGS } from '../data/seedData';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentRole: Role;
  urgentRenewalsCount: number;
  openClaimsCount: number;
  unallocatedMpesaCount: number;
  onOpenReportPack: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  currentRole,
  urgentRenewalsCount,
  openClaimsCount,
  unallocatedMpesaCount,
  onOpenReportPack,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'viewDashboard' as const,
    },
    {
      id: 'clients',
      label: 'Clients CRM',
      icon: Users,
      permission: 'viewClients' as const,
    },
    {
      id: 'policies',
      label: 'Policies & Renewals',
      icon: Shield,
      badge: urgentRenewalsCount > 0 ? `${urgentRenewalsCount} due` : undefined,
      permission: 'viewPolicies' as const,
    },
    {
      id: 'endorsements',
      label: 'Endorsements',
      icon: FilePenLine,
      permission: 'viewEndorsements' as const,
    },
    {
      id: 'claims',
      label: 'Claims Follow-Up',
      icon: FileCheck2,
      badge: openClaimsCount > 0 ? `${openClaimsCount} open` : undefined,
      permission: 'viewClaims' as const,
    },
    {
      id: 'mpesa',
      label: 'M-Pesa Daraja Tracking',
      icon: Smartphone,
      badge: unallocatedMpesaCount > 0 ? `${unallocatedMpesaCount} inbox` : undefined,
      permission: 'viewMpesa' as const,
    },
    {
      id: 'messaging',
      label: 'SMS & WhatsApp',
      icon: MessageSquare,
      permission: 'viewMessaging' as const,
    },
    {
      id: 'finance',
      label: 'Finance & Commissions',
      icon: CircleDollarSign,
      permission: 'viewFinance' as const,
    },
    {
      id: 'audit',
      label: 'Security & Audit Log',
      icon: History,
      permission: 'viewAudit' as const,
    },
    {
      id: 'settings',
      label: 'Agency Settings & Levies',
      icon: Settings,
      permission: 'manageSettings' as const,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header with Goldfinch Logo */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shrink-0 shadow-xs border border-amber-500/40 overflow-hidden">
            <img
              src="/public/assets/aistudio/WhatsApp_Image_2026-11-02_at_5.05.33_PM_382c93f3.jpeg"
              alt="Goldfinch Insurance Agency Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold tracking-tight text-white uppercase truncate">
              Goldfinch Agency
            </h1>
            <p className="text-[11px] text-amber-400 font-medium tracking-wide">
              InsureERP Kenya
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>{INITIAL_SETTINGS.iraLicenseNo}</span>
          <span className="text-emerald-400 font-sans font-medium">IRA Licensed</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2.5 py-1">
          ERP Modules
        </div>

        {navItems.map((item) => {
          const isAllowed = hasPermission(currentRole, item.permission);
          if (!isAllowed) return null;

          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white shadow-xs font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mandatory Kenyan Regulatory Notice Footer (Brief Section 3) */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 leading-tight">
          <p className="font-semibold text-slate-300 flex items-center gap-1 mb-0.5">
            <Scale className="w-3 h-3 text-amber-400" />
            Compliance Notice
          </p>
          This system supports record-keeping. Confirm specific obligations with the IRA and ODPC.
        </div>
        <div className="text-center text-[10px] text-slate-400">
          Upper Hill, Nairobi · Paybill: {INITIAL_SETTINGS.mpesaPaybill}
        </div>
      </div>
    </aside>
  );
};
