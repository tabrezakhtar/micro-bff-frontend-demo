# Food Ordering Micro Frontend & BFF Learning Project

Learning project demonstrating **Module Federation** (micro frontends) and **Backend-for-Frontend (BFF)** pattern.

## 🚀 Quick Start

From the repo root:

```powershell
npm start
```

This:
- Kills any stale processes on ports 3000, 4000, 5173, 5174
- Builds menu-mfe and host (required for Module Federation)
- Launches all 4 services in separate windows:
  - Restaurant API (4000)
  - Web BFF (3000)
  - Menu MFE (5174)
  - Host App (5173)

Then open **http://localhost:5173** in your browser.

To stop all services:
```powershell
npm stop
```

## � Docker Setup

Alternatively, run all services in Docker with docker-compose:

```bash
docker-compose up
```

Then open **http://localhost:5173** in your browser.

To stop:
```bash
docker-compose down
```

To rebuild after code changes:
```bash
docker-compose up --build
```

## �📊 Architecture

```
Browser → Host App (5173)
           ↓
         Menu MFE (5174) [loaded at runtime via Module Federation]
           ↓
         Web BFF (3000) [transforms data]
           ↓
         Restaurant API (4000) [raw menu data]
```

## 🔍 What Each Service Does

| Service | Port | Purpose |
|---------|------|---------|
| **Host App** | 5173 | Main React shell; loads Menu MFE dynamically |
| **Menu MFE** | 5174 | Standalone Menu component; fetches from BFF |
| **Web BFF** | 3000 | Transforms backend data for frontend (camelCase, currency formatting) |
| **Restaurant API** | 4000 | Raw menu data endpoint |

### Data Flow
1. Browser loads host (5173)
2. Host fetches menu-mfe's `remoteEntry.js` from 5174 (Module Federation manifest)
3. Menu component loads and calls BFF at 3000
4. BFF fetches from restaurant-api at 4000 and transforms the data
5. Menu renders with formatted prices (£10.50) and camelCase fields (isAvailable)

## 🔑 Key Patterns Demonstrated

**Module Federation**: Host loads Menu MFE at runtime via `remoteEntry.js` manifest (see `host/vite.config.js` line 11).

**BFF Pattern**: Backend returns raw data (e.g., `available: true, price: 10.50`), BFF transforms for web (e.g., `isAvailable: true, price: "£10.50"`).
