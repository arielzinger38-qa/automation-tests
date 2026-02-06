import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { InventoryPage } from '../pages/inventory.page';
import { Users, ErrorMessages } from '../fixtures/test-data';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with standard_user @smoke', async ({ page }) => {
    await loginPage.login(Users.standard.username, Users.standard.password);

    await page.waitForURL('**/inventory.html');
    const inventoryPage = new InventoryPage(page);
    await expect(inventoryPage.inventoryItems.first()).toBeVisible();
  });

  test('should show error for locked_out_user', async () => {
    await loginPage.login(Users.lockedOut.username, Users.lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(ErrorMessages.lockedOut);
  });

  test('should show error when submitting empty credentials', async () => {
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(ErrorMessages.usernameRequired);
  });
});
