const $ = id => document.getElementById(id);

let tasks = [];
let nextId = 1;
let currentFilter = "all";
let selectedDate = dateKey(new Date());
let calendarMonth = new Date();
calendarMonth.setDate(1);

$("todayDate").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric", year: "numeric"
});

function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addItem(parent, className, text, tag = "div") {
    const item = document.createElement(tag);
    item.className = className;
    item.textContent = text;
    parent.appendChild(item);
    return item;
}

function renderTasks() {
    const list = $("taskList");
    list.innerHTML = "";

    const shown = tasks.filter(t =>
        currentFilter === "all" ||
        (currentFilter === "active" && !t.completed) ||
        (currentFilter === "completed" && t.completed)
    );

    if (!shown.length) {
        const empty = addItem(list, "empty-state", "");
        addItem(empty, "empty-icon", "✓");
        addItem(empty, "", "No tasks to show", "h3");
        addItem(empty, "", shown.length === 0 && currentFilter === "completed"
            ? "You haven't completed any tasks yet."
            : "Add a task to get started.", "p");
    }

    shown.forEach(t => {
        const item = addItem(list, "task", "");
        const top = addItem(item, "task-top", "");
        const check = addItem(top, "task-check", "", "input");
        check.type = "checkbox";
        check.checked = t.completed;
        check.setAttribute("aria-label", "Mark task complete");
        check.addEventListener("change", () => {
            t.completed = check.checked;
            renderAll();
        });

        const details = addItem(top, "task-details", "");
        addItem(details, "", t.title, "h3");
        addItem(details, "", t.course, "p");
        addItem(details, "", "Due: " + t.dueDate, "p");
        addItem(details, "priority " + t.priority, "Priority: " + t.priority, "p");
        addItem(details, "", "Estimated time: " + t.minutes + " minutes", "p");

        const actions = addItem(item, "task-actions", "");
        const complete = addItem(actions, "complete-button",
            t.completed ? "Mark Incomplete" : "Mark Complete", "button");
        complete.addEventListener("click", () => {
            t.completed = !t.completed;
            renderAll();
        });

        const remove = addItem(actions, "delete-button", "Delete", "button");
        remove.addEventListener("click", () => {
            tasks = tasks.filter(other => other.id !== t.id);
            renderAll();
        });
    });

    $("taskCount").textContent = tasks.length + (tasks.length === 1 ? " task" : " tasks");
}

function renderStats() {
    const today = dateKey(new Date());
    $("totalTasks").textContent = tasks.length;
    $("completedTasks").textContent = tasks.filter(t => t.completed).length;
    $("upcomingTasks").textContent = tasks.filter(t =>
        !t.completed && t.dueDate >= today
    ).length;
}

function renderLists() {
    $("courseList").innerHTML = "";
    $("deadlineList").innerHTML = "";

    const courses = [...new Set(tasks.map(t => t.course))];

    if (!courses.length) {
        addItem($("courseList"), "empty-message", "Your courses will appear here.");
    }

    courses.forEach(course => {
        const count = tasks.filter(t => t.course === course).length;
        const item = addItem($("courseList"), "list-item", "");
        addItem(item, "", course, "strong");
        addItem(item, "", count + (count === 1 ? " task" : " tasks"), "span");
    });

    const deadlines = tasks.filter(t => !t.completed)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 5);

    if (!deadlines.length) {
        addItem($("deadlineList"), "empty-message", "No upcoming deadlines.");
    }

    deadlines.forEach(t => {
        const item = addItem($("deadlineList"), "list-item", "");
        addItem(item, "", t.title, "strong");
        addItem(item, "", t.course + " · Due " + t.dueDate, "span");
        addItem(item, "priority " + t.priority, t.priority + " priority", "span");
    });
}

function renderCalendar() {
    const grid = $("calendarGrid");
    const schedule = $("dailySchedule");
    grid.innerHTML = "";
    schedule.innerHTML = "";

    $("calendarMonth").textContent = calendarMonth.toLocaleDateString("en-US", {
        month: "long", year: "numeric"
    });

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day =>
        addItem(grid, "calendar-weekday", day)
    );

    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(start.getDate() - first.getDay());
    const today = dateKey(new Date());

    for (let i = 0; i < 42; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = dateKey(date);
        const day = addItem(grid, "calendar-day", "", "button");
        day.type = "button";

        if (date.getMonth() !== calendarMonth.getMonth()) day.classList.add("outside-month");
        if (key === selectedDate) day.classList.add("selected");
        if (key === today) day.classList.add("today");

        addItem(day, "", date.getDate(), "strong");

        const count = tasks.filter(t => t.dueDate === key && !t.completed).length;
        if (count) addItem(day, "", count + (count === 1 ? " task" : " tasks"), "small");

        day.addEventListener("click", () => {
            selectedDate = key;
            calendarMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            renderCalendar();
        });
    }

    $("selectedDateTitle").textContent = "Daily Schedule — " +
        new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric"
        });

    const daily = tasks.filter(t => t.dueDate === selectedDate);

    if (!daily.length) {
        addItem(schedule, "empty-message", "No tasks due on this date.");
    }

    daily.forEach(t => {
        const item = addItem(schedule, "list-item", "");
        addItem(item, "", t.title + (t.completed ? " (Completed)" : ""), "strong");
        addItem(item, "", `${t.course} · ${t.minutes} minutes · ${t.priority} priority`, "span");
    });
}

function renderAll() {
    renderTasks();
    renderStats();
    renderLists();
    renderCalendar();
}

$("taskForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("taskTitle").value.trim();
    const course = $("course").value.trim();
    const dueDate = $("dueDate").value;
    const minutes = Number($("estimatedMinutes").value);

    if (!title || !course || !dueDate || minutes < 1) {
        alert("Please fill in all fields.");
        return;
    }

    tasks.push({
        id: nextId++,
        title,
        course,
        dueDate,
        priority: $("priority").value,
        minutes,
        completed: false
    });

    event.target.reset();
    renderAll();
});

document.querySelectorAll("[data-filter]").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;
        document.querySelectorAll("[data-filter]").forEach(b =>
            b.classList.toggle("active", b === button)
        );
        renderTasks();
    });
});

$("prevMonth").addEventListener("click", () => {
    calendarMonth.setMonth(calendarMonth.getMonth() - 1);
    renderCalendar();
});

$("nextMonth").addEventListener("click", () => {
    calendarMonth.setMonth(calendarMonth.getMonth() + 1);
    renderCalendar();
});

document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
        const calendar = button.dataset.view === "calendar";
        $("dashboardView").hidden = calendar;
        $("calendarView").hidden = !calendar;

        document.querySelectorAll("[data-view]").forEach(b =>
            b.classList.toggle("active", b === button)
        );

        if (calendar) renderCalendar();
    });
});

renderAll();
