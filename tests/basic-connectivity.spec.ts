import { test, expect } from '@playwright/test';

test.describe('Restaurant System Basic Tests', () => {
  test('should load customer menu page', async ({ page }) => {
    await page.goto('/menu.html?table=10');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check basic page elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('#tableNumber')).toHaveText('10');
    
    // Wait for menu to load
    await page.waitForSelector('#menuContainer:not(.hidden)', { timeout: 10000 });
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-customer.png' });
  });

  test('should load kitchen display page', async ({ page }) => {
    await page.goto('/kitchen');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check basic elements
    await expect(page.locator('h1')).toContainText('Kitchen Display');
    await expect(page.locator('#ordersContainer')).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-kitchen.png' });
  });

  test('should load cashier page', async ({ page }) => {
    await page.goto('/cashier');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check basic elements
    await expect(page.locator('h1')).toContainText('Cashier');
    await expect(page.locator('#tableSearch')).toBeVisible();
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-cashier.png' });
  });
});