import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { getCurrentDeployment, getDeploymentHistory } from "@/lib/deployment-monitor"
import { logger } from "@/lib/logger"

// API route to get deployment status
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get deployment information
    const currentDeployment = getCurrentDeployment()
    const deploymentHistory = getDeploymentHistory()

    return NextResponse.json({
      current: currentDeployment,
      history: deploymentHistory,
    })
  } catch (error) {
    logger.error("Error fetching deployment status", { error })
    return NextResponse.json({ error: "Failed to fetch deployment status" }, { status: 500 })
  }
}
