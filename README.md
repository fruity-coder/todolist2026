# To-Do List 2026

A gamified task management application for 2026, built with Google Apps Script, Google Sheets, and Tailwind CSS.

## Features
- **Task Tracking**: Create, edit, and delete tasks with deadlines.
- **Gamification**: Earn points for completing tasks. Get bonuses for early completion and penalties for late completion.
- **Progression**: Level up and track your daily streak.
- **Email Reminders**: Automatic notifications for upcoming and overdue deadlines.
- **Modern UI**: Clean, dark-themed interface using Tailwind CSS.

## Setup Instructions

### 1. Create the Google Sheet
1.  Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2.  Name it "To-Do List 2026 Database".

### 2. Create the Apps Script Project
1.  In your new spreadsheet, go to `Extensions` > `Apps Script`.
2.  This will open the Apps Script editor in a new tab.
3.  Rename the project to "To-Do List 2026 App".

### 3. Add Project Files
1.  **Code.gs**:
    *   Delete any existing code in the `Code.gs` file in the editor.
    *   Copy the content of the `Code.gs` file provided in this repository.
    *   Paste it into the editor and save (Cmd/Ctrl + S).
2.  **index.html**:
    *   Click the `+` icon next to "Files" and select "HTML".
    *   Name the file `index` (it will automatically become `index.html`).
    *   Copy the content of the `index.html` file provided in this repository.
    *   Paste it into the editor and save.

### 4. Initialize the Database
1.  In the Apps Script editor, ensure `Code.gs` is open.
2.  In the toolbar, select `setup` from the function dropdown menu.
3.  Click **Run**.
4.  You will be asked to review permissions. Click **Review permissions**, choose your account, click **Advanced**, and then **Go to To-Do List 2026 App (unsafe)** (since it's your own script). Allow the permissions.
5.  Go back to your Google Sheet. You should see two new tabs: `Tasks` and `UserStats` with the correct headers.

### 5. Deploy the Web App
1.  In the Apps Script editor, click the blue **Deploy** button > **New deployment**.
2.  Click the "Select type" gear icon and choose **Web app**.
3.  Fill in the details:
    *   **Description**: Initial version.
    *   **Execute as**: `Me` (your email).
    *   **Who has access**: `Anyone with Google account` (or `Only myself` if you want it private).
4.  Click **Deploy**.
5.  Copy the **Web app URL**. This is the link to your new application!

### 6. Setup Email Reminders (Triggers)
1.  In the Apps Script editor, click on the **Triggers** icon (alarm clock) in the left sidebar.
2.  Click **+ Add Trigger** (bottom right).
3.  Configure the trigger:
    *   **Choose which function to run**: `checkDeadlines`
    *   **Choose which deployment should run**: `Head`
    *   **Select event source**: `Time-driven`
    *   **Select type of time based trigger**: `Hour timer` (or `Day timer` if you prefer).
    *   **Select hour interval**: `Every hour`.
4.  Click **Save**.

## Usage
- Open the Web App URL in your browser (works on mobile too!).
- Add tasks with deadlines and difficulty levels.
- Complete tasks to earn points and level up!
- Watch your streak grow as you stay consistent.
