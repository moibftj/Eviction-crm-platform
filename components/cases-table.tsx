import Link from "next/link"
import { format } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"

interface CasesTableProps {
  cases: any[]
}

export function CasesTable({ cases }: CasesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case #</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Tenant</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Updated</TableHead>
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
                <TableCell className="font-medium">
                  <Link href={`/cases/${caseItem.id}`} className="hover:underline">
                    {caseItem.caseNumber}
                  </Link>
                </TableCell>
                <TableCell>{caseItem.propertyOwner.name}</TableCell>
                <TableCell>{caseItem.tenant.name}</TableCell>
                <TableCell>{caseItem.property.address}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getCaseStageColor(caseItem.stage)}>
                    {caseItem.stage.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>{caseItem.evictionReason.replace(/_/g, " ")}</TableCell>
                <TableCell>{caseItem.urgencyLevel.replace(/_/g, " ")}</TableCell>
                <TableCell>{format(new Date(caseItem.updatedAt), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
