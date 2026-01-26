import { describe, it, expect } from 'vitest';

/**
 * Example test to verify Vitest setup is working correctly
 */

describe('Vitest Setup', () => {
  it('should run basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });

  it('should support array and object matchers', () => {
    const data = { name: 'test', value: 42 };
    expect(data).toHaveProperty('name', 'test');
    expect([1, 2, 3]).toContain(2);
  });
});
