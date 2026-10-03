# Quick Start Guide

## Status: ✅ ALL SERVICES RUNNING

All 4 applications are currently running in separate terminals.

## Access Points

| Service | URL | Status |
|---------|-----|--------|
| **Host App** | http://localhost:5173 | ✅ Running |
| **Menu MFE** | http://localhost:5174 | ✅ Running |
| **Web BFF** | http://localhost:3000/api/menu | ✅ Running |
| **Restaurant API** | http://localhost:4000/restaurants/1/menu | ✅ Running |

## What to Open in Browser

### Primary: Host App with Integrated Menu MFE
```
http://localhost:5173
```
You should see:
- "🍕 Food Ordering" heading
- Menu items organized by category (Pizza, Burgers, Salads)
- Each item shows: name, description, price (£ formatted), availability status
- Menu component is loaded from the MFE, not built-in to Host app

### Secondary: Menu MFE Standalone (for testing)
```
http://localhost:5174
```
Same menu display, but running independently. Use this to test the MFE without the Host app.

## Verify Data Flow

### 1. Check Restaurant API Response
```powershell
curl http://localhost:4000/restaurants/1/menu | ConvertFrom-Json | Format-Table
```
Shows: 8 menu items with id, name, price (10.50), available (true/false)

### 2. Check BFF Transformation
```powershell
curl http://localhost:3000/api/menu | ConvertFrom-Json | ConvertTo-Json
```
Shows: Items wrapped in `{ items: [...] }`, prices as `"£10.50"`, field `isAvailable` (not `available`)

### 3. Browser Network Tab
1. Open http://localhost:5173
2. Press F12 (DevTools)
3. Go to Network tab
4. Look for requests:
   - `remoteEntry.js` from localhost:5174 (Module Federation manifest)
   - `menu` request to localhost:3000/api/menu (Menu MFE fetching data)

## Architecture in Action

When you access http://localhost:5173:

1. Browser loads Host app (Vite dev server on 5173)
2. Host app loads React.lazy(() => import('menu-mfe/Menu'))
3. Module Federation resolves this to localhost:5174/dist/remoteEntry.js
4. Menu component mounts and runs useEffect
5. Menu component fetches http://localhost:3000/api/menu
6. BFF (3000) fetches http://localhost:4000/restaurants/1/menu
7. BFF transforms data (rename fields, format prices, wrap in items array)
8. Menu component receives transformed data and renders items
9. Browser shows menu organized by category

This demonstrates both **Module Federation** (dynamic component loading) and **BFF pattern** (data transformation).

## Terminal Management

Currently running (each in separate terminal):
- Terminal 1: `cd restaurant-api && npm start` (Port 4000)
- Terminal 2: `cd web-bff && npm start` (Port 3000)  
- Terminal 3: `cd menu-mfe && npm run dev` (Port 5174)
- Terminal 4: `cd host && npm run dev` (Port 5173)

To stop a service: Press Ctrl+C in its terminal

To restart a service:
```powershell
cd <service-folder>
npm start  # or npm run dev
```

## Next Steps

1. ✅ Open http://localhost:5173 in browser
2. ✅ Verify you see "Food Ordering" heading + menu items
3. ✅ Open DevTools (F12) → Network tab
4. ✅ Refresh page and observe:
   - remoteEntry.js loads from 5174
   - api/menu request goes to 3000 (BFF)
5. ✅ Try editing menu-mfe/src/Menu.jsx and see hot reload
6. ✅ Review README.md for detailed architecture explanation

## Troubleshooting

**"Port already in use" error?**
```powershell
# Kill process on specific port (e.g., 5173)
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
# Or restart the specific service
```

**Module Federation not loading?**
- Ensure both Host (5173) and Menu MFE (5174) are running
- Check Browser Console (F12) for errors
- Verify CORS settings in vite.config.js

**BFF not transforming data?**
- Verify Restaurant API (4000) is running
- Check http://localhost:4000/restaurants/1/menu responds
- Review web-bff/server.js transformMenuItem() function

**Menu items not showing?**
- Check Browser Network tab for failed requests
- Verify all 4 services are running
- Check browser Console for JavaScript errors
