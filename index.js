var TaskList = document.getElementById('taskList');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskDialog = document.getElementById('taskDialog');
const closeDialog = document.getElementById('closeDialog');
const cancelTask = document.getElementById('cancelTask');
const saveTask = document.getElementById('saveTask');
const taskForm = document.getElementById('taskForm');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskDueDate = document.getElementById('taskDueDate');
const dialogTitle = document.getElementById('dialogTitle');
const filterButtons = document.querySelectorAll('.filter-btn');

if(TaskList.childElementCount === 0){
    TaskList.innerHTML = '<h4>No tasks available</h4>';
}

let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;

function init() {
    // Load tasks from localStorage
    loadTasks();
    
    // Render initial tasks
    renderTasks();
    
    // Setup event listeners
    setupEventListeners();
}
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : [];
}
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function openTaskDialog(mode = 'add', taskId = null) {
    taskForm.reset();
    
    if (mode === 'edit' && taskId) {
        dialogTitle.textContent = 'Edit Task';
        editingTaskId = taskId;
        
        const taskToEdit = tasks.find(task => task.id === taskId);
        
        if (taskToEdit) {
            taskTitle.value = taskToEdit.title;
            taskDescription.value = taskToEdit.description || '';
            taskDueDate.value = taskToEdit.dueDate || '';
        }
    } else {
        dialogTitle.textContent = 'Add New Task';
        editingTaskId = null;
        
        const today = new Date().toISOString().split('T')[0];
        taskDueDate.value = today;
    }
    
    // Show dialog
    taskDialog.classList.add('active');
}

// Close task dialog
function closeTaskDialog() {
    taskDialog.classList.remove('active');
}

// Add a new task
function addTask() {
    const title = taskTitle.value.trim();
    
    if (title === '') return;
    
    const newTask = {
        id: Date.now().toString(),
        title: title,
        description: taskDescription.value.trim(),
        dueDate: taskDueDate.value,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    closeTaskDialog();
}

function updateTask() {
    if (!editingTaskId) return;
    
    const title = taskTitle.value.trim();
    
    if (title === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === editingTaskId) {
            return {
                ...task,
                title: title,
                description: taskDescription.value.trim(),
                dueDate: taskDueDate.value
            };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    closeTaskDialog();
    editingTaskId = null;
}

function deleteTask(id) {
    // Ask for confirmation
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    // Ask for confirmation
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }
}

function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Set current filter
function setFilter(filter) {
    currentFilter = filter;
    
    // Update active filter button
    filterButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    
    renderTasks();
}

// Get filtered tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Render tasks to the DOM
function renderTasks() {
    // Clear current list
    taskList.innerHTML = '';
    
    // Get tasks based on current filter
    const filteredTasks = getFilteredTasks();
    
    // Sort tasks by due date (closest first, then by creation date)
    filteredTasks.sort((a, b) => {
        // If both have due dates, sort by due date
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        // If only one has a due date, put the one with due date first
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        
        // If neither has a due date, sort by creation date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Create task items
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-list';
        
        if (tasks.length === 0) {
            emptyMessage.textContent = 'Your to-do list is empty. Add a task to get started!';
        } else {
            emptyMessage.textContent = `No ${currentFilter} tasks found.`;
        }
        
        taskList.appendChild(emptyMessage);
    } else {
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('completed');
            }
            
            // Create task content
            const taskContent = document.createElement('div');
            taskContent.className = 'task-content';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
            
            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            
            const taskTextTitle = document.createElement('div');
            taskTextTitle.textContent = task.title;
            taskText.appendChild(taskTextTitle);
            
            if (task.description) {
                const taskTextDesc = document.createElement('div');
                taskTextDesc.textContent = task.description;
                taskTextDesc.style.fontSize = '12px';
                taskTextDesc.style.color = '#7f8c8d';
                taskTextDesc.style.marginTop = '3px';
                taskText.appendChild(taskTextDesc);
            }
            
            if (task.dueDate) {
                const taskDate = document.createElement('span');
                taskDate.className = 'task-date';
                taskDate.innerHTML = `<i class="fa-regular fa-calendar"></i> ${formatDate(task.dueDate)}`;
                
                // Check if task is overdue
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = new Date(task.dueDate);
                dueDate.setHours(0, 0, 0, 0);
                
                if (dueDate < today && !task.completed) {
                    taskDate.style.color = '#e74c3c';
                }
                
                taskText.appendChild(taskDate);
            }
            
            taskContent.appendChild(checkbox);
            taskContent.appendChild(taskText);
            
            // Create task actions
            const taskActions = document.createElement('div');
            taskActions.className = 'task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
            editBtn.addEventListener('click', () => openTaskDialog('edit', task.id));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
            
            taskActions.appendChild(editBtn);
            taskActions.appendChild(deleteBtn);
            
            // Assemble task item
            taskItem.appendChild(taskContent);
            taskItem.appendChild(taskActions);
            
            // Add to list
            taskList.appendChild(taskItem);
        });
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Open dialog on add button click
    addTaskBtn.addEventListener('click', () => openTaskDialog());
    
    // Close dialog on close button click
    closeDialog.addEventListener('click', closeTaskDialog);
    
    // Close dialog on cancel button click
    cancelTask.addEventListener('click', closeTaskDialog);
    
    // Save task on save button click
    saveTask.addEventListener('click', () => {
        if (editingTaskId) {
            updateTask();
        } else {
            addTask();
        }
    });
    
    // Close dialog when clicking outside
    taskDialog.addEventListener('click', (e) => {
        if (e.target === taskDialog) {
            closeTaskDialog();
        }
    });
    
    // Submit form on Enter key press
    taskForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (editingTaskId) {
                updateTask();
            } else {
                addTask();
            }
        }
    });
    
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setFilter(btn.dataset.filter);
        });
    });
}

// Initialize the app
init();
