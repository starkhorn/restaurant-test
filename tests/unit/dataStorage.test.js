const fs = require('fs').promises;
const path = require('path');
const { readData, writeData, initializeData } = require('../../server');

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn()
  }
}));

describe('Data Storage Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readData', () => {
    it('should read and parse JSON data successfully', async () => {
      const mockData = { items: [], categories: [] };
      fs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const result = await readData('menu.json');

      expect(fs.readFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data', 'menu.json'),
        'utf8'
      );
      expect(result).toEqual(mockData);
    });

    it('should return empty array when file read fails', async () => {
      fs.readFile.mockRejectedValue(new Error('File not found'));

      const result = await readData('nonexistent.json');

      expect(result).toEqual([]);
    });

    it('should return empty array when JSON parsing fails', async () => {
      fs.readFile.mockResolvedValue('invalid json');

      const result = await readData('invalid.json');

      expect(result).toEqual([]);
    });
  });

  describe('writeData', () => {
    it('should write JSON data to file', async () => {
      const mockData = { items: [{ id: 1, name: 'Test Item' }] };
      fs.writeFile.mockResolvedValue();

      await writeData('test.json', mockData);

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data', 'test.json'),
        JSON.stringify(mockData, null, 2)
      );
    });

    it('should handle write errors', async () => {
      const mockData = { items: [] };
      fs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(writeData('test.json', mockData)).rejects.toThrow('Write failed');
    });
  });

  describe('initializeData', () => {
    it('should create data directory if it does not exist', async () => {
      fs.access.mockRejectedValueOnce(new Error('Directory not found'))
        .mockResolvedValue()
        .mockResolvedValue()
        .mockResolvedValue();
      fs.mkdir.mockResolvedValue();
      fs.writeFile.mockResolvedValue();

      await initializeData();

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data'),
        { recursive: true }
      );
    });

    it('should initialize menu.json if it does not exist', async () => {
      fs.access.mockResolvedValueOnce() // data directory exists
        .mockRejectedValueOnce(new Error('File not found')) // menu.json doesn't exist
        .mockResolvedValueOnce() // orders.json exists
        .mockResolvedValueOnce(); // tables.json exists
      fs.writeFile.mockResolvedValue();

      await initializeData();

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data', 'menu.json'),
        expect.stringContaining('"categories"')
      );
    });

    it('should initialize orders.json if it does not exist', async () => {
      fs.access.mockResolvedValueOnce() // data directory exists
        .mockResolvedValueOnce() // menu.json exists
        .mockRejectedValueOnce(new Error('File not found')) // orders.json doesn't exist
        .mockResolvedValueOnce(); // tables.json exists
      fs.writeFile.mockResolvedValue();

      await initializeData();

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data', 'orders.json'),
        '[]'
      );
    });

    it('should initialize tables.json if it does not exist', async () => {
      fs.access.mockResolvedValueOnce() // data directory exists
        .mockResolvedValueOnce() // menu.json exists
        .mockResolvedValueOnce() // orders.json exists
        .mockRejectedValueOnce(new Error('File not found')); // tables.json doesn't exist
      fs.writeFile.mockResolvedValue();

      await initializeData();

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'data', 'tables.json'),
        expect.stringMatching(/"number":\s*1/)
      );
    });
  });
});