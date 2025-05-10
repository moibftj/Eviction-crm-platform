import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { resetEmailTransporter } from "@/lib/email"

// API route to get and update email settings
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get email settings from environment variables
    // In a real app, these might come from a database
    const settings = {
      server: process.env.EMAIL_SERVER || "",
      port: process.env.EMAIL_PORT || "587",
      secure: process.env.EMAIL_SECURE === "true",
      user: process.env.EMAIL_USER || "",
      password: process.env.EMAIL_PASSWORD ? "••••••••" : "", // Don't expose actual password
      from: process.env.EMAIL_FROM || "",
    }

    return NextResponse.json({ settings })
  } catch (error) {
    logger.error("Error fetching email settings", { error })
    return NextResponse.json({ error: "Failed to fetch email settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get settings from request body
    const json = await req.json()
    const { settings } = json

    // Validate settings
    if (!settings.server || !settings.port || !settings.user || !settings.from) {
      return NextResponse.json({ error: "Missing required email settings" }, { status: 400 })
    }

    // In a real app, you would save these to a database or environment variables
    // For this example, we'll just log that they were updated
    logger.info("Email settings updated", {
      server: settings.server,
      port: settings.port,
      secure: settings.secure,
      user: settings.user,
      from: settings.from,
    })

    // Reset email transporter to apply new settings
    resetEmailTransporter()

    return NextResponse.json({
      success: true,
      message: "Email settings updated successfully",
    })
  } catch (error) {
    logger.error("Error updating email settings", { error })
    return NextResponse.json({ error: "Failed to update email settings" }, { status: 500 })
  }
}
