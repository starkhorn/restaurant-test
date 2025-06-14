# Restaurant Menu & Order Management System

A complete digital ordering platform for modern restaurants, enabling customers to order directly from their smartphones via QR codes while providing real-time order management for kitchen and cashier staff.

## 🚀 Features

### For Customers
- **QR Code Ordering**: Scan table QR code to access digital menu
- **Mobile-Optimized Interface**: Responsive design for smartphones
- **Multi-language Support**: Thai and English menu items
- **Smart Cart**: Add items with quantities and special requests
- **Real-time Status**: Track order progress (Queued → Cooking → Ready)
- **Instant Ordering**: Submit orders directly to kitchen

### For Restaurant Staff
- **Admin Panel**: Complete menu and category management
- **Kitchen Display System**: Real-time order display with status controls
- **Cashier Interface**: Bill generation, payment processing, and table management
- **Real-time Updates**: WebSocket-powered live notifications
- **Order Management**: Track and update order status seamlessly

### Technical Features
- **Fast Performance**: Menu loads in under 3 seconds
- **Real-time Communication**: Order updates in under 2 seconds
- **Cross-platform**: Works on all major mobile browsers
- **Scalable Architecture**: Supports multiple tables and concurrent orders

## 📋 System Requirements

- Node.js 14+ 
- npm 6+
- Modern web browser (Chrome, Safari, Firefox, Edge)
- Network connectivity for real-time features

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the system**
   - Main Dashboard: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin
   - Kitchen Display: http://localhost:3000/kitchen
   - Cashier System: http://localhost:3000/cashier

## 🍽️ Usage Guide

### Getting Started
1. Open the main dashboard at http://localhost:3000
2. Generate QR codes for your tables (1-20)
3. Print and place QR codes on respective tables
4. Staff can access admin, kitchen, and cashier interfaces

### Customer Ordering Flow
1. **Scan QR Code**: Customer scans table QR code with smartphone
2. **Browse Menu**: View categorized menu with images and descriptions
3. **Add to Cart**: Select items, quantities, and add special requests
4. **Place Order**: Review and confirm order
5. **Track Status**: Monitor order progress in real-time

### Kitchen Workflow
1. **Receive Orders**: New orders appear instantly with audio alerts
2. **Manage Queue**: View orders chronologically with priority indicators
3. **Update Status**: Change item status (Queued → Cooking → Ready)
4. **Filter Orders**: View orders by status or show all active orders

### Cashier Operations
1. **Search Table**: Enter table number to view order history
2. **Generate Bill**: Automatic calculation with tax and service charges
3. **Process Payment**: Confirm payment and print receipts
4. **Close Table**: Clear table for next customers

### Admin Management
1. **Menu Management**: Add, edit, delete menu items and categories
2. **Status Control**: Mark items as available or temporarily sold out
3. **Dashboard Overview**: Monitor system statistics and recent orders
4. **QR Code Generation**: Create and print QR codes for all tables

## 🏗️ Architecture

```
├── server.js              # Main Express server with Socket.IO
├── package.json           # Dependencies and scripts
├── data/                  # JSON data storage
│   ├── menu.json         # Menu items and categories
│   ├── orders.json       # Order history
│   └── tables.json       # Table management
└── public/               # Static files
    ├── index.html        # Main dashboard
    ├── menu.html         # Customer ordering interface
    ├── admin.html        # Restaurant admin panel
    ├── kitchen.html      # Kitchen display system
    ├── cashier.html      # Cashier interface
    └── css/
        └── main.css      # Responsive styling
```

## 🔧 API Endpoints

### Menu Management
- `GET /api/menu` - Get complete menu data
- `GET /api/menu/:tableNumber` - Get menu for specific table
- `POST /api/admin/menu/items` - Add new menu item
- `PUT /api/admin/menu/items/:id` - Update menu item
- `DELETE /api/admin/menu/items/:id` - Delete menu item
- `POST /api/admin/menu/categories` - Add new category

### Order Management  
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/table/:tableNumber` - Get orders for specific table
- `PUT /api/orders/:orderId/items/:itemId/status` - Update item status

### Utility
- `GET /api/qr/:tableNumber` - Generate QR code for table

## 🎨 Customization

### Menu Items
- Add items via admin panel or directly edit `data/menu.json`
- Support for item images, Thai/English names, descriptions, prices
- Category organization for better menu navigation

### Styling
- Modify `public/css/main.css` for visual customization
- CSS variables for easy color scheme changes
- Responsive breakpoints for different screen sizes

### Table Configuration
- Default setup supports 20 tables
- Modify table count in server.js if needed
- QR codes automatically generated for each table

## 🔍 Troubleshooting

### Common Issues
1. **Port 3000 in use**: Change PORT in server.js or set environment variable
2. **Socket.IO connection issues**: Check firewall settings and network connectivity
3. **Menu not loading**: Verify data/menu.json file exists and is valid JSON
4. **QR codes not working**: Ensure server URL is accessible from client devices

### Development Mode
```bash
npm install nodemon --save-dev
npx nodemon server.js
```

## 📱 Mobile Optimization

The customer interface is specifically optimized for mobile devices:
- Touch-friendly buttons and controls
- Responsive grid layouts
- Optimized text sizes for mobile screens
- Gesture-friendly navigation
- Fast loading on mobile networks

## 🔐 Security Considerations

For production deployment:
- Add authentication for admin panel
- Implement HTTPS for secure communication
- Add rate limiting for API endpoints
- Validate and sanitize all user inputs
- Use environment variables for configuration

## 🚀 Production Deployment

1. Set environment variables
2. Configure reverse proxy (nginx)
3. Set up process manager (PM2)
4. Configure SSL certificates
5. Set up database for persistent storage

## 📄 License

This project is created for demonstration purposes. Modify and use according to your needs.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes and test thoroughly
4. Submit pull request with detailed description

## 📞 Support

For technical support or questions about implementation, please refer to the documentation or create an issue in the repository.

---

**Built with modern web technologies for the restaurant industry** 🍴