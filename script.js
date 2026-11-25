
class ToDoItem {
    constructor(title, priority, date) {
        this.id = Date.now().toString() + Math.random().toString(16).slice(2);
        this.title = title;
        this.priority = priority;
        this.date = date;
        this.status = "todo";
        this.startDate = new Date().toLocaleString("uk-UA");
        this.endDate = null;
    }

    completeTask() {
        this.status = "done";
        this.endDate = new Date().toLocaleString("uk-UA");
    }
}

class WeeklyPlanner {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("weeklyTasks")) || [];
        this.selectedDate = this.getToday();
        this.weekDays = document.getElementById("weekDays");
        this.taskList = document.getElementById("taskList");
        this.taskInput = document.getElementById("taskInput");
        this.priorityInput = document.getElementById("priorityInput");
        this.taskForm = document.getElementById("taskForm");
        this.weekDate = document.getElementById("weekDate");

        this.weekDate.value = this.selectedDate;

        this.taskForm.addEventListener("submit", (event) => {
            event.preventDefault();
            this.addTask();
        });

        this.weekDate.addEventListener("change", () => {
            if (this.weekDate.value) {
                this.selectedDate = this.weekDate.value;
                this.render();
            }
        });

        this.render();
    }

    getToday() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    saveTasks() {
        localStorage.setItem("weeklyTasks", JSON.stringify(this.tasks));
    }

    getWeekStart(dateString) {
        const date = new Date(dateString + "T12:00:00");
        const day = date.getDay();
        const difference = day === 0 ? -6 : 1 - day;

        date.setDate(date.getDate() + difference);
        return date;
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    renderWeek() {
        this.weekDays.innerHTML = "";

        const weekStart = this.getWeekStart(this.selectedDate);
        const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);

            const dateString = this.formatDate(date);
            const dayCard = document.createElement("div");

            dayCard.className = "day-card";

            if (dateString === this.selectedDate) {
                dayCard.classList.add("active");
            }

            const dayName = document.createElement("span");
            dayName.className = "day-name";
            dayName.textContent = dayNames[date.getDay()];

            const dayNumber = document.createElement("span");
            dayNumber.className = "day-number";
            dayNumber.textContent = date.getDate();

            dayCard.append(dayName, dayNumber);

            const hasTasks = this.tasks.some(task => task.date === dateString);

            if (hasTasks) {
                const dot = document.createElement("div");
                dot.className = "day-dot";
                dayCard.appendChild(dot);
            }

            dayCard.addEventListener("click", () => {
                this.selectedDate = dateString;
                this.weekDate.value = dateString;
                this.render();
            });

            this.weekDays.appendChild(dayCard);
        }
    }

    addTask() {
        const title = this.taskInput.value.trim();

        if (!title) {
            return;
        }

        const task = new ToDoItem(
            title,
            this.priorityInput.value,
            this.selectedDate
        );

        this.tasks.push(task);
        this.taskInput.value = "";

        this.saveTasks();
        this.render();
    }

    completeTask(id) {
        const task = this.tasks.find(task => task.id === id);

        if (task && task.status === "todo") {
            task.status = "done";
            task.endDate = new Date().toLocaleString("uk-UA");

            this.saveTasks();
            this.render();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);

        this.saveTasks();
        this.render();
    }

    renderTasks() {
        this.taskList.innerHTML = "";

        const dayTasks = this.tasks.filter(
            task => task.date === this.selectedDate
        );

        const completed = dayTasks.filter(
            task => task.status === "done"
        ).length;

        const total = dayTasks.length;
        const progress = total === 0
            ? 0
            : Math.round((completed / total) * 100);

        document.getElementById("taskCounter").textContent =
            `${total} ${total === 1 ? "task" : "tasks"}`;

        document.getElementById("progressText").textContent =
            `${progress}%`;

        document.getElementById("progressBar").style.width =
            `${progress}%`;

        const selectedDate = new Date(this.selectedDate + "T12:00:00");

        document.getElementById("selectedDayTitle").textContent =
            selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric"
            });

        if (dayTasks.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "No tasks yet. Add something to your day";
            this.taskList.appendChild(emptyMessage);
            return;
        }

        dayTasks.forEach(task => {
            const item = document.createElement("li");
            item.className = "list-group-item task-item";

            if (task.status === "done") {
                item.classList.add("completed");
            }

            const info = document.createElement("div");
            info.className = "task-info";

            const title = document.createElement("div");
            title.className = "task-title";
            title.textContent = task.title;

            const startDate = document.createElement("small");
            startDate.className = "task-date";
            startDate.textContent = `Started: ${task.startDate}`;

            info.append(title, startDate);

            if (task.endDate) {
                const endDate = document.createElement("small");
                endDate.className = "task-date";
                endDate.textContent = `Completed: ${task.endDate}`;
                info.appendChild(endDate);
            }

            const actions = document.createElement("div");
            actions.className = "task-actions";

            const priority = document.createElement("span");
            priority.className = `priority priority-${task.priority}`;
            priority.textContent =
                task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

            const completeButton = document.createElement("button");
            completeButton.className = "complete-btn";
            completeButton.type = "button";
            completeButton.textContent =
                task.status === "done" ? "✓" : "○";
            completeButton.title = "Complete task";
            completeButton.disabled = task.status === "done";

            completeButton.addEventListener("click", () => {
                this.completeTask(task.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-btn";
            deleteButton.type = "button";
            deleteButton.textContent = "×";
            deleteButton.title = "Delete task";

            deleteButton.addEventListener("click", () => {
                this.deleteTask(task.id);
            });

            actions.append(priority, completeButton, deleteButton);
            item.append(info, actions);
            this.taskList.appendChild(item);
        });
    }

    render() {
        this.renderWeek();
        this.renderTasks();
    }
}

const planner = new WeeklyPlanner();
