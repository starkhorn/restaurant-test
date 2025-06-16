# Restaurant System Browser Automation Tests

This directory contains Playwright-based browser automation tests for the restaurant ordering system.

## Overview

The tests validate the complete end-to-end customer ordering workflow including:

1. **Customer Interface** (`/menu.html?table=10`): Order placement with item selection and special requests
2. **Kitchen Display System** (`/kitchen`): Order reception and status updates
3. **Cashier Interface** (`/cashier`): Table search, bill processing, and table closure

## Test Structure

### Main Test: `e2e-happy-path.spec.ts`

This test covers the "Happy Path" scenario as specified in the requirements:

- Customer places order for Table 10 with 2x Spring Rolls and 1x Pad Thai (extra spicy)
- Kitchen receives order and updates Pad Thai status to "Cooking"
- Customer sees real-time status update via WebSocket
- Cashier searches table, processes payment, and closes the bill
- Verification that closed table shows no open bills

### Basic Connectivity Test: `basic-connectivity.spec.ts`

Simple tests to verify that all three interfaces load correctly.

## Prerequisites

1. **Server Running**: The restaurant server must be running on `localhost:3000`
   ```bash
   npm start
   ```

2. **Browser Installation**: Playwright browsers need to be installed
   ```bash
   npx playwright install chromium
   npx playwright install-deps
   ```

## Running Tests

### Run all tests:
```bash
npm test
```

### Run specific test:
```bash
npx playwright test e2e-happy-path.spec.ts
```

### Run with UI (debugging):
```bash
npm run test:ui
```

### Run in debug mode:
```bash
npm run test:debug
```

## Test Configuration

- **Base URL**: `http://127.0.0.1:3000`
- **Browser**: Chromium (configurable in `playwright.config.ts`)
- **Timeout**: Default timeouts with retries for flaky operations
- **Screenshots**: Taken on failure for debugging

## Expected Behavior

The tests should validate:

✅ **Customer Flow**:
- Menu loads with items visible
- Items can be added to cart with quantities and special requests
- Cart displays correct totals
- Order submission works and shows confirmation

✅ **Kitchen Flow**:
- New orders appear within 3 seconds
- Orders show correct items, quantities, and special requests
- Status updates work (queued → cooking → ready)

✅ **Cashier Flow**:
- Table search finds correct orders
- Bill displays itemized charges
- Table closure removes orders from system

✅ **Real-time Updates**:
- WebSocket communication between interfaces
- Status changes propagate immediately
- Order updates reflect across all systems

## Troubleshooting

### Common Issues:

1. **Server not running**: Ensure `npm start` is running on port 3000
2. **Browser not installed**: Run `npx playwright install chromium`
3. **Dependencies missing**: Run `npx playwright install-deps`
4. **Flaky tests**: Tests include retries and waits for async operations

### Debug Mode:

Use the debug mode to step through tests:
```bash
npx playwright test --debug e2e-happy-path.spec.ts
```

### Screenshots:

Failed tests automatically generate screenshots in the `test-results` directory.

## Technical Notes

- Tests use multiple browser contexts to simulate concurrent users
- Real-time updates are tested with appropriate wait times
- Selectors are robust and handle dynamic content loading
- Error handling includes retries for network-dependent operations

## Extending Tests

To add new test scenarios:

1. Create new `.spec.ts` files in the `tests/` directory
2. Follow the existing pattern of using `test.step()` for organization
3. Use helper functions like `waitForElementWithRetry()` for stability
4. Include proper assertions for all requirements
5. Test both success and failure scenarios where appropriate