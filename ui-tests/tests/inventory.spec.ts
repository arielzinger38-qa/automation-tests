import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { HeaderComponent } from '../pages/components/header.component';
import { Users, Products } from '../fixtures/test-data';

test.describe('Inventory', () => {
  let inventoryPage: InventoryPage;
  let header: HeaderComponent;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await page.waitForURL('**/inventory.html');

    inventoryPage = new InventoryPage(page);
    header = new HeaderComponent(page);
  });

  test('should sort products by price low-to-high', async () => {
    await inventoryPage.sortBy('lohi');

    const prices = await inventoryPage.getAllPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
    expect(prices[0]).toBe(Products.onesie.price);
    expect(prices[prices.length - 1]).toBe(Products.fleeceJacket.price);
  });

  test('should update cart badge when adding items', async () => {
    await inventoryPage.addToCartBySlug(Products.backpack.slug);
    await expect(header.cartBadge).toHaveText('1');

    await inventoryPage.addToCartBySlug(Products.bikeLight.slug);
    await expect(header.cartBadge).toHaveText('2');
  });
});
