# GMP_LIVE Frontend

Phase 0 frontend infrastructure for the GMP_LIVE migration.

## Stack

- React
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios

## Setup

1. Install dependencies with `npm install`.
2. Start development mode with `npm run dev`.
3. Build production assets with `npm run build`.
4. Preview production output with `npm run preview`.

## Project Structure

- `src/pages`: page-level screens
- `src/components`: reusable UI building blocks
- `src/services`: API clients and service modules
- `src/stores`: Zustand state stores
- `src/hooks`: custom hooks
- `src/styles`: shared style tokens

## Architecture Notes

- Authentication state lives in Zustand.
- API requests are centralized in `src/services/api.js`.
- Routes are defined in `src/App.jsx`.
- Phase 0 uses a mock login flow and backend health check wiring.
