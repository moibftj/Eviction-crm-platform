import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CaseOverview } from "@/components/case-overview"
import { CaseDocuments } from "@/components/case-documents"
import { CaseNotes } from "@/components/case-notes"
import { CaseTasks } from "@/components/case-tasks"
import { CaseTimeline } from "@/components/case-timeline"
import { CaseHeader } from "@/components/case-header"

export default async function CaseDetailPage({
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
        include: {
          assignedTo: true,
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
      <CaseHeader caseData={caseData} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CaseOverview caseData={caseData} />
        </TabsContent>

        <TabsContent value="documents">
          <CaseDocuments caseData={caseData} />
        </TabsContent>

        <TabsContent value="tasks">
          <CaseTasks caseData={caseData} />
        </TabsContent>

        <TabsContent value="notes">
          <CaseNotes caseData={caseData} />
        </TabsContent>

        <TabsContent value="timeline">
          <CaseTimeline caseData={caseData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
