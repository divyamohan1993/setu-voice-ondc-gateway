# Testing Guide for Setu Voice-to-ONDC Gateway

## Overview

This directory contains the test suite for the Setu application. We use **Vitest** as our testing framework with **React Testing Library** for component testing.

## Test Structure

```
tests/
 setup.ts                    # Global test setup and configuration
 utils/                      # Testing utilities and helpers
    test-utils.tsx         # Custom render function with providers
    server-action-helpers.ts # Helpers for testing Server Actions
    prisma-mock.ts         # Mock Prisma client utilities
 fixtures/                   # Test data and mock objects
    beckn-catalog.ts       # Sample Beckn catalog items
    database.ts            # Mock database entities
 README.md                   # This file
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should be co-located with the source files using the `.test.ts` or `.test.tsx` suffix:

```
lib/
 translation-agent.ts
 translation-agent.test.ts
```

### Component Tests

Use the custom render function from `tests/utils/test-utils.tsx`:

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing Server Actions

Use the helpers from `tests/utils/server-action-helpers.ts`:

```typescript
import { vi } from 'vitest';
import { mockTranslateVoiceAction } from '@/tests/utils/server-action-helpers';
import { SAMPLE_ONION_CATALOG } from '@/tests/fixtures/beckn-catalog';

vi.mock('@/app/actions', () => ({
  translateVoiceAction: mockTranslateVoiceAction(SAMPLE_ONION_CATALOG),
}));
```

### Using Test Fixtures

Import pre-defined test data from the fixtures directory:

```typescript
import { SAMPLE_ONION_CATALOG, createTestCatalog } from '@/tests/fixtures/beckn-catalog';
import { MOCK_FARMER, createMockFarmer } from '@/tests/fixtures/database';

// Use sample data
const catalog = SAMPLE_ONION_CATALOG;

// Create custom test data
const customCatalog = createTestCatalog({
  price: { value: 50, currency: 'INR' },
});
```

### Mocking Prisma

Use the Prisma mock utilities for testing database operations:

```typescript
import { createMockPrismaClient } from '@/tests/utils/prisma-mock';
import { MOCK_CATALOG_DRAFT } from '@/tests/fixtures/database';

const mockPrisma = createMockPrismaClient();
mockPrisma.catalog.findUnique.mockResolvedValue(MOCK_CATALOG_DRAFT);
```

## Test Coverage

We aim for at least 80% code coverage. Run `npm run test:coverage` to generate a coverage report.

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component/function does, not how it does it.

2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested.

3. **Arrange-Act-Assert Pattern**: Structure tests with clear setup, execution, and verification phases.

4. **Avoid Over-Mocking**: Only mock external dependencies, not internal logic.

5. **Test Edge Cases**: Include tests for error conditions, empty inputs, and boundary values.

6. **Keep Tests Independent**: Each test should be able to run in isolation.

7. **Use Test Fixtures**: Reuse common test data from the fixtures directory.

## Property-Based Testing

For property-based tests, we use the `fast-check` library. These tests verify universal properties across many randomly generated inputs.

Example:
```typescript
import fc from 'fast-check';

test('property: all valid catalogs serialize correctly', () => {
  fc.assert(
    fc.property(becknCatalogArbitrary, (catalog) => {
      const serialized = JSON.stringify(catalog);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(catalog);
    }),
    { numRuns: 100 }
  );
});
```

## Troubleshooting

### Tests Failing Due to Missing Mocks

Make sure you've imported the test setup:
```typescript
import '@/tests/setup';
```

### Server Actions Not Mocked

Check that you're using the correct mock path:
```typescript
vi.mock('@/app/actions', () => ({ ... }));
```

### Prisma Client Errors

Ensure you're using the mock Prisma client in tests, not the real one.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
