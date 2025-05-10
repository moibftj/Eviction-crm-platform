/**
 * Enhanced email service with improved error handling and retry capabilities
 */

import nodemailer from "nodemailer"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "./error-handler"
import { logger } from "./logger"
import { getEnvVar } from "./env-validator"

// Email payload interface
export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  cc?: string | string[]
  bcc?: string | string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Email sending result
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: Error
}

// Email queue for retry mechanism
interface QueuedEmail {
  payload: EmailPayload
  attempts: number
  lastAttempt: Date
  maxAttempts: number
}

const emailQueue: QueuedEmail[] = []
const MAX_RETRY_ATTEMPTS = 5
const RETRY_DELAY_MS = 60000 // 1 minute

// Configure email transporter with better error handling
function createTransporter() {
  try {
    // Get email configuration from environment variables with validation
    const host = getEnvVar("EMAIL_SERVER", "smtp.example.com")
    const port = Number.parseInt(getEnvVar("EMAIL_PORT", "587"))
    const secure = getEnvVar("EMAIL_SECURE", "false") === "true"
    const user = getEnvVar("EMAIL_USER", "")
    const pass = getEnvVar("EMAIL_PASSWORD", "")

    // Validate essential configuration
    if (!host || !user || !pass) {
      logger.warn("Incomplete email configuration. Email functionality may not work correctly.")
    }

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      // Add connection timeout
      connectionTimeout: 10000, // 10 seconds
      // Add graceful error handling
      pool: true,
      maxConnections: 5,
      rateDelta: 1000,
      rateLimit: 5,
    })
  } catch (error) {
    const appError = createAppError("Failed to create email transporter", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.EMAIL,
      cause: error instanceof Error ? error : undefined,
    })

    handleError(appError)

    // Return a dummy transporter that logs instead of sending
    return {
      sendMail: async (mailOptions: any) => {
        logger.error("Email sending attempted but transporter is not configured", { mailOptions })
        throw new Error("Email transporter not configured")
      },
    }
  }
}

// Get a cached or new transporter
let transporter: any = null
function getTransporter() {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

// Reset the transporter (useful after configuration changes)
export function resetEmailTransporter() {
  transporter = null
}

// Send an email with improved error handling
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  try {
    const { to, subject, html, cc, bcc, attachments } = payload

    // Validate email payload
    if (!to || (Array.isArray(to) && to.length === 0)) {
      throw new Error("Email recipient is required")
    }

    if (!subject) {
      throw new Error("Email subject is required")
    }

    if (!html) {
      throw new Error("Email content is required")
    }

    // Get the from address from environment with fallback
    const from = getEnvVar("EMAIL_FROM", "Proactive Eviction CRM <noreply@proactiveeviction.com>")

    // Send the email
    const info = await getTransporter().sendMail({
      from,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
    })

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: info.messageId,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    const appError = createAppError(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.EMAIL,
        cause: error instanceof Error ? error : undefined,
        context: {
          to: payload.to,
          subject: payload.subject,
        },
        recoverable: true,
      },
    )

    await handleError(appError)

    // Add to retry queue if it's a transient error
    if (isTransientError(error)) {
      queueEmailForRetry(payload)
    }

    return {
      success: false,
      error: error instanceof Error ? error : new Error("Unknown email error"),
    }
  }
}

// Check if an error is likely transient (temporary)
function isTransientError(error: any): boolean {
  if (!error) return false

  const errorMessage = error.message || ""
  const transientKeywords = [
    "timeout",
    "connection",
    "network",
    "temporarily",
    "unavailable",
    "rate limit",
    "too many",
    "try again",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
  ]

  return transientKeywords.some((keyword) => errorMessage.toLowerCase().includes(keyword.toLowerCase()))
}

// Queue an email for retry
function queueEmailForRetry(payload: EmailPayload, attempts = 0): void {
  emailQueue.push({
    payload,
    attempts,
    lastAttempt: new Date(),
    maxAttempts: MAX_RETRY_ATTEMPTS,
  })

  logger.info(`Email queued for retry. Queue size: ${emailQueue.length}`)

  // Start the retry process if it's not already running
  if (emailQueue.length === 1) {
    processEmailQueue()
  }
}

// Process the email retry queue
async function processEmailQueue(): Promise<void> {
  if (emailQueue.length === 0) return

  // Find emails that are ready for retry
  const now = new Date()
  const readyForRetry = emailQueue.filter((email) => {
    const elapsedMs = now.getTime() - email.lastAttempt.getTime()
    return elapsedMs >= RETRY_DELAY_MS
  })

  if (readyForRetry.length === 0) {
    // Schedule next check
    setTimeout(processEmailQueue, RETRY_DELAY_MS / 2)
    return
  }

  // Process each email ready for retry
  for (const queuedEmail of readyForRetry) {
    // Remove from queue
    const index = emailQueue.indexOf(queuedEmail)
    if (index !== -1) {
      emailQueue.splice(index, 1)
    }

    // Skip if max attempts reached
    if (queuedEmail.attempts >= queuedEmail.maxAttempts) {
      logger.warn("Email retry max attempts reached, giving up", {
        to: queuedEmail.payload.to,
        subject: queuedEmail.payload.subject,
        attempts: queuedEmail.attempts,
      })
      continue
    }

    // Attempt to send again
    try {
      logger.info(`Retrying email (attempt ${queuedEmail.attempts + 1}/${queuedEmail.maxAttempts})`, {
        to: queuedEmail.payload.to,
        subject: queuedEmail.payload.subject,
      })

      const result = await sendEmail(queuedEmail.payload)

      if (!result.success) {
        // If still failed, re-queue with incremented attempt count
        queueEmailForRetry(queuedEmail.payload, queuedEmail.attempts + 1)
      }
    } catch (error) {
      // Re-queue on unexpected error
      queueEmailForRetry(queuedEmail.payload, queuedEmail.attempts + 1)

      logger.error("Error during email retry", { error })
    }
  }

  // Continue processing queue if there are more emails
  if (emailQueue.length > 0) {
    setTimeout(processEmailQueue, RETRY_DELAY_MS / 2)
  }
}

// Get the current email queue status (for monitoring)
export function getEmailQueueStatus() {
  return {
    queueLength: emailQueue.length,
    queuedEmails: emailQueue.map((email) => ({
      to: email.payload.to,
      subject: email.payload.subject,
      attempts: email.attempts,
      lastAttempt: email.lastAttempt,
    })),
  }
}
