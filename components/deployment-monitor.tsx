"use client"

import { useState, useEffect } from "react"
import { RefreshCw, AlertTriangle, CheckCircle, Clock, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Deployment status types (matching the backend)
enum DeploymentStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  ROLLED_BACK = "rolled_back",
}

// Deployment info interface
interface DeploymentInfo {
  id: string
  version: string
  environment: string
  startTime: string
  endTime?: string
  status: DeploymentStatus
  events: Array<{
    type: string
    timestamp: string
    message: string
  }>
  errorCount: number
}

export function DeploymentMonitor() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentDeployment, setCurrentDeployment] = useState<DeploymentInfo | null>(null)
  const [deploymentHistory, setDeploymentHistory] = useState<DeploymentInfo[]>([])
  const [rollbackReason, setRollbackReason] = useState("")
  const [isRollingBack, setIsRollingBack] = useState(false)

  // Fetch deployment status
  const fetchDeploymentStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/deployment/status")

      if (!response.ok) {
        throw new Error(`Failed to fetch deployment status: ${response.statusText}`)
      }

      const data = await response.json()
      setCurrentDeployment(data.current)
      setDeploymentHistory(data.history)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch deployment status")
      toast({
        title: "Error",
        description: "Failed to fetch deployment status",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Trigger deployment rollback
  const handleRollback = async () => {
    if (!currentDeployment || currentDeployment.status !== DeploymentStatus.FAILED) {
      toast({
        title: "Cannot rollback",
        description: "Rollback is only available for failed deployments",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRollingBack(true)

      const response = await fetch("/api/deployment/rollback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rollbackReason || "Manual rollback triggered by admin",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to rollback deployment: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Rollback initiated",
          description: "Deployment rollback has been initiated successfully",
        })

        // Refresh status after rollback
        fetchDeploymentStatus()
      } else {
        throw new Error(data.error || "Failed to rollback deployment")
      }
    } catch (err) {
      toast({
        title: "Rollback failed",
        description: err instanceof Error ? err.message : "Failed to rollback deployment",
        variant: "destructive",
      })
    } finally {
      setIsRollingBack(false)
      setRollbackReason("")
    }
  }

  // Load deployment status on component mount
  useEffect(() => {
    fetchDeploymentStatus()

    // Refresh status every 30 seconds
    const interval = setInterval(fetchDeploymentStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  // Get status badge color
  const getStatusColor = (status: DeploymentStatus) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return "bg-gray-500"
      case DeploymentStatus.IN_PROGRESS:
        return "bg-blue-500"
      case DeploymentStatus.COMPLETED:
        return "bg-green-500"
      case DeploymentStatus.FAILED:
        return "bg-red-500"
      case DeploymentStatus.ROLLED_BACK:
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get status icon
  const StatusIcon = ({ status }: { status: DeploymentStatus }) => {
    switch (status) {
      case DeploymentStatus.PENDING:
        return <Clock className="h-5 w-5 text-gray-500" />
      case DeploymentStatus.IN_PROGRESS:
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case DeploymentStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case DeploymentStatus.FAILED:
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case DeploymentStatus.ROLLED_BACK:
        return <RotateCcw className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Deployment</CardTitle>
          <CardDescription>Status and details of the current or most recent deployment</CardDescription>
        </CardHeader>

        <CardContent>
          {loading && !currentDeployment ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading deployment status...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !currentDeployment ? (
            <Alert>
              <AlertDescription>No deployment information available</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <StatusIcon status={currentDeployment.status} />
                  <h3 className="text-lg font-medium">{currentDeployment.status.replace("_", " ").toUpperCase()}</h3>
                  <Badge className={getStatusColor(currentDeployment.status)}>{currentDeployment.environment}</Badge>
                </div>

                <div>
                  <Badge variant="outline">v{currentDeployment.version}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deployment ID</p>
                  <p className="text-sm">{currentDeployment.id}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                  <p className="text-sm">{new Date(currentDeployment.startTime).toLocaleString()}</p>
                </div>

                {currentDeployment.endTime && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">End Time</p>
                      <p className="text-sm">{new Date(currentDeployment.endTime).toLocaleString()}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Duration</p>
                      <p className="text-sm">
                        {Math.round(
                          (new Date(currentDeployment.endTime).getTime() -
                            new Date(currentDeployment.startTime).getTime()) /
                            1000,
                        )}{" "}
                        seconds
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Error Count</p>
                  <p className="text-sm">{currentDeployment.errorCount}</p>
                </div>
              </div>

              {currentDeployment.status === DeploymentStatus.FAILED && (
                <div className="mt-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Deployment Failed</AlertTitle>
                    <AlertDescription>
                      The deployment failed with {currentDeployment.errorCount} errors. You can initiate a rollback to
                      the previous version.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchDeploymentStatus} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {currentDeployment?.status === DeploymentStatus.FAILED && (
            <Button variant="destructive" onClick={handleRollback} disabled={isRollingBack}>
              <RotateCcw className={`mr-2 h-4 w-4 ${isRollingBack ? "animate-spin" : ""}`} />
              {isRollingBack ? "Rolling Back..." : "Rollback Deployment"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {deploymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment History</CardTitle>
            <CardDescription>Recent deployment history</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left font-medium">Version</th>
                    <th className="px-4 py-2 text-left font-medium">Environment</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Start Time</th>
                    <th className="px-4 py-2 text-left font-medium">Duration</th>
                    <th className="px-4 py-2 text-left font-medium">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {deploymentHistory.map((deployment) => (
                    <tr key={deployment.id} className="border-b">
                      <td className="px-4 py-2">v{deployment.version}</td>
                      <td className="px-4 py-2">{deployment.environment}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <StatusIcon status={deployment.status} />
                          <span>{deployment.status.replace("_", " ").toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{new Date(deployment.startTime).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        {deployment.endTime
                          ? `${Math.round(
                              (new Date(deployment.endTime).getTime() - new Date(deployment.startTime).getTime()) /
                                1000,
                            )} sec`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2">{deployment.errorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
