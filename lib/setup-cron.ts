// This file is for documentation purposes only
// It shows how to set up a cron job to trigger the task reminders

/*
To set up automated task reminders with a cron job, you need to:

1. Add the following environment variables to your .env file:

EMAIL_SERVER=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=Proactive Eviction CRM <noreply@proactiveeviction.com>
NEXT_PUBLIC_APP_URL=https://your-app-url.com
TASK_REMINDER_DAYS=2
CRON_SECRET=your-secret-key-for-cron-jobs

2. Set up a cron job to call the API endpoint:

For Vercel Cron Jobs:
Add this to your vercel.json file:

{
  "crons": [
    {
      "path": "/api/cron/task-reminders?cron_secret=your-secret-key-for-cron-jobs",
      "schedule": "0 8 * * *"
    }
  ]
}

This will run the task reminder job every day at 8:00 AM.

For other hosting providers, set up a cron job to make an HTTP GET request to:
https://your-app-url.com/api/cron/task-reminders

Make sure to include the Authorization header:
Authorization: Bearer your-secret-key-for-cron-jobs
*/
