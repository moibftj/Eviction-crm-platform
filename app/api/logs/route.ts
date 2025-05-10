import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"

// API route to get application logs
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get URL parameters
    const url = new URL(req.url)
    const count = Number.parseInt(url.searchParams.get("count") || "100")
    const level = url.searchParams.get("level") || undefined

    // Get logs from logger
    const logs = logger.getRecentLogs(count, level as any)

    return NextResponse.json({ logs })
  } catch (error) {
    logger.error("Error fetching logs", { error })
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 })
  }
}
