const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const dueDateInput = document.getElementById("dueDateInput");
const recurringSelect = document.getElementById("recurringSelect");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const helperText = document.getElementById("helperText");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const overdueCount = document.getElementById("overdueCount");

const upcomingList = document.getElementById("upcomingList");
const upcomingSummary = document.getElementById("upcomingSummary");

let currentFilter = "all";
let tasks = JSON.parse(localStorage.getItem("v4Tasks")) || [];

function saveTasks() {
  localStorage.setItem("v4Tasks", JSON.stringify(tasks));
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function getStatus(task) {
  if (task.completed) {
    return { text: "Completed", className: "completed" };
  }

  if (!task.dueDate) {
    return { text: "Active", className: "" };
  }

  const today = startOfToday();
  const due = new Date(task.dueDate + "T00:00:00");

  if (due < today) {
    return { text: "Overdue", className: "overdue" };
  }

  if (due.getTime() === today.getTime()) {
    return { text: "Due Today", className: "today" };
  }

  return { text: "Upcoming", className: "upcoming" };
}

function getRecurringLabel(recurring) {
  if (recurring === "daily") return "Repeats Daily";
  if (recurring === "weekly") return "Repeats Weekly";
  return "";
}

function updateCounts() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.filter(task => !task.completed).length;
  const overdue = tasks.filter(task => !task.completed && getStatus(task).text === "Overdue").length;

  totalCount.textContent = total;
  activeCount.textContent = active;
  completedCount.textContent = completed;
  overdueCount.textContent = overdue;
}

function renderUpcomingTasks() {
  upcomingList.innerHTML = "";

  const upcomingTasks = tasks
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  if (upcomingTasks.length === 0) {
    upcomingSummary.textContent = "No upcoming tasks";
    upcomingList.innerHTML = `
      <li class="empty-state">No upcoming scheduled tasks right now.</li>
    `;
    return;
  }

  upcomingSummary.textContent = `${upcomingTasks.length} task(s) scheduled`;

  upcomingTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = "upcoming-item";

    const status = getStatus(task);

    li.innerHTML = `
      <strong>${escapeHtml(task.text)}</strong>
      <span>${formatDate(task.dueDate)} • ${task.priority} Priority • ${status.text}</span>
    `;

    upcomingList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function renderTasks() {
  taskList.innerHTML = "";

  const searchValue = searchInput.value.trim().toLowerCase();

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchValue);
    const status = getStatus(task).text;

    let matchesFilter = false;

    if (currentFilter === "all") {
      matchesFilter = true;
    } else if (currentFilter === "active") {
      matchesFilter = !task.completed;
    } else if (currentFilter === "completed") {
      matchesFilter = task.completed;
    } else if (currentFilter === "overdue") {
      matchesFilter = status === "Overdue";
    }

    return matchesSearch && matchesFilter;
  });

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        No matching tasks found. Try adding a task or changing the filter.
      </li>
    `;
  } else {
    filteredTasks.forEach(task => {
      const li = document.createElement("li");
      li.className = `task-item priority-${task.priority.toLowerCase()} ${task.completed ? "completed" : ""}`;

      const status = getStatus(task);
      const recurringLabel = getRecurringLabel(task.recurring);

      li.innerHTML = `
        <div class="task-left">
          <span class="task-bullet"></span>
          <div class="task-content">
            <div class="task-text">${escapeHtml(task.text)}</div>
            <div class="task-meta">
              <span class="priority-badge ${task.priority.toLowerCase()}">${task.priority} Priority</span>
              <span class="status-badge ${status.className}">${status.text}</span>
              ${task.dueDate ? `<span class="due-badge">Due: ${formatDate(task.dueDate)}</span>` : ""}
              ${recurringLabel ? `<span class="recurring-badge">${recurringLabel}</span>` : ""}
            </div>
          </div>
        </div>

        <div class="task-actions">
          <button class="action-btn edit-btn" data-id="${task.id}">Edit</button>
          <button class="action-btn complete-btn" data-id="${task.id}">
            ${task.completed ? "Undo" : "Complete"}
          </button>
          <button class="action-btn delete-btn" data-id="${task.id}">Delete</button>
        </div>
      `;

      taskList.appendChild(li);
    });
  }

  attachTaskEvents();
  updateCounts();
  renderUpcomingTasks();
  saveTasks();
}

function attachTaskEvents() {
  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", function () {
      const taskId = Number(this.dataset.id);
      const task = tasks.find(item => item.id === taskId);
      if (!task) return;

      const updatedText = prompt("Edit your task:", task.text);
      if (updatedText === null) return;

      const trimmedText = updatedText.trim();
      if (trimmedText === "") {
        helperText.textContent = "Task text cannot be empty.";
        return;
      }

      task.text = trimmedText;
      helperText.textContent = "Task updated successfully.";
      renderTasks();
    });
  });

  document.querySelectorAll(".complete-btn").forEach(button => {
    button.addEventListener("click", function () {
      const taskId = Number(this.dataset.id);
      const task = tasks.find(item => item.id === taskId);
      if (!task) return;

      const wasCompleted = task.completed;
      task.completed = !task.completed;

      if (!wasCompleted && task.completed && task.recurring !== "none") {
        createNextRecurringTask(task);
        helperText.textContent = "Recurring task completed and next occurrence created.";
      } else if (task.completed) {
        helperText.textContent = "Task marked as completed.";
      } else {
        helperText.textContent = "Task moved back to active.";
      }

      renderTasks();
    });
  });

  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", function () {
      const taskId = Number(this.dataset.id);
      tasks = tasks.filter(task => task.id !== taskId);
      helperText.textContent = "Task deleted successfully.";
      renderTasks();
    });
  });
}

function createNextRecurringTask(task) {
  if (!task.dueDate) return;

  const currentDue = new Date(task.dueDate + "T00:00:00");
  const nextDue = new Date(currentDue);

  if (task.recurring === "daily") {
    nextDue.setDate(nextDue.getDate() + 1);
  } else if (task.recurring === "weekly") {
    nextDue.setDate(nextDue.getDate() + 7);
  } else {
    return;
  }

  const nextTask = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    text: task.text,
    priority: task.priority,
    dueDate: nextDue.toISOString().split("T")[0],
    recurring: task.recurring,
    completed: false
  };

  tasks.push(nextTask);
}

function addTask() {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const dueDate = dueDateInput.value;
  const recurring = recurringSelect.value;

  if (text === "") {
    helperText.textContent = "Please enter a task before clicking Add Task.";
    taskInput.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    text,
    priority,
    dueDate,
    recurring,
    completed: false
  };

  tasks.push(newTask);

  helperText.textContent = `${priority} priority task added successfully.`;
  taskInput.value = "";
  prioritySelect.value = "Medium";
  dueDateInput.value = "";
  recurringSelect.value = "none";
  taskInput.focus();

  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

searchInput.addEventListener("input", renderTasks);

filterButtons.forEach(button => {
  button.addEventListener("click", function () {
    filterButtons.forEach(btn => btn.classList.remove("active-filter"));
    this.classList.add("active-filter");
    currentFilter = this.dataset.filter;
    renderTasks();
  });
});

renderTasks();