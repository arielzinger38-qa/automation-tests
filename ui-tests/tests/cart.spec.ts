import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { HeaderComponent } from '../pages/components/header.component';
import { Users, Products } from '../fixtures/test-data';

test.describe('Cart', () => {
  test('should remove item from cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await page.waitForURL('**/inventory.html');

    const inventoryPage = new InventoryPage(page);
    const header = new HeaderComponent(page);

    await inventoryPage.addToCartBySlug(Products.backpack.slug);
    await expect(header.cartBadge).toHaveText('1');

    await header.goToCart();
    await page.waitForURL('**/cart.html');

    const cartPage = new CartPage(page);
    const itemsBefore = await cartPage.getItemNames();
    expect(itemsBefore).toContain(Products.backpack.name);

    await cartPage.removeBySlug(Products.backpack.slug);

    await expect(cartPage.cartItems).toHaveCount(0);
    await expect(header.cartBadge).not.toBeVisible();
  });
});
