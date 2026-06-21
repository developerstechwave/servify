# Servify — Developer Guide

## Prerequisites

Make sure you have the following installed:

- **Node.js** v20 or higher — [nodejs.org](https://nodejs.org)
- **npm** v10 or higher
- **PostgreSQL** v15 or higher — [postgresql.org](https://www.postgresql.org)
- **Git**

### Install PostgreSQL (Mac)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb servify_db
```

---

## Project Structure
servify/

├── apps/

│   ├── frontend/          # React + Vite frontend (port 4200)

│   │   └── src/

│   │       ├── app/       # Root router

│   │       ├── components/ # Shared components

│   │       ├── pages/     # Page components per role

│   │       ├── services/  # API service layer

│   │       ├── store/     # Zustand auth store

│   │       └── lib/       # Constants, nav config, links

│   └── backend/           # NestJS API (port 3001)

│       └── src/

│           ├── app/       # App module

│           ├── common/    # Guards, decorators, mail

│           └── module/    # Feature modules

├── README.md              # Project overview

└── DEVELOPER.md           # This file

---

## Getting Started

### 1. Clone the repository

```bash
git clone git@github.com:developerstechwave/servify.git
cd servify
```

### 2. Install dependencies

```bash
npm install
```

This installs dependencies for the root, frontend, and backend workspaces.

### 3. Configure environment variables

```bash
cp apps/backend/.env.example apps/backend/.env
```

Open `apps/backend/.env` and fill in your values:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=servify_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_ACCESS_SECRET=change_this_to_a_strong_secret
JWT_REFRESH_SECRET=change_this_to_another_strong_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# App
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:4200

# Mail (Gmail)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=Servify <your_email@gmail.com>
```

### 4. Seed the Super Admin

```bash
cd apps/backend
npx ts-node -r tsconfig-paths/register src/database/seeds/super-admin.seed.ts
cd ../..
```

This creates the initial super admin account:
- **Email:** `superadmin@servify.com`
- **Password:** `Admin@1234`

> Change these credentials after first login in production.

### 5. Start the development servers

```bash
npm run dev
```

This starts both apps in parallel:
- **Frontend** → http://localhost:4200
- **Backend API** → http://localhost:3001/api

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@servify.com | Admin@1234 |
| Admin | *(register via ADM token)* | *(set during registration)* |
| Employee | *(added by admin)* | *(auto-generated, printed in terminal)* |
| Customer | *(register via CDM token)* | *(set during registration)* |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend and backend together |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | Login with email and password | Public |
| POST | `/api/auth/register` | Register with ADM or CDM token | Public |
| GET  | `/api/auth/validate-token/:token` | Validate invitation token | Public |
| POST | `/api/auth/refresh` | Refresh access token via cookie | Authenticated |
| POST | `/api/auth/logout` | Logout and clear cookie | Authenticated |
| GET  | `/api/auth/me` | Get current user details | Authenticated |

### Authentication Flow
1. `POST /api/auth/login` returns an `accessToken` in the response body
2. A `refresh_token` is set as an HTTP-only cookie automatically
3. Include the access token in all protected requests: `Authorization: Bearer <token>`
4. When the access token expires, the frontend auto-refreshes via interceptor
5. On refresh failure → clear auth → redirect to login

### Token System
- **ADM tokens** — For organisation admins. Format: `ADM` + 8 random chars
- **CDM tokens** — For customers. Format: `CDM` + 8 random chars
- Tokens expire in **7 days** and are single-use

### Dashboard
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/dashboard/super-admin` | Super Admin |
| GET | `/api/dashboard/admin` | Admin |
| GET | `/api/dashboard/employee` | Employee |

### Subscriptions
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/subscriptions/products` | Admin |
| POST | `/api/subscriptions/products` | Admin |
| PATCH | `/api/subscriptions/products/:id` | Admin |
| DELETE | `/api/subscriptions/products/:id` | Admin |
| GET | `/api/subscriptions/products/all` | All |
| GET | `/api/subscriptions/services` | Admin |
| POST | `/api/subscriptions/services` | Admin |
| PATCH | `/api/subscriptions/services/:id` | Admin |
| DELETE | `/api/subscriptions/services/:id` | Admin |
| GET | `/api/subscriptions/services/public` | All |

### Customers
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/customers` | Admin/Employee |
| GET | `/api/customers/:id` | Admin/Employee |
| GET | `/api/customers/:id/subscriptions` | Admin/Employee |
| GET | `/api/customers/:id/issues` | Admin/Employee |
| POST | `/api/customers/invite` | Admin |
| POST | `/api/customers/:id/reinvite` | Admin |
| DELETE | `/api/customers/:id` | Admin |

### Issues
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/issues` | Customer |
| GET | `/api/issues` | Admin/Employee |
| GET | `/api/issues/my` | Customer |
| GET | `/api/issues/assigned` | Employee |
| GET | `/api/issues/employees` | Admin/Employee |
| GET | `/api/issues/:id` | All |
| PATCH | `/api/issues/:id` | Admin/Employee |
| PATCH | `/api/issues/:id/assign` | Admin/Employee |
| POST | `/api/issues/:id/comments` | All |

### Payments
| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/payments` | Customer |
| GET | `/api/payments` | Admin |
| GET | `/api/payments/my` | Customer |
| GET | `/api/payments/stats` | Admin |
| PATCH | `/api/payments/:id/status` | Admin |

### Customer Subscriptions
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/customer-subscriptions` | Customer |
| POST | `/api/customer-subscriptions` | Customer |
| GET | `/api/customer-subscriptions/stats` | Customer |
| GET | `/api/customer-subscriptions/:id` | Customer |
| PATCH | `/api/customer-subscriptions/:id` | Customer |
| PATCH | `/api/customer-subscriptions/:id/unsubscribe` | Customer |
| DELETE | `/api/customer-subscriptions/:id` | Customer |

### Notifications
| Method | Endpoint | Role |
|--------|----------|------|
| GET | `/api/notifications` | All |
| GET | `/api/notifications/unread-count` | All |
| PATCH | `/api/notifications/:id/read` | All |
| PATCH | `/api/notifications/read-all` | All |

---

## Key Design Decisions

1. **Multi-tenancy** — All queries scoped by `organisationId`
2. **Role Guards** — `@Roles()` decorator + `RolesGuard` on all protected routes
3. **Auto-payment** — Subscribing to a service auto-creates a payment record (Pending)
4. **Payment-Subscription sync** — Marking payment as Paid updates subscription to Current
5. **Notification triggers** — Issue created / assigned / commented / status changed
6. **Password generation** — Employees get random 10-char passwords emailed on creation
7. **Token-based onboarding** — No public registration; all users join via invitation tokens

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production releases (tagged v1.0.0, v1.1.0, etc.) |
| `develop` | Integration branch — all features merge here first |
| `feat/*` | New feature branches |
| `fix/*` | Bug fix branches |
| `docs/*` | Documentation updates |

---

## Common Issues

**Backend won't start:**
```bash
rm -rf apps/backend/dist
npx nx reset
npm run dev
```

**TypeORM sync issues (dev only):**
```bash
psql -U postgres -c "DROP DATABASE servify_db; CREATE DATABASE servify_db;"
npm run dev
# Re-run seed
```

**Email not sending:**
- Enable 2FA on Gmail account
- Generate an App Password (Google Account → Security → App Passwords)
- Use the 16-char app password without spaces in `MAIL_PASS`

---

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `servify_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | — |
| `JWT_ACCESS_SECRET` | Secret for access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — |
| `JWT_ACCESS_EXPIRES` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh token TTL | `7d` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:4200` |
| `MAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP port | `587` |
| `MAIL_USER` | SMTP username | — |
| `MAIL_PASS` | SMTP app password | — |
| `MAIL_FROM` | Sender display name | — |

---

## License

MIT
