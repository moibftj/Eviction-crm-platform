import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"
import { ClientCaseOverview } from "@/components/client-case-overview"
import { ClientCaseDocuments } from "@/components/client-case-documents"
import { ClientCaseTimeline } from "@/components/client-case-timeline"

export default async function ClientCaseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const caseData = await prisma.case.findUnique({
    where: {
      id: params.id,
      propertyOwner: {
        email: session.user.email,
      },
    },
    include: {
      propertyOwner: true,
      tenant: true,
      property: true,
      assignedTo: true,
      documents: {
        include: {
          uploadedBy: true,
        },
      },
      notices: true,
      tasks: {
        where: {
          completed: true,
        },
      },
      notes: {
        include: {
          createdBy: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      events: {
        orderBy: {
          startDate: "asc",
        },
      },
    },
  })

  if (!caseData) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/client/cases" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Cases
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{caseData.caseNumber}</h1>
              <Badge variant="outline" className={getCaseStageColor(caseData.stage)}>
                {caseData.stage.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {caseData.property.address}, {caseData.property.city}, {caseData.property.state}{" "}
              {caseData.property.zipCode}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <ClientCaseOverview caseData={caseData} />
        </TabsContent>

        <TabsContent value="documents">
          <ClientCaseDocuments caseData={caseData} />
        </TabsContent>

        <TabsContent value="timeline">
          <ClientCaseTimeline caseData={caseData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
