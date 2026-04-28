const addTaskBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const helperText = document.getElementById("helperText");

function updateEmptyState() {
  if (taskList.children.length === 0) {
    taskList.innerHTML = `
      <li class="empty-state">
        No tasks added yet. Start by adding your first task.
      </li>
    `;
  }
}

function clearEmptyState() {
  const emptyState = document.querySelector(".empty-state");
  if (emptyState) {
    emptyState.remove();
  }
}

function createTaskElement(taskText) {
  const li = document.createElement("li");
  li.classList.add("task-item");

  const taskLeft = document.createElement("div");
  taskLeft.classList.add("task-left");

  const bullet = document.createElement("span");
  bullet.classList.add("task-bullet");

  const textSpan = document.createElement("span");
  textSpan.classList.add("task-text");
  textSpan.textContent = taskText;

  taskLeft.appendChild(bullet);
  taskLeft.appendChild(textSpan);

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  const completeBtn = document.createElement("button");
  completeBtn.classList.add("action-btn", "complete-btn");
  completeBtn.textContent = "Complete";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("action-btn", "delete-btn");
  deleteBtn.textContent = "Delete";

  completeBtn.addEventListener("click", function () {
    li.classList.toggle("completed");

    if (li.classList.contains("completed")) {
      completeBtn.textContent = "Undo";
      helperText.textContent = "Nice! You completed a task.";
    } else {
      completeBtn.textContent = "Complete";
      helperText.textContent = "Task marked as active again.";
    }
  });

  deleteBtn.addEventListener("click", function () {
    li.remove();
    helperText.textContent = "Task deleted successfully.";
    updateEmptyState();
  });

  actions.appendChild(completeBtn);
  actions.appendChild(deleteBtn);

  li.appendChild(taskLeft);
  li.appendChild(actions);

  return li;
}

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    helperText.textContent = "Please enter a task before clicking Add Task.";
    taskInput.focus();
    return;
  }

  clearEmptyState();

  const taskElement = createTaskElement(taskText);
  taskList.appendChild(taskElement);

  helperText.textContent = "Task added successfully.";
  taskInput.value = "";
  taskInput.focus();
}

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

updateEmptyState();