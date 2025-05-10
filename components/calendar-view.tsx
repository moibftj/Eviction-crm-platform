import { format } from "date-fns"
import { Calendar, MapPin, Clock, Briefcase } from "lucide-react"

interface CalendarViewProps {
  events: any[]
}

export function CalendarView({ events }: CalendarViewProps) {
  // Group events by date
  const eventsByDate: Record<string, any[]> = {}

  events.forEach((event) => {
    const dateKey = format(new Date(event.startDate), "yyyy-MM-dd")
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })

  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort()

  return (
    <div className="space-y-6">
      {events.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-1 text-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-medium">No upcoming events</h3>
            <p className="text-xs text-muted-foreground">You don&apos;t have any events scheduled</p>
          </div>
        </div>
      ) : (
        sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <h3 className="mb-2 font-medium">{format(new Date(dateKey), "EEEE, MMMM d, yyyy")}</h3>
            <div className="space-y-2">
              {eventsByDate[dateKey].map((event) => (
                <div key={event.id} className="flex items-start gap-4 rounded-md border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{event.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "h:mm a")}
                        {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                      </span>
                    </div>
                    {event.description && <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-4">
                      {event.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.case && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Briefcase className="h-3 w-3" />
                          <span>Case #{event.case.caseNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.type.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
