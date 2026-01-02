/**
 * Quest 2026 - Backend Logic
 */

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Quest 2026')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Setup function to initialize sheets and headers.
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Setup DB_Projects
  let projectsSheet = ss.getSheetByName('DB_Projects');
  if (!projectsSheet) {
    projectsSheet = ss.insertSheet('DB_Projects');
    // Columns: id (A), name (B), themeColor (C), createdAt (D)
    projectsSheet.appendRow(['id', 'name', 'themeColor', 'createdAt']);

    // Add a default project
    projectsSheet.appendRow([Utilities.getUuid(), 'Main Quest', '#a855f7', new Date()]);
  }

  // Setup DB_Tasks
  let tasksSheet = ss.getSheetByName('DB_Tasks');
  if (!tasksSheet) {
    tasksSheet = ss.insertSheet('DB_Tasks');
    // Columns: id (A), projectId (B), title (C), description (D), difficulty (E), dueDate (F), status (G), xpReward (H), createdAt (I), completedAt (J)
    tasksSheet.appendRow(['id', 'projectId', 'title', 'description', 'difficulty', 'dueDate', 'status', 'xpReward', 'createdAt', 'completedAt']);
  }
}

/**
 * Fetch all data for the client.
 */
function getInitialData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const projectsSheet = ss.getSheetByName('DB_Projects');
  const tasksSheet = ss.getSheetByName('DB_Tasks');

  if (!projectsSheet || !tasksSheet) {
    return { error: 'Database not initialized. Please run setup() function.' };
  }

  // Get Projects
  const projectData = projectsSheet.getDataRange().getValues();
  const projects = projectData.slice(1).map(row => ({
    id: row[0],
    name: row[1],
    themeColor: row[2],
    createdAt: row[3]
  }));

  // Get Tasks
  const taskData = tasksSheet.getDataRange().getValues();
  const tasks = taskData.slice(1).map(row => ({
    id: row[0],
    projectId: row[1],
    title: row[2],
    description: row[3],
    difficulty: row[4],
    dueDate: row[5] ? new Date(row[5]).toISOString() : null,
    status: row[6],
    xpReward: Number(row[7]),
    createdAt: row[8],
    completedAt: row[9] ? new Date(row[9]).toISOString() : null
  }));

  // Calculate User Stats
  let totalXP = 0;
  let completedQuests = 0;

  tasks.forEach(task => {
    if (task.status === 'Done') {
      totalXP += task.xpReward || 0;
      completedQuests++;
    }
  });

  // Level Calculation: Level 1 base, +1 level every 100 XP (Linear for simplicity as requested, or standard RPG curve)
  // Let's go with a simple curve: Level = floor(sqrt(XP / 10)) + 1 roughly, or just linear 100xp per level.
  // Prompt asked to "Calculate user level". Let's use Linear: 100 XP per level.
  const level = Math.floor(totalXP / 100) + 1;
  const currentLevelXP = totalXP % 100;
  const nextLevelXP = 100; // Fixed 100 xp per level

  return {
    projects,
    tasks,
    userStats: {
      totalXP,
      level,
      currentLevelXP,
      nextLevelXP,
      completedQuests
    }
  };
}

/**
 * Add a new Project (Campaign).
 */
function addProject(name, themeColor) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DB_Projects');
  const id = Utilities.getUuid();
  const createdAt = new Date();

  sheet.appendRow([id, name, themeColor, createdAt]);

  return { id, name, themeColor, createdAt };
}

/**
 * Add a new Task (Quest).
 */
function addTask(taskData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DB_Tasks');
  const id = Utilities.getUuid();
  const createdAt = new Date();

  // Calculate XP
  let xp = 10;
  switch(taskData.difficulty) {
    case 'Medium': xp = 25; break;
    case 'Hard': xp = 50; break;
    default: xp = 10;
  }

  sheet.appendRow([
    id,
    taskData.projectId,
    taskData.title,
    taskData.description,
    taskData.difficulty,
    taskData.dueDate ? new Date(taskData.dueDate) : '',
    'Pending',
    xp,
    createdAt,
    ''
  ]);

  return {
    id,
    projectId: taskData.projectId,
    title: taskData.title,
    description: taskData.description,
    difficulty: taskData.difficulty,
    dueDate: taskData.dueDate,
    status: 'Pending',
    xpReward: xp,
    createdAt: createdAt.toISOString(),
    completedAt: null
  };
}

/**
 * Mark a task as complete.
 */
function completeTask(taskId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DB_Tasks');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == taskId) {
      const xp = data[i][7];
      sheet.getRange(i + 1, 7).setValue('Done'); // Status
      sheet.getRange(i + 1, 10).setValue(new Date()); // CompletedAt
      return Number(xp);
    }
  }
  return 0;
}

/**
 * Check deadlines and send emails.
 * Run this via Time-Driven Trigger.
 */
function checkDeadlines() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('DB_Tasks');
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const userEmail = Session.getActiveUser().getEmail();

  let overdueTasks = [];
  let dueSoonTasks = [];

  // Iterate tasks
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[6];
    const dueDateStr = row[5];
    const title = row[2];

    if (status !== 'Done' && dueDateStr) {
      const dueDate = new Date(dueDateStr);
      const diffHours = (dueDate - now) / (1000 * 60 * 60);

      if (diffHours < 0) {
        overdueTasks.push(title);
      } else if (diffHours < 24) {
        dueSoonTasks.push(title);
      }
    }
  }

  if (overdueTasks.length > 0 || dueSoonTasks.length > 0) {
    let subject = "⚔️ Quest Status Update";
    let body = "<h1>Quest Log Update</h1>";

    if (overdueTasks.length > 0) {
      subject = "💀 The Boss is Angry! (Overdue Quests)";
      body += "<h2 style='color:red;'>FAILED QUESTS (Overdue)</h2><ul>";
      overdueTasks.forEach(t => body += `<li>${t}</li>`);
      body += "</ul><p>The dark forces are gaining ground...</p>";
    }

    if (dueSoonTasks.length > 0) {
      body += "<h2 style='color:orange;'>Quest Timers Expiring Soon</h2><ul>";
      dueSoonTasks.forEach(t => body += `<li>${t}</li>`);
      body += "</ul>";
    }

    MailApp.sendEmail({
      to: userEmail,
      subject: subject,
      htmlBody: body
    });
  }
}
