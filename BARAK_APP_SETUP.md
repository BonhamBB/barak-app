# Barak-App: How to Run Backend & Frontend

## Summary of Changes

### Backend (real-estate-backend)
- **Property model** (Sequelize): `rentPerSqm`, `mgmtFee`, `arnonaPerSqm`, `isTechDiscount`, `cleaningFee` (default 12), `totalArea`
- **API**: `GET /api/properties` and `GET /api/properties/:id`
- **Seed**: Azrieli - Barak Tower (Rent 180, Mgmt 35, Arnona 32, Area 500, Tech Discount: true)

### Frontend (src)
- **Property cards** show Total Monthly Cost (₪) when financial fields exist
- **Listing details** show full cost breakdown (Rent, Mgmt, Arnona, Cleaning)
- **Azrieli - Barak Tower** appears in listings and home page

---

## Prerequisites

- **Node.js** (v18+)
- **PostgreSQL** running with database `real_estate_db`
- Backend config: `real-estate-backend/src/config/database.ts` (username, password, host)

---

## 1. Run the Backend

```bash
cd real-estate-backend
npm install
npm run seed    # Seed Azrieli - Barak Tower (run once)
npm start      # Start server on port 5000
```

- API base: `http://localhost:5000`
- Properties: `GET http://localhost:5000/api/properties`

---

## 2. Run the Frontend

```bash
# From project root (Barak app folder)
npm install
npm run dev
```

- App: `http://localhost:3000`

---

## 3. See the Changes

1. **Home page**: Azrieli - Barak Tower appears with **Total Monthly Cost** (₪102,847/mo) and "Tech Discount" badge.
2. **Listings** (`/listing_01`): Same card with financial summary.
3. **Listing details** (`/listing_details_01`): Click Azrieli, then open details to see the full **Monthly Cost Breakdown** (Rent, Mgmt, Arnona, Cleaning, Total).

---

## Total Monthly Cost Formula

- **Rent** = rentPerSqm × totalArea  
- **Arnona** = arnonaPerSqm × totalArea (with 20% discount if `isTechDiscount`)  
- **Total** = Rent + mgmtFee + Arnona + cleaningFee

For Azrieli: 90,000 + 35 + 12,800 + 12 = **₪102,847/mo**

---

## 4. SalesGPT Engine (SDR)

The SalesGPT conversation logic is ported to TypeScript and runs natively in the backend.

### Setup

Add to `real-estate-backend/.env`:

```
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=Barak <your-email@gmail.com>
```

Run migration for email column: `npm run migrate:email`

### API

- **Generate opening email**: `POST /api/salesgpt/generate-opening`  
  Body: `{ "clientSlug": "azrieli-barak-tower" }`
- **Chat turn**: `POST /api/salesgpt/chat`  
  Body: `{ "clientSlug": "...", "userMessage": "..." }`

### SDR Script

```bash
cd real-estate-backend
npm run generate-email -- azrieli-barak-tower
```

### Sales Stages (from original SalesGPT)

1. Introduction  
2. Qualification  
3. Value proposition  
4. Needs analysis  
5. Solution presentation  
6. Objection handling  
7. Close  
8. End conversation  

The engine loads client + properties from the DB and injects the dashboard link when the agent reaches Solution presentation or Close.
