import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"
import { validateEnvironment } from "@/lib/env-validator"
import { initDeploymentMonitor } from "@/lib/deployment-monitor"

// Initialize the application
export async function POST(req: Request) {
  try {
    // Check authentication for non-startup initialization
    const isStartup = new URL(req.url).searchParams.get("startup") === "true"

    if (!isStartup) {
      const session = await getServerSession(authOptions)
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    // Validate environment variables
    const envValidation = validateEnvironment()
    if (!envValidation.valid) {
      logger.error("Environment validation failed during initialization", { errors: envValidation.errors })

      // Continue anyway in development, but return the errors
      if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
          {
            success: false,
            errors: envValidation.errors.map((e) => e.message),
          },
          { status: 500 },
        )
      }
    }

    // Initialize deployment monitor
    const appVersion = process.env.APP_VERSION || "1.0.0"
    const environment = process.env.NODE_ENV || "development"

    const deployment = initDeploymentMonitor({
      version: appVersion,
      environment,
      notifyAdmins: !isStartup && process.env.NODE_ENV === "production",
    })

    // Create TaskReminder table if it doesn't exist
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/reminder-table`, {
        method: "POST",
      })
    } catch (error) {
      logger.warn("Failed to create TaskReminder table", { error })
      // Continue anyway, this is not critical
    }

    // Return success
    return NextResponse.json({
      success: true,
      message: "Application initialized successfully",
      deployment: {
        id: deployment.id,
        version: deployment.version,
        environment: deployment.environment,
      },
      environmentValid: envValidation.valid,
    })
  } catch (error) {
    const appError = createAppError("Failed to initialize application", {
      severity: ErrorSeverity.CRITICAL,
      category: ErrorCategory.DEPLOYMENT,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
