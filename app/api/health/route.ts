import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { prisma } from "@/lib/db"
import { getEmailQueueStatus } from "@/lib/email"

// Health check endpoint for monitoring
export async function GET() {
  try {
    // Check database connection
    const dbStartTime = Date.now()
    let dbStatus = "healthy"
    let dbResponseTime = 0

    try {
      await prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - dbStartTime
    } catch (error) {
      dbStatus = "unhealthy"
      logger.error("Database health check failed", { error })
    }

    // Check email service
    const emailQueue = getEmailQueueStatus()
    const emailStatus = emailQueue.queueLength > 10 ? "degraded" : "healthy"

    // Overall system status
    const systemStatus = dbStatus === "healthy" && emailStatus === "healthy" ? "healthy" : "degraded"

    // Get memory usage
    const memoryUsage = process.memoryUsage()

    return NextResponse.json({
      status: systemStatus,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || "unknown",
      services: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`,
        },
        email: {
          status: emailStatus,
          queueSize: emailQueue.queueLength,
        },
      },
      system: {
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        },
        uptime: `${Math.round(process.uptime())} seconds`,
      },
    })
  } catch (error) {
    logger.error("Health check failed", { error })

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 },
    )
  }
}
