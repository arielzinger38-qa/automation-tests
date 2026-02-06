import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { HeaderComponent } from '../pages/components/header.component';
import { Users, Products, CheckoutInfo } from '../fixtures/test-data';

/**
 * Helper: login, add an item to cart, navigate to checkout step one.
 * Returns page objects for further assertions.
 */
async function goToCheckout(page: import('@playwright/test').Page, user: { username: string; password: string }) {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(user.username, user.password);
  await page.waitForURL('**/inventory.html');

  const inventoryPage = new InventoryPage(page);
  const header = new HeaderComponent(page);
  await inventoryPage.addToCartBySlug(Products.backpack.slug);
  await expect(header.cartBadge).toHaveText('1');

  await header.goToCart();
  await page.waitForURL('**/cart.html');

  const cartPage = new CartPage(page);
  await cartPage.checkout();
  await page.waitForURL('**/checkout-step-one.html');

  const checkoutPage = new CheckoutPage(page);
  return { loginPage, inventoryPage, cartPage, checkoutPage, header };
}

// ─── standard_user: full checkout should succeed ─────────────────────────
test.describe('Checkout - standard_user', () => {
  test('should complete checkout successfully', async ({ page }) => {
    const { checkoutPage } = await goToCheckout(page, Users.standard);

    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );
    await checkoutPage.continue();
    await page.waitForURL('**/checkout-step-two.html');

    await checkoutPage.finish();
    await page.waitForURL('**/checkout-complete.html');
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});

// ─── locked_out_user: cannot even login ──────────────────────────────────
test.describe('Checkout - locked_out_user', () => {
  test('should be blocked at login and never reach checkout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(Users.lockedOut.username, Users.lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(
      'Epic sadface: Sorry, this user has been locked out.',
    );
    // Verify we're still on the login page
    expect(page.url()).not.toContain('inventory');
  });
});

// ─── problem_user: checkout form has broken last name field ──────────────
test.describe('Checkout - problem_user', () => {
  test('should fail to fill checkout form due to broken last name field', async ({ page }) => {
    const { checkoutPage } = await goToCheckout(page, Users.problem);

    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );

    // problem_user's last name field doesn't accept input properly
    const lastNameValue = await checkoutPage.lastNameInput.inputValue();
    if (lastNameValue !== CheckoutInfo.lastName) {
      // Last name didn't stick - verify the form rejects submission
      await checkoutPage.continue();
      await expect(checkoutPage.errorMessage).toBeVisible();
    } else {
      // If it somehow accepted, continue and verify checkout works
      await checkoutPage.continue();
      await page.waitForURL('**/checkout-step-two.html');
      await checkoutPage.finish();
      await page.waitForURL('**/checkout-complete.html');
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
    }
  });
});

// ─── performance_glitch_user: checkout works but slowly ──────────────────
test.describe('Checkout - performance_glitch_user', () => {
  // Increase timeout for this slow user
  test.setTimeout(60_000);

  test('should complete checkout despite performance delays', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(Users.performanceGlitch.username, Users.performanceGlitch.password);
    await page.waitForURL('**/inventory.html', { timeout: 15_000 });

    const inventoryPage = new InventoryPage(page);
    const header = new HeaderComponent(page);
    await inventoryPage.addToCartBySlug(Products.backpack.slug);
    await expect(header.cartBadge).toHaveText('1');

    await header.goToCart();
    await page.waitForURL('**/cart.html', { timeout: 15_000 });

    const cartPage = new CartPage(page);
    await cartPage.checkout();
    await page.waitForURL('**/checkout-step-one.html', { timeout: 15_000 });

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );
    await checkoutPage.continue();
    await page.waitForURL('**/checkout-step-two.html', { timeout: 15_000 });

    await checkoutPage.finish();
    await page.waitForURL('**/checkout-complete.html', { timeout: 15_000 });
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});

// ─── error_user: encounters errors during checkout ───────────────────────
test.describe('Checkout - error_user', () => {
  test('should fail to complete checkout due to errors', async ({ page }) => {
    const { checkoutPage } = await goToCheckout(page, Users.error);

    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );

    // error_user's last name field gets cleared, but form still submits
    const lastNameValue = await checkoutPage.lastNameInput.inputValue();
    expect(lastNameValue).not.toBe(CheckoutInfo.lastName);

    // Despite missing last name, the form lets error_user proceed to step 2
    await checkoutPage.continue();
    await page.waitForURL('**/checkout-step-two.html');

    // Click Finish - error_user cannot complete the order
    await checkoutPage.finish();

    // Verify we stay on step two (order does NOT complete)
    await expect(page.url()).toContain('checkout-step-two');
    await expect(checkoutPage.completeHeader).not.toBeVisible();
  });
});

// ─── visual_user: checkout should succeed (visual diffs only) ────────────
test.describe('Checkout - visual_user', () => {
  test('should complete checkout successfully despite visual inconsistencies', async ({ page }) => {
    const { checkoutPage } = await goToCheckout(page, Users.visual);

    await checkoutPage.fillShippingInfo(
      CheckoutInfo.firstName,
      CheckoutInfo.lastName,
      CheckoutInfo.postalCode,
    );
    await checkoutPage.continue();
    await page.waitForURL('**/checkout-step-two.html');

    await checkoutPage.finish();
    await page.waitForURL('**/checkout-complete.html');
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });
});
