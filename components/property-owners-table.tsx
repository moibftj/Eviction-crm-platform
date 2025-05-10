import Link from "next/link"
import { format } from "date-fns"
import { Mail, Phone } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface PropertyOwnersTableProps {
  propertyOwners: any[]
}

export function PropertyOwnersTable({ propertyOwners }: PropertyOwnersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Preferred Method</TableHead>
            <TableHead>Cases</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {propertyOwners.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No property owners found
              </TableCell>
            </TableRow>
          ) : (
            propertyOwners.map((owner) => (
              <TableRow key={owner.id}>
                <TableCell className="font-medium">{owner.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {owner.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${owner.email}`} className="text-sm hover:underline">
                          {owner.email}
                        </a>
                      </div>
                    )}
                    {owner.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${owner.phone}`} className="text-sm hover:underline">
                          {owner.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{owner.preferredComMethod.replace(/_/g, " ")}</TableCell>
                <TableCell>{owner.cases.length}</TableCell>
                <TableCell>{format(new Date(owner.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/contacts/owners/${owner.id}`}>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
