import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { SendTaskReminders } from "@/components/send-task-reminders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notification Settings</h2>
      </div>

      <Tabs defaultValue="task-reminders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="task-reminders">Task Reminders</TabsTrigger>
          <TabsTrigger value="system-notifications">System Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="task-reminders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <SendTaskReminders />

            <Card>
              <CardHeader>
                <CardTitle>Automated Task Reminders</CardTitle>
                <CardDescription>Configure automated email reminders for upcoming tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Task reminders are automatically sent via a scheduled job that runs daily. By default, reminders are
                  sent for tasks due within the next 2 days.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  To change the default reminder period, update the TASK_REMINDER_DAYS environment variable in your
                  project settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system-notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Notification Settings</CardTitle>
              <CardDescription>Configure system-wide notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                System notification settings will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
