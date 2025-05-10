"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface CaseNotesProps {
  caseData: any
}

export function CaseNotes({ caseData }: CaseNotesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [noteContent, setNoteContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Empty note",
        description: "Please enter some content for your note",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/cases/${caseData.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: noteContent,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add note")
      }

      toast({
        title: "Note added",
        description: "Your note has been added successfully",
      })

      setNoteContent("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Notes</CardTitle>
        <CardDescription>Add and view notes for this case</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border p-4">
            <Textarea
              placeholder="Add a new note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={addNote} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Note"}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            {caseData.notes.length === 0 ? (
              <p className="text-center text-muted-foreground">No notes yet</p>
            ) : (
              caseData.notes.map((note: any) => (
                <div key={note.id} className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={note.createdBy.image || ""} alt={note.createdBy.name || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{note.createdBy.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
