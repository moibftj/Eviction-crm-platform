import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { addDays, startOfDay } from "date-fns"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendEmail } from "@/lib/email"
import { getTaskReminderEmailTemplate } from "@/lib/email-templates"

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await req.json()
    const { days = 2 } = body

    // Get the date range for tasks due soon
    const today = startOfDay(new Date())
    const reminderDate = addDays(today, days)

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

    console.log(`Found ${tasks.length} tasks due in the next ${days} days`)

    // Send email notifications for each task
    const results = await Promise.all(
      tasks.map(async (task) => {
        // Skip if no assigned user or no email
        if (!task.assignedTo || !task.assignedTo.email) {
          return { taskId: task.id, sent: false, reason: "No assigned user or email" }
        }

        // Generate email content
        const emailHtml = getTaskReminderEmailTemplate(task, task.assignedTo)

        // Send the email
        const result = await sendEmail({
          to: task.assignedTo.email,
          subject: `Task Reminder: ${task.title} is due soon`,
          html: emailHtml,
        })

        return {
          taskId: task.id,
          sent: result.success,
          error: result.success ? null : result.error,
        }
      }),
    )

    // Count successful and failed emails
    const sentCount = results.filter((r) => r.sent).length
    const failedCount = results.filter((r) => !r.sent).length

    return NextResponse.json({
      success: true,
      message: `Processed ${tasks.length} tasks. Sent ${sentCount} reminders. Failed: ${failedCount}.`,
      results,
    })
  } catch (error) {
    console.error("Error processing task reminders:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
