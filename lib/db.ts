import 'server-only';
import { PrismaClient } from './generated-client/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client Singleton
 * 
 * This ensures we only create one instance of PrismaClient in development
 * to avoid exhausting database connections during hot reloading.
 */
export const prisma = globalForPrisma.prisma ?? (() => {
  // Use BetterSQLite3 adapter for local development
  const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || 'file:./dev.db'
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
})();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Database Health Check
 * 
 * Verifies that the database connection is working by executing a simple query.
 * This is useful for deployment scripts and health check endpoints.
 * 
 * @returns Promise<boolean> - true if database is healthy, false otherwise
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Execute a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Connect to Database
 * 
 * Explicitly connects to the database with error handling.
 * This is useful for ensuring connection before critical operations.
 * 
 * @throws Error if connection fails after retries
 */
export async function connectDatabase(): Promise<void> {
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('[OK] Database connected successfully');
      return;
    } catch (error) {
      console.error(`[X] Database connection attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt === maxRetries) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

/**
 * Disconnect from Database
 * 
 * Gracefully disconnects from the database.
 * Should be called during application shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('[OK] Database disconnected successfully');
  } catch (error) {
    console.error('[X] Error disconnecting from database:', error);
  }
}

/**
 * Handle Database Errors
 * 
 * Provides user-friendly error messages for common Prisma errors.
 * 
 * @param error - The error object from Prisma
 * @returns string - User-friendly error message
 */
export function handleDatabaseError(error: any): string {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference

  if (error.code === 'P2002') {
    return 'A record with this information already exists';
  }

  if (error.code === 'P2003') {
    return 'Referenced record not found';
  }

  if (error.code === 'P2025') {
    return 'Record not found';
  }

  if (error.code === 'P1001') {
    return 'Cannot reach database server';
  }

  if (error.code === 'P1002') {
    return 'Database server connection timeout';
  }

  if (error.code === 'P1008') {
    return 'Database operation timeout';
  }

  // Generic error message
  return 'A database error occurred';
}
