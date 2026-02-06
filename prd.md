# PRD: SauceDemo Automation Test Suite

## 1. Overview

Build a production-minded automation suite for **Sauce Demo** (https://www.saucedemo.com/), a sample e-commerce web app ("Swag Labs") with login, product catalog, cart, and checkout flows.

- **UI Tests**: Playwright with TypeScript
- **API Tests**: Python with `requests` (against https://jsonplaceholder.typicode.com/ since SauceDemo has no public API)
- **Target**: Demonstrate good coverage choices, reliability, maintainability, and CI-readiness

---

## 2. Target Application: SauceDemo (Swag Labs)

### Pages & Functionality

| Page | URL | Key Features |
|---|---|---|
| Login | `/` | Username/password form, error messages, multiple test users |
| Inventory | `/inventory.html` | 6 products, sort dropdown (name/price), add-to-cart buttons |
| Product Detail | `/inventory-item.html?id=<ID>` | Single product view, add/remove from cart |
| Cart | `/cart.html` | Cart items list, remove button, continue shopping / checkout |
| Checkout Step 1 | `/checkout-step-one.html` | First name, last name, zip code form with validation |
| Checkout Step 2 | `/checkout-step-two.html` | Order summary, item total, tax, total price |
| Checkout Complete | `/checkout-complete.html` | Confirmation message, "Back Home" button |
| Sidebar Menu | (overlay) | All Items, About, Logout, Reset App State |

### Test Users (password for all: `secret_sauce`)

| Username | Behavior |
|---|---|
| `standard_user` | Normal / happy path |
| `locked_out_user` | Login blocked with error message |
| `problem_user` | Broken images, checkout field issues |
| `performance_glitch_user` | Slow responses |
| `error_user` | Errors during interactions |
| `visual_user` | Visual/UI inconsistencies |

### API Target: jsonplaceholder.typicode.com

| Endpoint | Method | Purpose |
|---|---|---|
| `/users` | GET | List users (positive) |
| `/users/9999` | GET | Non-existent user (negative - 404) |
| `/posts` | POST | Create post (positive) |
| `/users/1` | GET | Single user (schema/contract validation) |

---

## 3. Project Structure

```
assignment/
├── ui-tests/                        # Playwright + TypeScript
│   ├── package.json
│   ├── playwright.config.ts         # Base URL, headless, retries, trace, reporters
│   ├── tsconfig.json
│   ├── .env.example                 # BASE_URL, HEADLESS, etc.
│   ├── pages/                       # Page Object Model classes
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── components/
│   │       └── header.component.ts  # Shared header (cart badge, hamburger menu)
│   ├── fixtures/
│   │   └── test-data.ts             # Centralized test data (users, products)
│   ├── tests/
│   │   ├── login.spec.ts
│   │   ├── inventory.spec.ts
│   │   ├── cart.spec.ts
│   │   └── e2e-checkout.spec.ts
│   └── utils/
│       └── helpers.ts               # Shared utilities (login helper, etc.)
│
├── api-tests/                       # Python + requests
│   ├── requirements.txt             # requests, pytest, jsonschema
│   ├── conftest.py                  # Shared fixtures (base_url, session)
│   ├── schemas/                     # JSON schemas for contract validation
│   │   └── user_schema.json
│   ├── tests/
│   │   ├── test_users_positive.py
│   │   ├── test_users_negative.py
│   │   └── test_users_schema.py
│   └── utils/
│       └── api_client.py            # Wrapper around requests with base URL
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI pipeline
│
├── TEST_PLAN.md
├── README.md
└── prd.md
```

---

## 4. UI Tests (Playwright + TypeScript)

### 4.1 Test Cases (minimum 7 tests across 4 spec files)

#### `login.spec.ts`

| # | Test Name | Type | Description |
|---|---|---|---|
| UI-1 | Should login successfully with standard_user | Happy path | Enter valid credentials, verify redirect to inventory page, verify products are visible |
| UI-2 | Should show error for locked_out_user | Negative | Attempt login with `locked_out_user`, verify error message "Epic sadface: Sorry, this user has been locked out." |
| UI-3 | Should show error for empty credentials | Negative | Submit login form with empty fields, verify required-field error message |

#### `inventory.spec.ts`

| # | Test Name | Type | Description |
|---|---|---|---|
| UI-4 | Should sort products by price low-to-high | State change | Select "Price (low to high)" from sort dropdown, verify first product is cheapest ($7.99) and last is most expensive ($49.99) |
| UI-5 | Should add item to cart and see badge update | State change | Click "Add to cart" on a product, verify cart badge shows "1", click another, verify badge shows "2" |

#### `cart.spec.ts`

| # | Test Name | Type | Description |
|---|---|---|---|
| UI-6 | Should remove item from cart | State change | Add item, go to cart, click remove, verify cart is empty and badge disappears |

#### `e2e-checkout.spec.ts`

| # | Test Name | Type | Description |
|---|---|---|---|
| UI-7 | Should complete full purchase end-to-end | E2E happy path | Login -> add 2 items -> go to cart -> checkout step 1 (fill form) -> verify step 2 summary (items, total, tax) -> finish -> verify completion message "Thank you for your order!" |

### 4.2 Page Object Model Design

Each POM class encapsulates:
- **Locators** as readonly properties (using `data-test` attributes where available, falling back to stable selectors like `[id="..."]` or role-based locators)
- **Actions** as async methods (e.g., `login(user, pass)`, `addToCart(productName)`)
- **Assertions helpers** where appropriate (e.g., `getCartBadgeCount()`)

#### Key Selectors Strategy (SauceDemo uses `data-test` attributes):

```
Login:        [data-test="username"], [data-test="password"], [data-test="login-button"], [data-test="error"]
Inventory:    [data-test="inventory-item"], [data-test="product-sort-container"]
Cart:         [data-test="cart-list"], [data-test="checkout"], [data-test="continue-shopping"]
Checkout:     [data-test="firstName"], [data-test="lastName"], [data-test="postalCode"], [data-test="continue"]
Add to cart:  [data-test="add-to-cart-<product-slug>"]
Remove:       [data-test="remove-<product-slug>"]
```

### 4.3 Playwright Configuration

```typescript
// Key settings for playwright.config.ts
{
  baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
  headless: process.env.HEADLESS !== 'false',       // default headless in CI
  timeout: 15_000,                                    // per-test timeout
  expect: { timeout: 5_000 },                        // assertion timeout
  retries: process.env.CI ? 1 : 0,                   // 1 retry in CI only
  trace: 'retain-on-failure',                         // trace zip on failure
  screenshot: 'only-on-failure',                      // screenshot on failure
  video: 'retain-on-failure',                         // video on failure
  reporter: [
    ['html', { open: 'never' }],                      // HTML report
    ['list']                                           // console output
  ],
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
}
```

### 4.4 Stability / Anti-Flake Strategy

| Concern | Approach |
|---|---|
| **Selectors** | Prefer `data-test` attributes (SauceDemo provides them). Fall back to `getByRole()` / `getByText()` for elements without data-test. Never use fragile CSS chains like `.div > .container > span:nth-child(2)`. |
| **Waits** | Use Playwright's auto-waiting. Explicit `waitForURL()` after navigation. `expect().toBeVisible()` before interacting with dynamic elements. |
| **Test isolation** | Each test starts from a fresh browser context. Login is done per-test (fast since SauceDemo login is near-instant). No shared state between tests. |
| **Test data** | Hardcoded in `test-data.ts` fixture. SauceDemo has fixed products/users so no dynamic data setup needed. |
| **Retries** | 1 retry in CI only (to absorb transient network issues), 0 locally. |
| **Timeouts** | 15s per test, 5s per assertion. Generous enough for `performance_glitch_user` scenarios if needed. |
| **Tagging** | Use `test.describe` grouping. Support `--grep @smoke` for smoke suite (login + e2e checkout). |

---

## 5. API Tests (Python + requests + pytest)

### 5.1 Test Cases (minimum 4 tests)

| # | Test Name | Type | Description |
|---|---|---|---|
| API-1 | `test_list_users_returns_200_with_data` | Positive | GET `/users` -> status 200, response is array of 10 user objects with id, name, email, username |
| API-2 | `test_create_post_returns_201` | Positive | POST `/posts` with `{"title": "test title", "body": "test body", "userId": 1}` -> status 201, response echoes fields + has `id` |
| API-3 | `test_get_nonexistent_user_returns_404` | Negative | GET `/users/9999` -> status 404, empty response body `{}` |
| API-4 | `test_single_user_matches_schema` | Schema/Contract | GET `/users/1` -> validate response against JSON schema (required fields: id, name, username, email, address with geo, phone, website, company) |

### 5.2 JSON Schema for Contract Validation

```json
{
  "type": "object",
  "required": ["id", "name", "username", "email", "address", "phone", "website", "company"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "username": { "type": "string" },
    "email": { "type": "string" },
    "address": {
      "type": "object",
      "required": ["street", "suite", "city", "zipcode", "geo"]
    },
    "phone": { "type": "string" },
    "website": { "type": "string" },
    "company": {
      "type": "object",
      "required": ["name", "catchPhrase", "bs"]
    }
  }
}
```

### 5.3 Python Project Setup

```
# requirements.txt
requests>=2.31.0
pytest>=7.4.0
pytest-html>=4.1.0
jsonschema>=4.20.0
```

### 5.4 API Client Wrapper

```python
# api_client.py - thin wrapper for reuse
class JsonPlaceholderClient:
    BASE_URL = "https://jsonplaceholder.typicode.com"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def get_users(self):
        return self.session.get(f"{self.BASE_URL}/users")

    def get_user(self, user_id):
        return self.session.get(f"{self.BASE_URL}/users/{user_id}")

    def create_post(self, title, body, user_id):
        return self.session.post(f"{self.BASE_URL}/posts", json={"title": title, "body": body, "userId": user_id})
```

---

## 6. CI Pipeline (GitHub Actions)

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  ui-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd ui-tests && npm ci
      - run: cd ui-tests && npx playwright install --with-deps chromium
      - run: cd ui-tests && npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: ui-tests/playwright-report/

  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.12' }
      - run: cd api-tests && pip install -r requirements.txt
      - run: cd api-tests && pytest --html=report.html --self-contained-html -v
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: api-test-report
          path: api-tests/report.html
```

---

## 7. What to Automate vs. What NOT to Automate

### Automated (and why)

| Area | Rationale |
|---|---|
| Login (happy + negative) | Core gate to the app. High regression risk. Quick to automate. |
| Product sorting | Validates inventory logic, easy to assert order programmatically. |
| Add/remove cart items | Core state-change functionality. Cart badge is a key UI indicator. |
| Full E2E checkout | The critical business flow. Covers the most surface area in one test. |
| API CRUD + schema | Demonstrates API discipline with minimal overhead. |

### NOT Automated (and why)

| Area | Rationale |
|---|---|
| Visual regression (pixel diff) | Out of scope for this suite; would need a dedicated tool (e.g., Playwright visual comparisons or Percy). Worth adding later. |
| Performance/glitch user tests | `performance_glitch_user` behavior is artificial delay, not a functional bug. Not meaningful for a functional suite. |
| Cross-browser matrix | Assignment scope is Chromium only. Easy to expand via `playwright.config.ts` projects. |
| Sidebar "About" link (external) | Navigates to external saucelabs.com. Testing third-party sites is unreliable and out of scope. |
| Session timeout (10 min) | Would make tests slow. Better tested manually or with mocked timers. |
| `problem_user` / `error_user` flows | These are intentionally broken by design. Testing known-broken behavior doesn't add value to a functional regression suite. |

---

## 8. Risks & Assumptions

| Risk/Assumption | Mitigation |
|---|---|
| SauceDemo is a third-party site that could go down | Tests will fail clearly with timeout errors. No workaround other than retry. |
| `data-test` attributes could change | Selectors are centralized in POM classes, making updates a single-point fix. |
| jsonplaceholder API could be slow or unavailable | API client uses a session for connection reuse. Tests are few and run sequentially. |
| Fixed test data (6 products, specific prices) | Hardcoded in fixture file. If SauceDemo changes products, update one file. |
| Network flakiness in CI | 1 retry in CI. Trace/video/screenshot captured on failure for debugging. |

---

## 9. Deliverables Checklist

| Deliverable | File(s) |
|---|---|
| UI automation code (Playwright + TS) | `ui-tests/` directory |
| API automation code (Python + requests) | `api-tests/` directory |
| Page Object Models | `ui-tests/pages/*.page.ts` |
| Test plan document | `TEST_PLAN.md` |
| Project README with run instructions | `README.md` |
| CI pipeline config | `.github/workflows/ci.yml` |
| Environment config example | `ui-tests/.env.example` |
| Playwright config | `ui-tests/playwright.config.ts` |
| API JSON schemas | `api-tests/schemas/user_schema.json` |
| HTML reports (generated) | `playwright-report/`, `api-tests/report.html` |

---

## 10. Implementation Order

1. **Scaffold UI project** - `npm init`, install Playwright, create `playwright.config.ts`, `tsconfig.json`, `.env.example`
2. **Build Page Objects** - `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`, `HeaderComponent`
3. **Write UI tests** - login specs, inventory specs, cart specs, e2e checkout spec
4. **Scaffold API project** - `requirements.txt`, `conftest.py`, API client wrapper
5. **Write API tests** - positive, negative, schema validation
6. **Create CI pipeline** - `.github/workflows/ci.yml`
7. **Write TEST_PLAN.md** - document choices, risks, run instructions, stability approach
8. **Write README.md** - prerequisites, install, run commands, report viewing
9. **Run full suite locally** - verify all tests pass, fix any issues
10. **Final review** - check naming, assertions, structure consistency
