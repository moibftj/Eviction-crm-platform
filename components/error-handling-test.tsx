"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function ErrorHandlingTest() {
  const { toast } = useToast()
  const [errorType, setErrorType] = useState("generic")
  const [severity, setSeverity] = useState("MEDIUM")
  const [shouldRecover, setShouldRecover] = useState(true)
  const [shouldNotify, setShouldNotify] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTestError = async () => {
    if (shouldNotify && !recipientEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a recipient email for notifications",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/system/test-error-handling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          errorType,
          severity,
          shouldRecover,
          shouldNotify,
          recipientEmail: shouldNotify ? recipientEmail : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Error Test Completed",
          description: `Error was ${data.recovered ? "successfully recovered" : "not recovered"}`,
        })
      } else {
        throw new Error(data.error || "Failed to test error handling")
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Error Handling</CardTitle>
        <CardDescription>Generate test errors to verify error handling functionality</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="error-type">Error Type</Label>
          <Select value={errorType} onValueChange={setErrorType}>
            <SelectTrigger id="error-type">
              <SelectValue placeholder="Select error type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="generic">Generic Error</SelectItem>
              <SelectItem value="database">Database Error</SelectItem>
              <SelectItem value="email">Email Error</SelectItem>
              <SelectItem value="deployment">Deployment Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="severity">Error Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger id="severity">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="should-recover" className="cursor-pointer">
            Attempt Recovery
          </Label>
          <Switch id="should-recover" checked={shouldRecover} onCheckedChange={setShouldRecover} />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="should-notify" className="cursor-pointer">
            Send Email Notification
          </Label>
          <Switch id="should-notify" checked={shouldNotify} onCheckedChange={setShouldNotify} />
        </div>

        {shouldNotify && (
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Notification Email</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="admin@example.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleTestError} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Test Error Handling
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
