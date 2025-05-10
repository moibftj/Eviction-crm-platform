"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, MoreHorizontal, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCaseStageColor } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CaseHeaderProps {
  caseData: any
}

export function CaseHeader({ caseData }: CaseHeaderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState(caseData.stage)

  const updateCaseStage = async () => {
    setIsUpdating(true)

    try {
      const response = await fetch(`/api/cases/${caseData.id}/stage`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stage: selectedStage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update case stage")
      }

      toast({
        title: "Case updated",
        description: "Case stage has been updated successfully",
      })

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case stage. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{caseData.caseNumber}</h1>
            <Badge variant="outline" className={getCaseStageColor(caseData.stage)}>
              {caseData.stage.replace(/_/g, " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {caseData.propertyOwner.name} - {caseData.property.address}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Edit className="h-4 w-4" />
                Update Stage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Case Stage</DialogTitle>
                <DialogDescription>Change the current stage of the case.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="stage" className="text-sm font-medium">
                    Stage
                  </label>
                  <Select value={selectedStage} onValueChange={setSelectedStage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={updateCaseStage} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Stage"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Print Case Details</DropdownMenuItem>
              <DropdownMenuItem>Export to PDF</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Archive Case</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
