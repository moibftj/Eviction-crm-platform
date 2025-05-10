import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateCaseNumber } from "@/lib/utils"

const leadSchema = z.object({
  // Property Owner Information
  ownerName: z.string().min(2),
  ownerEmail: z.string().email().optional().or(z.literal("")),
  ownerPhone: z.string().min(10).optional().or(z.literal("")),
  preferredComMethod: z.enum(["EMAIL", "PHONE", "TEXT"]),

  // Property Information
  propertyAddress: z.string().min(5),
  propertyCity: z.string().min(2),
  propertyState: z.string().min(2),
  propertyZipCode: z.string().min(5),

  // Tenant Information
  tenantName: z.string().min(2),
  tenantEmail: z.string().email().optional().or(z.literal("")),
  tenantPhone: z.string().min(10).optional().or(z.literal("")),
  leaseStart: z.string().optional(),

  // Case Information
  leadSource: z.enum(["WEBSITE_FORM", "PHONE_CALL", "REFERRAL", "AD_CAMPAIGN", "OTHER"]),
  evictionReason: z.enum([
    "NON_PAYMENT",
    "LEASE_VIOLATION",
    "PROPERTY_DAMAGE",
    "ILLEGAL_ACTIVITY",
    "LEASE_EXPIRATION",
    "OTHER",
  ]),
  urgencyLevel: z.enum(["ASAP", "WITHIN_7_DAYS", "WITHIN_30_DAYS", "NOT_URGENT"]),
  description: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const body = leadSchema.parse(json)

    // Create or find property owner
    let propertyOwner = await prisma.propertyOwner.findFirst({
      where: {
        name: body.ownerName,
        email: body.ownerEmail || undefined,
      },
    })

    if (!propertyOwner) {
      propertyOwner = await prisma.propertyOwner.create({
        data: {
          name: body.ownerName,
          email: body.ownerEmail || null,
          phone: body.ownerPhone || null,
          preferredComMethod: body.preferredComMethod,
        },
      })
    }

    // Create or find property
    let property = await prisma.property.findFirst({
      where: {
        address: body.propertyAddress,
        city: body.propertyCity,
        state: body.propertyState,
        zipCode: body.propertyZipCode,
      },
    })

    if (!property) {
      property = await prisma.property.create({
        data: {
          address: body.propertyAddress,
          city: body.propertyCity,
          state: body.propertyState,
          zipCode: body.propertyZipCode,
        },
      })
    }

    // Create or find tenant
    let tenant = await prisma.tenant.findFirst({
      where: {
        name: body.tenantName,
        email: body.tenantEmail || undefined,
      },
    })

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: body.tenantName,
          email: body.tenantEmail || null,
          phone: body.tenantPhone || null,
          leaseStart: body.leaseStart ? new Date(body.leaseStart) : null,
        },
      })
    }

    // Generate case number
    const caseNumber = generateCaseNumber()

    // Create case
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        leadSource: body.leadSource,
        evictionReason: body.evictionReason,
        urgencyLevel: body.urgencyLevel,
        description: body.description || null,
        propertyOwnerId: propertyOwner.id,
        propertyId: property.id,
        tenantId: tenant.id,
        assignedToId: session.user.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        caseNumber: newCase.caseNumber,
        caseId: newCase.id,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }

    console.error("Error creating lead:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
