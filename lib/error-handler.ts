/**
 * Centralized error handling utility for the application
 * Provides structured error types, logging, and recovery strategies
 */

import { logger } from "./logger"

// Error severity levels
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Error categories
export enum ErrorCategory {
  DATABASE = "database",
  AUTHENTICATION = "authentication",
  API = "api",
  EMAIL = "email",
  DEPLOYMENT = "deployment",
  ENVIRONMENT = "environment",
  UNKNOWN = "unknown",
}

// Error with additional context
export interface AppError extends Error {
  severity: ErrorSeverity
  category: ErrorCategory
  context?: Record<string, any>
  timestamp: Date
  recoverable: boolean
  recoveryAttempted?: boolean
  recoverySuccessful?: boolean
}

// Create a structured application error
export function createAppError(
  message: string,
  options: {
    severity?: ErrorSeverity
    category?: ErrorCategory
    context?: Record<string, any>
    cause?: Error
    recoverable?: boolean
  } = {},
): AppError {
  const error = new Error(message) as AppError
  error.severity = options.severity || ErrorSeverity.MEDIUM
  error.category = options.category || ErrorCategory.UNKNOWN
  error.context = options.context || {}
  error.timestamp = new Date()
  error.recoverable = options.recoverable !== undefined ? options.recoverable : true

  if (options.cause) {
    error.cause = options.cause
    error.stack = `${error.stack}\nCaused by: ${options.cause.stack}`
  }

  return error
}

// Handle an application error
export async function handleError(error: AppError | Error): Promise<boolean> {
  // Convert regular Error to AppError if needed
  const appError = isAppError(error) ? error : createAppError(error.message, { cause: error })

  // Log the error
  logError(appError)

  // Attempt recovery for recoverable errors
  if (appError.recoverable && !appError.recoveryAttempted) {
    appError.recoveryAttempted = true
    try {
      const recovered = await attemptRecovery(appError)
      appError.recoverySuccessful = recovered
      return recovered
    } catch (recoveryError) {
      logger.error("Recovery attempt failed", {
        originalError: appError,
        recoveryError,
      })
      return false
    }
  }

  return false
}

// Check if an error is an AppError
function isAppError(error: any): error is AppError {
  return error && typeof error === "object" && "severity" in error && "category" in error && "timestamp" in error
}

// Log an error with appropriate level based on severity
function logError(error: AppError): void {
  const logData = {
    message: error.message,
    category: error.category,
    context: error.context,
    timestamp: error.timestamp,
    stack: error.stack,
    cause: error.cause,
  }

  switch (error.severity) {
    case ErrorSeverity.LOW:
      logger.info("Application error (low severity)", logData)
      break
    case ErrorSeverity.MEDIUM:
      logger.warn("Application error (medium severity)", logData)
      break
    case ErrorSeverity.HIGH:
      logger.error("Application error (high severity)", logData)
      break
    case ErrorSeverity.CRITICAL:
      logger.fatal("CRITICAL APPLICATION ERROR", logData)
      break
    default:
      logger.error("Application error (unknown severity)", logData)
  }
}

// Attempt to recover from an error based on its category
async function attemptRecovery(error: AppError): Promise<boolean> {
  switch (error.category) {
    case ErrorCategory.DATABASE:
      return await attemptDatabaseRecovery(error)
    case ErrorCategory.EMAIL:
      return await attemptEmailRecovery(error)
    case ErrorCategory.DEPLOYMENT:
      return await attemptDeploymentRecovery(error)
    case ErrorCategory.ENVIRONMENT:
      return attemptEnvironmentRecovery(error)
    default:
      // No specific recovery strategy for other categories
      return false
  }
}

// Database recovery strategies
async function attemptDatabaseRecovery(error: AppError): Promise<boolean> {
  // Implement database reconnection logic
  logger.info("Attempting database recovery", { error })

  // This would typically include reconnection attempts with exponential backoff
  // For now, we'll just simulate a recovery attempt
  return Math.random() > 0.5 // Simulate 50% recovery success rate
}

// Email service recovery strategies
async function attemptEmailRecovery(error: AppError): Promise<boolean> {
  logger.info("Attempting email service recovery", { error })

  // This would typically include retrying with alternative SMTP servers
  // or queueing emails for later delivery
  return Math.random() > 0.3 // Simulate 70% recovery success rate
}

// Deployment recovery strategies
async function attemptDeploymentRecovery(error: AppError): Promise<boolean> {
  logger.info("Attempting deployment recovery", { error })

  // This would typically include restarting services or falling back to previous versions
  return Math.random() > 0.7 // Simulate 30% recovery success rate
}

// Environment variable recovery strategies
function attemptEnvironmentRecovery(error: AppError): boolean {
  logger.info("Attempting environment configuration recovery", { error })

  // This would typically include using default values for non-critical configurations
  const missingVar = error.context?.variable
  if (missingVar && typeof missingVar === "string") {
    // Apply fallback values for known environment variables
    process.env[missingVar] = getDefaultValueForEnvVar(missingVar)
    return true
  }

  return false
}

// Get default values for environment variables (for non-critical vars only)
function getDefaultValueForEnvVar(varName: string): string {
  const defaults: Record<string, string> = {
    NODE_ENV: "development",
    PORT: "3000",
    TASK_REMINDER_DAYS: "2",
    // Add more default values as needed
  }

  return defaults[varName] || ""
}
