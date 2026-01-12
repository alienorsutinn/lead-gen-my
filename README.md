# Lead Gen Malaysia

Automated lead generation system targeting Malaysia, using Google Places API and automated website quality audits.

## Tech Stack

- **Monorepo**: NPM Workspaces
- **Apps**:
  - `web`: Next.js 14 App Router, TailwindCSS
  - `worker`: Node.js, BullMQ, Playwright
- **Packages**:
  - `db`: Prisma ORM
  - `core`: Shared types and utilities
  - `llm`: AI analysis interface
- **Infrastructure**: Docker Compose (Postgres, Redis)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in API keys.
   ```bash
   cp .env.example .env
   ```

3. **Start Infrastructure**
   ```bash
   docker-compose up -d
   ```

4. **Database Setup**
   ```bash
   npm run db:migrate
   ```

## Development

- **Run All**:
  ```bash
  npm run dev
  ```
  - Web: http://localhost:3000
  - Worker: Background process

- **Individual Services**:
  ```bash
  npm run dev:web
  npm run dev:worker
  ```

- **Database Studio**:
  ```bash
  npm run db:studio
  ```
