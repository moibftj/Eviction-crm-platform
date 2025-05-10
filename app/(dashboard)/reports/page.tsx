import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { BarChart3, PieChart, LineChart, Download } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get case statistics
  const totalCases = await prisma.case.count()

  const casesByStage = await prisma.$queryRaw`
    SELECT "stage", COUNT(*) as "count"
    FROM "Case"
    GROUP BY "stage"
    ORDER BY "count" DESC
  `

  const casesByReason = await prisma.$queryRaw`
    SELECT "evictionReason", COUNT(*) as "count"
    FROM "Case"
    GROUP BY "evictionReason"
    ORDER BY "count" DESC
  `

  const casesByLeadSource = await prisma.$queryRaw`
    SELECT "leadSource", COUNT(*) as "count"
    FROM "Case"
    GROUP BY "leadSource"
    ORDER BY "count" DESC
  `

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Case Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCases}</div>
                <p className="text-xs text-muted-foreground">All cases in the system</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalCases - (casesByStage as any[]).find((item: any) => item.stage === "CASE_CLOSED")?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">Cases currently in progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Case Duration</CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45 days</div>
                <p className="text-xs text-muted-foreground">Average time to resolution</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Cases by Stage</CardTitle>
                <CardDescription>Distribution of cases by current stage</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <PieChart className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Case Stage Distribution</h3>
                      <p className="text-xs text-muted-foreground">Chart showing cases by stage</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Cases by Reason</CardTitle>
                <CardDescription>Distribution of cases by eviction reason</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  {/* Placeholder for chart */}
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                    <div className="flex flex-col items-center gap-1 text-center">
                      <PieChart className="h-8 w-8 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Eviction Reasons</h3>
                      <p className="text-xs text-muted-foreground">Chart showing eviction reasons</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lead Sources</CardTitle>
              <CardDescription>Where your leads are coming from</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Resolution Time</CardTitle>
              <CardDescription>Average time to resolve cases by type</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {/* Placeholder for chart */}
                <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <LineChart className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Resolution Time</h3>
                    <p className="text-xs text-muted-foreground">Chart showing resolution time by case type</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Month</CardTitle>
              <CardDescription>Monthly revenue from cases</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                {/* Placeholder for chart */}
                <div className="flex h-full items-center justify-center rounded-md border border-dashed">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Monthly Revenue</h3>
                    <p className="text-xs text-muted-foreground">Chart showing revenue by month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
