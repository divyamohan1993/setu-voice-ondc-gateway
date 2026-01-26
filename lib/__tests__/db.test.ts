import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { checkDatabaseHealth, connectDatabase, disconnectDatabase, handleDatabaseError } from '../db';

describe('Database Utilities', () => {
  describe('handleDatabaseError', () => {
    it('should return user-friendly message for P2002 (unique constraint)', () => {
      const error = { code: 'P2002' };
      expect(handleDatabaseError(error)).toBe('A record with this information already exists');
    });

    it('should return user-friendly message for P2003 (foreign key constraint)', () => {
      const error = { code: 'P2003' };
      expect(handleDatabaseError(error)).toBe('Referenced record not found');
    });

    it('should return user-friendly message for P2025 (record not found)', () => {
      const error = { code: 'P2025' };
      expect(handleDatabaseError(error)).toBe('Record not found');
    });

    it('should return user-friendly message for P1001 (cannot reach database)', () => {
      const error = { code: 'P1001' };
      expect(handleDatabaseError(error)).toBe('Cannot reach database server');
    });

    it('should return generic message for unknown error codes', () => {
      const error = { code: 'UNKNOWN' };
      expect(handleDatabaseError(error)).toBe('A database error occurred');
    });

    it('should return generic message for errors without code', () => {
      const error = {};
      expect(handleDatabaseError(error)).toBe('A database error occurred');
    });
  });

  // Note: The following tests require a running database
  // They are commented out to avoid test failures in CI/CD
  // Uncomment when running with a live database

  /*
  describe('Database Connection', () => {
    it('should check database health successfully', async () => {
      const isHealthy = await checkDatabaseHealth();
      expect(isHealthy).toBe(true);
    });

    it('should connect to database successfully', async () => {
      await expect(connectDatabase()).resolves.not.toThrow();
    });

    it('should disconnect from database successfully', async () => {
      await expect(disconnectDatabase()).resolves.not.toThrow();
    });
  });
  */
});
