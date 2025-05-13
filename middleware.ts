import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { logger } from "./lib/logger"

// Middleware for global error handling and request logging
export function middleware(request: NextRequest) {
  // Skip for static assets
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/static") ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Log incoming requests (in development or if explicitly enabled)
  if (process.env.NODE_ENV === "development" || process.env.LOG_REQUESTS === "true") {
    logger.info(`Request: ${request.method} ${request.nextUrl.pathname}`, {
      headers: Object.fromEntries(request.headers),
      query: Object.fromEntries(request.nextUrl.searchParams),
    })
  }

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Content Security Policy (adjust as needed)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;",
  )

  return response
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Apply to all paths except static assets
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
