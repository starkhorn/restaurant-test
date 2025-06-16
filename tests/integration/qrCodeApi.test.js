const request = require('supertest');
const QRCode = require('qrcode');
const { app } = require('../../server');

// Mock QRCode module
jest.mock('qrcode');

describe('QR Code API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/qr/:tableNumber', () => {
    it('should generate QR code successfully', async () => {
      const mockQRCodeData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      QRCode.toDataURL.mockResolvedValue(mockQRCodeData);

      const response = await request(app)
        .get('/api/qr/5')
        .expect(200);

      expect(response.body.qrCode).toBe(mockQRCodeData);
      expect(response.body.url).toMatch(/\/menu\.html\?table=5$/);
      expect(QRCode.toDataURL).toHaveBeenCalledWith(
        expect.stringMatching(/\/menu\.html\?table=5$/)
      );
    });

    it('should handle QR code generation errors', async () => {
      QRCode.toDataURL.mockRejectedValue(new Error('QR code generation failed'));

      const response = await request(app)
        .get('/api/qr/5')
        .expect(500);

      expect(response.body).toEqual({ error: 'Failed to generate QR code' });
    });

    it('should generate correct URL format', async () => {
      const mockQRCodeData = 'mock-qr-code-data';
      QRCode.toDataURL.mockResolvedValue(mockQRCodeData);

      const response = await request(app)
        .get('/api/qr/10')
        .set('Host', 'example.com')
        .expect(200);

      expect(response.body.url).toBe('http://example.com/menu.html?table=10');
      expect(QRCode.toDataURL).toHaveBeenCalledWith('http://example.com/menu.html?table=10');
    });

    it('should handle different table numbers', async () => {
      const mockQRCodeData = 'mock-qr-code-data';
      QRCode.toDataURL.mockResolvedValue(mockQRCodeData);

      const testCases = [1, 5, 10, 20, 999];

      for (const tableNumber of testCases) {
        QRCode.toDataURL.mockClear();
        
        const response = await request(app)
          .get(`/api/qr/${tableNumber}`)
          .expect(200);

        expect(response.body.url).toMatch(new RegExp(`table=${tableNumber}$`));
        expect(QRCode.toDataURL).toHaveBeenCalledWith(
          expect.stringMatching(new RegExp(`table=${tableNumber}$`))
        );
      }
    });
  });
});