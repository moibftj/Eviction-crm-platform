import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { Briefcase, Calendar, FileText, Clock } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"

export default async function ClientDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get client's cases
  const cases = await prisma.case.findMany({
    where: {
      propertyOwner: {
        email: session.user.email,
      },
    },
    include: {
      property: true,
      tenant: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
  })

  // Get upcoming events
  const events = await prisma.event.findMany({
    where: {
      case: {
        propertyOwner: {
          email: session.user.email,
        },
      },
      startDate: {
        gte: new Date(),
      },
    },
    include: {
      case: true,
    },
    orderBy: {
      startDate: "asc",
    },
    take: 3,
  })

  // Get recent documents
  const documents = await prisma.document.findMany({
    where: {
      case: {
        propertyOwner: {
          email: session.user.email,
        },
      },
    },
    include: {
      case: true,
      uploadedBy: true,
    },
    orderBy: {
      uploadedAt: "desc",
    },
    take: 5,
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">Your active eviction cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled in the next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">Documents in your cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Update</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.length > 0 ? format(new Date(cases[0].updatedAt), "MMM d") : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Last case update</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Your Cases</CardTitle>
            <CardDescription>Your active eviction cases</CardDescription>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                  <h3 className="text-sm font-medium">No cases found</h3>
                  <p className="text-xs text-muted-foreground">You don&apos;t have any active cases</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="flex items-center justify-between rounded-md border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{caseItem.caseNumber}</h3>
                        <Badge variant="outline" className={getCaseStageColor(caseItem.stage)}>
                          {caseItem.stage.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        <p>
                          {caseItem.property.address}, {caseItem.property.city}, {caseItem.property.state}{" "}
                          {caseItem.property.zipCode}
                        </p>
                        <p>Tenant: {caseItem.tenant.name}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/client/cases/${caseItem.id}`}>View Details</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your scheduled events</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <h3 className="text-sm font-medium">No upcoming events</h3>
                  <p className="text-xs text-muted-foreground">You don&apos;t have any scheduled events</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 rounded-md border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.case ? `Case #${event.case.caseNumber}` : "No case associated"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
