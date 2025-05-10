"use client"

import type React from "react"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function CasesFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [stage, setStage] = useState<string | null>(searchParams.get("stage"))
  const [evictionReason, setEvictionReason] = useState<string | null>(searchParams.get("evictionReason"))
  const [urgencyLevel, setUrgencyLevel] = useState<string | null>(searchParams.get("urgencyLevel"))
  const [search, setSearch] = useState<string | null>(searchParams.get("search"))

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams()

    if (stage) params.set("stage", stage)
    if (evictionReason) params.set("evictionReason", evictionReason)
    if (urgencyLevel) params.set("urgencyLevel", urgencyLevel)
    if (search) params.set("search", search)

    router.push(`/cases?${params.toString()}`)
  }

  // Clear all filters
  const clearFilters = () => {
    setStage(null)
    setEvictionReason(null)
    setUrgencyLevel(null)
    setSearch(null)
    router.push("/cases")
  }

  // Handle search input
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters()
    }
  }

  // Apply filters when any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 500)

    return () => clearTimeout(timer)
  }, [stage, evictionReason, urgencyLevel])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={stage || ""} onValueChange={setStage}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Case Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              <SelectItem value="NEW_LEAD">New Lead</SelectItem>
              <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
              <SelectItem value="NOTICE_SERVED">Notice Served</SelectItem>
              <SelectItem value="WAITING_PERIOD">Waiting Period</SelectItem>
              <SelectItem value="COURT_FILING">Court Filing</SelectItem>
              <SelectItem value="HEARING_SCHEDULED">Hearing Scheduled</SelectItem>
              <SelectItem value="JUDGMENT">Judgment</SelectItem>
              <SelectItem value="ENFORCEMENT">Enforcement</SelectItem>
              <SelectItem value="CASE_CLOSED">Case Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={evictionReason || ""} onValueChange={setEvictionReason}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Eviction Reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Reasons</SelectItem>
              <SelectItem value="NON_PAYMENT">Non-Payment</SelectItem>
              <SelectItem value="LEASE_VIOLATION">Lease Violation</SelectItem>
              <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
              <SelectItem value="ILLEGAL_ACTIVITY">Illegal Activity</SelectItem>
              <SelectItem value="LEASE_EXPIRATION">Lease Expiration</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={urgencyLevel || ""} onValueChange={setUrgencyLevel}>
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Urgency Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Urgency Levels</SelectItem>
              <SelectItem value="ASAP">ASAP</SelectItem>
              <SelectItem value="WITHIN_7_DAYS">Within 7 Days</SelectItem>
              <SelectItem value="WITHIN_30_DAYS">Within 30 Days</SelectItem>
              <SelectItem value="NOT_URGENT">Not Urgent</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Search cases..."
              value={search || ""}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
              className="h-8 w-[200px]"
            />
            <Button variant="ghost" size="sm" onClick={applyFilters} className="h-8 px-2">
              Apply
            </Button>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8">
          <X className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {/* Active filters */}
      {(stage || evictionReason || urgencyLevel || search) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {stage && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Stage: {stage.replace(/_/g, " ")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setStage(null)} />
            </Badge>
          )}
          {evictionReason && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Reason: {evictionReason.replace(/_/g, " ")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setEvictionReason(null)} />
            </Badge>
          )}
          {urgencyLevel && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Urgency: {urgencyLevel.replace(/_/g, " ")}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setUrgencyLevel(null)} />
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearch(null)} />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
