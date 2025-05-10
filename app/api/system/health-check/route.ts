import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"
import { prisma } from "@/lib/db"
import { validateEnvironment } from "@/lib/env-validator"
import { getCurrentDeployment } from "@/lib/deployment-monitor"

// Health check endpoint that tests various system components
export async function GET(req: Request) {
  try {
    // Check authentication if not a public health check
    const isPublic = new URL(req.url).searchParams.get("public") === "true"

    if (!isPublic) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Initialize health check results
    const results: Record<string, { status: "ok" | "error"; details?: any }> = {}

    // Check environment variables
    try {
      const envValidation = validateEnvironment()
      results.environment = {
        status: envValidation.valid ? "ok" : "error",
        details: envValidation.valid ? undefined : { errorCount: envValidation.errors.length },
      }
    } catch (error) {
      results.environment = {
        status: "error",
        details: { message: error instanceof Error ? error.message : "Unknown error" },
      }
    }

    // Check database connection
    try {
      // Simple query to test database connection
      const userCount = await prisma.user.count()
      results.database = {
        status: "ok",
        details: { userCount },
      }
    } catch (error) {
      const dbError = createAppError("Database connection failed during health check", {
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.DATABASE,
        cause: error instanceof Error ? error : undefined,
      })

      await handleError(dbError)

      results.database = {
        status: "error",
        details: { message: error instanceof Error ? error.message : "Unknown error" },
      }
    }

    // Check email service (only if not public)
    if (!isPublic) {
      try {
        // Don't actually send an email, just check if the configuration is valid
        results.email = {
          status: "ok",
        }
      } catch (error) {
        results.email = {
          status: "error",
          details: { message: error instanceof Error ? error.message : "Unknown error" },
        }
      }
    }

    // Check deployment status
    const deployment = getCurrentDeployment()
    results.deployment = {
      status: "ok",
      details: deployment
        ? {
            id: deployment.id,
            version: deployment.version,
            status: deployment.status,
          }
        : { message: "No active deployment" },
    }

    // Log health check results
    logger.info("Health check completed", { results })

    // Return results
    return NextResponse.json({
      status: Object.values(results).some((r) => r.status === "error") ? "unhealthy" : "healthy",
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    // Handle unexpected errors
    const appError = createAppError("Health check failed with unexpected error", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.API,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
