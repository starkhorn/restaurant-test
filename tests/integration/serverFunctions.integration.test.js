const { readData, writeData, initializeData } = require('../../server');
const fs = require('fs').promises;
const path = require('path');

// Create a real integration test that uses temp files
describe('Server Functions - Real Integration', () => {
  const testDataDir = path.join(__dirname, '../../test-data');
  const originalCwd = process.cwd();

  beforeAll(async () => {
    // Create test data directory
    try {
      await fs.mkdir(testDataDir, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
  });

  afterAll(async () => {
    // Clean up test data directory
    try {
      await fs.rmdir(testDataDir, { recursive: true });
    } catch (err) {
      // Directory might not exist or have files
    }
  });

  beforeEach(() => {
    // Change to test directory for these tests
    process.chdir(path.join(__dirname, '../..'));
  });

  afterEach(() => {
    // Restore original directory
    process.chdir(originalCwd);
  });

  describe('readData and writeData integration', () => {
    it('should write and read data successfully', async () => {
      const testData = { test: 'data', items: [1, 2, 3] };
      const filename = 'test-integration.json';

      // Write data
      await writeData(filename, testData);

      // Read data back
      const result = await readData(filename);

      expect(result).toEqual(testData);
    });

    it('should handle non-existent files gracefully', async () => {
      const result = await readData('non-existent-file.json');
      expect(result).toEqual([]);
    });
  });

  describe('initializeData integration', () => {
    it('should create necessary data files', async () => {
      await initializeData();

      // Check that files were created
      const dataDir = path.join(process.cwd(), 'data');
      const menuExists = await fs.access(path.join(dataDir, 'menu.json')).then(() => true).catch(() => false);
      const ordersExists = await fs.access(path.join(dataDir, 'orders.json')).then(() => true).catch(() => false);
      const tablesExists = await fs.access(path.join(dataDir, 'tables.json')).then(() => true).catch(() => false);

      expect(menuExists).toBe(true);
      expect(ordersExists).toBe(true);
      expect(tablesExists).toBe(true);
    });
  });
});