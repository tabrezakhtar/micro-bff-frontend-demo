# Food Ordering Micro Frontend & BFF Demo Project

Demo project demonstrating **Module Federation** (micro frontends) and **Backend-for-Frontend (BFF)** pattern.

## Quick Start (Docker - recommended)

From the repo root:

```bash
docker-compose up --build
```

Then open **http://localhost:5173** in your browser.

Code changes are reflected automatically without rebuilding:
- `restaurant-api` / `web-bff`: nodemon restarts on file save
- `menu-mfe` / `host`: Vite rebuilds in watch mode on file save (browser refresh needed)

To stop:
```bash
docker-compose down
```

If you only want the plain production images (no live-reload), run:
```bash
docker-compose -f docker-compose.yml up --build
```

## Quick Start (Local, without Docker)

> **Windows only** - the start/stop scripts are PowerShell (`.ps1`), invoked via `npm start`/`npm stop`.

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

## Architecture

```
Browser -> Host App (5173)
           |
           v
         Menu MFE (5174) [loaded at runtime via Module Federation]
           |
           v
         Web BFF (3000) [transforms data]
           |
           v
         Restaurant API (4000) [raw menu data]
```

## What Each Service Does

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
5. Menu renders with formatted prices ($10.50) and camelCase fields (isAvailable)

## Key Patterns Demonstrated

**Module Federation**: Host loads Menu MFE at runtime via `remoteEntry.js` manifest (see `host/vite.config.js` line 11).

**BFF Pattern**: Backend returns raw data (e.g., `available: true, price: 10.50`), BFF transforms for web (e.g., `isAvailable: true, price: "$10.50"`).
