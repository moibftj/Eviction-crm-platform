import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { CasesTable } from "@/components/cases-table"
import { CasesFilter } from "@/components/cases-filter"

export default async function CasesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Parse filter parameters
  const stage = searchParams.stage as string | undefined
  const evictionReason = searchParams.evictionReason as string | undefined
  const urgencyLevel = searchParams.urgencyLevel as string | undefined
  const search = searchParams.search as string | undefined

  // Build filter conditions
  const where: any = {}

  if (stage) {
    where.stage = stage
  }

  if (evictionReason) {
    where.evictionReason = evictionReason
  }

  if (urgencyLevel) {
    where.urgencyLevel = urgencyLevel
  }

  if (search) {
    where.OR = [
      { caseNumber: { contains: search, mode: "insensitive" } },
      { propertyOwner: { name: { contains: search, mode: "insensitive" } } },
      { tenant: { name: { contains: search, mode: "insensitive" } } },
      { property: { address: { contains: search, mode: "insensitive" } } },
    ]
  }

  // Get cases with filters
  const cases = await prisma.case.findMany({
    where,
    include: {
      propertyOwner: true,
      tenant: true,
      property: true,
      assignedTo: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cases</h2>
        <Link href="/leads/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-4">
        <CasesFilter />
        <CasesTable cases={cases} />
      </div>
    </div>
  )
}
