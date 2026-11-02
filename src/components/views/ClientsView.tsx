import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Client, Policy, Claim, PaymentReceipt, MessageLog } from '../../types/insurance';
import { maskSensitive } from '../../lib/permissions';
import { formatKenyanPhone } from '../../lib/phone';
import { formatDate } from '../../lib/dates';
import { exportToExcel } from '../../lib/exportExcel';

interface ClientsViewProps {
  clients: Client[];
  policies: Policy[];
  claims: Claim[];
  messageLogs: MessageLog[];
  searchQuery: string;
  isSensitiveUnmasked: boolean;
  onOpenNewClient: () => void;
  onSelectClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  policies,
  claims,
  messageLogs,
  searchQuery,
  isSensitiveUnmasked,
  onOpenNewClient,
  onSelectClient,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [countyFilter, setCountyFilter] = useState<string>('All');

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesType = typeFilter === 'All' || c.type === typeFilter;
    const matchesCounty = countyFilter === 'All' || c.county === countyFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.kraPin && c.kraPin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.idOrPassport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.county.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesCounty && matchesSearch;
  });

  const counties = Array.from(new Set(clients.map((c) => c.county))).sort();

  const handleExportClients = () => {
    exportToExcel(
      filteredClients,
      [
        { header: 'Client ID', key: 'id' },
        { header: 'Full Name', key: 'name' },
        { header: 'Entity Type', key: 'type' },
        { header: 'Phone Number', key: 'phone' },
        { header: 'Email Address', key: 'email' },
        {
          header: 'National ID / Passport',
          key: 'idOrPassport',
          formatter: (c) => maskSensitive(c.idOrPassport, isSensitiveUnmasked),
        },
        {
          header: 'KRA PIN',
          key: 'kraPin',
          formatter: (c) => maskSensitive(c.kraPin, isSensitiveUnmasked),
        },
        { header: 'County', key: 'county' },
        { header: 'Town / Address', key: 'address' },
        { header: 'ODPC Consent', key: 'odpcConsent', formatter: (c) => (c.odpcConsent ? 'Yes' : 'No') },
        { header: 'Assigned Manager', key: 'assignedManager' },
      ],
      'Goldfinch_Clients',
      'Clients'
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            <span>Client Register &amp; CRM</span>
            <span>·</span>
            <span>Kenya DPA Compliant</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Customer Profiles &amp; Historical Dossiers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Centralized client registry for Individuals, SMEs and Corporates. Integrated with policy schedules, claims, M-Pesa statements and communication logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportClients}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            title="Export currently filtered clients to Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">Entity Type:</span>
          {['All', 'Individual', 'SME', 'Corporate'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                typeFilter === t
                  ? 'bg-slate-900 text-white dark:bg-amber-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">County:</span>
          <select
            value={countyFilter}
            onChange={(e) => setCountyFilter(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="All">All Counties ({counties.length})</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Client Directory ({filteredClients.length})
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            Click client row to open 6-tab detailed dossier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/70 dark:bg-slate-750 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Client Name &amp; Type</th>
                <th className="py-2.5 px-4">Phone (Kenyan Normalized)</th>
                <th className="py-2.5 px-4">National ID / Reg</th>
                <th className="py-2.5 px-4">KRA PIN</th>
                <th className="py-2.5 px-4">County / Address</th>
                <th className="py-2.5 px-4 text-center">ODPC Consent</th>
                <th className="py-2.5 px-4">Assigned Officer</th>
                <th className="py-2.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredClients.map((client) => {
                const clientPolicies = policies.filter((p) => p.clientId === client.id);

                return (
                  <tr
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{client.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-medium text-amber-700 dark:text-amber-400">{client.type}</span>
                        <span>·</span>
                        <span>{clientPolicies.length} Policies</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-200">
                      {formatKenyanPhone(client.phone)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {maskSensitive(client.idOrPassport, isSensitiveUnmasked)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {maskSensitive(client.kraPin, isSensitiveUnmasked)}
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      <div>{client.county}</div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{client.address}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                          client.odpcConsent
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {client.odpcConsent ? 'Granted' : 'Pending'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {client.assignedManager}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClient(client);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded transition-colors"
                      >
                        Dossier &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
