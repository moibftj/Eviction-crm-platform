import { PrismaClient } from "@prisma/client"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "./error-handler"
import { logger } from "./logger"

// Enhanced Prisma client with better error handling
const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Create Prisma client with logging based on environment
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

// Keep reference in global object in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Database connection status
let isConnected = false
let connectionAttempts = 0
const MAX_CONNECTION_ATTEMPTS = 5

// Initialize database connection with retry logic
export async function initDatabase(): Promise<boolean> {
  if (isConnected) return true

  try {
    // Test the connection with a simple query
    await prisma.$queryRaw`SELECT 1`
    isConnected = true
    connectionAttempts = 0
    logger.info("Database connection established successfully")
    return true
  } catch (error) {
    connectionAttempts++

    const appError = createAppError(
      `Database connection failed (attempt ${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`,
      {
        severity: connectionAttempts >= MAX_CONNECTION_ATTEMPTS ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        cause: error instanceof Error ? error : undefined,
        recoverable: connectionAttempts < MAX_CONNECTION_ATTEMPTS,
      },
    )

    await handleError(appError)

    // If we've reached max attempts, don't try again automatically
    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      logger.fatal("Maximum database connection attempts reached, giving up")
      return false
    }

    // Exponential backoff for retries
    const backoffMs = Math.min(1000 * Math.pow(2, connectionAttempts), 30000)
    logger.info(`Retrying database connection in ${backoffMs}ms`)

    // Wait and try again
    await new Promise((resolve) => setTimeout(resolve, backoffMs))
    return initDatabase()
  }
}

// Wrapper for database operations with error handling
export async function withErrorHandling<T>(operation: () => Promise<T>, errorMessage: string): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const appError = createAppError(`${errorMessage}: ${error instanceof Error ? error.message : "Unknown error"}`, {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.DATABASE,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)
    throw appError
  }
}
