"use client"

import { useState } from "react"
import { Bell, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function SendTaskReminders() {
  const { toast } = useToast()
  const [days, setDays] = useState(2)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendReminders = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/tasks/send-reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reminders")
      }

      toast({
        title: "Reminders sent",
        description: data.message,
      })
    } catch (error) {
      console.error("Error sending reminders:", error)
      toast({
        title: "Error",
        description: "Failed to send task reminders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Task Reminders</CardTitle>
        <CardDescription>Manually send email reminders for upcoming task deadlines</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="days">Days Until Deadline</Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(Number.parseInt(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">Send reminders for tasks due within this many days</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendReminders} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Send Reminders
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
