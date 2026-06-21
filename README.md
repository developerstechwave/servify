<div align="center">

<img src="apps/frontend/public/favicon.svg" width="60" height="60" alt="Servify Logo" />

# Servify

**Multi-Tenant Customer Service Management Platform**

*A cloud-based SaaS platform that enables organisations to manage customer support operations, service subscriptions, and issue tracking through a unified, role-based interface.*

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-active-success)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)

</div>

---

## 📋 Overview

Servify is designed to help organisations of all sizes manage their customer service operations efficiently. Built with a multi-tenant architecture, multiple independent organisations can operate within the same platform while maintaining complete data isolation and security.

The platform supports four distinct user roles — **Super Administrator**, **Organisation Administrator**, **Employee**, and **Customer** — each with tailored dashboards and capabilities.

---

## ✨ Key Features

### 🏢 For Organisations (Admins)
- **Product & Service Management** — Create and manage service offerings that customers can subscribe to
- **Customer Management** — Invite, track, and manage customers with full subscription and issue history
- **Employee Management** — Add employees with auto-generated credentials and role assignments
- **CRM Kanban Board** — Visual ticket management with status tracking across Pending, In Progress, and Resolved columns
- **Issue Tracking** — Full ticket lifecycle management from creation to resolution
- **Payment Management** — Track subscription payments and update statuses
- **Analytics Dashboard** — Real-time stats on customers, tickets, revenue, and performance

### 👤 For Customers
- **Service Subscriptions** — Browse and subscribe to available products and services
- **Issue Reporting** — Submit and track support requests with real-time status updates
- **Payment History** — View payment records and generate printable invoices
- **In-App Notifications** — Real-time updates on ticket assignments and status changes
- **FAQ Centre** — Self-service help across General, Subscriptions, and Transactions categories

### 👨‍💼 For Employees
- **My Tickets** — Personal view of all assigned support tickets
- **CRM Board** — Shared Kanban board for collaborative ticket management
- **Customer Directory** — Read-only access to customer information

### 🔧 For Super Admins
- **Platform Management** — Oversee all organisations on the platform
- **Organisation Onboarding** — Invite and approve new organisations
- **Platform Analytics** — Monitor overall platform health and usage

---

## 🔄 Core Workflow
Super Admin invites an Organisation

↓

Admin registers → sets up Products & Services

↓

Admin invites Customers (CDM token via email)

↓

Customer subscribes to a Service

→ Payment record auto-created (Pending)

↓

Customer submits an Issue / Ticket

→ Admin receives notification

↓

Admin assigns Ticket to Employee

→ Employee receives notification

↓

Employee resolves the Ticket

→ Customer receives notification

↓

Admin marks Payment as Paid

→ Subscription status updates to Current

↓

Customer generates Invoice PDF

---

## 👥 User Roles

| Role | Access Level | Key Capabilities |
|------|-------------|-----------------|
| **Super Admin** | Platform-wide | Manage all organisations, approve/reject join requests |
| **Admin** | Organisation-wide | Full control over org data, customers, employees, and tickets |
| **Employee** | Assigned tickets only | Work on assigned tickets, comment, view customers |
| **Customer** | Own data only | Subscribe to services, submit issues, view payments |

---

## 🏗️ Architecture
┌─────────────────────────────────────────────────────┐

│                      Servify                         │

├─────────────────────┬───────────────────────────────┤

│      Frontend       │           Backend              │

│                     │                               │

│  React 19 + TypeScript  │   NestJS + PostgreSQL     │

│  Vite + Tailwind    │   TypeORM + JWT Auth          │

│  Ant Design v5      │   Nodemailer + Role Guards    │

│  Zustand + Axios    │   Multer + Bcrypt             │

│  Recharts           │                               │

└─────────────────────┴───────────────────────────────┘

### Multi-Tenant Design
Every record is scoped to an `organisationId`. Data isolation is enforced at both the API level (via `RolesGuard`) and the database query level — organisations can never access each other's data.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI Framework |
| TypeScript | 5 | Type Safety |
| Vite | 6 | Build Tool |
| Tailwind CSS | 4 | Styling |
| Ant Design | 5 | UI Components |
| React Router | 6 | Routing |
| Zustand | — | State Management |
| Axios | — | HTTP Client |
| Recharts | — | Data Visualisation |
| Day.js | — | Date Handling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10 | API Framework |
| PostgreSQL | 15 | Database |
| TypeORM | 0.3 | ORM |
| JWT | — | Authentication |
| Bcrypt | — | Password Hashing |
| Nodemailer | — | Email Service |
| Multer | — | File Uploads |

---

## 🚀 Quick Start

```bash
# Clone
git clone git@github.com:developerstechwave/servify.git
cd servify

# Install
npm install

# Configure environment
cp apps/backend/.env.example apps/backend/.env
# Edit apps/backend/.env with your DB and mail credentials

# Seed super admin
cd apps/backend
npx ts-node -r tsconfig-paths/register src/database/seeds/super-admin.seed.ts
cd ../..

# Run
npm run dev
```

**Frontend:** http://localhost:4200
**API:** http://localhost:3001/api

> See [DEVELOPER.md](./DEVELOPER.md) for full setup instructions.

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@servify.com | Admin@1234 |

---

## 🎓 Academic Context

This platform was developed as a final year project by students of the Department of Information and Communication Technology.

**Project Title:**
> Design and Development of a Multi-Tenant Customer Service Management Platform with Workflow Automation

**Group Members:**

| Name | Student ID |
|------|-----------|
| Theophilus Joseph Quarm | BC/ICT/22/286 |
| Paapa Kwesi Bentil | BC/ICT/22/349 |
| Theophilus Sarpong | BC/ICT/22/191 |
| Kingsley Fynn Thompson | BC/ICT/22/153 |
| Seyram Kofi Oboum Agyare | BC/ITN/22/030 |
| Gloria Awuku | BC/ICT/22/097 |

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ by the Servify Team · 2026</p>
</div>
