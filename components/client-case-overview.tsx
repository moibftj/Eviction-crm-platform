import { format } from "date-fns"
import { Mail, Calendar, MapPin, User, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ClientCaseOverviewProps {
  caseData: any
}

export function ClientCaseOverview({ caseData }: ClientCaseOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>Information about your eviction case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Eviction Reason</h4>
                <Badge variant="outline">{caseData.evictionReason.replace(/_/g, " ")}</Badge>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Current Stage</h4>
                <Badge
                  variant="outline"
                  className={
                    caseData.stage === "NEW_LEAD"
                      ? "bg-blue-50 text-blue-700"
                      : caseData.stage === "UNDER_REVIEW"
                        ? "bg-purple-50 text-purple-700"
                        : caseData.stage === "NOTICE_SERVED"
                          ? "bg-amber-50 text-amber-700"
                          : caseData.stage === "WAITING_PERIOD"
                            ? "bg-cyan-50 text-cyan-700"
                            : caseData.stage === "COURT_FILING"
                              ? "bg-orange-50 text-orange-700"
                              : caseData.stage === "HEARING_SCHEDULED"
                                ? "bg-pink-50 text-pink-700"
                                : caseData.stage === "JUDGMENT"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : caseData.stage === "ENFORCEMENT"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-green-50 text-green-700"
                  }
                >
                  {caseData.stage.replace(/_/g, " ")}
                </Badge>
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-medium">Case Created</h4>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(caseData.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Last Updated</h4>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(caseData.updatedAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Case Manager</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{caseData.assignedTo ? caseData.assignedTo.name : "Unassigned"}</span>
                </div>
                {caseData.assignedTo?.email && (
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${caseData.assignedTo.email}`} className="text-primary hover:underline">
                      {caseData.assignedTo.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property</CardTitle>
            <CardDescription>Property information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{caseData.property.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>
                  {caseData.property.city}, {caseData.property.state} {caseData.property.zipCode}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Tenant</CardTitle>
            <CardDescription>Tenant information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{caseData.tenant.name}</span>
              </div>
              {caseData.tenant.leaseStart && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Lease Start: {format(new Date(caseData.tenant.leaseStart), "MMM d, yyyy")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>Additional case details</CardDescription>
          </CardHeader>
          <CardContent>
            {caseData.description ? (
              <p className="whitespace-pre-line">{caseData.description}</p>
            ) : (
              <p className="text-muted-foreground">No description provided</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Scheduled events for this case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.events.filter((event: any) => new Date(event.startDate) > new Date()).length === 0 ? (
                <p className="text-muted-foreground">No upcoming events scheduled</p>
              ) : (
                caseData.events
                  .filter((event: any) => new Date(event.startDate) > new Date())
                  .slice(0, 3)
                  .map((event: any) => (
                    <div key={event.id} className="flex items-center space-x-4 rounded-md border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        {event.location && <p className="text-xs text-muted-foreground">{event.location}</p>}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
