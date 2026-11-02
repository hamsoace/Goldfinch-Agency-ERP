import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  FileSpreadsheet,
  Shield,
  Lock,
  User,
  Clock,
} from 'lucide-react';
import { AuditLogEntry } from '../../types/insurance';
import { Role, hasPermission } from '../../lib/permissions';
import { formatDateTime } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface AuditLogViewProps {
  currentRole: Role;
  auditLogs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({
  currentRole,
  auditLogs,
}) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const canExport = hasPermission(currentRole, 'exportData') && (currentRole === 'admin' || currentRole === 'auditor');

  const filtered = auditLogs.filter((log) => {
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesSearch =
      search === '' ||
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.targetRecord.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action))).sort();

  const handleExport = () => {
    exportToExcel(
      filtered,
      [
        { header: 'Timestamp (EAT)', key: 'timestamp' },
        { header: 'User', key: 'user' },
        { header: 'Role', key: 'role' },
        { header: 'Action Event', key: 'action' },
        { header: 'Target Record', key: 'targetRecord' },
        { header: 'Before Value', key: 'beforeValue' },
        { header: 'After Value', key: 'afterValue' },
        { header: 'IP Address', key: 'ipAddress' },
      ],
      'Goldfinch_Audit_Logs',
      'Audit Trail'
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Proposal Section 5.10: Security &amp; Compliance</span>
            <span>·</span>
            <span>Tamper-Evident Ledger</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Immutable Security &amp; Operations Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Records all user actions including sensitive field unmasking (National ID/KRA PIN), policy endorsements, M-Pesa allocations, and automated message dispatches.
          </p>
        </div>

        {canExport && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Audit Trail</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, action or target record..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs p-1.5 bg-transparent border-0 focus:outline-none text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Actions ({auditLogs.length})</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Timestamp (EAT)</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action Event</th>
                <th className="py-2.5 px-4">Target Record</th>
                <th className="py-2.5 px-4">Change Delta</th>
                <th className="py-2.5 px-4 font-mono">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 font-mono text-[11px]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750">
                  <td className="py-2.5 px-4 text-slate-500">{log.timestamp}</td>
                  <td className="py-2.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                    {log.user}
                  </td>
                  <td className="py-2.5 px-4 font-sans capitalize text-slate-600 dark:text-slate-400">
                    {log.role}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-amber-700 dark:text-amber-400">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-800 dark:text-slate-200">
                    {log.targetRecord}
                  </td>
                  <td className="py-2.5 px-4 font-sans text-slate-500 text-[10px]">
                    {log.beforeValue && log.afterValue ? (
                      <span>{log.beforeValue} &rarr; {log.afterValue}</span>
                    ) : log.afterValue ? (
                      <span>{log.afterValue}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
