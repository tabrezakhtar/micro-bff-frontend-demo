# Food Ordering Micro Frontend & BFF Learning Project

## 🎯 Overview

This is a complete learning project demonstrating:
- **Module Federation** for micro frontend architecture
- **Backend-for-Frontend (BFF)** pattern for data transformation

## 📊 Architecture

```
Browser (http://localhost:5173)
    ↓
Host React App (Port 5173)
    ↓
Menu Micro Frontend (Port 5174) - Loaded at runtime
    ↓
Web BFF (Port 3000) - Data transformation layer
    ↓
Restaurant API (Port 4000) - Domain data
```

## 🚀 How to Run All Services

All four applications are already created and running:

### Terminal 1: Restaurant API (Port 4000)
```powershell
cd c:\Users\Tabrez\Documents\Work\micro-bff-frontend-demo\restaurant-api
npm start
```
- **Purpose**: Exposes restaurant menu data
- **Endpoint**: `GET http://localhost:4000/restaurants/1/menu`
- **Returns**: Array of menu items with: id, name, description, price, category, restaurantId, available

### Terminal 2: Web BFF (Port 3000)
```powershell
cd c:\Users\Tabrez\Documents\Work\micro-bff-frontend-demo\web-bff
npm start
```
- **Purpose**: Bridges backend and frontend, transforms data
- **Endpoint**: `GET http://localhost:3000/api/menu`
- **Returns**: Transformed response with structure: `{ items: [...] }`
- **Transformations**:
  - `available` → `isAvailable` (camelCase for web)
  - `price: 10.50` → `price: "£10.50"` (formatted string)
  - Removes `restaurantId` (frontend doesn't need it)

### Terminal 3: Menu Micro Frontend (Port 5174)
```powershell
cd c:\Users\Tabrez\Documents\Work\micro-bff-frontend-demo\menu-mfe
npm run dev
```
- **Purpose**: Standalone React component exposing Menu UI
- **Module Federation**: Exposes `./src/Menu.jsx` as named export `Menu`
- **Entry Point**: http://localhost:5174/dist/remoteEntry.js
- **Data Source**: Fetches from BFF at `http://localhost:3000/api/menu`
- **Runs standalone**: Open http://localhost:5174 to see Menu component fetch data from BFF

### Terminal 4: Host App (Port 5173)
```powershell
cd c:\Users\Tabrez\Documents\Work\micro-bff-frontend-demo\host
npm run dev
```
- **Purpose**: Main application shell
- **Opens**: http://localhost:5173
- **Loads**: Menu MFE component at runtime using Module Federation
- **Display**: Shows "Food Ordering" heading + Menu component from MFE

## 🔍 Testing the Architecture

### 1. Test Restaurant API directly
```powershell
curl http://localhost:4000/restaurants/1/menu | ConvertFrom-Json
```
**Expected**: Array of 8 menu items with Pizza, Burgers, and Salads

### 2. Test BFF transformation
```powershell
curl http://localhost:3000/api/menu | ConvertFrom-Json
```
**Expected**: 
- Response wrapped in `{ items: [...] }`
- Prices formatted as `"£X.XX"`
- Field names in camelCase: `isAvailable` (not `available`)
- No `restaurantId` field

### 3. Test Menu MFE standalone
Open browser: http://localhost:5174
**Expected**: Menu component displays all items grouped by category

### 4. Test Host app with MFE integration
Open browser: http://localhost:5173
**Expected**: 
- See "Food Ordering" heading
- See Menu component loaded from localhost:5174
- Browser Network tab shows:
  - `remoteEntry.js` loaded from 5174
  - Menu data fetched from BFF (3000)

## 📁 Project Structure

```
micro-bff-frontend-demo/
├── restaurant-api/              # Backend API (Port 4000)
│   ├── package.json
│   ├── server.js               # Express server with menu endpoint
│   └── node_modules/
│
├── web-bff/                    # Backend-for-Frontend (Port 3000)
│   ├── package.json
│   ├── server.js               # Transformation logic
│   └── node_modules/
│
├── menu-mfe/                   # Micro Frontend (Port 5174)
│   ├── package.json
│   ├── vite.config.js          # Module Federation config (exposes Menu)
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── Menu.jsx            # Menu component that fetches from BFF
│   └── node_modules/
│
└── host/                       # Host App (Port 5173)
    ├── package.json
    ├── vite.config.js          # Module Federation config (imports Menu)
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   └── App.jsx             # Loads Menu MFE with React.lazy + Suspense
    └── node_modules/
```

## 🏗️ Key Concepts

### 1. Module Federation (Micro Frontends)
- **Host** (`host/vite.config.js`):
  - Defines `remotes` to load Menu MFE from localhost:5174
  - `remoteEntry.js` provides the shared module registry
  - Uses `React.lazy()` and `Suspense` to load Menu at runtime

- **Remote** (`menu-mfe/vite.config.js`):
  - Defines `exposes` to share Menu component
  - Exports `./src/Menu.jsx` with filename `remoteEntry.js`

### 2. Backend-for-Frontend (BFF) Pattern
The BFF transforms backend data specifically for frontend needs:

**Backend (Restaurant API)** returns:
```json
{
  "id": 1,
  "name": "Margherita Pizza",
  "available": true,
  "price": 10.50,
  "restaurantId": 1
}
```

**BFF transforms it** for the web frontend:
```json
{
  "id": 1,
  "name": "Margherita Pizza",
  "isAvailable": true,
  "price": "£10.50"
}
```

**Benefits**:
- Frontend gets exactly what it needs
- Backend can change without breaking frontend
- Data formatting logic centralized (prices, date formats, etc.)
- Removes sensitive fields from backend response

### 3. Responsibilities
- **Restaurant API**: Owns restaurant/menu domain logic
- **Web BFF**: Bridges backend and frontend, owns web data contracts
- **Menu MFE**: Owns menu UI, isolated and reusable
- **Host App**: Owns application shell and routing

## 🔧 How Module Federation Works (Dev Mode)

In development, Vite dev servers use lazy federation:

1. Browser loads Host app (http://localhost:5173)
2. Host app tries to load Menu from `menu-mfe/Menu`
3. Vite resolves this to `http://localhost:5174/dist/remoteEntry.js`
4. remoteEntry.js is a federation manifest that exposes the Menu component
5. Menu component loads and renders

**Note**: In production, you'd build all apps and host on CDN with proper URLs.

## 🧪 Modifying the Project

### Add a new menu item
Edit `restaurant-api/server.js`:
```javascript
const menuData = [
  // ... existing items
  {
    id: 9,
    name: "Fish and Chips",
    description: "Beer-battered fish with fries",
    price: 12.99,
    category: "Seafood",
    restaurantId: 1,
    available: true
  }
];
```

### Change BFF transformation
Edit `web-bff/server.js` - modify `transformMenuItem()` function:
```javascript
function transformMenuItem(item) {
  return {
    // ... change transformation logic here
  };
}
```

### Modify Menu UI
Edit `menu-mfe/src/Menu.jsx` - change React component as needed.
Menu MFE will hot-reload in browser.

## 📚 Learning Outcomes

By studying this project, you'll understand:
1. ✅ How Module Federation enables micro frontends
2. ✅ How multiple frontend teams can work independently
3. ✅ Why BFF pattern is valuable for frontend-backend separation
4. ✅ How data transformation centralizes business logic
5. ✅ Module sharing in federated applications
6. ✅ Dynamic component loading with React.lazy

## 🚪 Stopping the Services

Each service runs in its own terminal. Press Ctrl+C to stop.

## 📝 Notes

- No database required - all data is hard-coded
- No authentication or error handling - learning focused
- CORS is configured to allow localhost:3000, :5173, :5174
- In production, build all apps and host on CDN/server with proper URLs
- Module Federation remotes must be resolvable at runtime

## 🎓 Further Exploration

1. Add another MFE (e.g., `checkout-mfe`) and share it from Host
2. Add error boundaries to handle MFE load failures
3. Implement a version switching mechanism for MFEs
4. Add environment configuration for BFF and Restaurant API URLs
5. Build all apps and deploy to separate servers
6. Add more complex transformations in the BFF layer
