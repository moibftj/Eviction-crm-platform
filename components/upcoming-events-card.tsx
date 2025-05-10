import { format } from "date-fns"
import { Calendar } from "lucide-react"

interface UpcomingEventsCardProps {
  events: any[]
}

export function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  return (
    <div className="space-y-4">
      {events.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-1 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-medium">No upcoming events</h3>
            <p className="text-xs text-muted-foreground">You don&apos;t have any events scheduled</p>
          </div>
        </div>
      ) : (
        events.map((event) => (
          <div key={event.id} className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{event.title}</p>
              <p className="text-xs text-muted-foreground">
                {event.case ? `Case #${event.case.caseNumber}` : "No case associated"}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">{format(new Date(event.startDate), "MMM d, yyyy")}</div>
          </div>
        ))
      )}
    </div>
  )
}
