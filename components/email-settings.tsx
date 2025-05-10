"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

// Email settings interface
interface EmailSettings {
  server: string
  port: string
  secure: boolean
  user: string
  password: string
  from: string
}

export function EmailSettings() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<EmailSettings>({
    server: "",
    port: "587",
    secure: false,
    user: "",
    password: "",
    from: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch current email settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)

        const response = await fetch("/api/settings/email")

        if (!response.ok) {
          throw new Error("Failed to fetch email settings")
        }

        const data = await response.json()
        setSettings(data.settings)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [toast])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)

    try {
      const response = await fetch("/api/settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to save email settings")
      }

      toast({
        title: "Settings saved",
        description: "Email settings have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save email settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle input changes
  const handleChange = (field: keyof EmailSettings, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Configuration</CardTitle>
        <CardDescription>Configure SMTP settings for sending emails from the application</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading settings...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="server">SMTP Server</Label>
                <Input
                  id="server"
                  placeholder="smtp.example.com"
                  value={settings.server}
                  onChange={(e) => handleChange("server", e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="587"
                    value={settings.port}
                    onChange={(e) => handleChange("port", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secure" className="block mb-6">
                    Use SSL/TLS
                  </Label>
                  <Switch
                    id="secure"
                    checked={settings.secure}
                    onCheckedChange={(checked) => handleChange("secure", checked)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="user">Username</Label>
                <Input
                  id="user"
                  placeholder="user@example.com"
                  value={settings.user}
                  onChange={(e) => handleChange("user", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={settings.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">For security, the password is stored encrypted</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="from">From Address</Label>
                <Input
                  id="from"
                  placeholder="Proactive Eviction CRM <noreply@example.com>"
                  value={settings.from}
                  onChange={(e) => handleChange("from", e.target.value)}
                  required
                />
              </div>
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={loading || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
