/**
 * Environment variable validation utility
 * Ensures all required environment variables are present and valid
 */

import { logger } from "./logger"
import { createAppError, ErrorCategory, ErrorSeverity } from "./error-handler"

// Environment variable configuration
interface EnvVarConfig {
  name: string
  required: boolean
  validator?: (value: string) => boolean
  errorMessage?: string
}

// Define required environment variables
const requiredEnvVars: EnvVarConfig[] = [
  {
    name: "DATABASE_URL",
    required: true,
    validator: (value) => value.includes("://"),
    errorMessage: "DATABASE_URL must be a valid connection string",
  },
  {
    name: "NEXTAUTH_SECRET",
    required: true,
    validator: (value) => value.length >= 32,
    errorMessage: "NEXTAUTH_SECRET should be at least 32 characters long for security",
  },
  {
    name: "NEXTAUTH_URL",
    required: true,
    validator: (value) => value.startsWith("http"),
    errorMessage: "NEXTAUTH_URL must be a valid URL starting with http:// or https://",
  },
  {
    name: "EMAIL_SERVER",
    required: false,
  },
  {
    name: "EMAIL_PORT",
    required: false,
    validator: (value) => !isNaN(Number(value)),
    errorMessage: "EMAIL_PORT must be a valid number",
  },
  {
    name: "EMAIL_USER",
    required: false,
  },
  {
    name: "EMAIL_PASSWORD",
    required: false,
  },
  {
    name: "EMAIL_FROM",
    required: false,
    validator: (value) => value.includes("@"),
    errorMessage: "EMAIL_FROM must be a valid email address",
  },
  {
    name: "CRON_SECRET",
    required: false,
  },
  {
    name: "ADMIN_EMAIL_ADDRESSES",
    required: false,
    validator: (value) => value.includes("@"),
    errorMessage: "ADMIN_EMAIL_ADDRESSES must contain valid email addresses separated by commas",
  },
]

// Validate all environment variables
export function validateEnvironment(): { valid: boolean; errors: Error[] } {
  const errors: Error[] = []

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name]

    // Check if required variable is missing
    if (envVar.required && (!value || value.trim() === "")) {
      const error = createAppError(`Missing required environment variable: ${envVar.name}`, {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.ENVIRONMENT,
        context: { variable: envVar.name },
      })
      errors.push(error)
      continue
    }

    // Skip validation if value is not provided and not required
    if (!value || value.trim() === "") {
      continue
    }

    // Validate value format if validator is provided
    if (envVar.validator && !envVar.validator(value)) {
      const error = createAppError(envVar.errorMessage || `Invalid value for environment variable: ${envVar.name}`, {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.ENVIRONMENT,
        context: { variable: envVar.name },
      })
      errors.push(error)
    }
  }

  // Log validation results
  if (errors.length > 0) {
    logger.error(`Environment validation failed with ${errors.length} errors`, { errors })
    return { valid: false, errors }
  }

  logger.info("Environment validation successful")
  return { valid: true, errors: [] }
}

// Get a validated environment variable with fallback
export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name]

  if (!value || value.trim() === "") {
    if (fallback !== undefined) {
      logger.warn(`Using fallback value for environment variable: ${name}`)
      return fallback
    }

    // Find the config for this variable
    const config = requiredEnvVars.find((v) => v.name === name)

    if (config?.required) {
      // This should not happen if validateEnvironment is called at startup
      logger.error(`Missing required environment variable: ${name}`)
      throw new Error(`Missing required environment variable: ${name}`)
    }

    return ""
  }

  return value
}
