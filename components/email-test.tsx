"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export function EmailTest() {
  const { toast } = useToast()
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("Test Email from Proactive Eviction CRM")
  const [content, setContent] = useState(
    `<h1>Test Email</h1>
<p>This is a test email from Proactive Eviction CRM.</p>
<p>If you received this email, your email configuration is working correctly.</p>`,
  )
  const [isSending, setIsSending] = useState(false)

  const handleSendTest = async () => {
    if (!to) {
      toast({
        title: "Missing recipient",
        description: "Please enter a recipient email address",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const response = await fetch("/api/email/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          html: content,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Test email sent",
          description: `Email successfully sent to ${to}`,
        })
      } else {
        throw new Error(data.error || "Failed to send test email")
      }
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Email Configuration</CardTitle>
        <CardDescription>Send a test email to verify your email configuration is working correctly</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to">Recipient Email</Label>
          <Input id="to" placeholder="recipient@example.com" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Email Content (HTML)</Label>
          <Textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={handleSendTest} disabled={isSending}>
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Test Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
