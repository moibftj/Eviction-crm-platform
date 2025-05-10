import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCaseStageColor(stage: string) {
  switch (stage) {
    case "NEW_LEAD":
      return "bg-blue-50 text-blue-700 hover:bg-blue-100"
    case "UNDER_REVIEW":
      return "bg-purple-50 text-purple-700 hover:bg-purple-100"
    case "NOTICE_SERVED":
      return "bg-amber-50 text-amber-700 hover:bg-amber-100"
    case "WAITING_PERIOD":
      return "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
    case "COURT_FILING":
      return "bg-orange-50 text-orange-700 hover:bg-orange-100"
    case "HEARING_SCHEDULED":
      return "bg-pink-50 text-pink-700 hover:bg-pink-100"
    case "JUDGMENT":
      return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
    case "ENFORCEMENT":
      return "bg-red-50 text-red-700 hover:bg-red-100"
    case "CASE_CLOSED":
      return "bg-green-50 text-green-700 hover:bg-green-100"
    default:
      return "bg-gray-50 text-gray-700 hover:bg-gray-100"
  }
}

export function getTaskPriorityColor(priority: string) {
  switch (priority) {
    case "LOW":
      return "bg-blue-50 text-blue-700 hover:bg-blue-100"
    case "MEDIUM":
      return "bg-amber-50 text-amber-700 hover:bg-amber-100"
    case "HIGH":
      return "bg-orange-50 text-orange-700 hover:bg-orange-100"
    case "URGENT":
      return "bg-red-50 text-red-700 hover:bg-red-100"
    default:
      return "bg-gray-50 text-gray-700 hover:bg-gray-100"
  }
}

export function generateCaseNumber() {
  const prefix = "EVT"
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")
  return `${prefix}-${year}-${random}`
}
