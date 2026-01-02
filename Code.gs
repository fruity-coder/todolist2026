/**
 * Serve the HTML file for the web app.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('To-Do List 2026')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Creates a custom menu in Google Sheets.
 */
function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('To-Do List 2026')
      .addItem('Setup Database', 'setup')
      .addToUi();
}

/**
 * Setup function to initialize sheets and headers.
 * User should run this once manually.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Setup Tasks Sheet
  let tasksSheet = ss.getSheetByName('Tasks');
  if (!tasksSheet) {
    tasksSheet = ss.insertSheet('Tasks');
    // Added 'Last Reminder Sent' at index 9 (Column J)
    tasksSheet.appendRow(['ID', 'Title', 'Description', 'Deadline', 'Status', 'Difficulty', 'Points', 'Created At', 'Completed At', 'Last Reminder Sent']);
  } else {
    // Check if the new column exists, if not add it (migration support)
    const headers = tasksSheet.getRange(1, 1, 1, tasksSheet.getLastColumn()).getValues()[0];
    if (headers.length < 10) {
      tasksSheet.getRange(1, 10).setValue('Last Reminder Sent');
    }
  }

  // Setup UserStats Sheet
  let statsSheet = ss.getSheetByName('UserStats');
  if (!statsSheet) {
    statsSheet = ss.insertSheet('UserStats');
    statsSheet.appendRow(['Total Points', 'Level', 'Current Streak', 'Max Streak', 'Last Active Date']);
    // Initialize stats row
    statsSheet.appendRow([0, 1, 0, 0, new Date()]);
  }
}

/**
 * Get all tasks and user stats.
 */
function getData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasksSheet = ss.getSheetByName('Tasks');
  const statsSheet = ss.getSheetByName('UserStats');

  if (!tasksSheet || !statsSheet) {
    return { error: "Please run the setup() function first." };
  }

  const tasksData = tasksSheet.getDataRange().getValues();
  const statsData = statsSheet.getDataRange().getValues();

  // Remove headers
  const tasks = tasksData.slice(1).map(row => ({
    id: row[0],
    title: row[1],
    description: row[2],
    deadline: row[3],
    status: row[4],
    difficulty: row[5],
    points: row[6],
    createdAt: row[7],
    completedAt: row[8]
  }));

  const stats = {
    totalPoints: statsData[1] ? statsData[1][0] : 0,
    level: statsData[1] ? statsData[1][1] : 1,
    currentStreak: statsData[1] ? statsData[1][2] : 0,
    maxStreak: statsData[1] ? statsData[1][3] : 0,
    lastActiveDate: statsData[1] ? statsData[1][4] : new Date()
  };

  return { tasks, stats };
}

/**
 * Add a new task.
 */
function addTask(task) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tasks');

  const id = Utilities.getUuid();
  const createdAt = new Date();
  const points = calculateBasePoints(task.difficulty);

  sheet.appendRow([
    id,
    task.title,
    task.description,
    new Date(task.deadline),
    'Pending',
    task.difficulty,
    points,
    createdAt,
    '',
    '' // Last Reminder Sent
  ]);

  return getData();
}

/**
 * Delete a task.
 */
function deleteTask(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tasks');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  return getData();
}

/**
 * Mark a task as complete and update stats.
 */
function markTaskComplete(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tasksSheet = ss.getSheetByName('Tasks');
  const statsSheet = ss.getSheetByName('UserStats');

  const tasksData = tasksSheet.getDataRange().getValues();
  let taskRowIndex = -1;
  let taskData = null;

  for (let i = 1; i < tasksData.length; i++) {
    if (tasksData[i][0] == id) {
      taskRowIndex = i + 1;
      taskData = tasksData[i];
      break;
    }
  }

  if (taskRowIndex === -1) return getData(); // Task not found

  // Update Task Status
  const completedAt = new Date();
  tasksSheet.getRange(taskRowIndex, 5).setValue('Done'); // Status
  tasksSheet.getRange(taskRowIndex, 9).setValue(completedAt); // Completed At

  // Calculate Points
  const deadline = new Date(taskData[3]);
  let pointsEarned = Number(taskData[6]);

  // Bonus/Penalty Logic
  if (completedAt > deadline) {
    pointsEarned = Math.floor(pointsEarned * 0.5); // 50% penalty for late
  } else {
    // 10% bonus for being early (more than 24h early)
    const diffHours = (deadline - completedAt) / (1000 * 60 * 60);
    if (diffHours > 24) {
      pointsEarned = Math.floor(pointsEarned * 1.1);
    }
  }

  // Update Stats
  const statsRange = statsSheet.getRange(2, 1, 1, 5);
  const currentStats = statsRange.getValues()[0];

  let totalPoints = currentStats[0] + pointsEarned;
  let currentStreak = currentStats[2];
  let maxStreak = currentStats[3];
  let lastActive = new Date(currentStats[4]);

  // Streak Logic
  const today = new Date();
  today.setHours(0,0,0,0);
  const lastActiveDay = new Date(lastActive);
  lastActiveDay.setHours(0,0,0,0);

  const diffDays = (today - lastActiveDay) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) {
    // Same day, streak continues, no increment
  } else if (diffDays === 1) {
    currentStreak++;
  } else {
    currentStreak = 1; // Reset streak
  }

  if (currentStreak > maxStreak) maxStreak = currentStreak;

  // Level Calculation (Simple: 1 level per 100 points)
  const level = Math.floor(totalPoints / 100) + 1;

  statsRange.setValues([[totalPoints, level, currentStreak, maxStreak, new Date()]]);

  return getData();
}

/**
 * Helper to determine points based on difficulty.
 */
function calculateBasePoints(difficulty) {
  switch (difficulty) {
    case 'Easy': return 10;
    case 'Medium': return 25;
    case 'Hard': return 50;
    default: return 10;
  }
}

/**
 * Trigger function to check deadlines and send emails.
 * Should be set up as a time-driven trigger (e.g., every hour).
 */
function checkDeadlines() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Tasks');
  // Get data including the new 'Last Reminder Sent' column (index 9)
  const dataRange = sheet.getDataRange();
  const data = dataRange.getValues();
  const now = new Date();
  const userEmail = Session.getActiveUser().getEmail();

  let emailBody = "Here is your To-Do List Update:\n\n";
  let sendEmail = false;
  const updates = []; // Store updates to write back in batch

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const title = row[1];
    const deadline = new Date(row[3]);
    const status = row[4];
    const lastReminder = row[9] ? new Date(row[9]) : null;

    let shouldNotify = false;
    let note = "";

    if (status !== 'Done') {
      const diffHours = (deadline - now) / (1000 * 60 * 60);

      // Urgent: Due in < 24 hours
      if (diffHours > 0 && diffHours < 24) {
        // Notify if never notified OR notified more than 20 hours ago (essentially once a day for urgent tasks)
        if (!lastReminder || (now - lastReminder) > (20 * 60 * 60 * 1000)) {
           note = `[URGENT] '${title}' is due in ${Math.floor(diffHours)} hours.`;
           shouldNotify = true;
        }
      }
      // Overdue
      else if (diffHours < 0) {
        // Notify if never notified OR notified more than 24 hours ago (once a day reminder for overdue)
        if (!lastReminder || (now - lastReminder) > (24 * 60 * 60 * 1000)) {
           note = `[OVERDUE] '${title}' was due on ${deadline.toLocaleString()}.`;
           shouldNotify = true;
        }
      }

      if (shouldNotify) {
        emailBody += `${note}\n`;
        sendEmail = true;
        // Update the 'Last Reminder Sent' for this row
        // We'll update the specific cell to avoid overwriting other changes if concurrent (unlikely here but good practice)
        sheet.getRange(i + 1, 10).setValue(now);
      }
    }
  }

  if (sendEmail) {
    MailApp.sendEmail({
      to: userEmail,
      subject: "Action Required: To-Do List 2026",
      body: emailBody
    });
  }
}
