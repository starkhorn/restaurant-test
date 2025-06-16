# Testing Documentation

## Overview

This project includes comprehensive unit tests and integration tests with code coverage reporting for the Restaurant Menu & Order Management System.

## Test Structure

```
tests/
├── unit/                      # Unit tests for individual functions
│   └── dataStorage.test.js    # Tests for data storage functions
├── integration/               # Integration tests for API endpoints
│   ├── menuApi.integration.test.js
│   ├── ordersApi.integration.test.js
│   ├── qrCodeApi.test.js
│   ├── serverFunctions.integration.test.js
│   └── staticRoutes.test.js
└── coverage/                  # Comprehensive coverage tests
    └── serverCoverage.test.js
```

## Testing Framework

- **Jest**: JavaScript testing framework for unit and integration tests
- **Supertest**: HTTP assertion library for testing Express.js applications
- **Coverage**: Jest built-in coverage with HTML and text reporting

## Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage reporting
npm run test:coverage

# Generate HTML coverage report
npm run coverage
```

## Code Coverage

Current code coverage metrics:
- **Statements**: 77.77%
- **Branches**: 58.33%
- **Functions**: 75.86%
- **Lines**: 77.56%

### Coverage Reports

After running `npm run coverage`, coverage reports are generated in the `coverage/` directory:
- `coverage/index.html` - Interactive HTML coverage report
- `coverage/lcov.info` - LCOV format for CI/CD integration
- Text summary displayed in terminal

## Test Categories

### Unit Tests

**Data Storage Functions** (`tests/unit/dataStorage.test.js`)
- Tests for `readData()`, `writeData()`, and `initializeData()` functions
- Mocked file system operations
- Error handling scenarios
- Edge cases and validation

### Integration Tests

**Menu API** (`tests/integration/menuApi.integration.test.js`)
- Menu retrieval endpoints
- Admin menu management operations
- Input validation and error handling

**Orders API** (`tests/integration/ordersApi.integration.test.js`)
- Order creation and retrieval
- Table-specific order filtering
- Status updates and validation

**QR Code API** (`tests/integration/qrCodeApi.test.js`)
- QR code generation for tables
- URL formatting validation
- Error handling for generation failures

**Static Routes** (`tests/integration/staticRoutes.test.js`)
- Main application routes (/, /admin, /kitchen, /cashier)
- HTML file serving
- 404 error handling

**Server Functions** (`tests/integration/serverFunctions.integration.test.js`)
- Real file system integration tests
- Data persistence validation
- Cross-function integration

### Coverage Tests

**Comprehensive Coverage** (`tests/coverage/serverCoverage.test.js`)
- Exercises all major code paths
- API endpoint coverage
- Error condition testing
- End-to-end functionality validation

## Test Data Management

Tests use isolated test data to avoid conflicts:
- Unit tests use mocked file operations
- Integration tests create temporary data
- Test data cleanup after each test run
- No interference with application data

## Continuous Integration

The test suite is designed for CI/CD integration:
- All tests run in Node.js environment
- No external dependencies required
- Coverage reports in standard formats
- Exit codes indicate test success/failure

## Running Specific Tests

```bash
# Run only unit tests
npm test tests/unit

# Run only integration tests
npm test tests/integration

# Run specific test file
npm test tests/unit/dataStorage.test.js

# Run tests matching pattern
npm test -- --testNamePattern="menu"
```

## Test Coverage Goals

- **Minimum Statement Coverage**: 80%
- **Minimum Branch Coverage**: 70%
- **Minimum Function Coverage**: 80%
- **Critical Path Coverage**: 100%

## Adding New Tests

When adding new features:

1. **Unit Tests**: Create tests in `tests/unit/` for new utility functions
2. **Integration Tests**: Add API endpoint tests in `tests/integration/`
3. **Coverage Tests**: Update `serverCoverage.test.js` to include new endpoints
4. **Documentation**: Update this file with new test information

## Mock Strategy

- **File System**: Mocked for unit tests, real for integration tests
- **External APIs**: Mocked (QRCode generation)
- **Database**: File-based JSON storage with test isolation
- **Network**: Supertest handles HTTP mocking

## Common Test Patterns

```javascript
// Unit test with mocks
const fs = require('fs').promises;
jest.mock('fs', () => ({ promises: { readFile: jest.fn() } }));

// Integration test with supertest
const request = require('supertest');
const { app } = require('../../server');
await request(app).get('/api/endpoint').expect(200);

// Coverage test with real operations
const { functionName } = require('../../server');
const result = await functionName('test-data');
expect(result).toBeDefined();
```

## Test Environment

- **Node.js Environment**: All tests run in Node.js context
- **Test Isolation**: Each test is independent
- **Cleanup**: Automatic cleanup of test data
- **Parallel Execution**: Jest runs tests in parallel for speed
- **Watch Mode**: Available for development efficiency

## Troubleshooting

**Tests Failing**:
1. Check that Node.js dependencies are installed (`npm install`)
2. Ensure data directory exists and is writable
3. Verify no other processes are using test ports
4. Check for file permission issues

**Coverage Issues**:
1. Ensure all code paths are tested
2. Check for untested error conditions
3. Verify mocks are not interfering with coverage
4. Review uncovered line numbers in report

**Performance**:
- Tests should complete in under 5 seconds
- Use `--verbose` flag for detailed output
- Consider `--maxWorkers` for CPU-intensive tests