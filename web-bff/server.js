import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 3000;
const RESTAURANT_API_URL = 'http://localhost:4000';

// Enable CORS for Menu MFE and Host
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Transform restaurant API data into web-friendly format
function transformMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: `£${item.price.toFixed(2)}`,
    category: item.category,
    isAvailable: item.available
    // Note: restaurantId is removed - frontend doesn't need it
  };
}

// Menu endpoint - calls Restaurant API and transforms response
app.get('/api/menu', async (req, res) => {
  try {
    // Call Restaurant API
    const response = await axios.get(`${RESTAURANT_API_URL}/restaurants/1/menu`);
    const items = response.data;

    // Transform each item for web frontend
    const transformedItems = items.map(transformMenuItem);

    // Return in shape designed for web frontend
    res.json({
      items: transformedItems
    });
  } catch (error) {
    console.error('Error fetching menu from Restaurant API:', error.message);
    res.status(500).json({
      error: 'Failed to fetch menu',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'web-bff' });
});

app.listen(PORT, () => {
  console.log(`🍽️  Web BFF running on http://localhost:${PORT}`);
  console.log(`📡 Menu endpoint: http://localhost:${PORT}/api/menu`);
  console.log(`📍 Connects to Restaurant API at ${RESTAURANT_API_URL}`);
});
