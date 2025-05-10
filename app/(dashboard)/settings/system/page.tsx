import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { SystemHealth } from "@/components/system-health"
import { ErrorHandlingTest } from "@/components/error-handling-test"
import { EmailTest } from "@/components/email-test"

export const metadata = {
  title: "System Settings - Proactive Eviction CRM",
  description: "Monitor and manage system health and settings",
}

export default async function SystemSettingsPage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SystemHealth />
        <div className="space-y-6">
          <ErrorHandlingTest />
          <EmailTest />
        </div>
      </div>
    </div>
  )
}
