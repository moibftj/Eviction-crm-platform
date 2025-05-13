import { NextResponse } from "next/server"
import { validateEnvironment } from "@/lib/env-validator"
import { initDatabase } from "@/lib/db"
import { initDeploymentMonitor } from "@/lib/deployment-monitor"
import { logger } from "@/lib/logger"

// API route to initialize the application
// This should be called when the application starts
export async function GET() {
  try {
    logger.info("Application initialization started")

    // Validate environment variables
    const envValidation = validateEnvironment()

    if (!envValidation.valid) {
      const errorMessages = envValidation.errors.map((e) => e.message).join(", ")
      logger.error("Environment validation failed", { errors: errorMessages })

      return NextResponse.json(
        {
          success: false,
          message: "Environment validation failed",
          errors: errorMessages,
        },
        { status: 500 },
      )
    }

    // Initialize database connection
    const dbConnected = await initDatabase()

    if (!dbConnected) {
      logger.error("Database initialization failed")

      return NextResponse.json(
        {
          success: false,
          message: "Database initialization failed",
        },
        { status: 500 },
      )
    }

    // Initialize deployment monitor
    const deployment = initDeploymentMonitor({
      version: process.env.APP_VERSION || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      notifyAdmins: process.env.NODE_ENV === "production",
    })

    logger.info("Application initialization completed successfully", { deploymentId: deployment.id })

    return NextResponse.json({
      success: true,
      message: "Application initialized successfully",
      deployment: {
        id: deployment.id,
        version: deployment.version,
        environment: deployment.environment,
      },
    })
  } catch (error) {
    logger.fatal("Application initialization failed", { error })

    return NextResponse.json(
      {
        success: false,
        message: "Application initialization failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
