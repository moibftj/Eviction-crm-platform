import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { logger } from "@/lib/logger"

// API route to test email configuration
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get test email parameters
    const json = await req.json()
    const { to, subject, html } = json

    // Validate parameters
    if (!to) {
      return NextResponse.json({ error: "Recipient email address is required" }, { status: 400 })
    }

    // Send test email
    const result = await sendEmail({
      to,
      subject: subject || "Test Email from Proactive Eviction CRM",
      html:
        html ||
        `
        <h1>Test Email</h1>
        <p>This is a test email from Proactive Eviction CRM.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `,
    })

    if (result.success) {
      logger.info("Test email sent successfully", { to, messageId: result.messageId })
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully",
        messageId: result.messageId,
      })
    } else {
      throw result.error || new Error("Failed to send test email")
    }
  } catch (error) {
    logger.error("Error sending test email", { error })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 },
    )
  }
}
