/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { ClientsView } from './components/views/ClientsView';
import { PoliciesView } from './components/views/PoliciesView';
import { EndorsementsView } from './components/views/EndorsementsView';
import { ClaimsView } from './components/views/ClaimsView';
import { MpesaPaymentsView } from './components/views/MpesaPaymentsView';
import { MessagingView } from './components/views/MessagingView';
import { FinanceView } from './components/views/FinanceView';
import { AuditLogView } from './components/views/AuditLogView';
import { SettingsView } from './components/views/SettingsView';

// Modals
import { NewClientModal } from './components/modals/NewClientModal';
import { ClientDetailModal } from './components/modals/ClientDetailModal';
import { NewPolicyModal } from './components/modals/NewPolicyModal';
import { RenewalWorkflowModal } from './components/modals/RenewalWorkflowModal';
import { NewEndorsementModal } from './components/modals/NewEndorsementModal';
import { NewClaimModal } from './components/modals/NewClaimModal';
import { StkPushModal } from './components/modals/StkPushModal';
import { ManualPaymentModal } from './components/modals/ManualPaymentModal';
import { PrintReceiptModal } from './components/modals/PrintReceiptModal';
import { SendTemplateModal } from './components/modals/SendTemplateModal';
import { BulkSendModal } from './components/modals/BulkSendModal';
import { ReportPackModal } from './components/modals/ReportPackModal';

// Seed & Libs
import {
  SEED_CLIENTS,
  SEED_POLICIES,
  SEED_ENDORSEMENTS,
  SEED_CLAIMS,
  SEED_MPESA_TRANSACTIONS,
  SEED_TEMPLATES,
  SEED_AUDIT_LOGS,
  SEED_DEBIT_CREDIT_NOTES,
  SEED_COMMISSIONS,
  SEED_AUTOMATION_RULES,
  SEED_MESSAGE_LOGS,
  SEED_INSURERS,
  INITIAL_SETTINGS,
} from './data/seedData';
import {
  Role,
  ROLES,
} from './lib/permissions';
import {
  Client,
  Policy,
  Endorsement,
  EndorsementStatus,
  Claim,
  ClaimStatus,
  MpesaTransaction,
  MessageTemplate,
  AutomationRule,
  MessageLog,
  AuditLogEntry,
  DebitCreditNote,
  CommissionEntry,
  PaymentReceipt,
  AgencySettings,
} from './types/insurance';
import { DEFAULT_STATUTORY_CONFIG, StatutoryConfig, formatKES } from './lib/money';

export default function App() {
  // Navigation & Role State
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<Role>('admin');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSensitiveUnmasked, setIsSensitiveUnmasked] = useState<boolean>(false);

  // Domain Data State
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [policies, setPolicies] = useState<Policy[]>(SEED_POLICIES);
  const [endorsements, setEndorsements] = useState<Endorsement[]>(SEED_ENDORSEMENTS);
  const [claims, setClaims] = useState<Claim[]>(SEED_CLAIMS);
  const [mpesaTransactions, setMpesaTransactions] = useState<MpesaTransaction[]>(SEED_MPESA_TRANSACTIONS);
  const [templates, setTemplates] = useState<MessageTemplate[]>(SEED_TEMPLATES);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(SEED_AUTOMATION_RULES);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(SEED_MESSAGE_LOGS);
  const [commissions, setCommissions] = useState<CommissionEntry[]>(SEED_COMMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(SEED_AUDIT_LOGS);
  const [debitCreditNotes, setDebitCreditNotes] = useState<DebitCreditNote[]>(SEED_DEBIT_CREDIT_NOTES);
  const [statutoryConfig, setStatutoryConfig] = useState<StatutoryConfig>(DEFAULT_STATUTORY_CONFIG);
  const [settings, setSettings] = useState<AgencySettings>(INITIAL_SETTINGS);

  // Modals Visibility & Context
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [isClientDetailOpen, setIsClientDetailOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);

  const [isNewPolicyOpen, setIsNewPolicyOpen] = useState(false);
  const [isRenewalWorkflowOpen, setIsRenewalWorkflowOpen] = useState(false);
  const [selectedPolicyForRenewal, setSelectedPolicyForRenewal] = useState<Policy | null>(null);

  const [isNewEndorsementOpen, setIsNewEndorsementOpen] = useState(false);

  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);

  const [isStkPushOpen, setIsStkPushOpen] = useState(false);

  const [isManualPaymentOpen, setIsManualPaymentOpen] = useState(false);
  const [selectedPolicyForManualPayment, setSelectedPolicyForManualPayment] = useState<Policy | null>(null);

  const [isPrintReceiptOpen, setIsPrintReceiptOpen] = useState(false);
  const [selectedPolicyForReceipt, setSelectedPolicyForReceipt] = useState<Policy | null>(null);
  const [selectedReceiptForPrint, setSelectedReceiptForPrint] = useState<PaymentReceipt | null>(null);

  const [isSendTemplateOpen, setIsSendTemplateOpen] = useState(false);
  const [selectedPolicyForSend, setSelectedPolicyForSend] = useState<Policy | null>(null);
  const [isBulkSendOpen, setIsBulkSendOpen] = useState(false);
  const [isReportPackOpen, setIsReportPackOpen] = useState(false);

  // Dark mode class toggle on root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getRoleName = (r: Role) => {
    const item = ROLES.find((def) => def.id === r);
    return item ? item.name : r;
  };

  // Central Audit Logger
  const addAuditLog = (
    action: string,
    targetRecord: string,
    beforeValue?: string,
    afterValue?: string
  ) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: getRoleName(currentRole),
      role: currentRole,
      action,
      targetRecord,
      beforeValue,
      afterValue,
      ipAddress: '197.232.4.18 (Nairobi HQ)',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Toggle PII sensitive unmasking with audit logging
  const handleToggleUnmaskSensitive = () => {
    const nextState = !isSensitiveUnmasked;
    setIsSensitiveUnmasked(nextState);
    if (nextState) {
      addAuditLog(
        'VIEW_SENSITIVE_RECORD',
        'All Active Clients',
        'Masked',
        'Unmasked KRA PIN & National ID records'
      );
    }
  };

  // --- Handlers: Clients ---
  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    addAuditLog('CREATE_CLIENT', `Client ${newClient.name} (${newClient.phone})`);
  };

  const handleOpenClientDetail = (client: Client) => {
    setSelectedClientForDetail(client);
    setIsClientDetailOpen(true);
    addAuditLog('INSPECT_CLIENT_DOSSIER', `Client ${client.name} (${client.id})`);
  };

  // --- Handlers: Policies ---
  const handleAddPolicy = (newPolicy: Policy) => {
    setPolicies((prev) => [newPolicy, ...prev]);
    const debitNote: DebitCreditNote = {
      id: `dn-${Date.now()}`,
      noteNumber: `DN-2026-${Math.floor(3000 + Math.random() * 6000)}`,
      type: 'Debit Note',
      policyId: newPolicy.id,
      policyNumber: newPolicy.policyNumber,
      clientName: newPolicy.clientName,
      amountKES: newPolicy.totalPayableKES,
      dateIssued: newPolicy.startDate,
      reason: `New Policy Inception: ${newPolicy.product}`,
      isPaid: false,
    };
    setDebitCreditNotes((prev) => [debitNote, ...prev]);
    addAuditLog(
      'UNDERWRITE_POLICY',
      `Policy ${newPolicy.policyNumber} (${newPolicy.clientName})`,
      undefined,
      `Total payable: ${formatKES(newPolicy.totalPayableKES)}`
    );
  };

  const handleIssueRenewal = (renewedPolicy: Policy, oldPolicyId: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === oldPolicyId ? { ...p, status: 'Renewed' } : p))
    );
    setPolicies((prev) => [renewedPolicy, ...prev]);
    const debitNote: DebitCreditNote = {
      id: `dn-${Date.now()}`,
      noteNumber: `DN-2027-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Debit Note',
      policyId: renewedPolicy.id,
      policyNumber: renewedPolicy.policyNumber,
      clientName: renewedPolicy.clientName,
      amountKES: renewedPolicy.totalPayableKES,
      dateIssued: renewedPolicy.startDate,
      reason: `Annual Policy Renewal (Previous: ${oldPolicyId})`,
      isPaid: false,
    };
    setDebitCreditNotes((prev) => [debitNote, ...prev]);
    addAuditLog(
      'ISSUE_RENEWAL',
      `Policy ${renewedPolicy.policyNumber} (Prev: ${oldPolicyId})`,
      'Active (Expiring)',
      `Renewed for ${formatKES(renewedPolicy.totalPayableKES)}`
    );
  };

  // --- Handlers: Endorsements ---
  const handleAddEndorsement = (newEndorsement: Endorsement) => {
    setEndorsements((prev) => [newEndorsement, ...prev]);
    addAuditLog(
      'DRAFT_ENDORSEMENT',
      `Endorsement ${newEndorsement.endorsementNumber} on ${newEndorsement.policyNumber}`,
      undefined,
      `${newEndorsement.premiumImpactType} ${formatKES(newEndorsement.premiumImpactAmountKES)}`
    );
  };

  const handleTransitionEndorsement = (
    endorsementId: string,
    newStatus: EndorsementStatus,
    note?: string
  ) => {
    setEndorsements((prev) =>
      prev.map((e) => {
        if (e.id !== endorsementId) return e;
        const transitionItem = {
          fromStatus: e.status,
          toStatus: newStatus,
          user: getRoleName(currentRole),
          timestamp: new Date().toISOString(),
          note,
        };
        const updated: Endorsement = {
          ...e,
          status: newStatus,
          history: [...e.history, transitionItem],
        };

        if (newStatus === 'Applied') {
          if (e.premiumImpactType === 'Additional' && e.premiumImpactAmountKES > 0) {
            const dn: DebitCreditNote = {
              id: `dn-${Date.now()}`,
              noteNumber: `DN-2026-${Math.floor(7000 + Math.random() * 2000)}`,
              type: 'Debit Note',
              policyId: e.policyId,
              policyNumber: e.policyNumber,
              clientName: e.clientName,
              amountKES: e.premiumImpactAmountKES,
              dateIssued: new Date().toISOString().split('T')[0],
              reason: `Endorsement ${e.endorsementNumber}: ${e.description}`,
              isPaid: false,
              relatedEndorsementNo: e.endorsementNumber,
            };
            setDebitCreditNotes((prevNotes) => [dn, ...prevNotes]);
            setPolicies((prevPolicies) =>
              prevPolicies.map((p) =>
                p.id === e.policyId
                  ? {
                      ...p,
                      totalPayableKES: p.totalPayableKES + e.premiumImpactAmountKES,
                      paymentStatus: p.premiumPaidKES >= p.totalPayableKES + e.premiumImpactAmountKES ? 'Paid' : 'Partly paid',
                    }
                  : p
              )
            );
          } else if (e.premiumImpactType === 'Return' && e.premiumImpactAmountKES > 0) {
            const cn: DebitCreditNote = {
              id: `cn-${Date.now()}`,
              noteNumber: `CN-2026-${Math.floor(1000 + Math.random() * 2000)}`,
              type: 'Credit Note',
              policyId: e.policyId,
              policyNumber: e.policyNumber,
              clientName: e.clientName,
              amountKES: e.premiumImpactAmountKES,
              dateIssued: new Date().toISOString().split('T')[0],
              reason: `Endorsement Return Premium ${e.endorsementNumber}: ${e.description}`,
              isPaid: true,
              relatedEndorsementNo: e.endorsementNumber,
            };
            setDebitCreditNotes((prevNotes) => [cn, ...prevNotes]);
            setPolicies((prevPolicies) =>
              prevPolicies.map((p) =>
                p.id === e.policyId
                  ? {
                      ...p,
                      totalPayableKES: Math.max(0, p.totalPayableKES - e.premiumImpactAmountKES),
                    }
                  : p
              )
            );
          }
        }

        return updated;
      })
    );

    addAuditLog(
      'UPDATE_ENDORSEMENT_STATUS',
      `Endorsement ${endorsementId}`,
      undefined,
      `Status changed to ${newStatus}`
    );
  };

  // --- Handlers: Claims ---
  const handleAddClaim = (newClaim: Claim) => {
    setClaims((prev) => [newClaim, ...prev]);
    addAuditLog(
      'INTAKE_CLAIM',
      `Claim ${newClaim.claimNumber} (${newClaim.clientName})`,
      undefined,
      `Estimated loss: ${formatKES(newClaim.estimatedAmountKES)}`
    );
  };

  const handleUpdateClaimStatus = (claimId: string, newStatus: ClaimStatus) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const newActivity = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleName(currentRole),
          action: `Status: ${newStatus}`,
          note: `Claim status updated from ${c.status} to ${newStatus}.`,
        };
        return {
          ...c,
          status: newStatus,
          lastActivityDate: new Date().toISOString().split('T')[0],
          timeline: [...c.timeline, newActivity],
        };
      })
    );
    addAuditLog('UPDATE_CLAIM_STATUS', `Claim ${claimId}`, undefined, `Status changed to ${newStatus}`);
  };

  const handleToggleChecklist = (claimId: string, itemId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const updatedChecklist = c.checklist.map((chk) => {
          if (chk.id !== itemId) return chk;
          const nextReceived = !chk.received;
          return {
            ...chk,
            received: nextReceived,
            receivedDate: nextReceived ? new Date().toISOString().split('T')[0] : undefined,
          };
        });
        return {
          ...c,
          checklist: updatedChecklist,
          lastActivityDate: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const handleAddTimelineNote = (claimId: string, note: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        const newAct = {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: getRoleName(currentRole),
          action: 'Follow-Up Note',
          note,
        };
        return {
          ...c,
          lastActivityDate: new Date().toISOString().split('T')[0],
          timeline: [...c.timeline, newAct],
        };
      })
    );
    addAuditLog('CLAIM_FOLLOW_UP', `Claim ${claimId}`, undefined, note);
  };

  const handleToggleClaimTask = (claimId: string, taskId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id !== claimId) return c;
        return {
          ...c,
          tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        };
      })
    );
  };

  // --- Handlers: M-Pesa & Payments ---
  const handleStkPaymentComplete = (trans: MpesaTransaction) => {
    setMpesaTransactions((prev) => [trans, ...prev]);

    if (trans.allocatedPolicies && trans.allocatedPolicies.length > 0) {
      const polAlloc = trans.allocatedPolicies[0];
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.policyNumber === polAlloc.policyNumber) {
            const updatedPaid = p.premiumPaidKES + polAlloc.amountKES;
            const isPaid = updatedPaid >= p.totalPayableKES;
            return {
              ...p,
              premiumPaidKES: updatedPaid,
              paymentStatus: isPaid ? 'Paid' : 'Partly paid',
            };
          }
          return p;
        })
      );
    }

    addAuditLog(
      'MPESA_STK_PAYMENT',
      `Receipt ${trans.receiptCode} (${trans.payerName})`,
      'Initiated',
      `Completed ${formatKES(trans.amountKES)}`
    );
  };

  const handleAllocateTransaction = (
    transId: string,
    allocations: { policyNumber: string; amountKES: number }[]
  ) => {
    const txn = mpesaTransactions.find((t) => t.id === transId);
    if (!txn) return;

    setMpesaTransactions((prev) =>
      prev.map((t) =>
        t.id === transId
          ? {
              ...t,
              status: 'Allocated',
              allocatedPolicies: allocations,
            }
          : t
      )
    );

    // Update policies
    allocations.forEach((alloc) => {
      setPolicies((prev) =>
        prev.map((p) => {
          if (p.policyNumber.toLowerCase() === alloc.policyNumber.toLowerCase()) {
            const newPaid = p.premiumPaidKES + alloc.amountKES;
            return {
              ...p,
              premiumPaidKES: newPaid,
              paymentStatus: newPaid >= p.totalPayableKES ? 'Paid' : 'Partly paid',
            };
          }
          return p;
        })
      );
    });

    addAuditLog(
      'ALLOCATE_PAYMENT',
      `M-Pesa ${txn.receiptCode} (${formatKES(txn.amountKES)})`,
      'Unallocated',
      `Allocated to ${allocations.map((a) => a.policyNumber).join(', ')}`
    );
  };

  const handleManualPayment = (receipt: PaymentReceipt, updatedPolicy: Policy) => {
    setPolicies((prev) => prev.map((p) => (p.id === updatedPolicy.id ? updatedPolicy : p)));
    setSelectedPolicyForReceipt(updatedPolicy);
    setSelectedReceiptForPrint(receipt);
    setIsPrintReceiptOpen(true);
    addAuditLog(
      'RECORD_MANUAL_PAYMENT',
      `Receipt ${receipt.receiptNumber} (${receipt.policyNumber})`,
      undefined,
      `${receipt.paymentMethod}: ${formatKES(receipt.amountKES)}`
    );
  };

  // --- Handlers: Messaging ---
  const handleSaveTemplate = (updated: MessageTemplate) => {
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    addAuditLog('UPDATE_TEMPLATE', `Template ${updated.title}`);
  };

  const handleToggleAutomation = (ruleId: string) => {
    setAutomationRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    addAuditLog('TOGGLE_AUTOMATION_RULE', `Rule ${ruleId}`);
  };

  const handleRetryMessage = (logId: string) => {
    setMessageLogs((prev) =>
      prev.map((m) =>
        m.id === logId
          ? { ...m, status: 'Sent', retryCount: (m.retryCount || 0) + 1 }
          : m
      )
    );
    addAuditLog('RETRY_MESSAGE', `Message ${logId}`);
  };

  const handleSendMessage = (logItem: {
    clientName: string;
    phone: string;
    channel: 'SMS' | 'WhatsApp';
    templateTitle: string;
    renderedText: string;
  }) => {
    const newLog: MessageLog = {
      id: `msg-${Date.now()}`,
      clientName: logItem.clientName,
      phone: logItem.phone,
      channel: logItem.channel,
      templateTitle: logItem.templateTitle,
      renderedText: logItem.renderedText,
      status: 'Delivered',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sender: getRoleName(currentRole),
      retryCount: 0,
    };
    setMessageLogs((prev) => [newLog, ...prev]);
    addAuditLog('SEND_DIRECT_MESSAGE', `${logItem.channel} to ${logItem.clientName} (${logItem.phone})`);
  };

  const handleDispatchBulk = (
    messages: {
      clientName: string;
      phone: string;
      channel: 'SMS' | 'WhatsApp';
      templateTitle: string;
      renderedText: string;
    }[]
  ) => {
    const newLogs: MessageLog[] = messages.map((m, idx) => ({
      id: `msg-${Date.now()}-${idx}`,
      clientName: m.clientName,
      phone: m.phone,
      channel: m.channel,
      templateTitle: m.templateTitle,
      renderedText: m.renderedText,
      status: 'Delivered',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      sender: 'System Automation',
      retryCount: 0,
    }));
    setMessageLogs((prev) => [...newLogs, ...prev]);
    addAuditLog(
      'BULK_DISPATCH_COMPLETED',
      `${messages.length} renewal notices dispatched`,
      undefined,
      'Skipped opted-out clients per Kenya ODPC Data Protection Act'
    );
  };

  // --- Handlers: Finance ---
  const handleResolveVariance = (recId: string) => {
    setCommissions((prev) =>
      prev.map((c) =>
        c.id === recId
          ? { ...c, status: 'Matched', varianceKES: 0, remittedCommissionKES: c.contractCommissionKES }
          : c
      )
    );
    addAuditLog('RESOLVE_COMMISSION_VARIANCE', `Commission Entry ${recId}`);
  };

  // --- Counters for Sidebar ---
  const urgentRenewalsCount = policies.filter(
    (p) => p.daysToExpiry <= 14 && p.daysToExpiry >= 0 && p.status !== 'Renewed'
  ).length;
  const openClaimsCount = claims.filter(
    (c) => c.status !== 'Settled' && c.status !== 'Closed'
  ).length;
  const unallocatedMpesaCount = mpesaTransactions.filter(
    (t) => t.status === 'Unallocated'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <Header
        currentRole={currentRole}
        setCurrentRole={(r) => {
          setCurrentRole(r);
          addAuditLog('ROLE_SWITCH', `Switched to ${getRoleName(r)}`);
        }}
        activeModule={activeModule}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isSensitiveUnmasked={isSensitiveUnmasked}
        onToggleUnmaskSensitive={handleToggleUnmaskSensitive}
        onOpenReportPack={() => setIsReportPackOpen(true)}
        onOpenStkPush={() => setIsStkPushOpen(true)}
        onOpenNewPolicy={() => setIsNewPolicyOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          currentRole={currentRole}
          urgentRenewalsCount={urgentRenewalsCount}
          openClaimsCount={openClaimsCount}
          unallocatedMpesaCount={unallocatedMpesaCount}
          onOpenReportPack={() => setIsReportPackOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* VIEW ROUTING */}
            {activeModule === 'dashboard' && (
              <DashboardView
                currentRole={currentRole}
                policies={policies}
                claims={claims}
                mpesaTransactions={mpesaTransactions}
                endorsements={endorsements}
                onNavigate={(mod) => setActiveModule(mod)}
                onOpenSendReminder={(pol) => {
                  setSelectedPolicyForSend(pol);
                  setIsSendTemplateOpen(true);
                }}
                onOpenRenewModal={(pol) => {
                  setSelectedPolicyForRenewal(pol);
                  setIsRenewalWorkflowOpen(true);
                }}
                onOpenStkPush={() => setIsStkPushOpen(true)}
                onOpenReportPack={() => setIsReportPackOpen(true)}
              />
            )}

            {activeModule === 'clients' && (
              <ClientsView
                clients={clients}
                policies={policies}
                claims={claims}
                messageLogs={messageLogs}
                searchQuery={searchQuery}
                isSensitiveUnmasked={isSensitiveUnmasked}
                onOpenNewClient={() => setIsNewClientOpen(true)}
                onSelectClient={handleOpenClientDetail}
              />
            )}

            {activeModule === 'policies' && (
              <PoliciesView
                policies={policies}
                clients={clients}
                insurers={SEED_INSURERS}
                onOpenNewPolicy={() => setIsNewPolicyOpen(true)}
                onOpenRenewalWorkflow={(pol) => {
                  setSelectedPolicyForRenewal(pol);
                  setIsRenewalWorkflowOpen(true);
                }}
                onOpenStkPush={() => setIsStkPushOpen(true)}
                onOpenManualPayment={(pol) => {
                  setSelectedPolicyForManualPayment(pol);
                  setIsManualPaymentOpen(true);
                }}
                onOpenPrintReceipt={(pol) => {
                  setSelectedPolicyForReceipt(pol);
                  setSelectedReceiptForPrint(null);
                  setIsPrintReceiptOpen(true);
                }}
                onOpenSendTemplate={(pol) => {
                  setSelectedPolicyForSend(pol);
                  setIsSendTemplateOpen(true);
                }}
                onOpenNewEndorsement={() => setIsNewEndorsementOpen(true)}
              />
            )}

            {activeModule === 'endorsements' && (
              <EndorsementsView
                endorsements={endorsements}
                policies={policies}
                onOpenNewEndorsement={() => setIsNewEndorsementOpen(true)}
                onTransitionStatus={handleTransitionEndorsement}
              />
            )}

            {activeModule === 'claims' && (
              <ClaimsView
                claims={claims}
                policies={policies}
                onOpenNewClaim={() => setIsNewClaimOpen(true)}
                onUpdateStatus={handleUpdateClaimStatus}
                onToggleChecklist={handleToggleChecklist}
                onAddTimelineNote={handleAddTimelineNote}
                onToggleClaimTask={handleToggleClaimTask}
              />
            )}

            {activeModule === 'mpesa' && (
              <MpesaPaymentsView
                currentRole={currentRole}
                transactions={mpesaTransactions}
                policies={policies}
                onOpenStkPush={() => setIsStkPushOpen(true)}
                onOpenManualPayment={() => {
                  setSelectedPolicyForManualPayment(policies[0]);
                  setIsManualPaymentOpen(true);
                }}
                onAllocateTransaction={handleAllocateTransaction}
                onMarkReconciled={() => {
                  addAuditLog('DAILY_RECONCILIATION_CONFIRMED', 'M-Pesa Ledger Reconciled to Bank Statement');
                }}
                onPrintReceipt={(trans) => {
                  const matchingPol = policies.find((p) => p.policyNumber === trans.accountReference) || policies[0];
                  setSelectedPolicyForReceipt(matchingPol);
                  setSelectedReceiptForPrint({
                    id: `rcp-${Date.now()}`,
                    receiptNumber: `RCP-${trans.receiptCode}`,
                    clientId: matchingPol.clientId,
                    clientName: trans.payerName,
                    policyNumber: matchingPol.policyNumber,
                    amountKES: trans.amountKES,
                    paymentMethod: 'M-Pesa Paybill (400200)',
                    paymentReference: trans.receiptCode,
                    paymentDate: trans.timestamp.split(' ')[0],
                    matchedStatus: 'Reconciled',
                    receivedBy: getRoleName(currentRole),
                    allocatedToPremium: trans.amountKES,
                  });
                  setIsPrintReceiptOpen(true);
                }}
              />
            )}

            {activeModule === 'messaging' && (
              <MessagingView
                currentRole={currentRole}
                templates={templates}
                automationRules={automationRules}
                messageLogs={messageLogs}
                policies={policies}
                clients={clients}
                onSaveTemplate={handleSaveTemplate}
                onToggleAutomation={handleToggleAutomation}
                onRetryMessage={handleRetryMessage}
                onOpenBulkSend={() => setIsBulkSendOpen(true)}
              />
            )}

            {activeModule === 'finance' && (
              <FinanceView
                policies={policies}
                debitCreditNotes={debitCreditNotes}
                commissions={commissions}
                onResolveVariance={handleResolveVariance}
                onOpenReportPack={() => setIsReportPackOpen(true)}
              />
            )}

            {activeModule === 'audit' && (
              <AuditLogView currentRole={currentRole} auditLogs={auditLogs} />
            )}

            {activeModule === 'settings' && (
              <SettingsView
                settings={settings}
                onUpdateSettings={(newSettings: AgencySettings) => {
                  setSettings(newSettings);
                  setStatutoryConfig(newSettings.statutoryConfig);
                  addAuditLog('UPDATE_SETTINGS', 'Agency Settings & Statutory Levies Updated');
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* MODALS */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onAddClient={handleAddClient}
      />

      <ClientDetailModal
        isOpen={isClientDetailOpen}
        onClose={() => setIsClientDetailOpen(false)}
        client={selectedClientForDetail}
        policies={policies}
        claims={claims}
        transactions={mpesaTransactions}
        messageLogs={messageLogs}
        isSensitiveUnmasked={isSensitiveUnmasked}
      />

      <NewPolicyModal
        isOpen={isNewPolicyOpen}
        onClose={() => setIsNewPolicyOpen(false)}
        clients={clients}
        insurers={SEED_INSURERS}
        onAddPolicy={handleAddPolicy}
      />

      <RenewalWorkflowModal
        isOpen={isRenewalWorkflowOpen}
        onClose={() => setIsRenewalWorkflowOpen(false)}
        policy={selectedPolicyForRenewal}
        statutoryConfig={statutoryConfig}
        onIssueRenewal={handleIssueRenewal}
      />

      <NewEndorsementModal
        isOpen={isNewEndorsementOpen}
        onClose={() => setIsNewEndorsementOpen(false)}
        policies={policies}
        onAddEndorsement={handleAddEndorsement}
      />

      <NewClaimModal
        isOpen={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        policies={policies}
        onAddClaim={handleAddClaim}
      />

      <StkPushModal
        isOpen={isStkPushOpen}
        onClose={() => setIsStkPushOpen(false)}
        policies={policies}
        onCompletePayment={handleStkPaymentComplete}
      />

      <ManualPaymentModal
        isOpen={isManualPaymentOpen}
        onClose={() => setIsManualPaymentOpen(false)}
        policy={selectedPolicyForManualPayment}
        onRecordPayment={handleManualPayment}
      />

      <PrintReceiptModal
        isOpen={isPrintReceiptOpen}
        onClose={() => setIsPrintReceiptOpen(false)}
        policy={selectedPolicyForReceipt}
        receipt={selectedReceiptForPrint}
      />

      <SendTemplateModal
        isOpen={isSendTemplateOpen}
        onClose={() => setIsSendTemplateOpen(false)}
        policy={selectedPolicyForSend}
        templates={templates}
        onSendMessage={handleSendMessage}
      />

      <BulkSendModal
        isOpen={isBulkSendOpen}
        onClose={() => setIsBulkSendOpen(false)}
        policies={policies}
        clients={clients}
        templates={templates}
        onDispatchBulk={handleDispatchBulk}
      />

      <ReportPackModal
        isOpen={isReportPackOpen}
        onClose={() => setIsReportPackOpen(false)}
        policies={policies}
        claims={claims}
        transactions={mpesaTransactions}
        commissions={commissions}
        onLogExport={(moduleName, rowCount) => {
          addAuditLog('EXPORT_REPORT_PACK', `Management Pack: ${moduleName} (${rowCount} rows)`);
        }}
      />
    </div>
  );
}
