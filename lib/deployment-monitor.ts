/**
 * Deployment monitoring service
 * Tracks deployment status and provides hooks for deployment events
 */

import { logger } from "./logger"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "./error-handler"
import { sendEmail } from "./email"
import { getDeploymentStatusEmailTemplate } from "./email-templates"

// Deployment status types
export enum DeploymentStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back",
}

// Deployment event types
export enum DeploymentEventType {
  STARTED = "started",
  STEP_COMPLETED = "step_completed",
  STEP_FAILED = "step_failed",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back",
}

// Deployment event interface
export interface DeploymentEvent {
  type: DeploymentEventType
  timestamp: Date
  message: string
  data?: any
}

// Deployment information
export interface DeploymentInfo {
  id: string
  version: string
  environment: string
  startTime: Date
  endTime?: Date
  status: DeploymentStatus
  events: DeploymentEvent[]
  errorCount: number
}

// Current deployment information
let currentDeployment: DeploymentInfo | null = null

// Recent deployments history
const deploymentHistory: DeploymentInfo[] = []
const MAX_HISTORY = 10

// Initialize deployment monitoring
export function initDeploymentMonitor(options: {
  version: string
  environment: string
  notifyAdmins?: boolean
}): DeploymentInfo {
  const deploymentId = generateDeploymentId()

  currentDeployment = {
    id: deploymentId,
    version: options.version,
    environment: options.environment,
    startTime: new Date(),
    status: DeploymentStatus.IN_PROGRESS,
    events: [],
    errorCount: 0,
  }

  // Log deployment start
  logger.info(`Deployment started: ${deploymentId}`, { deployment: currentDeployment })

  // Add initial event
  addDeploymentEvent({
    type: DeploymentEventType.STARTED,
    message: `Deployment of version ${options.version} to ${options.environment} started`,
  })

  // Notify admins if requested
  if (options.notifyAdmins) {
    notifyDeploymentStatus(currentDeployment, "Deployment Started")
  }

  return { ...currentDeployment }
}

// Generate a unique deployment ID
function generateDeploymentId(): string {
  return `deploy-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

// Add an event to the current deployment
export function addDeploymentEvent(event: Omit<DeploymentEvent, "timestamp">): void {
  if (!currentDeployment) {
    logger.warn("Attempted to add deployment event but no deployment is in progress")
    return
  }

  const fullEvent: DeploymentEvent = {
    ...event,
    timestamp: new Date(),
  }

  currentDeployment.events.push(fullEvent)

  // Update error count if this is a failure event
  if (event.type === DeploymentEventType.STEP_FAILED || event.type === DeploymentEventType.FAILED) {
    currentDeployment.errorCount++
  }

  // Log the event
  logger.info(`Deployment event: ${event.type}`, { event: fullEvent })
}

// Complete the current deployment
export function completeDeployment(success: boolean, message?: string): DeploymentInfo | null {
  if (!currentDeployment) {
    logger.warn("Attempted to complete deployment but no deployment is in progress")
    return null
  }

  currentDeployment.endTime = new Date()
  currentDeployment.status = success ? DeploymentStatus.COMPLETED : DeploymentStatus.FAILED

  // Add completion event
  addDeploymentEvent({
    type: success ? DeploymentEventType.COMPLETED : DeploymentEventType.FAILED,
    message: message || `Deployment ${success ? "completed successfully" : "failed"}`,
  })

  // Log completion
  if (success) {
    logger.info(`Deployment completed: ${currentDeployment.id}`, { deployment: currentDeployment })
  } else {
    logger.error(`Deployment failed: ${currentDeployment.id}`, { deployment: currentDeployment })
  }

  // Add to history
  deploymentHistory.unshift({ ...currentDeployment })
  if (deploymentHistory.length > MAX_HISTORY) {
    deploymentHistory.pop()
  }

  // Notify about deployment status
  notifyDeploymentStatus(currentDeployment, success ? "Deployment Completed Successfully" : "Deployment Failed")

  const completedDeployment = { ...currentDeployment }
  currentDeployment = null

  return completedDeployment
}

// Roll back a failed deployment
export async function rollbackDeployment(reason: string): Promise<boolean> {
  if (!currentDeployment || currentDeployment.status !== DeploymentStatus.FAILED) {
    logger.warn("Attempted to roll back deployment but no failed deployment exists")
    return false
  }

  try {
    // In a real implementation, this would contain logic to restore the previous version
    logger.info(`Rolling back deployment: ${currentDeployment.id}`, { reason })

    // Update status
    currentDeployment.status = DeploymentStatus.ROLLED_BACK

    // Add rollback event
    addDeploymentEvent({
      type: DeploymentEventType.ROLLED_BACK,
      message: `Deployment rolled back: ${reason}`,
    })

    // Notify about rollback
    notifyDeploymentStatus(currentDeployment, "Deployment Rolled Back")

    return true
  } catch (error) {
    const appError = createAppError(
      `Failed to roll back deployment: ${error instanceof Error ? error.message : "Unknown error"}`,
      {
        severity: ErrorSeverity.CRITICAL,
        category: ErrorCategory.DEPLOYMENT,
        cause: error instanceof Error ? error : undefined,
        context: { deploymentId: currentDeployment.id },
      },
    )

    await handleError(appError)
    return false
  }
}

// Get the current deployment status
export function getCurrentDeployment(): DeploymentInfo | null {
  return currentDeployment ? { ...currentDeployment } : null
}

// Get deployment history
export function getDeploymentHistory(): DeploymentInfo[] {
  return [...deploymentHistory]
}

// Send deployment status notifications
async function notifyDeploymentStatus(deployment: DeploymentInfo, subject: string): Promise<void> {
  try {
    // Get admin email addresses from environment variable
    const adminEmails = process.env.ADMIN_EMAIL_ADDRESSES
    if (!adminEmails) {
      logger.warn("No admin email addresses configured for deployment notifications")
      return
    }

    const emailAddresses = adminEmails.split(",").map((email) => email.trim())

    // Generate email content
    const htmlContent = getDeploymentStatusEmailTemplate(deployment)

    // Send emails to all admins
    for (const email of emailAddresses) {
      await sendEmail({
        to: email,
        subject: `[${deployment.environment}] ${subject}: ${deployment.version}`,
        html: htmlContent,
      })
    }

    logger.info(`Sent deployment status notifications to ${emailAddresses.length} admins`)
  } catch (error) {
    logger.error("Failed to send deployment status notifications", { error })
  }
}
