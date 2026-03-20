# Barak-App System Audit

**Date:** March 2025  
**Purpose:** Full system audit for AI collaborator (Gemini) sync. Identifies current state and gaps for the "Enter Email → Send Dashboard" flow.

---

## 1. Database

### Tables (Sequelize models)

| Table       | Model   | Key Fields                                                                 |
|------------|---------|----------------------------------------------------------------------------|
| `users`    | User    | name, email, password, termsAccepted, firstName, lastName, phoneNumber, about |
| `clients`  | Client  | **unique_slug** (unique), displayName                                      |
| `properties` | Property | **clientId** (FK → clients), title, address, rentPerSqm, mgmtFee, arnonaPerSqm, totalArea, isTechDiscount, cleaningFee, addedBy |

### Relationships

- **Property → Client**: `clientId` FK, `BelongsTo` Client. One client has many properties.
- **Client**: No FK to User. Clients are standalone (company records).

### Gaps (updated)

- ~~Client has no `email` field~~ **DONE** – `email` added. Run `npm run migrate:email`.
- No `emails_sent` / `emails_opened` tracking for SDR metrics (mentioned in original Admin spec).

---

## 2. Routes & Pages

### Backend API (Express, port 5000)

| Method | Route | Purpose |
|--------|-------|---------|
| POST   | /api/auth/* | Auth (login, signup) |
| GET/PUT | /api/profile | Protected profile |
| GET    | /api/properties | List all properties |
| POST   | /api/properties | Create property (admin) |
| GET    | /api/properties/:id | Get property by ID |
| GET    | /api/clients | List clients |
| POST   | /api/clients | Create client |
| GET    | /api/clients/:slug | Get client by slug |
| GET    | /api/clients/:slug/properties | Get properties for client |
| POST   | /api/clients/:slug/properties | Client adds property (no auth) |
| POST   | /api/salesgpt/generate-opening | Generate opening email text |
| POST   | /api/salesgpt/chat | Chat turn with SalesGPT |

### Frontend (Next.js App Router)

| Route | Purpose |
|-------|---------|
| `/` | Home |
| `/admin` | Admin: Add property form |
| `/admin/clients` | Admin: Create clients, copy dashboard links |
| `/dashboard/[slug]` | **Client Dashboard** – dynamic, shows properties for client by slug (no login) |
| `/dashboard/dashboard-index` | User dashboard (legacy) |
| `/dashboard/profile`, `/dashboard/add-property`, etc. | User dashboard pages |
| `/listing_01` … `/listing_17` | Listing pages |
| `/listing_details_01` … `06` | Listing detail pages |

### Active flows

- **Admin**: Create client → Add properties → Copy dashboard link manually.
- **Client**: Visit `/dashboard/{slug}` → See properties → Add own properties for comparison.
- **SalesGPT**: API generates opening text; script prints to console. **No email is sent.**

---

## 3. SDR (SalesGPT Engine)

### Implementation

- **Location**: `real-estate-backend/src/services/SalesGPTEngine.ts`
- **Status**: Implemented in TypeScript.
- **Dependencies**: `openai` package, `OPENAI_API_KEY` in env.

### Features

- All 8 Sales Stages ported from Python SalesGPT.
- Stage Analyzer + Sales Agent prompts.
- `loadClientContext(clientSlug, baseUrl)` – loads client + properties from DB, injects dashboard link.
- `generateOpening()` – first-turn message.
- `chat(userMessage)` – multi-turn conversation.
- API: `POST /api/salesgpt/generate-opening`, `POST /api/salesgpt/chat`.
- Script: `npm run generate-email -- <clientSlug>` – outputs email draft to **console only**.

### Gaps

- **No actual email sending.** Script and API only return text.
- No integration with an email provider (Nodemailer, Resend, SendGrid, etc.).

---

## 4. Gaps for "Enter Email → Send Dashboard" Flow

To make this flow work end-to-end:

| # | Gap | What's needed |
|---|-----|---------------|
| 1 | ~~Client has no email~~ | **DONE** – `email` added to Client. |
| 2 | ~~No email sending~~ | **DONE** – `emailService.ts` with Nodemailer. |
| 3 | ~~No "Send Dashboard" action~~ | **DONE** – Magic Onboard: `POST /api/clients/magic-onboard`, Admin UI with email input + Send. |
| 4 | **No SDR metrics** | Optional: `emails_sent`, `emails_opened` (or similar) on Client or a new `EmailLog` table for tracking. |
| 5 | **API base URL** | Frontend `api.ts` uses `http://localhost:5000/api`. Ensure CORS and env for production. |

---

## 5. Summary for Gemini (AI Collaborator)

**Current state**

- **DB**: `users`, `clients` (unique_slug, displayName), `properties` (clientId, financial fields). Property → Client linked. Client has no email.
- **Admin**: `/admin` (add property), `/admin/clients` (create client, copy link). No email input or send.
- **Client Dashboard**: `/dashboard/[slug]` – works, no login. Shows properties + Tech Discount breakdown.
- **SalesGPT**: TypeScript engine in `SalesGPTEngine.ts`. Generates opening + chat. Loads client/properties from DB, injects dashboard link. API + script exist. **No email is sent.**

**To complete "Enter Email → Send Dashboard"**

1. Add `email` to Client.
2. Add email provider (e.g. Resend) and send service.
3. Add Admin UI: email field + "Send Dashboard" button.
4. Add backend endpoint: generate opening + send email with dashboard link.
5. (Optional) Add SDR metrics (emails sent/opened).

**Tech stack**

- Backend: Node.js, Express, Sequelize, PostgreSQL, OpenAI.
- Frontend: Next.js 14, React, Redux.
- SalesGPT: Ported to TypeScript, uses OpenAI API.
