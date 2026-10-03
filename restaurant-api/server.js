import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Enable CORS for BFF and Menu MFE
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Hard-coded menu data
const menuData = [
  {
    id: 1,
    name: "Margherita Pizza 123",
    description: "Tomato, mozzarella and basil",
    price: 10.50,
    category: "Pizza",
    restaurantId: 1,
    available: true
  },
  {
    id: 2,
    name: "Chicken Burger",
    description: "Grilled chicken, lettuce and tomato",
    price: 9.95,
    category: "Burgers",
    restaurantId: 1,
    available: true
  },
  {
    id: 3,
    name: "Pepperoni Pizza",
    description: "Tomato, mozzarella, pepperoni and oregano",
    price: 12.50,
    category: "Pizza",
    restaurantId: 1,
    available: true
  },
  {
    id: 4,
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons and caesar dressing",
    price: 8.75,
    category: "Salads",
    restaurantId: 1,
    available: true
  },
  {
    id: 5,
    name: "Beef Burger",
    description: "100% beef patty, cheddar, onion and pickles",
    price: 11.50,
    category: "Burgers",
    restaurantId: 1,
    available: true
  },
  {
    id: 6,
    name: "Vegetarian Pizza",
    description: "Tomato, mozzarella, bell peppers, onions and mushrooms",
    price: 11.00,
    category: "Pizza",
    restaurantId: 1,
    available: true
  },
  {
    id: 7,
    name: "Greek Salad",
    description: "Feta cheese, olives, tomatoes, cucumbers and olive oil",
    price: 9.25,
    category: "Salads",
    restaurantId: 1,
    available: true
  },
  {
    id: 8,
    name: "Spicy Chicken Burger",
    description: "Grilled chicken with hot sauce and jalapeños",
    price: 10.75,
    category: "Burgers",
    restaurantId: 1,
    available: false
  }
];

// Menu endpoint
app.get('/restaurants/1/menu', (req, res) => {
  res.json(menuData);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'restaurant-api' });
});

app.listen(PORT, () => {
  console.log(`Restaurant API running on http://localhost:${PORT}`);
  console.log(`Menu endpoint: http://localhost:${PORT}/restaurants/1/menu`);
});
