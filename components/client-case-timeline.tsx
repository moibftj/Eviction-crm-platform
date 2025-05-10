import { format } from "date-fns"
import { Calendar, CheckCircle2, FileText, Upload, AlertTriangle, Mail } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientCaseTimelineProps {
  caseData: any
}

export function ClientCaseTimeline({ caseData }: ClientCaseTimelineProps) {
  // Combine all timeline events
  const timelineEvents = [
    // Case creation
    {
      id: `case-created-${caseData.id}`,
      type: "CASE_CREATED",
      title: "Case Created",
      description: `Case #${caseData.caseNumber} was created`,
      date: new Date(caseData.createdAt),
      icon: <FileText className="h-4 w-4" />,
    },
    // Documents
    ...caseData.documents.map((doc: any) => ({
      id: `document-${doc.id}`,
      type: "DOCUMENT_UPLOADED",
      title: "Document Uploaded",
      description: `${doc.name} was uploaded`,
      date: new Date(doc.uploadedAt),
      icon: <Upload className="h-4 w-4" />,
    })),
    // Tasks (only completed ones)
    ...caseData.tasks.map((task: any) => ({
      id: `task-${task.id}`,
      type: "TASK_COMPLETED",
      title: "Task Completed",
      description: task.title,
      date: new Date(task.updatedAt),
      icon: <CheckCircle2 className="h-4 w-4" />,
    })),
    // Notices
    ...caseData.notices.map((notice: any) => ({
      id: `notice-${notice.id}`,
      type: "NOTICE_SENT",
      title: "Notice Sent",
      description: `${notice.type.replace(/_/g, " ")} notice was sent to tenant`,
      date: new Date(notice.sentDate),
      icon: <Mail className="h-4 w-4" />,
    })),
    // Events
    ...caseData.events.map((event: any) => ({
      id: `event-${event.id}`,
      type: "EVENT_SCHEDULED",
      title: "Event Scheduled",
      description: event.title,
      date: new Date(event.startDate),
      icon: <Calendar className="h-4 w-4" />,
    })),
  ]

  // Sort by date (newest first)
  const sortedEvents = timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
        <CardDescription>History of events for this case</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative ml-3 space-y-4 border-l pl-6 pt-2">
          {sortedEvents.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-center">
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-sm font-medium">No timeline events</h3>
                <p className="text-xs text-muted-foreground">No activity has been recorded for this case</p>
              </div>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full border bg-background">{event.icon}</div>
                <div className="mb-2 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{event.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      {format(event.date, "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
