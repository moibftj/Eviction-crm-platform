import { format } from "date-fns"
import { CheckCircle2 } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { getTaskPriorityColor } from "@/lib/utils"

interface TasksListProps {
  tasks: any[]
}

export function TasksList({ tasks }: TasksListProps) {
  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-1 text-center">
            <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            <h3 className="text-sm font-medium">No urgent tasks</h3>
            <p className="text-xs text-muted-foreground">You don&apos;t have any urgent tasks</p>
          </div>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex items-center space-x-4 rounded-md border p-4">
            <Checkbox id={`task-${task.id}`} />
            <div className="flex-1 space-y-1">
              <label
                htmlFor={`task-${task.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {task.title}
              </label>
              <p className="text-xs text-muted-foreground">
                {task.case ? `Case #${task.case.caseNumber}` : "No case associated"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getTaskPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">{format(new Date(task.dueDate), "MMM d")}</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
