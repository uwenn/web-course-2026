const input = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const list = document.getElementById('task-list');
const counter = document.getElementById('counter');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = [];
let currentFilter = 'all';
let nextId = 1;

function addTask() {
    const text = input.value.trim();
    if (!text) {
        alert('Введите текст задачи');
        return;
    }

    tasks.push({
        id: nextId++,
        text: text,
        completed: false
    });

    input.value = '';
    render();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    render();
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    render();
}

function setFilter(filter) {
    currentFilter = filter;

    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    render();
}

function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(task => !task.completed);
    }
    if (currentFilter === 'completed') {
        return tasks.filter(task => task.completed);
    }
    return tasks;
}

function updateCounter() {
    const remaining = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    counter.textContent = `Осталось: ${remaining}, Выполнено: ${completed}`;
}

function render() {
    list.innerHTML = '';

    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty';
        empty.textContent = tasks.length === 0
            ? 'Пока нет задач. Добавь первую!'
            : 'Здесь ничего нет.';
        list.appendChild(empty);
    } else {
        filtered.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task' + (task.completed ? ' completed' : '');
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTask(task.id));

            const span = document.createElement('span');
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            list.appendChild(li);
        });
    }

    updateCounter();
}

addBtn.addEventListener('click', addTask);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

render();