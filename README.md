# MedCare+ | Digital Healthcare Ecosystem

MedCare+ is a unified, state-of-the-art digital healthcare platform built with a modern React frontend and a Node.js Express backend. Designed to address the demands of the modern health-tech ecosystem, MedCare+ integrates telemedicine, e-pharmacy, lab diagnostics, and health insurance under a single secure, type-safe portal.

---

## 🚀 Key Features

*   **👨‍⚕️ Telemedicine & Consultations**: Browse specialist doctors, filter by department, schedule virtual video consultation rooms, and track upcoming appointments.
*   **💊 E-Pharmacy Portal**: Complete online medicine catalog, shopping cart flow, prescription file upload validator, and mock credit card checkouts.
*   **🧪 Diagnostic Reports Vault**: Browse health packages, schedule pathology collections, track lab analysis, and download certified pathology reports.
*   **🛡️ Health Insurance checkout & Claims**: Compare coverage (Basic, Family, and Senior Shield), pay premium cycles via a secure Stripe checkout sheet, file reimbursement claims, and track claim approval status ledger in real-time.
*   **🤖 AI Symptom Assistant**: Contextual chatbot assistant to verify symptoms and suggest diagnostic options.

---

## 🛠️ Technology Stack

### **Frontend**
*   **Framework**: React (v19)
*   **Language**: TypeScript (Type-Safe Component Architecture)
*   **Build Tool**: Vite (Ultra-fast Hot Module Replacement)
*   **Styling**: Tailwind CSS (Harmonious Slate Theme)
*   **State Management**: Zustand
*   **Animations**: Framer Motion
*   **Icons**: Lucide React

### **Backend**
*   **Runtime**: Node.js
*   **Framework**: Express with TypeScript compilation
*   **Database**: SQLite
*   **ORM**: Prisma Client
*   **Authentication**: JWT Session Auth & Password Hashing

---

## 📂 Project Directory Structure

```text
medcare-plus/
├── backend/
│   ├── prisma/
│   │   ├── dev.db              # Local SQLite Database
│   │   ├── schema.prisma       # Database Schema definitions
│   │   └── seed.ts             # Default mock accounts & data seeder
│   ├── src/
│   │   ├── controllers/        # Express route controllers
│   │   ├── middleware/         # JWT Auth, Rate limiting & Error handlers
│   │   ├── routes/             # API Endpoints (Auth, Catalog, Payments)
│   │   ├── utils/              # JWT & hashing utility helpers
│   │   └── app.ts              # Application initialization
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
│   │   ├── App.tsx             # React-Router-DOM routing declarations
│   │   └── main.tsx            # DOM mounting
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## ⚙️ Getting Started

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
Configure the local SQLite schema and seed mock accounts:
```bash
cd ../backend
npx prisma migrate dev --name init
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

## 📦 Production Builds

Verify that both projects compile successfully for production release:

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build
```
