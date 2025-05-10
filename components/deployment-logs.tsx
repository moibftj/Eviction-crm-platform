"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { RefreshCw, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

// Log level type
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal" | "all"

// Log entry interface
interface LogEntry {
  level: Exclude<LogLevel, "all">
  message: string
  timestamp: string
  data?: any
}

export function DeploymentLogs() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<LogLevel>("all")

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/logs")

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.statusText}`)
      }

      const data = await response.json()
      setLogs(data.logs)
      applyFilters(data.logs, searchQuery, levelFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch logs")
      toast({
        title: "Error",
        description: "Failed to fetch deployment logs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Apply filters to logs
  const applyFilters = (logsToFilter: LogEntry[], query: string, level: LogLevel) => {
    let filtered = [...logsToFilter]

    // Apply level filter
    if (level !== "all") {
      filtered = filtered.filter((log) => log.level === level)
    }

    // Apply search query
    if (query.trim() !== "") {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(lowercaseQuery) ||
          (log.data && JSON.stringify(log.data).toLowerCase().includes(lowercaseQuery)),
      )
    }

    setFilteredLogs(filtered)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    applyFilters(logs, query, levelFilter)
  }

  // Handle level filter change
  const handleLevelChange = (value: string) => {
    const level = value as LogLevel
    setLevelFilter(level)
    applyFilters(logs, searchQuery, level)
  }

  // Load logs on component mount
  useEffect(() => {
    fetchLogs()

    // Refresh logs every minute
    const interval = setInterval(fetchLogs, 60000)

    return () => clearInterval(interval)
  }, [])

  // Get log level badge color
  const getLevelColor = (level: string) => {
    switch (level) {
      case "debug":
        return "bg-gray-500"
      case "info":
        return "bg-blue-500"
      case "warn":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      case "fatal":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Logs</CardTitle>
        <CardDescription>View and search application logs related to deployments</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-8" value={searchQuery} onChange={handleSearchChange} />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={levelFilter} onValueChange={handleLevelChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="fatal">Fatal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && logs.length === 0 ? (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2">Loading logs...</span>
          </div>
        ) : error ? (
          <div className="p-4 border rounded-md bg-red-50 text-red-800">
            <p>{error}</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No logs found matching the current filters</div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredLogs.map((log, index) => (
              <div key={index} className="p-3 border rounded-md text-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="font-mono">{log.message}</p>
                {log.data && (
                  <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto text-xs">
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button variant="outline" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Logs
        </Button>
      </CardFooter>
    </Card>
  )
}
