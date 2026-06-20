# MedCare+ | Digital Healthcare Ecosystem

MedCare+ is a unified, state-of-the-art digital healthcare platform built with a modern React frontend, a Node.js Express backend, and a PostgreSQL database. Designed to address the demands of the modern health-tech ecosystem, MedCare+ integrates telemedicine, e-pharmacy, lab diagnostics, and health insurance under a single secure, type-safe portal.

---

## 🚀 Key Features

*   **👨‍⚕️ Telemedicine & Consultations**: Browse specialist doctors, filter by department, schedule virtual video consultation rooms, and track upcoming appointments.
*   **💊 E-Pharmacy Portal**: Complete online medicine catalog, shopping cart flow, prescription file upload validator, and mock credit card checkouts.
*   **🧪 Diagnostic Reports Vault**: Browse health packages, schedule pathology collections, track lab analysis, and download certified pathology reports.
*   **🛡️ Health Insurance Checkout & Claims**: Compare coverage (Basic, Family, and Senior Shield), pay premium cycles via a secure Stripe checkout sheet, file reimbursement claims, and track claim approval status ledger in real-time.
*   **🤖 AI Symptom Assistant**: Contextual chatbot assistant to verify symptoms and suggest diagnostic options.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework**: React (v19)
*   **Language**: TypeScript (Type-Safe Component Architecture)
*   **Build Tool**: Vite (Ultra-fast Hot Module Replacement)
*   **Styling**: Tailwind CSS (Harmonious Slate Theme)
*   **State Management**: Zustand
*   **Routing**: React Router DOM (Single Page Application routing with Vercel redirection rules)

### **Backend & Database**
*   **Runtime**: Node.js
*   **Framework**: Express with TypeScript compilation
*   **Database**: PostgreSQL (Production-ready via Supabase cloud DB connection pooling)
*   **ORM**: Prisma Client
*   **Authentication**: JWT Session Auth & Password Hashing

---

## 📂 Project Directory Structure

```text
medcare-plus/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma Schema for PostgreSQL
│   │   └── seed.ts             # Default mock accounts & data seeder
│   ├── src/
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # JWT Auth, Rate limiting & Error handlers
│   │   ├── routes/             # API Endpoints (Auth, Catalog, Payments)
│   │   ├── utils/              # JWT & hashing utility helpers
│   │   └── app.ts              # Express server initialization
│   ├── .env.example            # Backend deployment environment variables guide
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Premium reusable UI cards, inputs, buttons
│   │   │   └── layout/         # Navigation Header & Footer structures
│   │   ├── layouts/            # Nested Dashboard & Main routing layouts
│   │   ├── pages/              # App views (Home, Pharmacy, Insurance, etc.)
│   │   ├── store/              # Zustand global application state stores
│   │   ├── utils/
│   │   │   └── api.ts          # Centralized API dynamic URL configuration
│   │   ├── App.tsx             # React-Router-DOM routing declarations
│   │   └── main.tsx            # DOM mounting
│   ├── .env.example            # Frontend deployment environment variables guide
│   ├── vercel.json             # Vercel SPA client rewrite routing rules
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Local Development Setup

### **Prerequisites**
Make sure you have **Node.js** (v18+) and **NPM** installed on your system.

### **1. Clone & Install Dependencies**
```bash
# Clone the repository
git clone https://github.com/rameshreddymrec/medcare-plus.git
cd medcare-plus

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### **2. Setup Database & Seeding**
1. Set up a local or hosted PostgreSQL database.
2. Copy `backend/.env.example` to `backend/.env` and update the `DATABASE_URL` with your PostgreSQL connection string.
3. Configure the PostgreSQL database schema and seed mock accounts:
```bash
cd ../backend
npx prisma db push
npm run seed
```

### **3. Run Development Servers**
Open two terminal windows to run both servers simultaneously:

**Backend Server (Port 5000):**
```bash
cd backend
npm run dev
```

**Frontend Server (Port 5173):**
```bash
cd frontend
npm run dev
```

---

## ☁️ Deployment Instructions

### **1. Database Setup (Supabase)**
- Register a free project on **[Supabase](https://supabase.com)**.
- Under **Project Settings > Database**, copy your PostgreSQL **URI Connection String** (use port 6543 pooler with `pgbouncer=true` for production Express backends).

### **2. Backend Deployment (Render)**
- Create a new **Web Service** on **[Render](https://render.com)** linking this GitHub repo.
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/app.js`
- **Environment Variables**:
  - `DATABASE_URL` = *(your Supabase URI string)*
  - `JWT_SECRET` = *(any secure random text string)*
  - `PORT` = `5000`
  - `NODE_ENV` = `production`
- Once the deployment is live, note down your Render Web Service URL.

### **3. Frontend Deployment (Vercel)**
- Create a new Project on **[Vercel](https://vercel.com)** linking this GitHub repo.
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Environment Variables**:
  - `VITE_API_URL` = *(your live Render API URL ending in `/api/v1`)*
- Click **Deploy**! Vercel's SPA routing configuration in `vercel.json` will automatically load routing requests.
