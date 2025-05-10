import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"

export default async function ClientCasesPage() {
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
      assignedTo: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Cases</h2>
        <Button asChild>
          <Link href="/client/cases/new">Submit New Case</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case #</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Case Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No cases found
                </TableCell>
              </TableRow>
            ) : (
              cases.map((caseItem) => (
                <TableRow key={caseItem.id}>
                  <TableCell className="font-medium">{caseItem.caseNumber}</TableCell>
                  <TableCell>
                    {caseItem.property.address}, {caseItem.property.city}
                  </TableCell>
                  <TableCell>{caseItem.tenant.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getCaseStageColor(caseItem.stage)}>
                      {caseItem.stage.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{caseItem.evictionReason.replace(/_/g, " ")}</TableCell>
                  <TableCell>{format(new Date(caseItem.updatedAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>{caseItem.assignedTo?.name || "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/client/cases/${caseItem.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
