import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { createAppError, ErrorCategory, ErrorSeverity, handleError } from "@/lib/error-handler"

// Create a table to track task reminders
export async function POST() {
  try {
    // Check if the table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'TaskReminder'
      );
    `

    // If the table exists, return success
    if (tableExists[0].exists) {
      return NextResponse.json({
        success: true,
        message: "TaskReminder table already exists",
      })
    }

    // Create the TaskReminder table
    await prisma.$executeRaw`
      CREATE TABLE "TaskReminder" (
        "id" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        "sentAt" TIMESTAMP(3) NOT NULL,
        "success" BOOLEAN NOT NULL DEFAULT true,
        
        CONSTRAINT "TaskReminder_pkey" PRIMARY KEY ("id")
      );
    `

    // Add foreign key constraint
    await prisma.$executeRaw`
      ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_taskId_fkey" 
      FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `

    // Create index
    await prisma.$executeRaw`
      CREATE INDEX "TaskReminder_taskId_idx" ON "TaskReminder"("taskId");
    `

    return NextResponse.json({
      success: true,
      message: "TaskReminder table created successfully",
    })
  } catch (error) {
    const appError = createAppError("Failed to create TaskReminder table", {
      severity: ErrorSeverity.HIGH,
      category: ErrorCategory.DATABASE,
      cause: error instanceof Error ? error : undefined,
    })

    await handleError(appError)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
