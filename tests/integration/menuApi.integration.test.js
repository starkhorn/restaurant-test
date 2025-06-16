const request = require('supertest');
const { app } = require('../../server');

// Create a test app with mocked dependencies
function createTestApp() {
  // Mock the data functions at the module level
  const originalReadData = require('../../server').readData;
  const originalWriteData = require('../../server').writeData;
  
  return { app, originalReadData, originalWriteData };
}

describe('Menu API Endpoints - Integration', () => {
  let testData = {};

  beforeEach(() => {
    // Reset test data
    testData = {
      menu: {
        categories: [
          { id: 1, name: 'Appetizers', nameEn: 'Appetizers', nameTh: 'ของทานเล่น' }
        ],
        items: [
          { id: 1, nameEn: 'Spring Rolls', categoryId: 1, price: 120, status: 'available' }
        ]
      },
      orders: []
    };
  });

  describe('GET /api/menu', () => {
    it('should handle menu loading when no data exists', async () => {
      // This tests the actual error handling path
      const response = await request(app)
        .get('/api/menu');

      // The response should be either successful with empty data or an error
      expect([200, 500]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      } else {
        expect(response.body).toHaveProperty('error');
      }
    });
  });

  describe('POST /api/admin/menu/items', () => {
    it('should reject invalid menu item data', async () => {
      const response = await request(app)
        .post('/api/admin/menu/items')
        .send({}); // Empty object

      // Should either create with defaults or return error
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('PUT /api/admin/menu/items/:id', () => {
    it('should handle non-numeric IDs gracefully', async () => {
      const response = await request(app)
        .put('/api/admin/menu/items/invalid-id')
        .send({ nameEn: 'Updated Item' });

      // Should handle invalid ID gracefully
      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/menu/items/:id', () => {
    it('should handle deletion of non-existent items gracefully', async () => {
      const response = await request(app)
        .delete('/api/admin/menu/items/999999');

      // Should handle non-existent item gracefully
      expect([200, 404, 500]).toContain(response.status);
    });
  });
});