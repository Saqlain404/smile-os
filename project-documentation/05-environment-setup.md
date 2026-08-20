# SmileOS — Environment Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 22.23.1 | Required for Prisma 7.9+ (v18 doesn't work with `npx prisma`) |
| **nvm** | latest | Node version management |
| **npm** | latest | Package manager |
| **Git** | latest | Version control |
| **Supabase account** | free tier+ | PostgreSQL hosting |

## Setup Steps

### 1. Clone & Install

```bash
cd /Users/saqlainmalik/Desktop/React/smile-os

# Use correct Node version
source ~/.nvm/nvm.sh && nvm use 22.23.1

# Install dependencies (peer deps conflict, scripts skip needed)
npm install --legacy-peer-deps --ignore-scripts
```

### 2. Environment Variables

Two `.env` files exist at project root:

#### `.env` (defaults, overridden by `.env.local`)
```env
DATABASE_URL="postgresql://postgres:Wapking%4023%3DSmileOS@db.iptuwixtpzdwscsbzvnd.supabase.co:5432/postgres"
```

#### `.env.local` (active, overrides `.env`)
```env
DATABASE_URL="postgresql://postgres:Wapking%4023%3DSmileOS@db.iptuwixtpzdwscsbzvnd.supabase.co:5432/postgres?sslmode=no-verify"
BETTER_AUTH_SECRET="smile-os-dev-secret-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="SmileOS"
```

**Critical:** `sslmode=no-verify` is required because Supabase uses a self-signed SSL certificate. The `pg` v8 library treats `sslmode=require` as `verify-full`, which rejects self-signed certs.

### 3. Database Setup

```bash
# Ensure Node 22 is active
source ~/.nvm/nvm.sh && nvm use 22.23.1

# Generate Prisma client
./node_modules/.bin/prisma generate

# Push schema to database (creates/updates tables)
./node_modules/.bin/prisma db push

# Seed database with demo data
npx tsx prisma/seed.ts
```

**Note:** Use `./node_modules/.bin/prisma` instead of `npx prisma` — Prisma 7.9 has an ESM bug where `npx` fails but the direct binary works.

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@smileos.com | password123 | Admin |
| sarah@smileos.com | password123 | Dentist |
| anna@smileos.com | password123 | Receptionist |

## Known Environment Issues

### Disk Space
Disk space periodically fills up. If builds fail:
```bash
rm -rf .next/cache
npm cache clean --force
df -h  # Check available space
```

### Node Version
Prisma 7.9.1 requires Node 20.19+ or 22.12+. The system default is v18.20.3. Always run:
```bash
source ~/.nvm/nvm.sh && nvm use 22.23.1
```

### Prisma ESM Bug
`npx prisma` fails with ESM errors in Prisma 7.9. Use the direct binary path:
```bash
./node_modules/.bin/prisma generate
./node_modules/.bin/prisma db push
./node_modules/.bin/prisma studio
```

### Password Hashing
The seed script uses `hashPassword` from `@better-auth/utils/password` (scrypt). **Do not use SHA-256** — Better Auth expects the `salt:key` scrypt format. If passwords don't match login, re-seed.

## Project Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Dependencies (Package.json)

- **49 total packages** (36 dependencies + 13 devDependencies)
- **Key dependencies:** next, react, prisma, better-auth, shadcn, recharts, fullcalendar, zod, tailwindcss, lucide-react
- **Key devDependencies:** tailwindcss, typescript, eslint, @tailwindcss/postcss
