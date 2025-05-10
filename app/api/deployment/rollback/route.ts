import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { rollbackDeployment } from "@/lib/deployment-monitor"
import { logger } from "@/lib/logger"

// API route to trigger deployment rollback
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get reason from request body
    const json = await req.json()
    const reason = json.reason || "Manual rollback triggered by admin"

    // Attempt rollback
    const success = await rollbackDeployment(reason)

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Deployment rollback initiated successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to roll back deployment. No failed deployment exists or rollback already in progress.",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    logger.error("Error during deployment rollback", { error })
    return NextResponse.json({ error: "Failed to process rollback request" }, { status: 500 })
  }
}
