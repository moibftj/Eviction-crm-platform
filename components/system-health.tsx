"use client"

import { useState, useEffect } from "react"
import { RefreshCw, CheckCircle, AlertTriangle, Database, Mail, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

// Health check result interface
interface HealthCheckResult {
  status: "healthy" | "unhealthy"
  timestamp: string
  results: {
    environment?: { status: "ok" | "error"; details?: any }
    database?: { status: "ok" | "error"; details?: any }
    email?: { status: "ok" | "error"; details?: any }
    deployment?: { status: "ok" | "error"; details?: any }
  }
  error?: string
}

export function SystemHealth() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null)

  // Fetch health check data
  const fetchHealthCheck = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/system/health-check")

      if (!response.ok) {
        throw new Error(`Failed to fetch health check data: ${response.statusText}`)
      }

      const data = await response.json()
      setHealthData(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch system health data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load health check data on component mount
  useEffect(() => {
    fetchHealthCheck()

    // Refresh health check every 5 minutes
    const interval = setInterval(fetchHealthCheck, 300000)

    return () => clearInterval(interval)
  }, [])

  // Get status icon component
  const StatusIcon = ({ status }: { status: "ok" | "error" }) => {
    return status === "ok" ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Current status of system components</CardDescription>
      </CardHeader>

      <CardContent>
        {loading && !healthData ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Checking system health...</span>
          </div>
        ) : !healthData ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Failed to fetch system health data</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {healthData.status === "healthy" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                )}
                <h3 className="text-lg font-medium">
                  System is {healthData.status === "healthy" ? "Healthy" : "Unhealthy"}
                </h3>
              </div>
              <div className="text-sm text-muted-foreground">
                Last checked: {new Date(healthData.timestamp).toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              {healthData.results.environment && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Environment</div>
                      {healthData.results.environment.status === "error" && (
                        <div className="text-sm text-red-500">
                          {healthData.results.environment.details?.errorCount} configuration errors
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusIcon status={healthData.results.environment.status} />
                </div>
              )}

              {healthData.results.database && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Database</div>
                      {healthData.results.database.status === "ok" ? (
                        <div className="text-sm text-muted-foreground">
                          {healthData.results.database.details?.userCount} users in database
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">{healthData.results.database.details?.message}</div>
                      )}
                    </div>
                  </div>
                  <StatusIcon status={healthData.results.database.status} />
                </div>
              )}

              {healthData.results.email && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email Service</div>
                      {healthData.results.email.status === "error" && (
                        <div className="text-sm text-red-500">{healthData.results.email.details?.message}</div>
                      )}
                    </div>
                  </div>
                  <StatusIcon status={healthData.results.email.status} />
                </div>
              )}

              {healthData.results.deployment && (
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Server className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Deployment</div>
                      {healthData.results.deployment.details?.version ? (
                        <div className="text-sm text-muted-foreground">
                          Version: {healthData.results.deployment.details.version}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {healthData.results.deployment.details?.message}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusIcon status={healthData.results.deployment.status} />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={fetchHealthCheck} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Health Status
        </Button>
      </CardFooter>
    </Card>
  )
}
