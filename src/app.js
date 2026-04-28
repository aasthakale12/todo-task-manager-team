const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const searchInput = document.getElementById("searchInput");
const taskList = document.getElementById("taskList");
const helperText = document.getElementById("helperText");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

let currentFilter = "all";

function updateCounts() {
  const tasks = document.querySelectorAll(".task-item");
  const completedTasks = document.querySelectorAll(".task-item.completed");
  const activeTasks = tasks.length - completedTasks.length;

  totalCount.textContent = tasks.length;
  activeCount.textContent = activeTasks;
  completedCount.textContent = completedTasks.length;
}

function updateEmptyState() {
  const tasks = document.querySelectorAll(".task-item");

  if (tasks.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        No tasks added yet. Start by adding your first task.
      </li>
    `;
  }

  updateCounts();
}

function clearEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.remove();
  }
}

function applyFilters() {
  const searchValue = searchInput.value.trim().toLowerCase();
  const tasks = document.querySelectorAll(".task-item");

  tasks.forEach((task) => {
    const taskText = task.querySelector(".task-text").textContent.toLowerCase();
    const isCompleted = task.classList.contains("completed");

    let matchesFilter = false;

    if (currentFilter === "all") {
      matchesFilter = true;
    } else if (currentFilter === "active") {
      matchesFilter = !isCompleted;
    } else if (currentFilter === "completed") {
      matchesFilter = isCompleted;
    }

    const matchesSearch = taskText.includes(searchValue);

    if (matchesFilter && matchesSearch) {
      task.classList.remove("hidden");
    } else {
      task.classList.add("hidden");
    }
  });
}

function createTaskElement(taskText, priority) {
  const li = document.createElement("li");
  li.classList.add("task-item", `priority-${priority.toLowerCase()}`);

  const taskLeft = document.createElement("div");
  taskLeft.classList.add("task-left");

  const bullet = document.createElement("span");
  bullet.classList.add("task-bullet");

  const taskContent = document.createElement("div");
  taskContent.classList.add("task-content");

  const textSpan = document.createElement("div");
  textSpan.classList.add("task-text");
  textSpan.textContent = taskText;

  const meta = document.createElement("div");
  meta.classList.add("task-meta");

  const priorityBadge = document.createElement("span");
  priorityBadge.classList.add("priority-badge", priority.toLowerCase());
  priorityBadge.textContent = `${priority} Priority`;

  const statusBadge = document.createElement("span");
  statusBadge.classList.add("status-badge");
  statusBadge.textContent = "Active";

  meta.appendChild(priorityBadge);
  meta.appendChild(statusBadge);

  taskContent.appendChild(textSpan);
  taskContent.appendChild(meta);

  taskLeft.appendChild(bullet);
  taskLeft.appendChild(taskContent);

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("action-btn", "edit-btn");
  editBtn.textContent = "Edit";

  const completeBtn = document.createElement("button");
  completeBtn.classList.add("action-btn", "complete-btn");
  completeBtn.textContent = "Complete";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.textContent = "Delete";

  editBtn.addEventListener("click", function () {
    const updatedText = prompt("Edit your task:", textSpan.textContent);

    if (updatedText === null) {
      return;
    }

    const trimmedText = updatedText.trim();

    if (trimmedText === "") {
      helperText.textContent = "Task text cannot be empty.";
      return;
    }

    textSpan.textContent = trimmedText;
    helperText.textContent = "Task updated successfully.";
    applyFilters();
  });

  completeBtn.addEventListener("click", function () {
    li.classList.toggle("completed");

    if (li.classList.contains("completed")) {
      completeBtn.textContent = "Undo";
      statusBadge.textContent = "Completed";
      helperText.textContent = "Task marked as completed.";
    } else {
      completeBtn.textContent = "Complete";
      statusBadge.textContent = "Active";
      helperText.textContent = "Task moved back to active.";
    }

    updateCounts();
    applyFilters();
  });

  deleteBtn.addEventListener("click", function () {
    li.remove();
    helperText.textContent = "Task deleted successfully.";
    updateEmptyState();
    applyFilters();
  });

  actions.appendChild(editBtn);
  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(taskLeft);
  li.appendChild(actions);

  return li;
}

function addTask() {
  const taskText = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (taskText === "") {
    helperText.textContent = "Please enter a task before clicking Add Task.";
    taskInput.focus();
    return;
  }

  clearEmptyState();

  const taskElement = createTaskElement(taskText, priority);
  taskList.appendChild(taskElement);

  helperText.textContent = `${priority} priority task added successfully.`;
  taskInput.value = "";
  prioritySelect.value = "Medium";
  taskInput.focus();

  updateCounts();
  applyFilters();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

searchInput.addEventListener("input", applyFilters);

filterButtons.forEach((button) => {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => btn.classList.remove("active-filter"));
    this.classList.add("active-filter");
    currentFilter = this.dataset.filter;
    applyFilters();
  });
});

updateEmptyState();