import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyOwnersTable } from "@/components/property-owners-table"
import { TenantsTable } from "@/components/tenants-table"

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get property owners
  const propertyOwners = await prisma.propertyOwner.findMany({
    include: {
      cases: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Get tenants
  const tenants = await prisma.tenant.findMany({
    include: {
      cases: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
        <div className="flex gap-2">
          <Link href="/contacts/new-owner">
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Owner
            </Button>
          </Link>
          <Link href="/contacts/new-tenant">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Tenant
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="owners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="owners">Property Owners</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
        </TabsList>
        <TabsContent value="owners">
          <PropertyOwnersTable propertyOwners={propertyOwners} />
        </TabsContent>
        <TabsContent value="tenants">
          <TenantsTable tenants={tenants} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
