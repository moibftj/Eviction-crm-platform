/**
 * Application logging utility
 * Provides structured logging with different severity levels
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: any
}

// Simple in-memory log storage for recent logs
// In a production app, you might want to use a proper logging service
const recentLogs: LogEntry[] = []
const MAX_LOGS = 1000

// Function to determine if we're in a server context
const isServer = () => typeof window === "undefined"

// Create a timestamp string
const timestamp = () => new Date().toISOString()

// Log to the appropriate output based on environment
function logToOutput(entry: LogEntry): void {
  // Format the log entry
  const formattedData = entry.data ? JSON.stringify(entry.data, null, 2) : ""
  const formattedEntry = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message} ${formattedData}`

  // Store in recent logs
  recentLogs.push(entry)
  if (recentLogs.length > MAX_LOGS) {
    recentLogs.shift()
  }

  // Only log to console on server or in development
  if (isServer() || process.env.NODE_ENV === "development") {
    switch (entry.level) {
      case "debug":
        console.debug(formattedEntry)
        break
      case "info":
        console.info(formattedEntry)
        break
      case "warn":
        console.warn(formattedEntry)
        break
      case "error":
      case "fatal":
        console.error(formattedEntry)
        break
    }
  }
}

// Logger implementation
export const logger = {
  debug: (message: string, data?: any) => {
    logToOutput({ level: "debug", message, timestamp: timestamp(), data })
  },

  info: (message: string, data?: any) => {
    logToOutput({ level: "info", message, timestamp: timestamp(), data })
  },

  warn: (message: string, data?: any) => {
    logToOutput({ level: "warn", message, timestamp: timestamp(), data })
  },

  error: (message: string, data?: any) => {
    logToOutput({ level: "error", message, timestamp: timestamp(), data })
  },

  fatal: (message: string, data?: any) => {
    logToOutput({ level: "fatal", message, timestamp: timestamp(), data })
  },

  // Get recent logs (useful for admin dashboards)
  getRecentLogs: (count = 100, level?: LogLevel) => {
    let filteredLogs = recentLogs

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level)
    }

    return filteredLogs.slice(-count)
  },

  // Clear logs (for testing)
  clearLogs: () => {
    recentLogs.length = 0
  },
}
