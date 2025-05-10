import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { logger } from "@/lib/logger"

// Middleware to handle request logging and error tracking
export function middleware(request: NextRequest) {
  // Skip logging for static assets
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Log requests if enabled
  if (process.env.LOG_REQUESTS === "true") {
    const requestId = crypto.randomUUID()
    const startTime = Date.now()

    // Add request ID to headers for tracking
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-request-id", requestId)

    // Log request
    logger.info(`Request started: ${request.method} ${request.nextUrl.pathname}`, {
      requestId,
      method: request.method,
      url: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      userAgent: request.headers.get("user-agent"),
      referer: request.headers.get("referer"),
      ip: request.ip || request.headers.get("x-forwarded-for"),
    })

    // Continue with the request
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

    // Add response headers for tracking
    response.headers.set("x-request-id", requestId)

    // Use a custom header to calculate response time
    // This will be read by the middleware on the way back
    response.headers.set("x-request-start-time", startTime.toString())

    return response
  }

  return NextResponse.next()
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
