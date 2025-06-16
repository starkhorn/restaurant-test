const request = require('supertest');
const { app } = require('../../server');

describe('Static Routes', () => {
  describe('GET /', () => {
    it('should serve index.html', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /admin', () => {
    it('should serve admin.html', async () => {
      const response = await request(app)
        .get('/admin')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /kitchen', () => {
    it('should serve kitchen.html', async () => {
      const response = await request(app)
        .get('/kitchen')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /cashier', () => {
    it('should serve cashier.html', async () => {
      const response = await request(app)
        .get('/cashier')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('GET /non-existent-route', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });
  });
});