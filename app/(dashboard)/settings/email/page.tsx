import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { EmailSettings } from "@/components/email-settings"
import { EmailTest } from "@/components/email-test"

export const metadata = {
  title: "Email Settings - Proactive Eviction CRM",
  description: "Configure and test email settings",
}

export default async function EmailSettingsPage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <EmailSettings />
        <EmailTest />
      </div>
    </div>
  )
}
