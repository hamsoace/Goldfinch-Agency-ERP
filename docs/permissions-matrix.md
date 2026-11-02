# Goldfinch InsureERP — Permissions Matrix & RBAC Specification

This document details the role permissions and enforcement rules across the application.

| Permission | Admin / Director | Agent | Accountant | Claims Officer | Read-only Auditor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | Full KPIs | Agent KPIs | Finance KPIs | Claims KPIs | Read-only |
| **View Clients** | Yes | Yes | Yes | Yes | Yes |
| **Edit Clients** | Yes | Yes | No | No | No |
| **View Policies** | Yes | Yes | Yes (Read-only) | Yes (Read-only) | Yes |
| **Edit / Issue Policies** | Yes | Yes | No | No | No |
| **View Endorsements** | Yes | Yes | Yes | No | Yes |
| **Create / Apply Endorsement** | Yes | Yes | No | No | No |
| **View Claims** | Yes | No | No | Yes | Yes |
| **Manage / Settle Claims** | Yes | No | No | Yes | No |
| **View Finance & Commissions** | Yes | No | Yes | No | Yes |
| **Edit Finance & Reconcile** | Yes | No | Yes | No | No |
| **View M-Pesa Transactions** | Yes | No | Yes | No | Yes |
| **Allocate M-Pesa Payments** | Yes | No | Yes | No | No |
| **Send SMS / WhatsApp** | Yes | Yes | No | Yes | No |
| **Manage Message Templates** | Yes | No | No | No | No |
| **View Audit Trail** | Yes | No | No | No | Yes |
| **View Sensitive PII** | Masked (Can Unmask) | Masked | Masked | Masked | Masked |
| **Manage Admin Settings** | Yes | No | No | No | No |
| **Export Excel / CSV** | Yes | Yes (Own Views) | Yes | Yes (Claims) | Yes |

### Sensitive Data Masking Rule
National ID numbers and KRA PINs are displayed masked (e.g. `24****43` and `A00****231B`).
When a user clicks "Unmask", an immutable audit entry (`VIEW_SENSITIVE_RECORD`) is recorded with the user identity, client ID, timestamp, and IP address.
