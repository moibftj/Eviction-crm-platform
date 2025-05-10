import { format } from "date-fns"
import { type DeploymentInfo, DeploymentStatus } from "./deployment-monitor"

export function getTaskReminderEmailTemplate(task: any, user: any) {
  const dueDate = task.dueDate ? format(new Date(task.dueDate), "MMMM d, yyyy") : "No due date"
  const caseName = task.case ? `Case #${task.case.caseNumber}` : "No associated case"

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Task Deadline Reminder</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
          }
          .header {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px 5px 0 0;
            margin-bottom: 20px;
          }
          .task-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .task-details {
            margin: 15px 0;
          }
          .priority {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .priority-low {
            background-color: #e3f2fd;
            color: #1976d2;
          }
          .priority-medium {
            background-color: #fff8e1;
            color: #ff8f00;
          }
          .priority-high {
            background-color: #ffebee;
            color: #c62828;
          }
          .priority-urgent {
            background-color: #b71c1c;
            color: white;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4caf50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 15px;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #757575;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Task Deadline Reminder</h1>
          </div>
          
          <p>Hello ${user.name},</p>
          
          <p>This is a reminder that you have a task due soon:</p>
          
          <div class="task-details">
            <p class="task-title">${task.title}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <p><strong>Priority:</strong> <span class="priority priority-${task.priority.toLowerCase()}">${task.priority}</span></p>
            <p><strong>Related to:</strong> ${caseName}</p>
            ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ""}
          </div>
          
          <p>Please make sure to complete this task before the deadline.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}" class="button">View Task</a>
          
          <div class="footer">
            <p>This is an automated message from Proactive Eviction CRM. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Add deployment status email template
export function getDeploymentStatusEmailTemplate(deployment: DeploymentInfo): string {
  const statusColor = getStatusColor(deployment.status)
  const duration = deployment.endTime
    ? Math.round((deployment.endTime.getTime() - deployment.startTime.getTime()) / 1000)
    : 0

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .status { display: inline-block; padding: 5px 10px; border-radius: 3px; font-weight: bold; color: white; background-color: ${statusColor}; }
        .details { margin: 20px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details table td, .details table th { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
        .events { margin: 20px 0; }
        .event { padding: 10px; border-left: 3px solid #ddd; margin-bottom: 10px; }
        .event-time { color: #666; font-size: 0.9em; }
        .footer { margin-top: 30px; font-size: 0.8em; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Deployment Status Update</h2>
          <p>Status: <span class="status">${deployment.status}</span></p>
        </div>
        
        <div class="details">
          <h3>Deployment Details</h3>
          <table>
            <tr>
              <th>Deployment ID</th>
              <td>${deployment.id}</td>
            </tr>
            <tr>
              <th>Version</th>
              <td>${deployment.version}</td>
            </tr>
            <tr>
              <th>Environment</th>
              <td>${deployment.environment}</td>
            </tr>
            <tr>
              <th>Start Time</th>
              <td>${deployment.startTime.toLocaleString()}</td>
            </tr>
            ${
              deployment.endTime
                ? `
            <tr>
              <th>End Time</th>
              <td>${deployment.endTime.toLocaleString()}</td>
            </tr>
            <tr>
              <th>Duration</th>
              <td>${duration} seconds</td>
            </tr>
            `
                : ""
            }
            <tr>
              <th>Error Count</th>
              <td>${deployment.errorCount}</td>
            </tr>
          </table>
        </div>
        
        <div class="events">
          <h3>Deployment Events</h3>
          ${deployment.events
            .map(
              (event) => `
            <div class="event">
              <div class="event-time">${event.timestamp.toLocaleString()}</div>
              <div><strong>${event.type}</strong>: ${event.message}</div>
            </div>
          `,
            )
            .join("")}
        </div>
        
        <div class="footer">
          <p>This is an automated message from the Proactive Eviction CRM deployment system.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Get color for deployment status
function getStatusColor(status: DeploymentStatus): string {
  switch (status) {
    case DeploymentStatus.PENDING:
      return "#6c757d" // Gray
    case DeploymentStatus.IN_PROGRESS:
      return "#007bff" // Blue
    case DeploymentStatus.COMPLETED:
      return "#28a745" // Green
    case DeploymentStatus.FAILED:
      return "#dc3545" // Red
    case DeploymentStatus.ROLLED_BACK:
      return "#fd7e14" // Orange
    default:
      return "#6c757d" // Gray
  }
}
