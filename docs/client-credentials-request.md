# Results Roofing - Credentials & Access Request

**Date:** January 26, 2026
**Project:** Results Roofing Website Overhaul (MVP B)
**Status:** Development ~52% complete - awaiting third-party credentials to continue

---

## Overview

The Results Roofing self-service quote platform is progressing well. We've completed the core infrastructure, quote flow, payment integration, and customer portal. However, several features are blocked pending access to third-party services.

To continue development and enable full functionality, we need the following credentials and account access.

---

## Critical - Required for MVP Launch

These credentials are blocking core features that customers will use.

### 1. Roofr (Satellite Roof Measurements)

| Item | Details |
|------|---------|
| **What we need** | API Key |
| **Environment variable** | `ROOFR_API_KEY` |
| **Why it's needed** | Enables live satellite roof measurements for accurate quotes |
| **Current state** | Using mock measurements for development |
| **Sign up** | https://roofr.com |

---

### 2. JobNimbus (CRM Integration)

| Item | Details |
|------|---------|
| **What we need** | API Key |
| **Environment variable** | `JOBNIMBUS_API_KEY` |
| **Why it's needed** | Syncs leads and jobs to your CRM for sales follow-up |
| **Current state** | CRM sync disabled |
| **Sign up** | Contact your JobNimbus account rep for API access |

---

### 3. Documenso (E-Signatures)

| Item | Details |
|------|---------|
| **What we need** | API Key |
| **Environment variable** | `DOCUMENSO_API_KEY` |
| **Why it's needed** | Allows customers to e-sign contracts online |
| **Current state** | Contract signing disabled |
| **Sign up** | https://documenso.com |

---

### 4. Cal.com (Appointment Scheduling)

| Item | Details |
|------|---------|
| **What we need** | API Key + Event Type ID |
| **Environment variables** | `CALCOM_API_KEY`, `CALCOM_EVENT_TYPE_ID` |
| **Why it's needed** | Lets customers book installation appointments |
| **Current state** | Using mock availability slots |
| **Sign up** | https://cal.com |

**Setup notes:**
- Create an event type for "Roof Installation" appointments
- Configure your team's availability
- Provide the Event Type ID from the event settings

---

### 5. Wisetack (Financing)

| Item | Details |
|------|---------|
| **What we need** | Merchant ID + API Key |
| **Environment variables** | `WISETACK_MERCHANT_ID`, `WISETACK_API_KEY` |
| **Why it's needed** | Enables customer financing pre-qualification |
| **Current state** | Financing options disabled |
| **Sign up** | https://wisetack.com (requires merchant partnership) |

**Setup notes:**
- Wisetack requires a merchant partnership agreement
- Contact their sales team to set up your account
- This may take 1-2 weeks for approval

---

## Analytics & Tracking

These enable marketing attribution and conversion tracking.

### 6. Google Analytics 4

| Item | Details |
|------|---------|
| **What we need** | Measurement ID + API Secret |
| **Environment variables** | `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` |
| **Why it's needed** | Tracks website traffic, conversions, and marketing ROI |
| **How to get it** | Google Analytics > Admin > Data Streams > Your Stream |

---

### 7. Google Tag Manager

| Item | Details |
|------|---------|
| **What we need** | Container ID |
| **Environment variable** | `GTM_CONTAINER_ID` |
| **Why it's needed** | Manages all marketing tags in one place |
| **How to get it** | GTM > Admin > Container Settings |

---

### 8. Meta/Facebook (Optional)

| Item | Details |
|------|---------|
| **What we need** | Pixel ID + Conversions API Token |
| **Environment variables** | `META_PIXEL_ID`, `META_CAPI_TOKEN` |
| **Why it's needed** | Facebook/Instagram ad conversion tracking |
| **How to get it** | Meta Business Suite > Events Manager |

---

## Communications

These enable customer notifications.

### 9. SignalWire (SMS Notifications)

| Item | Details |
|------|---------|
| **What we need** | Project ID, API Token, Space URL |
| **Environment variables** | `SIGNALWIRE_PROJECT_ID`, `SIGNALWIRE_API_TOKEN`, `SIGNALWIRE_SPACE_URL` |
| **Why it's needed** | Sends SMS updates to customers (quote ready, appointment reminders) |
| **Sign up** | https://signalwire.com |

---

### 10. Resend (Email Delivery)

| Item | Details |
|------|---------|
| **What we need** | API Key |
| **Environment variable** | `RESEND_API_KEY` |
| **Why it's needed** | Sends transactional emails (confirmations, receipts) |
| **Sign up** | https://resend.com |

---

## Infrastructure

### 11. Clerk (Authentication)

| Item | Details |
|------|---------|
| **What we need** | Publishable Key + Secret Key |
| **Environment variables** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| **Why it's needed** | Secures customer portal login |
| **Current state** | Using development bypass |
| **Sign up** | https://clerk.com |

---

### 12. Google Places API

| Item | Details |
|------|---------|
| **What we need** | API Key |
| **Environment variable** | `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` |
| **Why it's needed** | Address autocomplete when customers enter their address |
| **How to get it** | Google Cloud Console > APIs & Services > Credentials |

---

### 13. Domain & Hosting Access

| Item | Details |
|------|---------|
| **What we need** | DNS provider login OR ability to update DNS records |
| **Why it's needed** | Point domain to new website, configure SSL |
| **Current state** | Awaiting domain confirmation |

---

## Optional / Enhanced Features

These are nice-to-have but not required for MVP launch.

| Service | Credentials | Purpose |
|---------|-------------|---------|
| **Hearth** | `HEARTH_API_KEY` | Alternative financing for projects over $25K |
| **Upstash Redis** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Rate limiting for API protection |

---

## How to Send Credentials Securely

**Do NOT send credentials via regular email.**

Please use one of these secure methods:

1. **1Password / LastPass** - Share via secure vault
2. **Doppler** - Invite us to your project
3. **Encrypted email** - Use ProtonMail or similar
4. **Secure document** - Password-protected PDF (send password separately via text)

---

## Priority Order

If you need to set these up in phases, here's the recommended priority:

### Phase 1 - Core Quote Flow
1. Roofr (measurements)
2. Clerk (authentication)
3. Google Places (address entry)

### Phase 2 - Transactions
4. Documenso (e-signatures)
5. Cal.com (scheduling)
6. Wisetack (financing)

### Phase 3 - Operations
7. JobNimbus (CRM)
8. SignalWire (SMS)
9. Resend (email)

### Phase 4 - Analytics
10. GA4 + GTM
11. Meta (if running Facebook ads)

---

## Questions?

If you have questions about any of these services or need help setting up accounts, please let us know. We're happy to schedule a call to walk through the setup process.

---

*Document generated: January 26, 2026*
