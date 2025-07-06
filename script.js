let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let theme = localStorage.getItem("theme") || "dark";

window.onload = () => {
  document.body.className = theme;
  document.getElementById("modeToggle").checked = theme === "light";
  renderTasks();
  renderWeeklyCompleted();
};

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleTheme() {
  const mode = document.getElementById("modeToggle").checked ? "light" : "dark";
  document.body.className = mode;
  localStorage.setItem("theme", mode);
}

function addTask() {
  const input = document.getElementById("taskInput");
  const type = document.getElementById("taskType").value;
  const taskText = input.value.trim();
  if (!taskText) return;

  const task = {
    text: taskText,
    type: type,
    completed: false,
    date: new Date().toISOString()
  };

  tasks.push(task);
  input.value = "";
  saveTasks();
  renderTasks();
  renderWeeklyCompleted();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  if (tasks[index].completed) triggerConfetti();
  saveTasks();
  renderTasks();
  renderWeeklyCompleted();
}

function deleteTask(index) {
  const taskEl = document.querySelectorAll("#taskList li")[index];
  const sound = document.getElementById("deleteSound");

  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(err => console.log("Sound play blocked:", err));
  }

  taskEl.style.transform = "translateX(-100%)";
  taskEl.style.opacity = 0;

  setTimeout(() => {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks();
    renderWeeklyCompleted();
  }, 300);
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const iconMap = {
    study: "📚",
    health: "🏃",
    fun: "🎮",
    other: "📋"
  };

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "floating";
    li.ontouchstart = (e) => handleTouchStart(e, index);
    li.ontouchend = (e) => handleTouchEnd(e, index);

    // ✅ Checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleTask(index);

    const span = document.createElement("span");
    span.textContent = `${iconMap[task.type]} ${task.text}`;

    // ✅ SVG delete icon
    const delBtn = document.createElement("button");
    delBtn.innerHTML = `<svg width="20" height="20"><use href="#trash"/></svg>`;
    delBtn.onclick = () => deleteTask(index);
    delBtn.style.border = "none";
    delBtn.style.background = "transparent";
    delBtn.style.cursor = "pointer";

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

function renderWeeklyCompleted() {
  const container = document.getElementById("weeklyCompleted");
  container.innerHTML = "";

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const filtered = tasks.filter(task => {
    const taskDate = new Date(task.date);
    return task.completed && taskDate >= startOfWeek;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p>No tasks completed this week.</p>";
    return;
  }

  const grouped = {};
  filtered.forEach(task => {
    const key = new Date(task.date).toDateString();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(task);
  });

  Object.keys(grouped).forEach(day => {
    const div = document.createElement("div");
    div.className = "week-group";

    const title = document.createElement("h4");
    title.textContent = day;

    const ul = document.createElement("ul");
    grouped[day].forEach(task => {
      const li = document.createElement("li");
      const icon = {
        study: "📚",
        health: "🏃",
        fun: "🎮",
        other: "📋"
      }[task.type];
      li.textContent = `${icon} ${task.text}`;
      ul.appendChild(li);
    });

    div.appendChild(title);
    div.appendChild(ul);
    container.appendChild(div);
  });
}

function triggerConfetti() {
  confetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 }
  });
}

let startX = 0;
function handleTouchStart(e, index) {
  startX = e.changedTouches[0].clientX;
}
function handleTouchEnd(e, index) {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 60) deleteTask(index);
}
