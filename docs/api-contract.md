# Goldfinch InsureERP — Backend API Contract

This document specifies the REST and Webhook endpoints required by the InsureERP frontend for a production backend (NestJS/Django/Node).

---

## 1. Safaricom M-Pesa Daraja Integration

All M-Pesa API credentials (Consumer Key, Consumer Secret, Passkey, Shortcode) are strictly stored server-side.

### 1.1 Initiate STK Push (Lipa Na M-Pesa Online)
- **Endpoint**: `POST /api/mpesa/stkpush`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "policyNumber": "BRT/MOT/2025/08941",
    "phoneNumber": "254721445901",
    "amountKES": 87432,
    "accountReference": "BRT/MOT/2025/08941",
    "transactionDesc": "Goldfinch Insurance Renewal"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "merchantRequestId": "29115-9922011-1",
    "checkoutRequestId": "ws_CO_02112026084419921",
    "responseCode": "0",
    "responseDescription": "Success. Request accepted for processing",
    "customerMessage": "Success. Request accepted for processing"
  }
  ```

### 1.2 STK Push Callback (Webhook from Safaricom)
- **Endpoint**: `POST /api/mpesa/stk-callback`
- **Security**: Validated via IP whitelisting (Safaricom Daraja IPs) & timestamp.
- **Payload Example (Success)**:
  ```json
  {
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "29115-9922011-1",
        "CheckoutRequestID": "ws_CO_02112026084419921",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            { "Name": "Amount", "Value": 87431.5 },
            { "Name": "MpesaReceiptNumber", "Value": "SJD8201KPL" },
            { "Name": "TransactionDate", "Value": 20261031142210 },
            { "Name": "PhoneNumber", "Value": 254721445901 }
          ]
        }
      }
    }
  }
  ```
- **Duplicate Protection**:
  The backend verifies `MpesaReceiptNumber` against existing transactions. If already recorded, returns `HTTP 200` idempotently without duplicate entry.

### 1.3 C2B Paybill Confirmation (Webhook from Safaricom)
- **Endpoint**: `POST /api/mpesa/c2b-confirmation`
- **Payload**:
  ```json
  {
    "TransactionType": "Pay Bill",
    "TransID": "QFK19284ZN",
    "TransTime": "20261030091540",
    "TransAmount": "246142.50",
    "BusinessShortCode": "522123",
    "BillRefNumber": "JUB/MED/2026/0411",
    "MSISDN": "254722710405",
    "FirstName": "AMINA",
    "LastName": "SAID"
  }
  ```
- **Auto-matching logic**:
  1. Exact match on `BillRefNumber` against policy or debit note numbers.
  2. Fallback match on `MSISDN` (phone number) + `TransAmount`.
  3. If matched, status is set to `Allocated`. Otherwise, deposited into the **Unallocated Payments Inbox** for manual allocation.

---

## 2. SMS & WhatsApp Messaging API

### 2.1 Send Single SMS (Africa's Talking / Twilio)
- **Endpoint**: `POST /api/messaging/send-sms`
- **Request Body**:
  ```json
  {
    "recipientPhone": "+254721445901",
    "message": "Dear Johnstone Kamau, your policy BRT/MOT/2025/08941 expires in 7 days...",
    "templateId": "tpl-ren-7-en",
    "senderId": "GOLDFINCH"
  }
  ```

### 2.2 Send WhatsApp Message (Meta Cloud API)
- **Endpoint**: `POST /api/messaging/send-whatsapp`
- **Request Body**:
  ```json
  {
    "recipientPhone": "+254721445901",
    "templateName": "renewal_reminder_30d_v1",
    "language": "en",
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "Johnstone Kamau" },
          { "type": "text", "text": "BRT/MOT/2025/08941" },
          { "type": "text", "text": "09 Nov 2026" }
        ]
      }
    ]
  }
  ```

### 2.3 Bulk Send with Opt-out Filtering
- **Endpoint**: `POST /api/messaging/bulk-send`
- **Request Body**:
  ```json
  {
    "policyIds": ["pol-001", "pol-002", "pol-003"],
    "templateId": "tpl-ren-14-en",
    "channel": "WhatsApp"
  }
  ```
- **Backend Behavior**:
  Evaluates each client's `smsOptOut` flag and quiet hours setting (`20:00 - 07:00 EAT`). Dispatches to eligible clients and returns:
  ```json
  {
    "totalRequested": 3,
    "sentCount": 2,
    "skippedOptOutCount": 1,
    "queuedMessageIds": ["msg-101", "msg-102"]
  }
  ```

---

## 3. Core Resource Endpoints

- `GET /api/clients` · `POST /api/clients` · `PUT /api/clients/:id`
- `GET /api/policies` · `POST /api/policies` · `PUT /api/policies/:id`
- `GET /api/endorsements` · `POST /api/endorsements` · `POST /api/endorsements/:id/apply`
- `GET /api/claims` · `POST /api/claims` · `PUT /api/claims/:id/status`
- `GET /api/audit-logs` · `POST /api/audit-logs/export`
