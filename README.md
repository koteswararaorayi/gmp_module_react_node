# GMP Module — React + Node.js

A full-stack enterprise **Good Manufacturing Practice (GMP)** management system built with React and Node.js/Express. Designed to handle master item management, warehouse tracking, goods receipts, material requests, and production reporting for manufacturing environments.

## Tech Stack

**Frontend:** React.js, JavaScript (ES6+), HTML5, CSS3  
**Backend:** Node.js, Express.js  
**Database:** MySQL  
**Architecture:** REST API with client/server separation

## Project Structure

## Implementation Status

| Phase | Module | Status |
|-------|--------|--------|
| Phase 0 | Infrastructure & Project Setup | ✅ Done |
| Phase 1 | Authentication & Role Management | ✅ Done |
| Phase 2 | Master Items Management | ✅ Done |
| Phase 3 | Warehouses & Locations Management | ✅ Done |
| Phase 4 | GRN (Goods Receipt Note) | 🔄 Planned |
| Phase 5 | Material Requests | 🔄 Planned |
| Phase 6 | Stock Reports | 🔄 Planned |
| Phase 7 | Production | 🔄 Planned |
| Phase 8 | Testing | 🔄 Planned |
| Phase 9 | Dashboards | 🔄 Planned |

## Key Features (Phases 0–3)

- JWT-based authentication with Role-Based Access Control (RBAC)
- Master item catalogue with CRUD operations
- Warehouse and location hierarchy management
- Server-side pagination for large datasets
- Input validation and SQL injection prevention
- REST APIs consumed by the React frontend

## Background

This project is built on domain knowledge gained from working on large-scale GMP systems handling **1,300+ items and 6,700+ ATR records**. A key optimisation in that environment reduced page load time from ~3 minutes to 10–20 seconds (~80% improvement) through server-side pagination, lazy loading, and query-level fixes — patterns applied in this codebase.

## Getting Started

```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm start
```

> Requires MySQL. Configure your DB credentials in `server/.env`.

## Author

[Koteswara Rao Rayi](https://github.com/koteswararaorayi) — Full-Stack Developer  
📧 koteswararaorayi@gmail.com
