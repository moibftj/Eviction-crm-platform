import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"
import { sendEmail } from "@/lib/email"

// API endpoint to test error handling and notifications
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get test parameters
    const json = await req.json()
    const {
      errorType = "generic",
      severity = "MEDIUM",
      shouldNotify = false,
      shouldRecover = false,
      recipientEmail,
    } = json

    // Map severity string to enum
    const errorSeverity = ErrorSeverity[severity as keyof typeof ErrorSeverity] || ErrorSeverity.MEDIUM

    // Create an appropriate error based on the requested type
    let appError
    switch (errorType) {
      case "database":
        appError = createAppError("Test database error", {
          severity: errorSeverity,
          category: ErrorCategory.DATABASE,
          recoverable: shouldRecover,
          context: { test: true, source: "test-error-handling" },
        })
        break
      case "email":
        appError = createAppError("Test email error", {
          severity: errorSeverity,
          category: ErrorCategory.EMAIL,
          recoverable: shouldRecover,
          context: { test: true, source: "test-error-handling" },
        })
        break
      case "deployment":
        appError = createAppError("Test deployment error", {
          severity: errorSeverity,
          category: ErrorCategory.DEPLOYMENT,
          recoverable: shouldRecover,
          context: { test: true, source: "test-error-handling" },
        })
        break
      default:
        appError = createAppError("Test generic error", {
          severity: errorSeverity,
          category: ErrorCategory.UNKNOWN,
          recoverable: shouldRecover,
          context: { test: true, source: "test-error-handling" },
        })
    }

    // Handle the error
    const recovered = await handleError(appError)

    // Send notification if requested
    if (shouldNotify && recipientEmail) {
      await sendEmail({
        to: recipientEmail,
        subject: `Test Error Notification: ${appError.category} (${appError.severity})`,
        html: `
          <h1>Test Error Notification</h1>
          <p>This is a test error notification from the Eviction CRM system.</p>
          <h2>Error Details</h2>
          <ul>
            <li><strong>Message:</strong> ${appError.message}</li>
            <li><strong>Category:</strong> ${appError.category}</li>
            <li><strong>Severity:</strong> ${appError.severity}</li>
            <li><strong>Timestamp:</strong> ${appError.timestamp.toISOString()}</li>
            <li><strong>Recoverable:</strong> ${appError.recoverable ? "Yes" : "No"}</li>
            <li><strong>Recovery Attempted:</strong> ${appError.recoveryAttempted ? "Yes" : "No"}</li>
            <li><strong>Recovery Successful:</strong> ${appError.recoverySuccessful ? "Yes" : "No"}</li>
          </ul>
          <p>This is a test notification and can be safely ignored.</p>
        `,
      })
    }

    // Return the result
    return NextResponse.json({
      success: true,
      error: {
        message: appError.message,
        category: appError.category,
        severity: appError.severity,
        timestamp: appError.timestamp,
        recoverable: appError.recoverable,
        recoveryAttempted: appError.recoveryAttempted,
        recoverySuccessful: appError.recoverySuccessful,
      },
      recovered,
    })
  } catch (error) {
    // Handle unexpected errors in the error testing endpoint
    logger.error("Error in test-error-handling endpoint", { error })

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
