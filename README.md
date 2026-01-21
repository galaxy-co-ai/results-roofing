# Results Roofing

Instant roof replacement quote platform for self-pay homeowners.

## Overview

Results Roofing is a Gunner Roofing-style instant quote platform that lets homeowners get roof replacement quotes in minutes, select packages, schedule installation, e-sign contracts, and pay deposits online.

**Service Areas:** Texas, Georgia, North Carolina, Arizona

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle
- **Auth:** Clerk
- **Payments:** Stripe
- **UI:** Ark UI (headless) + CSS Modules
- **State:** TanStack Query + React Hook Form
- **Testing:** Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/galaxy-co-ai/results-roofing.git
cd results-roofing

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
src/
  app/           # Next.js App Router (pages, layouts, API routes)
  components/    # React components (ui, layout, features)
  lib/           # Utilities, services, integrations
  hooks/         # Custom React hooks
  db/            # Drizzle ORM (schema, queries)
  types/         # TypeScript type definitions
  styles/        # Global styles and design tokens

docs/
  planning/      # Planning documents (01-23)
  roadmap/       # Sprint planning
```

## Documentation

See `docs/planning/` for detailed planning documents:

- `01-vision-and-goals.md` - Project vision and success criteria
- `04-feature-breakdown.md` - All features with specs
- `07-technical-architecture.md` - System architecture
- `17-code-patterns.md` - Implementation patterns

## License

Proprietary - Results Roofing / CB Media
