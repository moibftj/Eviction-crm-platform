import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { sendEmail } from "@/lib/email"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"

// API endpoint to test email functionality
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get test parameters
    const json = await req.json()
    const { to, subject, content, template } = json

    // Validate parameters
    if (!to) {
      return NextResponse.json({ error: "Recipient email address is required" }, { status: 400 })
    }

    let html = ""

    // Use template if provided, otherwise use custom content or default
    if (template) {
      switch (template) {
        case "task-reminder":
          // Example task data
          const task = {
            id: "task_test",
            title: "Test Task Reminder",
            description: "This is a test task reminder email.",
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            priority: "HIGH",
            case: { caseNumber: "TEST-123" },
          }

          const user = {
            name: session.user.name || "User",
            email: to,
          }

          // Import dynamically to avoid circular dependencies
          const { getTaskReminderEmailTemplate } = await import("@/lib/email-templates")
          html = getTaskReminderEmailTemplate(task, user)
          break

        case "deployment":
          // Example deployment data
          const deployment = {
            id: "deploy-test",
            version: "1.0.0",
            environment: "test",
            startTime: new Date(),
            endTime: new Date(),
            status: "COMPLETED",
            events: [
              {
                type: "STARTED",
                timestamp: new Date(Date.now() - 3600000),
                message: "Deployment started",
              },
              {
                type: "COMPLETED",
                timestamp: new Date(),
                message: "Deployment completed successfully",
              },
            ],
            errorCount: 0,
          }

          // Import dynamically to avoid circular dependencies
          const { getDeploymentStatusEmailTemplate } = await import("@/lib/email-templates")
          html = getDeploymentStatusEmailTemplate(deployment)
          break

        default:
          return NextResponse.json({ error: "Invalid template name" }, { status: 400 })
      }
    } else {
      // Use custom content or default
      html =
        content ||
        `
        <h1>Test Email</h1>
        <p>This is a test email from Proactive Eviction CRM.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
      `
    }

    // Send the email
    const result = await sendEmail({
      to,
      subject: subject || "Test Email from Proactive Eviction CRM",
      html,
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
    // Handle unexpected errors
    const appError = createAppError("Failed to send test email", {
      severity: ErrorSeverity.MEDIUM,
      category: ErrorCategory.EMAIL,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 },
    )
  }
}
