const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const QRCode = require('qrcode');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data storage functions
async function readData(filename) {
  try {
    const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(filename, data) {
  await fs.writeFile(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
}

// Initialize data files if they don't exist
async function initializeData() {
  const dataDir = path.join(__dirname, 'data');
  
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }

  // Initialize menu.json with sample data
  try {
    await fs.access(path.join(dataDir, 'menu.json'));
  } catch {
    const sampleMenu = {
      categories: [
        { id: 1, name: "Appetizers", nameEn: "Appetizers", nameTh: "ของทานเล่น" },
        { id: 2, name: "Main Courses", nameEn: "Main Courses", nameTh: "อาหารจานหลัก" },
        { id: 3, name: "Drinks", nameEn: "Drinks", nameTh: "เครื่องดื่ม" }
      ],
      items: [
        {
          id: 1,
          nameEn: "Spring Rolls",
          nameTh: "ปอเปี๊ยะทอด",
          description: "Crispy spring rolls with vegetables",
          price: 120,
          categoryId: 1,
          image: "/images/spring-rolls.jpg",
          status: "available"
        },
        {
          id: 2,
          nameEn: "Pad Thai",
          nameTh: "ผัดไทย",
          description: "Traditional Thai stir-fried noodles",
          price: 180,
          categoryId: 2,
          image: "/images/pad-thai.jpg",
          status: "available"
        },
        {
          id: 3,
          nameEn: "Thai Iced Tea",
          nameTh: "ชาเย็น",
          description: "Sweet and creamy Thai tea",
          price: 60,
          categoryId: 3,
          image: "/images/thai-tea.jpg",
          status: "available"
        }
      ]
    };
    await writeData('menu.json', sampleMenu);
  }

  // Initialize orders.json
  try {
    await fs.access(path.join(dataDir, 'orders.json'));
  } catch {
    await writeData('orders.json', []);
  }

  // Initialize tables.json
  try {
    await fs.access(path.join(dataDir, 'tables.json'));
  } catch {
    const tables = [];
    for (let i = 1; i <= 20; i++) {
      tables.push({
        id: i,
        number: i,
        qrCode: null,
        status: 'available' // available, occupied, needs_cleaning
      });
    }
    await writeData('tables.json', tables);
  }
}

// API Routes

// Get menu data
app.get('/api/menu', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

// Get menu for specific table
app.get('/api/menu/:tableNumber', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    const tableNumber = parseInt(req.params.tableNumber);
    res.json({ ...menu, tableNumber });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

// Admin routes
app.get('/api/admin/menu', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load menu' });
  }
});

app.post('/api/admin/menu/items', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    const newItem = {
      id: Date.now(),
      ...req.body,
      status: req.body.status || 'available'
    };
    menu.items.push(newItem);
    await writeData('menu.json', menu);
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add menu item' });
  }
});

app.put('/api/admin/menu/items/:id', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    const itemId = parseInt(req.params.id);
    const itemIndex = menu.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    menu.items[itemIndex] = { ...menu.items[itemIndex], ...req.body };
    await writeData('menu.json', menu);
    res.json(menu.items[itemIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

app.delete('/api/admin/menu/items/:id', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    const itemId = parseInt(req.params.id);
    menu.items = menu.items.filter(item => item.id !== itemId);
    await writeData('menu.json', menu);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

app.post('/api/admin/menu/categories', async (req, res) => {
  try {
    const menu = await readData('menu.json');
    const newCategory = {
      id: Date.now(),
      ...req.body
    };
    menu.categories.push(newCategory);
    await writeData('menu.json', menu);
    res.json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// Order routes
app.post('/api/orders', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const newOrder = {
      id: Date.now(),
      tableNumber: req.body.tableNumber,
      items: req.body.items,
      status: 'queued',
      timestamp: new Date().toISOString(),
      total: req.body.total
    };
    
    orders.push(newOrder);
    await writeData('orders.json', orders);
    
    // Emit to kitchen
    io.emit('newOrder', newOrder);
    
    res.json(newOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

app.get('/api/orders/table/:tableNumber', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const tableNumber = parseInt(req.params.tableNumber);
    const tableOrders = orders.filter(order => order.tableNumber === tableNumber);
    res.json(tableOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load table orders' });
  }
});

app.put('/api/orders/:orderId/items/:itemId/status', async (req, res) => {
  try {
    const orders = await readData('orders.json');
    const orderId = parseInt(req.params.orderId);
    const itemId = parseInt(req.params.itemId);
    const { status } = req.body;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const item = order.items.find(i => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    item.status = status;
    await writeData('orders.json', orders);
    
    // Emit status update
    io.emit('orderStatusUpdate', { orderId, itemId, status, tableNumber: order.tableNumber });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item status' });
  }
});

// Generate QR code for table
app.get('/api/qr/:tableNumber', async (req, res) => {
  try {
    const tableNumber = req.params.tableNumber;
    const url = `${req.protocol}://${req.get('host')}/menu.html?table=${tableNumber}`;
    const qrCode = await QRCode.toDataURL(url);
    res.json({ qrCode, url });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('joinTable', (tableNumber) => {
    socket.join(`table-${tableNumber}`);
    console.log(`Client joined table ${tableNumber}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Serve static pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/kitchen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'kitchen.html'));
});

app.get('/cashier', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cashier.html'));
});

// Initialize and start server
async function startServer() {
  await initializeData();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`Kitchen Display: http://localhost:${PORT}/kitchen`);
    console.log(`Cashier: http://localhost:${PORT}/cashier`);
  });
}

startServer().catch(console.error);