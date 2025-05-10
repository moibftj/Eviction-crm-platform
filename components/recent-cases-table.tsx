import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"

interface RecentCasesTableProps {
  cases: any[]
}

export function RecentCasesTable({ cases }: RecentCasesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Case #</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Property</TableHead>
          <TableHead>Stage</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
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
              <TableCell>{caseItem.property.address}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getCaseStageColor(caseItem.stage)}>
                  {caseItem.stage.replace(/_/g, " ")}
                </Badge>
              </TableCell>
              <TableCell>{formatDistanceToNow(new Date(caseItem.createdAt), { addSuffix: true })}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
