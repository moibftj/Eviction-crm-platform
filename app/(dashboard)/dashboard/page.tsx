import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { BarChart3, Users, Briefcase, Building, Clock, AlertTriangle } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStatsCard } from "@/components/dashboard-stats-card"
import { RecentCasesTable } from "@/components/recent-cases-table"
import { UpcomingEventsCard } from "@/components/upcoming-events-card"
import { TasksList } from "@/components/tasks-list"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get dashboard stats
  const totalCases = await prisma.case.count()
  const activeCases = await prisma.case.count({
    where: {
      stage: {
        not: "CASE_CLOSED",
      },
    },
  })
  const totalOwners = await prisma.propertyOwner.count()
  const totalProperties = await prisma.property.count()

  // Get recent cases
  const recentCases = await prisma.case.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      propertyOwner: true,
      property: true,
    },
  })

  // Get upcoming events
  const upcomingEvents = await prisma.event.findMany({
    where: {
      startDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: "asc",
    },
    take: 5,
    include: {
      case: true,
    },
  })

  // Get urgent tasks
  const urgentTasks = await prisma.task.findMany({
    where: {
      completed: false,
      priority: {
        in: ["HIGH", "URGENT"],
      },
    },
    orderBy: {
      dueDate: "asc",
    },
    take: 5,
    include: {
      case: true,
      assignedTo: true,
    },
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatsCard
              title="Total Cases"
              value={totalCases}
              description="All cases in the system"
              icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardStatsCard
              title="Active Cases"
              value={activeCases}
              description="Cases currently in progress"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardStatsCard
              title="Property Owners"
              value={totalOwners}
              description="Total property owners"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <DashboardStatsCard
              title="Properties"
              value={totalProperties}
              description="Total properties"
              icon={<Building className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>Recently added cases in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentCasesTable cases={recentCases} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Your scheduled events for the next few days</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingEventsCard events={upcomingEvents} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Urgent Tasks</CardTitle>
                <CardDescription>Tasks that require immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <TasksList tasks={urgentTasks} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Important notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Upcoming Court Date</p>
                      <p className="text-sm text-muted-foreground">Case #EVT-2023-001 has a court date in 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 rounded-md border p-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Notice Expiring</p>
                      <p className="text-sm text-muted-foreground">
                        3-day notice for Case #EVT-2023-005 expires tomorrow
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Case Analytics</CardTitle>
                <CardDescription>Case distribution by stage</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Case Stage Distribution</h3>
                      <p className="text-xs text-muted-foreground">Chart showing cases by stage</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Eviction Reasons</CardTitle>
                <CardDescription>Distribution of eviction reasons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Eviction Reasons</h3>
                      <p className="text-xs text-muted-foreground">Chart showing eviction reasons</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Where your leads are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Lead Sources</h3>
                      <p className="text-xs text-muted-foreground">Chart showing lead sources</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Case Duration</CardTitle>
                <CardDescription>Average time to resolve cases</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Case Duration</h3>
                      <p className="text-xs text-muted-foreground">Chart showing average case duration</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
