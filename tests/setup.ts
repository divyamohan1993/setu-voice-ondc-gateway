import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock 'server-only' for tests
vi.mock('server-only', () => ({}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
// process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
// process.env.NODE_ENV = 'test';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Server Actions removed - integration tests should use real actions
