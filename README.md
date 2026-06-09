---

## Prerequisites

Make sure you have the following installed:

- **Node.js** v20 or higher — [nodejs.org](https://nodejs.org)
- **npm** v10 or higher
- **PostgreSQL** v15 or higher — [postgresql.org](https://www.postgresql.org)
- **Redis** v7 or higher — [redis.io](https://redis.io)
- **Git**

### Install PostgreSQL (Mac)
```bash
brew install postgresql@15
brew services start postgresql@15
createdb servify
```

### Install Redis (Mac)
```bash
brew install redis
brew services start redis
redis-cli ping  # should return PONG
```

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
DB_NAME=servify
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=change_this_to_a_strong_secret
JWT_REFRESH_SECRET=change_this_to_another_strong_secret

# App
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:4200
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

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start frontend and backend together |
| `npm run seed` | Seed the super admin account |

---

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Login with email and password | Public |
| POST | `/api/auth/refresh` | Refresh access token via cookie | Authenticated |
| POST | `/api/auth/logout` | Logout and clear cookie | Authenticated |
| GET | `/api/auth/me` | Get current user details | Authenticated |

### Authentication Flow
1. `POST /api/auth/login` returns an `accessToken` in the response body
2. A `refresh_token` is set as an HTTP-only cookie automatically
3. Include the access token in all protected requests: `Authorization: Bearer <token>`
4. When the access token expires, call `POST /api/auth/refresh` to get a new one

---

## Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Initial project setup |
| `develop` | Main development branch — all features merge here |
| `docs/readme` | Documentation updates |
| `feat/*` | New features |
| `fix/*` | Bug fixes |

---

## Contributing

1. Branch off `develop`
2. Name your branch `feat/your-feature` or `fix/your-fix`
3. Commit with clear messages
4. Open a PR into `develop`

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `servify` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_ACCESS_SECRET` | Secret for access tokens | — |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | — |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:4200` |

---

## License

MIT
EOF
