# File Structure & Explanation

## Project Root
```
micro-bff-frontend-demo/
├── README.md                 # Full project documentation
├── QUICK_START.md           # Quick access guide (THIS FILE)
├── FILES_EXPLAINED.md       # This file - explains each file
│
├── restaurant-api/          # Backend API (Port 4000)
├── web-bff/                 # Backend-for-Frontend layer (Port 3000)
├── menu-mfe/                # Menu Micro Frontend (Port 5174)
└── host/                    # Host Application (Port 5173)
```

---

## 1. Restaurant API (Port 4000)

**Purpose**: Domain API that owns restaurant/menu data

### `restaurant-api/package.json`
```json
{
  "name": "restaurant-api",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```
- Defines Express and CORS dependencies
- Start with: `npm start`

### `restaurant-api/server.js` ⭐ Core File
```javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// CORS allows requests from BFF (3000) and MFEs (5174, 5173)
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5173']
}));

// Hard-coded menu data with 8 items
const menuData = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Tomato, mozzarella and basil",
    price: 10.50,
    category: "Pizza",
    restaurantId: 1,
    available: true
  },
  // ... 7 more items
];

// Endpoint returns raw backend data structure
app.get('/restaurants/1/menu', (req, res) => {
  res.json(menuData);
});

app.listen(PORT, () => {
  console.log(`🍕 Restaurant API running on http://localhost:${PORT}`);
});
```

**Key Points**:
- Domain data model: includes `available`, `restaurantId`, `price` as number
- No transformation - returns raw backend schema
- CORS enabled for downstream services
- Health check endpoint: `/health`

**Endpoints**:
- `GET /restaurants/1/menu` - Returns array of menu items
- `GET /health` - Returns `{ status: 'ok', service: 'restaurant-api' }`

---

## 2. Web BFF (Port 3000)

**Purpose**: Transforms backend data for web frontend consumption

### `web-bff/package.json`
```json
{
  "name": "web-bff",
  "main": "server.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "axios": "^1.6.0"
  }
}
```
- Adds axios to call upstream services

### `web-bff/server.js` ⭐⭐ Core BFF Logic
```javascript
const RESTAURANT_API_URL = 'http://localhost:4000';

// TRANSFORMATION: Backend schema → Web-friendly schema
function transformMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: `£${item.price.toFixed(2)}`,  // Format price as string
    category: item.category,
    isAvailable: item.available             // Rename field (camelCase)
    // Note: restaurantId is removed - frontend doesn't need it
  };
}

// Endpoint returns transformed data
app.get('/api/menu', async (req, res) => {
  try {
    // 1. Call Restaurant API
    const response = await axios.get(`${RESTAURANT_API_URL}/restaurants/1/menu`);
    
    // 2. Transform each item
    const transformedItems = response.data.map(transformMenuItem);
    
    // 3. Shape response for web frontend
    res.json({
      items: transformedItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu' });
  }
});
```

**Key Points**:
- Calls Restaurant API and transforms response
- Demonstrates BFF pattern: backend schema → web schema
- Transformations:
  - `available` → `isAvailable` (camelCase)
  - `price: 10.50` → `price: "£10.50"` (formatted string)
  - Removes `restaurantId` (not needed by frontend)
  - Wraps in `{ items: [...] }` structure

**Example Transformation**:
```
Input (from Restaurant API):
{
  "id": 1,
  "name": "Margherita Pizza",
  "price": 10.5,
  "available": true,
  "restaurantId": 1,
  "category": "Pizza"
}

Output (to Frontend):
{
  "id": 1,
  "name": "Margherita Pizza",
  "price": "£10.50",           ← Formatted
  "isAvailable": true,         ← Renamed + camelCase
  "category": "Pizza"
  // restaurantId removed
}
```

**Endpoints**:
- `GET /api/menu` - Returns `{ items: [...transformed items] }`
- `GET /health` - Returns `{ status: 'ok', service: 'web-bff' }`

---

## 3. Menu Micro Frontend (Port 5174)

**Purpose**: Reusable menu UI component that can be loaded into any host app

### `menu-mfe/package.json`
```json
{
  "name": "menu-mfe",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "@originjs/vite-plugin-federation": "^1.2.4"
  }
}
```

### `menu-mfe/vite.config.js` ⭐ Module Federation Config (EXPOSES)
```javascript
import federation from '@originjs/vite-plugin-federation';

federation({
  name: 'menu_mfe',
  filename: 'remoteEntry.js',      // Entry point for Host app
  exposes: {
    './Menu': './src/Menu.jsx'     // What this MFE exposes
  },
  shared: {
    react: { singleton: true },        // Share React instance
    'react-dom': { singleton: true }   // Share ReactDOM instance
  }
})
```

**Key Points**:
- `exposes`: Defines what this MFE shares with host apps
- `remoteEntry.js`: Federation manifest - lists what's available
- `shared`: Prevents multiple React instances in browser
- Dev server runs on port 5174

### `menu-mfe/src/Menu.jsx` ⭐ UI Component
```javascript
export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from BFF, not from Restaurant API directly
    fetch('http://localhost:3000/api/menu')
      .then(res => res.json())
      .then(data => setItems(data.items))
      .catch(err => console.error(err));
  }, []);

  // Render items grouped by category
  return (
    <div>
      <h2>Menu</h2>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3>{category}</h3>
          {items.map(item => (
            <div key={item.id}>
              <h4>{item.name}</h4>
              <p>{item.description}</p>
              <span>{item.price}</span>
              <span>{item.isAvailable ? '✓ Available' : '✗ Unavailable'}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

**Key Points**:
- Fetches from BFF (`http://localhost:3000/api/menu`), NOT directly from Restaurant API
- This is intentional - demonstrates MFE responsibility
- Groups items by category for display
- Includes loading and error states
- Uses inline styles (no CSS framework)

### `menu-mfe/src/App.jsx`
```javascript
import Menu from './Menu';

export default function App() {
  return <div style={{ padding: '20px' }}><Menu /></div>;
}
```
- Wrapper for standalone testing at http://localhost:5174

### `menu-mfe/src/main.jsx`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```
- Entry point for Vite
- Mounts App into #root div

### `menu-mfe/index.html`
```html
<!doctype html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
- HTML template for Vite
- Provides #root div for React mount

---

## 4. Host Application (Port 5173)

**Purpose**: Main application shell that loads Menu MFE at runtime

### `host/package.json`
```json
{
  "name": "host",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^5.0.0",
    "@originjs/vite-plugin-federation": "^1.2.4"
  }
}
```

### `host/vite.config.js` ⭐ Module Federation Config (IMPORTS)
```javascript
import federation from '@originjs/vite-plugin-federation';

federation({
  name: 'host_app',
  remotes: {
    'menu-mfe': 'http://localhost:5174/dist/remoteEntry.js'
    // Tells Host where to find Menu MFE's remoteEntry.js
  },
  shared: {
    react: { singleton: true },        // Share React instance
    'react-dom': { singleton: true }   // Share ReactDOM instance
  }
})
```

**Key Points**:
- `remotes`: Defines external MFEs to import
- `'menu-mfe'`: Alias used in import statements
- URL points to localhost:5174/dist/remoteEntry.js (Menu MFE's federation manifest)
- Dev server runs on port 5173

### `host/src/App.jsx` ⭐ Loads MFE at Runtime
```javascript
import React, { Suspense } from 'react';

// Dynamically import Menu from Menu MFE
const Menu = React.lazy(() => import('menu-mfe/Menu'));

export default function App() {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🍕 Food Ordering</h1>
        <p>Powered by Micro Frontend Architecture</p>
      </header>

      <main>
        <Suspense fallback={<div>Loading menu component...</div>}>
          <Menu />
        </Suspense>
      </main>

      <footer>
        <p>Menu component loaded from Menu MFE (localhost:5174) at runtime</p>
      </footer>
    </div>
  );
}
```

**Key Points**:
- `React.lazy(() => import('menu-mfe/Menu'))` - Dynamic import
- `Suspense` with fallback - Shows loading state while MFE loads
- Module Federation resolves `'menu-mfe/Menu'` to localhost:5174
- Menu is NOT built into Host - loaded at runtime
- Both apps must run for this to work

**Flow**:
1. Host app loads (5173)
2. Host renders App component
3. App tries to render `<Menu />`
4. React.lazy triggers federation load
5. Module Federation checks remotes config
6. Loads `http://localhost:5174/dist/remoteEntry.js`
7. remoteEntry.js provides Menu component
8. Menu component mounts and fetches from BFF (3000)
9. UI renders with data

### `host/src/main.jsx`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```
- Entry point for Vite
- Mounts App into #root div

### `host/index.html`
```html
<!doctype html>
<html>
  <head>
    <title>Food Ordering - Host App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```
- HTML template for Vite
- Provides #root div for React mount

---

## 📊 Data Flow Through Files

```
1. Browser → Host (5173)
   host/index.html
   host/src/main.jsx
   host/src/App.jsx

2. App.jsx requests Menu from MFE
   React.lazy(() => import('menu-mfe/Menu'))
   Module Federation loads remoteEntry.js from 5174

3. Menu loads (5174)
   menu-mfe/src/Menu.jsx

4. Menu.jsx fetches data
   useEffect → fetch('http://localhost:3000/api/menu')
   
5. BFF transforms (3000)
   web-bff/server.js
   transformMenuItem() function
   
6. Restaurant API provides data (4000)
   restaurant-api/server.js
   menuData array

7. Data flows back up the chain
   Restaurant API → BFF → Menu.jsx → Host.jsx → Browser
```

---

## 🔑 Key Concepts Implemented

### Module Federation
- **Host** exposes its React instance via `shared` config
- **Remote** (Menu MFE) exposes `Menu.jsx` via `exposes` config
- Both share singleton React to prevent duplicate instances
- Dynamic loading via `React.lazy()` and `import('menu-mfe/Menu')`

### Backend-for-Frontend Pattern
- **Restaurant API**: Backend domain model
- **Web BFF**: Transformation layer
- **Menu MFE**: Web-specific UI component

### Responsibilities
- **restaurant-api/server.js**: Own menu data
- **web-bff/server.js**: Transform data for web (camelCase, currency formatting, field removal)
- **menu-mfe/src/Menu.jsx**: Own menu UI, fetch only from BFF
- **host/src/App.jsx**: Own app shell, compose MFEs

---

## 🚀 How to Modify

### Add a new menu item
Edit `restaurant-api/server.js` - add to `menuData` array

### Change price format (e.g., $ instead of £)
Edit `web-bff/server.js` - modify `transformMenuItem()`:
```javascript
price: `$${item.price.toFixed(2)}`
```

### Change menu UI
Edit `menu-mfe/src/Menu.jsx` - modify React component
Vite will hot-reload

### Change host heading
Edit `host/src/App.jsx` - modify text or styles
Vite will hot-reload

### Add another MFE
1. Create another app with Module Federation exposes
2. Add to `host/vite.config.js` remotes
3. Load with `React.lazy(() => import('new-mfe/Component'))`
