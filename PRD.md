# Product Requirement Document (PRD): To-Do List 2026

## 1. Project Overview
**Project Name:** To-Do List 2026
**Goal:** A gamified task management application designed to help the user track goals, meet deadlines, and stay motivated throughout 2026. The app combines standard to-do list functionality with game-like elements such as points and rewards to encourage productivity.

## 2. Technical Stack
*   **Frontend:** Vanilla HTML, Tailwind CSS (via CDN).
*   **Backend:** Google Apps Script (GAS).
*   **Database:** Google Sheets.
*   **Deployment:** Google Apps Script Web App.

## 3. Core Features

### 3.1 Task Management
*   **Add Task:** Users can create new tasks with a title, description, deadline, and priority/difficulty level.
*   **Edit Task:** Users can modify existing task details.
*   **Delete Task:** Users can remove tasks.
*   **Mark as Complete:** Users can mark tasks as done.

### 3.2 Deadlines & Notifications
*   **Deadline Setting:** Every task must have a date and time deadline.
*   **Email Reminders:** The system will send email notifications via Google Mail (GmailApp) if a task is approaching its deadline or if a deadline has been missed.
*   **Daily Digest:** (Optional) A morning email summary of tasks for the day.

### 3.3 Gamification
*   **Points System:**
    *   Completing a task earns points based on difficulty.
    *   Completing a task *before* the deadline earns a bonus.
    *   Missing a deadline may result in a penalty or 0 points.
*   **Levels/Badges:** (Optional) Accumulating points can unlock levels (e.g., "Novice Planner", "Productivity Master").
*   **Visual Feedback:** Progress bars, confetti on completion, or score counters.

### 3.4 Motivation
*   **Motivational Quotes:** Display a random motivational quote on the dashboard.
*   **Streak Counter:** Track consecutive days of completing at least one task.

## 4. Data Architecture (Google Sheets)

The application will use a Google Sheet as the database.

### Sheet 1: `Tasks`
| ID | Title | Description | Deadline | Status | Difficulty | Points Value | Created At | Completed At |
|----|-------|-------------|----------|--------|------------|--------------|------------|--------------|
| UUID | String | String | DateTime | Pending/Done | Low/Med/High | Integer | DateTime | DateTime |

### Sheet 2: `UserStats`
| Total Points | Level | Current Streak | Max Streak | Last Active Date |
|--------------|-------|----------------|------------|------------------|
| Integer | Integer | Integer | Integer | Date |

## 5. User Interface (UI)

### 5.1 Dashboard
*   **Header:** Displays current score, level, and streak.
*   **Active Tasks:** List of pending tasks sorted by deadline.
    *   Each task card shows Title, Deadline, and Points.
    *   "Complete" button.
    *   "Edit" button.
*   **Add Button:** A floating action button (FAB) or prominent button to add a new task.

### 5.2 Add/Edit Task Modal
*   **Form Fields:**
    *   Task Name (Input)
    *   Description (Textarea)
    *   Deadline (Date/Time Picker)
    *   Difficulty (Select: Easy, Medium, Hard - auto-assigns points)

## 6. Logic & Implementation Details

### 6.1 Backend (Google Apps Script)
*   `doGet(e)`: Serves the HTML file.
*   `getTasks()`: Reads rows from the `Tasks` sheet.
*   `addTask(task)`: Appends a new row to the `Tasks` sheet.
*   `updateTask(id, data)`: Finds and updates a row.
*   `markComplete(id)`: Updates status, calculates points based on time vs deadline, updates `UserStats`.
*   **Triggers:** A time-driven trigger (e.g., every hour or daily) to check for overdue tasks and send emails.

### 6.2 Frontend
*   Fetch data from backend using `google.script.run`.
*   Render UI using vanilla JS and template literals.
*   Style using Tailwind utility classes.
