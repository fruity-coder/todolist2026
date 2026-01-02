# Quest 2026 - Gamified Task Manager

"Quest 2026" is a Cyber-Fantasy themed task manager built with Google Apps Script, Google Sheets, and Tailwind CSS. It features a gamified experience with XP, levels, and neon visuals.

## Setup Instructions

### 1. Create the Google Sheet
1.  Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2.  Name it **"Quest 2026 Database"**.

### 2. Create the Apps Script
1.  In your spreadsheet, go to **Extensions > Apps Script**.
2.  Clear any existing code in `Code.gs`.
3.  Copy the content of the `Code.gs` file from this repository and paste it into the script editor.
4.  Create a new HTML file named `index.html` in the script editor.
5.  Copy the content of the `index.html` file from this repository and paste it into the script editor.

### 3. Initialize the Database
1.  In the Apps Script toolbar, select the **`setup`** function from the dropdown.
2.  Click **Run**.
3.  Authorize the script when prompted (since you created it, it's safe).
4.  Return to your spreadsheet. You should see two new sheets:
    *   `DB_Projects`
    *   `DB_Tasks`

### 4. Deploy the App
1.  Click **Deploy > New deployment**.
2.  Select **Web app**.
3.  Description: "Quest 2026 v1".
4.  Execute as: **Me**.
5.  Who has access: **Anyone with Google Account** (or "Only myself").
6.  Click **Deploy**.
7.  Open the provided **Web app URL** to launch Quest 2026!

### 5. Setup Daily Triggers (Optional)
To enable the "Angry Boss" email notifications:
1.  In Apps Script, click the **Triggers (Alarm Clock)** icon on the left.
2.  **+ Add Trigger**.
3.  Function: `checkDeadlines`.
4.  Event Source: **Time-driven**.
5.  Type: **Day timer** (e.g., 8am to 9am).
6.  Save.

## Features
*   **XP & Leveling**: Earn XP by completing tasks.
*   **Visuals**: Dark mode, Neon aesthetics, Glassmorphism.
*   **Interactivity**: Optimistic UI updates, Confetti explosions.
*   **Deadlines**: Visual indicators for overdue/urgent tasks.
