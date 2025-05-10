import Link from "next/link"
import { format } from "date-fns"
import { Mail, Phone, Calendar } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

interface TenantsTableProps {
  tenants: any[]
}

export function TenantsTable({ tenants }: TenantsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Lease Start</TableHead>
            <TableHead>Cases</TableHead>
            <TableHead>Added</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No tenants found
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {tenant.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${tenant.email}`} className="text-sm hover:underline">
                          {tenant.email}
                        </a>
                      </div>
                    )}
                    {tenant.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <a href={`tel:${tenant.phone}`} className="text-sm hover:underline">
                          {tenant.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {tenant.leaseStart ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{format(new Date(tenant.leaseStart), "MMM d, yyyy")}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </TableCell>
                <TableCell>{tenant.cases.length}</TableCell>
                <TableCell>{format(new Date(tenant.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/contacts/tenants/${tenant.id}`}>
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
