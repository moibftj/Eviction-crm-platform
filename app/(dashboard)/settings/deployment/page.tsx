import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { DeploymentMonitor } from "@/components/deployment-monitor"
import { DeploymentLogs } from "@/components/deployment-logs"

export const metadata = {
  title: "Deployment Status - Proactive Eviction CRM",
  description: "Monitor and manage application deployments",
}

export default async function DeploymentPage() {
  // Check if user is authenticated and is an admin
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Deployment Status</h1>
      </div>

      <div className="grid gap-6">
        <DeploymentMonitor />
        <DeploymentLogs />
      </div>
    </div>
  )
}
