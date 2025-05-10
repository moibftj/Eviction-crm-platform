import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { PropertiesTable } from "@/components/properties-table"

export default async function PropertiesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get properties
  const properties = await prisma.property.findMany({
    include: {
      cases: true,
    },
    orderBy: {
      address: "asc",
    },
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
        <Link href="/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Property
          </Button>
        </Link>
      </div>

      <PropertiesTable properties={properties} />
    </div>
  )
}
