const STORAGE_KEY = "mindfulDayTasks";

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priorityInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const taskCount = document.getElementById("taskCount");
const focusNumber = document.getElementById("focusNumber");
const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");
const progressMessage = document.getElementById("progressMessage");

const dateText = document.getElementById("dateText");
const dayName = document.getElementById("dayName");
const dailyThought = document.getElementById("dailyThought");
const newThoughtBtn = document.getElementById("newThoughtBtn");

const filterButtons = document.querySelectorAll(".filter");

let tasks = loadTasks();
let currentFilter = "all";

const thoughts = [
  "Small progress is still progress.",
  "You can do one thing at a time.",
  "A calm start can change the whole day.",
  "Your attention is a valuable thing. Spend it gently.",
  "Done is better than endlessly waiting for perfect.",
  "Make room for what matters.",
  "One small win is enough to begin.",
  "Today does not need to be perfect to be meaningful."
];

const priorityNames = {
  gentle: "GENTLE",
  important: "IMPORTANT",
  focus: "FOCUS"
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text, priority) {
  return {
    id: Date.now() + Math.random(),
    text,
    priority,
    completed: false
  };
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift(createTask(text, priorityInput.value));
  saveTasks();
  taskInput.value = "";
  priorityInput.value = "gentle";

  renderTasks();
  taskInput.focus();
});

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);

  saveTasks();
  renderTasks();
}

function getVisibleTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  taskList.innerHTML = "";

  visibleTasks.forEach((task) => {
    const item = document.createElement("article");
    item.className = `task-item ${task.completed ? "completed" : ""}`;

    item.innerHTML = `
      <button class="check-button" aria-label="Complete task">
        ${task.completed ? "✓" : ""}
      </button>

      <div class="task-name">${escapeHTML(task.text)}</div>

      <span class="task-priority priority-${task.priority}">
        ${priorityNames[task.priority]}
      </span>

      <button class="delete-button" aria-label="Delete task">×</button>
    `;

    item.querySelector(".check-button").addEventListener("click", () => {
      toggleTask(task.id);
    });

    item.querySelector(".delete-button").addEventListener("click", () => {
      deleteTask(task.id);
    });

    taskList.appendChild(item);
  });

  emptyState.classList.toggle("hidden", visibleTasks.length !== 0);

  updateDashboard();
}

function updateDashboard() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  taskCount.textContent = total;
  focusNumber.textContent = active;
  progressPercent.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;

  if (total === 0) {
    progressMessage.textContent = "Start with one simple task.";
  } else if (percentage === 100) {
    progressMessage.textContent = "Beautiful. Everything is complete.";
  } else if (percentage >= 70) {
    progressMessage.textContent = "You're making lovely progress.";
  } else if (percentage >= 40) {
    progressMessage.textContent = "Keep going, one task at a time.";
  } else {
    progressMessage.textContent = "A small step is a good start.";
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function setToday() {
  const now = new Date();

  const day = now.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const date = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  dayName.textContent = day.toUpperCase();
  dateText.textContent = date.toUpperCase();
}

function showRandomThought() {
  const current = dailyThought.textContent.replace(/[“”]/g, "").trim();

  let next = current;

  while (next === current) {
    next = thoughts[Math.floor(Math.random() * thoughts.length)];
  }

  dailyThought.animate(
    [
      { opacity: 0, transform: "translateY(6px)" },
      { opacity: 1, transform: "translateY(0)" }
    ],
    {
      duration: 300,
      easing: "ease-out"
    }
  );

  dailyThought.textContent = `“${next}”`;
}

newThoughtBtn.addEventListener("click", showRandomThought);

setToday();
renderTasks();
