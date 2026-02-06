import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HeaderComponent } from '../pages/components/header.component';
import { Users, Products, CheckoutInfo } from '../fixtures/test-data';

test.describe('End-to-End Checkout', () => {
  test('should complete full purchase flow @smoke', async ({ page }) => {
    // 1. Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(Users.standard.username, Users.standard.password);
    await page.waitForURL('**/inventory.html');

    // 2. Add two items to cart
    const inventoryPage = new InventoryPage(page);
    const header = new HeaderComponent(page);
    await inventoryPage.addToCartBySlug(Products.backpack.slug);
    await inventoryPage.addToCartBySlug(Products.onesie.slug);
    await expect(header.cartBadge).toHaveText('2');

    // 3. Go to cart and verify items
    await header.goToCart();
    await page.waitForURL('**/cart.html');
    const cartPage = new CartPage(page);
    const cartItems = await cartPage.getItemNames();
    expect(cartItems).toContain(Products.backpack.name);
    expect(cartItems).toContain(Products.onesie.name);

    // 4. Checkout step 1 - fill shipping info
    await cartPage.checkout();
    await page.waitForURL('**/checkout-step-one.html');
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );
    await checkoutPage.continue();

    // 5. Checkout step 2 - verify summary
    await page.waitForURL('**/checkout-step-two.html');
    const totalText = await checkoutPage.getTotal();
    const expectedSubtotal = Products.backpack.price + Products.onesie.price;
    expect(totalText).toContain('$');
    // Verify the total includes tax (should be > subtotal)
    const totalMatch = totalText.match(/\$(\d+\.\d+)/);
    expect(totalMatch).not.toBeNull();
    const totalValue = parseFloat(totalMatch![1]);
    expect(totalValue).toBeGreaterThan(expectedSubtotal);

    // 6. Finish and verify completion
    await checkoutPage.finish();
    await page.waitForURL('**/checkout-complete.html');
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
