# Test Plan

## What We Chose to Automate (and Why)

| Test | Type | Rationale |
|---|---|---|
| Login with valid credentials | UI - Happy path | Core gate to the app; highest regression risk |
| Login with locked-out user | UI - Negative | Validates error handling for blocked accounts |
| Login with empty credentials | UI - Negative | Validates client-side form validation |
| Sort products by price | UI - State change | Verifies inventory sorting logic end-to-end |
| Add items to cart (badge update) | UI - State change | Core shopping functionality; badge is key UX indicator |
| Remove item from cart | UI - State change | Validates cart state management and UI sync |
| Full E2E checkout flow | UI - E2E | The critical business path from login to order confirmation |
| List users (GET 200) | API - Positive | Verifies GET /users returns array of 10 users with expected fields |
| Create post (POST 201) | API - Positive | Verifies POST /posts creates resource with correct response |
| Get non-existent user (404) | API - Negative | Validates proper 404 status for missing user /users/9999 |
| Single user schema validation | API - Contract | Validates GET /users/1 response matches JSON schema contract |

## What We Intentionally Did NOT Automate (and Why)

| Area | Reason |
|---|---|
| Visual regression | Requires dedicated tooling (Percy, Applitools). Out of scope for functional suite. |
| `performance_glitch_user` tests | Artificial delay, not a functional bug. Would only test Playwright's wait mechanisms. |
| `problem_user` / `error_user` flows | Intentionally broken by design. Testing known-broken behavior adds no regression value. |
| Cross-browser testing | Suite runs on Chromium only. Easy to extend via `playwright.config.ts` projects later. |
| Sidebar "About" link | Navigates to external saucelabs.com. Third-party site testing is unreliable. |
| Session timeout (10 min idle) | Would make tests unacceptably slow. Better tested manually or with mocked timers. |
| Product detail page navigation | Covered implicitly by cart/checkout flows. Standalone test would be low-value duplication. |

## Risks and Assumptions

| Risk / Assumption | Mitigation |
|---|---|
| SauceDemo is a third-party site that could go down or change | Tests fail clearly with timeouts. Selectors centralized in POM for single-point fixes. |
| `data-test` attributes could be removed | All selectors in POM classes. Migration to role-based selectors is straightforward. |
| jsonplaceholder.typicode.com could be slow or unavailable | Few tests, session reuse, sequential execution. |
| Fixed test data (6 products, known prices) | Hardcoded in `fixtures/test-data.ts`. One file to update if products change. |
| Network flakiness in CI | 1 retry in CI. Trace + video + screenshot on failure for debugging. |

## How to Run

### Locally

```bash
# UI Tests
cd ui-tests
npm install
npx playwright install chromium
npx playwright test              # headless
npx playwright test --headed     # see the browser

# API Tests
cd api-tests
pip install -r requirements.txt
pytest tests/ -v
```

### In CI (GitHub Actions)

Push to `main`/`master` or open a PR. The workflow at `.github/workflows/ci.yml` runs both suites automatically. Reports are uploaded as artifacts.

## Stability Approach

| Concern | Strategy |
|---|---|
| **Selectors** | `data-test` attributes as primary selectors (SauceDemo provides them). No fragile CSS chains. |
| **Waits** | Playwright auto-waiting + explicit `waitForURL()` after navigation. No arbitrary `sleep()`. |
| **Test isolation** | Each test gets a fresh browser context. No shared state between tests. |
| **Test data** | Centralized in `fixtures/test-data.ts` (UI) and fixtures in `conftest.py` (API). |
| **Retries** | 1 retry in CI only (transient network issues). 0 retries locally for fast feedback. |
| **Timeouts** | 30s per test, 10s per action, 5s per assertion. Generous but bounded. |
| **Failure artifacts** | Trace, video, and screenshot captured on failure (Playwright). HTML report for API tests. |
| **Tagging** | `@smoke` tag on login + e2e checkout. Run with `--grep @smoke` for quick validation. |
