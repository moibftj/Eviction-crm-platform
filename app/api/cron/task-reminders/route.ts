import { NextResponse } from "next/server"
import { addDays, startOfDay } from "date-fns"

import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { getTaskReminderEmailTemplate } from "@/lib/email-templates"
import { logger } from "@/lib/logger"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"

// This function checks for tasks due in the next X days and sends reminders
export async function GET(req: Request) {
  try {
    // Only allow this route to be called from cron jobs or authorized sources
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn("Unauthorized attempt to access task reminders cron job", {
        authHeader,
        ip: req.headers.get("x-forwarded-for") || "unknown",
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the date range for tasks due soon
    const today = startOfDay(new Date())
    const reminderDays = Number.parseInt(process.env.TASK_REMINDER_DAYS || "2")
    const reminderDate = addDays(today, reminderDays)

    logger.info("Running task reminder cron job", {
      today: today.toISOString(),
      reminderDate: reminderDate.toISOString(),
      reminderDays,
    })

    // Find tasks that are due soon and not completed
    const tasks = await prisma.task.findMany({
      where: {
        completed: false,
        dueDate: {
          gte: today,
          lt: reminderDate,
        },
      },
      include: {
        assignedTo: true,
        case: true,
      },
    })

    logger.info(`Found ${tasks.length} tasks due in the next ${reminderDays} days`)

    // Send email notifications for each task
    const results = await Promise.all(
      tasks.map(async (task) => {
        try {
          // Skip if no assigned user or no email
          if (!task.assignedTo || !task.assignedTo.email) {
            return {
              taskId: task.id,
              sent: false,
              reason: "No assigned user or email",
            }
          }

          // Generate email content
          const emailHtml = getTaskReminderEmailTemplate(task, task.assignedTo)

          // Send the email
          const result = await sendEmail({
            to: task.assignedTo.email,
            subject: `Task Reminder: ${task.title} is due soon`,
            html: emailHtml,
          })

          // Record that we sent a reminder
          if (result.success) {
            await prisma.taskReminder.create({
              data: {
                taskId: task.id,
                sentAt: new Date(),
                success: true,
              },
            })
          }

          return {
            taskId: task.id,
            sent: result.success,
            error: result.success ? null : result.error,
          }
        } catch (error) {
          // Handle individual task errors without failing the entire batch
          const appError = createAppError(`Failed to send reminder for task ${task.id}`, {
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.EMAIL,
            cause: error instanceof Error ? error : undefined,
            context: { taskId: task.id },
          })

          await handleError(appError)

          return {
            taskId: task.id,
            sent: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    // Count successful and failed emails
    const sentCount = results.filter((r) => r.sent).length
    const failedCount = results.filter((r) => !r.sent).length

    logger.info(`Task reminder results: sent ${sentCount}, failed ${failedCount}`)

    return NextResponse.json({
      success: true,
      message: `Processed ${tasks.length} tasks. Sent ${sentCount} reminders. Failed: ${failedCount}.`,
      results,
    })
  } catch (error) {
    const appError = createAppError("Error processing task reminders cron job", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.API,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
