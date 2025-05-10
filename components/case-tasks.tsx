"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle2, Circle, Plus, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { getTaskPriorityColor } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CaseTasksProps {
  caseData: any
}

export function CaseTasks({ caseData }: CaseTasksProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [taskPriority, setTaskPriority] = useState("MEDIUM")

  const addTask = async () => {
    if (!taskTitle.trim()) {
      toast({
        title: "Empty title",
        description: "Please enter a title for the task",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/cases/${caseData.id}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          dueDate: taskDueDate || undefined,
          priority: taskPriority,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      toast({
        title: "Task added",
        description: "Your task has been added successfully",
      })

      setIsDialogOpen(false)
      setTaskTitle("")
      setTaskDescription("")
      setTaskDueDate("")
      setTaskPriority("MEDIUM")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      toast({
        title: "Task updated",
        description: `Task marked as ${!completed ? "completed" : "incomplete"}`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Manage tasks for this case</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
              <DialogDescription>Add a new task for this case</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="taskTitle">Title</Label>
                <Input
                  id="taskTitle"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskDueDate">Due Date</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taskPriority">Priority</Label>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addTask} disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {caseData.tasks.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <div className="flex flex-col items-center gap-1 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                <h3 className="text-sm font-medium">No tasks</h3>
                <p className="text-xs text-muted-foreground">Add tasks to track work for this case</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="mb-4 font-medium">Active Tasks</h3>
              {caseData.tasks
                .filter((task: any) => !task.completed)
                .map((task: any) => (
                  <div key={task.id} className="mb-4 flex items-start gap-3 rounded-md border p-4">
                    <div className="mt-1 cursor-pointer" onClick={() => toggleTaskCompletion(task.id, task.completed)}>
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge variant="outline" className={getTaskPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {task.assignedTo && (
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={task.assignedTo.image || ""} alt={task.assignedTo.name || ""} />
                                <AvatarFallback>
                                  <User className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                            </div>
                          )}
                        </div>
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              <h3 className="mb-4 mt-6 font-medium">Completed Tasks</h3>
              {caseData.tasks.filter((task: any) => task.completed).length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">No completed tasks</p>
              ) : (
                caseData.tasks
                  .filter((task: any) => task.completed)
                  .map((task: any) => (
                    <div key={task.id} className="mb-4 flex items-start gap-3 rounded-md border p-4 opacity-70">
                      <div
                        className="mt-1 cursor-pointer"
                        onClick={() => toggleTaskCompletion(task.id, task.completed)}
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium line-through">{task.title}</h4>
                          <Badge variant="outline" className="bg-gray-50 text-gray-500">
                            {task.priority}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="mt-1 text-sm text-muted-foreground line-through">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={task.assignedTo.image || ""} alt={task.assignedTo.name || ""} />
                                  <AvatarFallback>
                                    <User className="h-3 w-3" />
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
