import { format } from "date-fns"
import { Mail, Phone, Calendar, AlertTriangle, MapPin, User, FileText, Clock } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface CaseOverviewProps {
  caseData: any
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Property Owner</CardTitle>
            <CardDescription>Property owner information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{caseData.propertyOwner.name}</span>
              </div>
              {caseData.propertyOwner.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${caseData.propertyOwner.email}`} className="text-primary hover:underline">
                    {caseData.propertyOwner.email}
                  </a>
                </div>
              )}
              {caseData.propertyOwner.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${caseData.propertyOwner.phone}`} className="text-primary hover:underline">
                    {caseData.propertyOwner.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Preferred: {caseData.propertyOwner.preferredComMethod.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

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
              {caseData.tenant.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${caseData.tenant.email}`} className="text-primary hover:underline">
                    {caseData.tenant.email}
                  </a>
                </div>
              )}
              {caseData.tenant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${caseData.tenant.phone}`} className="text-primary hover:underline">
                    {caseData.tenant.phone}
                  </a>
                </div>
              )}
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
              <div className="pt-2">
                <Button variant="outline" size="sm">
                  View on Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
            <CardDescription>Information about the eviction case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium">Eviction Reason</h4>
                <Badge variant="outline">{caseData.evictionReason.replace(/_/g, " ")}</Badge>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Urgency Level</h4>
                <Badge
                  variant="outline"
                  className={
                    caseData.urgencyLevel === "ASAP"
                      ? "bg-red-50 text-red-700"
                      : caseData.urgencyLevel === "WITHIN_7_DAYS"
                        ? "bg-orange-50 text-orange-700"
                        : caseData.urgencyLevel === "WITHIN_30_DAYS"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-green-50 text-green-700"
                  }
                >
                  {caseData.urgencyLevel.replace(/_/g, " ")}
                </Badge>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium">Lead Source</h4>
                <Badge variant="outline">{caseData.leadSource.replace(/_/g, " ")}</Badge>
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
                <h4 className="mb-2 text-sm font-medium">Assigned To</h4>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{caseData.assignedTo ? caseData.assignedTo.name : "Unassigned"}</span>
                </div>
              </div>
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
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Recommended actions for this case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {caseData.stage === "NEW_LEAD" && (
                <>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Review case details and collect missing information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Request lease agreement and other relevant documents</span>
                  </div>
                </>
              )}

              {caseData.stage === "UNDER_REVIEW" && (
                <>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Prepare appropriate notice for tenant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Review all documents for completeness</span>
                  </div>
                </>
              )}

              {caseData.stage === "NOTICE_SERVED" && (
                <>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Monitor notice period expiration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Prepare court filing documents</span>
                  </div>
                </>
              )}

              {/* Add more stage-specific next steps as needed */}

              <div className="pt-2">
                <Button size="sm">Add Task</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
