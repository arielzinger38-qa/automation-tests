# SauceDemo Automation Test Suite

Automation test suite for [Sauce Demo](https://www.saucedemo.com/) (Swag Labs) covering UI end-to-end flows and API contract testing.

- **UI Tests**: Playwright + TypeScript (7 tests)
- **API Tests**: Python + requests + pytest (4 tests) against [jsonplaceholder](https://jsonplaceholder.typicode.com/)

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.10
- **npm** (comes with Node.js)
- **pip** (comes with Python)

## Install

### UI Tests

```bash
cd ui-tests
npm install
npx playwright install chromium
```

### API Tests

```bash
cd api-tests
pip install -r requirements.txt
```

## How to Run UI Tests

```bash
cd ui-tests

# Run all tests (headless)
npx playwright test

# Run with browser visible
npx playwright test --headed

# Run smoke tests only
npx playwright test --grep @smoke

# Run a specific spec file
npx playwright test tests/login.spec.ts
```

## How to Run API Tests

```bash
cd api-tests

# Run all API tests
pytest tests/ -v

# Run a specific test file
pytest tests/test_users_positive.py -v
```

## How to Generate/View Reports

### Playwright HTML Report (UI)

```bash
cd ui-tests

# After running tests, open the report
npx playwright show-report
```

The report is generated at `ui-tests/playwright-report/index.html`. On failure, traces and videos are saved in `ui-tests/test-results/`.

### Pytest HTML Report (API)

```bash
cd api-tests

# Generate HTML report
pytest tests/ -v --html=report.html --self-contained-html
```

Open `api-tests/report.html` in a browser.

## Configuration

### UI Tests

| Variable | Default | Description |
|---|---|---|
| `BASE_URL` | `https://www.saucedemo.com` | Application URL |
| `HEADLESS` | `true` | Run browser in headless mode |
| `CI` | - | Set automatically in CI; enables retries |

Copy `.env.example` to `.env` to override defaults:

```bash
cp .env.example .env
```

### Playwright Config

See `ui-tests/playwright.config.ts` for timeout, retry, trace, and reporter settings.

## Project Structure

```
├── ui-tests/                        # Playwright + TypeScript
│   ├── playwright.config.ts         # Playwright configuration
│   ├── pages/                       # Page Object Models
│   │   ├── login.page.ts
│   │   ├── inventory.page.ts
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   └── components/
│   │       └── header.component.ts
│   ├── fixtures/
│   │   └── test-data.ts             # Centralized test data
│   └── tests/
│       ├── login.spec.ts
│       ├── inventory.spec.ts
│       ├── cart.spec.ts
│       └── e2e-checkout.spec.ts
│
├── api-tests/                       # Python + requests
│   ├── requirements.txt
│   ├── conftest.py                  # Shared pytest fixtures
│   ├── schemas/
│   │   └── user_schema.json         # JSON schema for contract tests
│   ├── utils/
│   │   └── api_client.py            # API client wrapper
│   └── tests/
│       ├── test_users_positive.py
│       ├── test_users_negative.py
│       └── test_users_schema.py
│
├── .github/workflows/ci.yml        # GitHub Actions CI pipeline
├── TEST_PLAN.md                     # Test strategy document
├── prd.md                           # Product requirements
└── README.md                        # This file
```

## CI

GitHub Actions runs both suites on push/PR to `main`/`master`. See `.github/workflows/ci.yml`.

Artifacts uploaded on every run:
- `playwright-report` - HTML report for UI tests
- `playwright-traces` - Traces on failure
- `api-test-report` - HTML report for API tests
