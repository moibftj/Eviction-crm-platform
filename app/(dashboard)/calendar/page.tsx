import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarView } from "@/components/calendar-view"

export default async function CalendarPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Get events for the next 30 days
  const today = new Date()
  const thirtyDaysLater = addDays(today, 30)

  const events = await prisma.event.findMany({
    where: {
      startDate: {
        gte: today,
        lte: thirtyDaysLater,
      },
    },
    include: {
      case: true,
    },
    orderBy: {
      startDate: "asc",
    },
  })

  // Get upcoming events for this week
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }) // Monday as start of week
  const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 })
  const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek })

  // Group events by day for this week
  const eventsByDay = daysOfWeek.map((day) => {
    return {
      date: day,
      events: events.filter((event) => isSameDay(new Date(event.startDate), day)),
    }
  })

  return (
    <div className="flex flex-col gap-4 py-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        {eventsByDay.map((day, index) => (
          <Card key={index} className={day.events.length > 0 ? "border-primary/50" : ""}>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{format(day.date, "EEEE")}</CardTitle>
              <CardDescription>{format(day.date, "MMM d")}</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              {day.events.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events</p>
              ) : (
                <div className="space-y-2">
                  {day.events.map((event) => (
                    <div key={event.id} className="rounded-md bg-primary/10 p-2 text-xs">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.startDate), "h:mm a")}
                        {event.case && ` - Case #${event.case.caseNumber}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Events scheduled for the next 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <CalendarView events={events} />
        </CardContent>
      </Card>
    </div>
  )
}
