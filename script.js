(() => {
  "use strict";

  const STORAGE_KEY = "todolist.items.v1";

  const form = document.getElementById("todo-form");
  const input = document.getElementById("todo-input");
  const list = document.getElementById("todo-list");
  const itemsLeft = document.getElementById("items-left");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const filterButtons = document.querySelectorAll(".filter-btn");

  /** @type {{id: string, text: string, completed: boolean}[]} */
  let todos = loadTodos();
  let currentFilter = "all";

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function addTodo(text) {
    todos.push({ id: createId(), text, completed: false });
    saveTodos();
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      saveTodos();
      render();
    }
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    saveTodos();
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    render();
  }

  function getFilteredTodos() {
    if (currentFilter === "active") return todos.filter((t) => !t.completed);
    if (currentFilter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  function render() {
    list.innerHTML = "";
    const filtered = getFilteredTodos();

    if (filtered.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent =
        currentFilter === "completed"
          ? "No hay tareas completadas."
          : currentFilter === "active"
          ? "No hay tareas pendientes."
          : "No hay tareas todavía. ¡Agrega una!";
      list.appendChild(empty);
    } else {
      filtered.forEach((todo) => list.appendChild(buildItem(todo)));
    }

    const pending = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${pending} ${
      pending === 1 ? "tarea pendiente" : "tareas pendientes"
    }`;
  }

  function buildItem(todo) {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "Marcar como completada");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Eliminar tarea");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    return li;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addTodo(text);
    input.value = "";
    input.focus();
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  render();
})();
