import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const stageSchema = z.object({
  stage: z.enum([
    "NEW_LEAD",
    "UNDER_REVIEW",
    "NOTICE_SERVED",
    "WAITING_PERIOD",
    "COURT_FILING",
    "HEARING_SCHEDULED",
    "JUDGMENT",
    "ENFORCEMENT",
    "CASE_CLOSED",
  ]),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const body = stageSchema.parse(json)

    const caseExists = await prisma.case.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!caseExists) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const updatedCase = await prisma.case.update({
      where: {
        id: params.id,
      },
      data: {
        stage: body.stage,
      },
    })

    // Create a note about the stage change
    await prisma.note.create({
      data: {
        content: `Case stage updated to ${body.stage.replace(/_/g, " ")}`,
        caseId: params.id,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Case stage updated successfully",
        case: updatedCase,
      },
      { status: 200 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }

    console.error("Error updating case stage:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
