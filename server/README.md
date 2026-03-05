# GMP_LIVE Backend

Phase 0 backend infrastructure for the GMP_LIVE migration.

## Stack

- Node.js
- Express
- MariaDB via `mysql2/promise`
- JWT via `jsonwebtoken`
- Password hashing via `bcryptjs`

## Setup

1. Copy `.env.example` to `.env` if needed.
2. Install dependencies with `npm install`.
3. Start development mode with `npm run dev`.
4. Start production mode with `npm start`.

## Available Endpoints

- `GET /api/health`
- `GET /api/version`

## Environment Variables

The project expects database, server, JWT, CORS, upload, and SMTP settings in `.env`.

## Project Structure

- `src/config`: environment, database, constants
- `src/middleware`: CORS, auth, error handling
- `src/routes`: API routes
- `src/utils`: response formatting and auth helpers
- `src/controllers`: phase-specific controllers
- `src/models`: phase-specific data access

## Troubleshooting

- Verify MariaDB is running on `localhost:3306`.
- Confirm `infinextg_ricon` exists.
- If port `5000` is busy, change `PORT` in `.env`.
