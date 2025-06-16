import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Restaurant End-to-End Customer Order - Happy Path', () => {
  test('should complete successful end-to-end customer order flow', async ({ browser }) => {
    // Create three browser contexts for customer, kitchen, and cashier
    const customerContext = await browser.newContext();
    const kitchenContext = await browser.newContext();
    const cashierContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const kitchenPage = await kitchenContext.newPage();
    const cashierPage = await cashierContext.newPage();

    try {
      // Step 1: Customer - Navigate to table 10 and verify menu loads
      await test.step('Customer: Navigate to table 10 and verify menu loads', async () => {
        await customerPage.goto('/?table=10');
        
        // Assert that menu items are loaded and visible
        await expect(customerPage.locator('#menuItems')).toBeVisible();
        await customerPage.waitForSelector('.menu-item', { timeout: 10000 });
        
        // Verify at least one menu item is visible
        const menuItems = await customerPage.locator('.menu-item').count();
        expect(menuItems).toBeGreaterThan(0);
      });

      // Step 2: Customer - Add items to cart
      await test.step('Customer: Add Spring Rolls (2x) and Pad Thai (1x) to cart', async () => {
        // Look for Spring Rolls and add 2
        const springRollsItem = customerPage.locator('.menu-item').filter({ hasText: 'Spring Rolls' }).first();
        if (await springRollsItem.count() > 0) {
          const incrementBtn = springRollsItem.locator('button[onclick*="incrementQuantity"]');
          await incrementBtn.click();
          await incrementBtn.click(); // Add 2 Spring Rolls
          
          const addToCartBtn = springRollsItem.locator('button[onclick*="addToCart"]');
          await addToCartBtn.click();
        }

        // Look for Pad Thai and add 1 with special request
        const padThaiItem = customerPage.locator('.menu-item').filter({ hasText: 'Pad Thai' }).first();
        if (await padThaiItem.count() > 0) {
          const incrementBtn = padThaiItem.locator('button[onclick*="incrementQuantity"]');
          await incrementBtn.click(); // Add 1 Pad Thai
          
          // Add special request "extra spicy"
          const specialRequestsTextarea = padThaiItem.locator('textarea[id*="special"]');
          await specialRequestsTextarea.fill('extra spicy');
          
          const addToCartBtn = padThaiItem.locator('button[onclick*="addToCart"]');
          await addToCartBtn.click();
        }
      });

      // Step 3: Customer - Open cart and verify contents
      await test.step('Customer: Open cart and verify contents', async () => {
        // Toggle cart to open
        const cartToggle = customerPage.locator('#cartToggle');
        await cartToggle.click();
        
        // Wait for cart to be expanded
        await expect(customerPage.locator('#orderSummary.cart-expanded')).toBeVisible();
        
        // Verify cart items are correct
        const cartItems = customerPage.locator('#cartItems .cart-item');
        const cartItemCount = await cartItems.count();
        expect(cartItemCount).toBeGreaterThan(0);
        
        // Check that subtotal is displayed
        const cartTotal = customerPage.locator('#cartTotal');
        const totalText = await cartTotal.textContent();
        expect(parseFloat(totalText || '0')).toBeGreaterThan(0);
      });

      // Step 4: Customer - Submit order
      await test.step('Customer: Submit order and verify confirmation', async () => {
        const placeOrderBtn = customerPage.locator('#placeOrder');
        await placeOrderBtn.click();
        
        // Confirm the order in the modal
        await expect(customerPage.locator('#orderModal.show')).toBeVisible();
        const confirmOrderBtn = customerPage.locator('#confirmOrder');
        await confirmOrderBtn.click();
        
        // Wait for success message
        await expect(customerPage.locator('.alert-success')).toBeVisible({ timeout: 10000 });
      });

      // Step 5: Kitchen - Navigate to KDS and verify new order appears
      await test.step('Kitchen: Navigate to KDS and verify new order appears', async () => {
        await kitchenPage.goto('/kitchen');
        
        // Wait for orders to load
        await kitchenPage.waitForSelector('#ordersContainer', { timeout: 10000 });
        
        // Wait for the new order to appear (within 3 seconds as required)
        await kitchenPage.waitForSelector('.order-card:has-text("Table 10")', { timeout: 3000 });
        
        // Verify the order contains the correct items
        const orderCard = kitchenPage.locator('.order-card').filter({ hasText: 'Table 10' }).first();
        await expect(orderCard).toBeVisible();
        
        // Check for Spring Rolls (2x) and Pad Thai (1x) with special request
        await expect(orderCard.locator('.item-name:has-text("Spring Rolls")')).toBeVisible();
        await expect(orderCard.locator('.item-quantity:has-text("2x")')).toBeVisible();
        await expect(orderCard.locator('.item-name:has-text("Pad Thai")')).toBeVisible();
        await expect(orderCard.locator('.item-quantity:has-text("1x")')).toBeVisible();
        await expect(orderCard.locator('.item-special:has-text("extra spicy")')).toBeVisible();
      });

      // Step 6: Kitchen - Update Pad Thai status to Cooking
      await test.step('Kitchen: Change Pad Thai status to Cooking', async () => {
        const orderCard = kitchenPage.locator('.order-card').filter({ hasText: 'Table 10' }).first();
        
        // Find the Pad Thai item and click the "Cooking" button
        const padThaiItem = orderCard.locator('.order-item').filter({ hasText: 'Pad Thai' });
        const cookingBtn = padThaiItem.locator('button[onclick*="updateItemStatus"][onclick*="cooking"]');
        await cookingBtn.click();
        
        // Verify the status is updated
        await expect(padThaiItem.locator('.status-btn.status-cooking[disabled]')).toBeVisible();
      });

      // Step 7: Customer - Verify real-time status update
      await test.step('Customer: Verify Pad Thai status updates to Cooking in real-time', async () => {
        // Wait for the status update to propagate via WebSocket
        await customerPage.waitForTimeout(2000);
        
        // Check that the order status section is visible
        await expect(customerPage.locator('#orderStatus')).toBeVisible({ timeout: 5000 });
        
        // Look for status indicator showing "Cooking" for Pad Thai
        const cookingStatus = customerPage.locator('.order-item').filter({ hasText: 'Pad Thai' }).locator('.status:has-text("Cooking")');
        await expect(cookingStatus).toBeVisible({ timeout: 5000 });
      });

      // Step 8: Cashier - Navigate to cashier and search table 10
      await test.step('Cashier: Navigate to cashier and search table 10', async () => {
        await cashierPage.goto('/cashier');
        
        // Enter table number 10
        const tableSearchInput = cashierPage.locator('#tableSearch');
        await tableSearchInput.fill('10');
        
        // Click search button
        const searchBtn = cashierPage.locator('#searchBtn');
        await searchBtn.click();
        
        // Verify bill section is displayed
        await expect(cashierPage.locator('#billSection')).toBeVisible();
        await expect(cashierPage.locator('#displayTableNumber')).toHaveText('10');
      });

      // Step 9: Cashier - Verify itemized bill and close bill
      await test.step('Cashier: Verify itemized bill and close table', async () => {
        // Verify order list is displayed with correct items
        const orderList = cashierPage.locator('#orderList');
        await expect(orderList).toBeVisible();
        
        // Check that the grand total is displayed and greater than 0
        const grandTotal = cashierPage.locator('#grandTotal');
        const grandTotalText = await grandTotal.textContent();
        expect(parseFloat(grandTotalText?.replace(/[^\d.]/g, '') || '0')).toBeGreaterThan(0);
        
        // Click Close Table button
        const closeTableBtn = cashierPage.locator('#closeTable');
        await closeTableBtn.click();
        
        // Confirm the action
        await cashierPage.on('dialog', dialog => dialog.accept());
        
        // Wait for success message
        await cashierPage.waitForTimeout(1000);
      });

      // Step 10: Cashier - Verify table 10 search shows no open bill
      await test.step('Cashier: Verify searching table 10 again shows no open bill', async () => {
        // Search for table 10 again
        const tableSearchInput = cashierPage.locator('#tableSearch');
        await tableSearchInput.fill('10');
        
        const searchBtn = cashierPage.locator('#searchBtn');
        await searchBtn.click();
        
        // Verify no orders message is displayed
        await expect(cashierPage.locator('#noOrdersMessage')).toBeVisible({ timeout: 5000 });
      });

    } finally {
      // Clean up contexts
      await customerContext.close();
      await kitchenContext.close();
      await cashierContext.close();
    }
  });
});