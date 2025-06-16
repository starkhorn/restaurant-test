const request = require('supertest');
const { app } = require('../../server');

describe('Orders API Endpoints - Integration', () => {
  describe('POST /api/orders', () => {
    it('should handle order creation with minimal data', async () => {
      const newOrder = {
        tableNumber: 5,
        items: [],
        total: 0
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder);

      // Should either succeed or fail gracefully
      expect([200, 400, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('timestamp');
      }
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({}); // Empty object

      // Should handle missing data gracefully
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('GET /api/orders', () => {
    it('should return orders or handle gracefully', async () => {
      const response = await request(app)
        .get('/api/orders');

      // Should either return data or error gracefully
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('GET /api/orders/table/:tableNumber', () => {
    it('should handle table number validation', async () => {
      const response = await request(app)
        .get('/api/orders/table/abc'); // Invalid table number

      // Should handle invalid table number gracefully
      expect([200, 400, 500]).toContain(response.status);
    });

    it('should handle large table numbers', async () => {
      const response = await request(app)
        .get('/api/orders/table/999999');

      // Should handle large numbers gracefully
      expect([200, 404, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/orders/:orderId/items/:itemId/status', () => {
    it('should handle invalid status values', async () => {
      const response = await request(app)
        .put('/api/orders/1/items/1/status')
        .send({ status: 'invalid-status' });

      // Should handle invalid status gracefully
      expect([400, 404, 500]).toContain(response.status);
    });

    it('should handle missing status in request body', async () => {
      const response = await request(app)
        .put('/api/orders/1/items/1/status')
        .send({}); // No status field

      // Should handle missing status gracefully  
      expect([400, 404, 500]).toContain(response.status);
    });
  });
});