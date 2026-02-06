
# Testing Infrastructure

EvoWell uses **Vitest** for unit and integration testing, **React Testing Library** for component testing, and **MSW** for API mocking.

## Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Structure

- `tests/setup.ts`: Global test setup (mocks for browser APIs).
- `tests/utils.tsx`: Custom render functions and helpers.
- `tests/mocks/`: MSW handlers and server configuration.
- `tests/`: Test files location.

## Writing Tests

### Component Tests
Use `render` from `@testing-library/react`. Mock any necessary context or API calls.

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

it('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### API Tests
MSW intercepts requests. Add handlers in `tests/mocks/handlers.ts` if needed, or use `server.use()` within a specific test file to override.

```typescript
import { server } from './mocks/server';
import { http, HttpResponse } from 'msw';

it('handles error', async () => {
  server.use(
    http.get('/api/resource', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  // ... perform action that triggers API call
});
```

## Coverage Requirements
We enforce minimum coverage thresholds:
- Statements: 70%
- Branches: 65%
- Functions: 70%
- Lines: 70%

The CI pipeline will fail if these thresholds are not met.
