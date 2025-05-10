import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const noteSchema = z.object({
  content: z.string().min(1, {
    message: "Note content cannot be empty",
  }),
})

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await req.json()
    const body = noteSchema.parse(json)

    const caseExists = await prisma.case.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!caseExists) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const note = await prisma.note.create({
      data: {
        content: body.content,
        caseId: params.id,
        createdById: session.user.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Note added successfully",
        note,
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }

    console.error("Error adding note:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
