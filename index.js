// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Task-related DOM elements
    var taskList = document.getElementById('taskList');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskDialog = document.getElementById('taskDialog');
    const closeDialog = document.getElementById('closeDialog');
    const cancelTask = document.getElementById('cancelTask');
    const saveTask = document.getElementById('saveTask');
    const taskForm = document.getElementById('taskForm');
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskCategory = document.getElementById('taskCategory');
    const dialogTitle = document.getElementById('dialogTitle');
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Note-related DOM elements
    const notesList = document.getElementById('notesList');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteDialog = document.getElementById('noteDialog');
    const closeNoteDialogBtn = document.getElementById('closeNoteDialog'); // Renamed to avoid conflict
    const cancelNote = document.getElementById('cancelNote');
    const saveNote = document.getElementById('saveNote');
    const noteForm = document.getElementById('noteForm');
    const noteTitle = document.getElementById('noteTitle');
    const noteContent = document.getElementById('noteContent');
    const noteCategory = document.getElementById('noteCategory');
    const noteDialogTitle = document.getElementById('noteDialogTitle');

    // Tab-related DOM elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Theme and font size related DOM elements
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    const resetFontBtn = document.getElementById('resetFontBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');

    // Initial check for tasks
    if(taskList && taskList.childElementCount === 0){
        taskList.innerHTML = '<h4>No tasks available</h4>';
    }

    // State variables
    let tasks = [];
    let notes = [];
    let filteredTasks = [];
    let filteredNotes = [];
    let currentFilter = 'all';
    let editingTaskId = null;
    let editingNoteId = null;
    
    // Theme and font size state variables
    let isDarkTheme = false;
    let currentFontSize = 'medium'; // Options: small, medium, large

    // Initialize date picker with today's date and improve behavior
    if (taskDueDate) {
        const today = new Date().toISOString().split('T')[0];
        taskDueDate.value = today;
        
        // Add event listener for date input focus
        taskDueDate.addEventListener('click', function() {
            this.showPicker();
        });
    }

    function init() {
        console.log('Initializing app...');
        // Load data from localStorage
        loadTasks();
        loadNotes();
        
        // Initialize filtered arrays
        filteredTasks = [...tasks];
        filteredNotes = [...notes];
        
        // Load user preferences for theme and font size
        loadUserPreferences();
        
        // Render initial data
        renderTasks();
        renderNotes();
        
        // Setup event listeners
        setupEventListeners();
        setupThemeAndFontSizeListeners();

        // Make tasks and notes available globally for category filtering
        window.tasks = tasks;
        window.notes = notes;
        window.renderTasks = renderTasks;
        window.renderNotes = renderNotes;
    }
    
    // Function to load user preferences
    function loadUserPreferences() {
        // Load theme preference
        const storedTheme = localStorage.getItem('appTheme');
        if (storedTheme === 'dark') {
            enableDarkTheme();
        } else {
            disableDarkTheme();
        }
        
        // Load font size preference
        const storedFontSize = localStorage.getItem('appFontSize');
        if (storedFontSize) {
            setFontSize(storedFontSize);
        } else {
            setFontSize('medium');
        }
    }

    // Theme functions
    function toggleTheme() {
        if (isDarkTheme) {
            disableDarkTheme();
        } else {
            enableDarkTheme();
        }
    }

    function enableDarkTheme() {
        document.body.classList.add('dark-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
            themeToggleBtn.title = 'Switch to Light Theme';
        }
        isDarkTheme = true;
        localStorage.setItem('appTheme', 'dark');
    }

    function disableDarkTheme() {
        document.body.classList.remove('dark-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
            themeToggleBtn.title = 'Switch to Dark Theme';
        }
        isDarkTheme = false;
        localStorage.setItem('appTheme', 'light');
    }

    // Font size functions
    function setFontSize(size) {
        // Remove any existing font size classes
        document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
        
        // Add the appropriate class
        document.body.classList.add(`font-size-${size}`);
        
        // Update the current font size
        currentFontSize = size;
        
        // Save to localStorage
        localStorage.setItem('appFontSize', size);
    }

    function increaseFontSize() {
        switch (currentFontSize) {
            case 'small':
                setFontSize('medium');
                break;
            case 'medium':
                setFontSize('large');
                break;
            // If already large, do nothing
        }
    }

    function decreaseFontSize() {
        switch (currentFontSize) {
            case 'large':
                setFontSize('medium');
                break;
            case 'medium':
                setFontSize('small');
                break;
            // If already small, do nothing
        }
    }

    function resetFontSize() {
        setFontSize('medium');
    }

    // Setup theme and font size event listeners
    function setupThemeAndFontSizeListeners() {
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', toggleTheme);
        }
        
        if (decreaseFontBtn) {
            decreaseFontBtn.addEventListener('click', decreaseFontSize);
        }
        
        if (resetFontBtn) {
            resetFontBtn.addEventListener('click', resetFontSize);
        }
        
        if (increaseFontBtn) {
            increaseFontBtn.addEventListener('click', increaseFontSize);
        }
    }

    // Tab functionality
    function setupTabEvents() {
        if (!tabButtons || tabButtons.length === 0) return;
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab
                button.classList.add('active');
                
                // Show corresponding content
                const tabId = button.dataset.tab;
                const contentEl = document.getElementById(`${tabId}-content`);
                if (contentEl) {
                    contentEl.classList.add('active');
                }
            });
        });
    }

    // Task functions
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        tasks = storedTasks ? JSON.parse(storedTasks) : [];
        console.log('Loaded tasks:', tasks.length);
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update tasks array in window scope for category filtering
        window.tasks = tasks;
        
        // Update category sidebar if available
        if (window.categoryManager && window.categoryManager.renderCategorySidebar) {
            window.categoryManager.renderCategorySidebar();
        }
    }

    function openTaskDialog(mode = 'add', taskId = null) {
        if (!taskForm) return;
        
        taskForm.reset();
        
        if (mode === 'edit' && taskId) {
            if (dialogTitle) dialogTitle.textContent = 'Edit Task';
            editingTaskId = taskId;
            
            const taskToEdit = tasks.find(task => task.id === taskId);
            
            if (taskToEdit) {
                if (taskTitle) taskTitle.value = taskToEdit.title;
                if (taskDescription) taskDescription.value = taskToEdit.description || '';
                if (taskCategory) taskCategory.value = taskToEdit.category || '';
                
                // Update the custom calendar if it exists
                if (window.customCalendar) {
                    if (taskToEdit.dueDate) {
                        window.customCalendar.setValue(taskToEdit.dueDate);
                    } else {
                        window.customCalendar.clearDate();
                    }
                } else if (taskDueDate) {
                    // Fallback to the standard date input
                    taskDueDate.value = taskToEdit.dueDate || '';
                }
            }
        } else {
            if (dialogTitle) dialogTitle.textContent = 'Add New Task';
            editingTaskId = null;
            
            // Set default date for new tasks in the calendar
            if (window.customCalendar) {
                const today = new Date().toISOString().split('T')[0];
                window.customCalendar.setValue(today);
                // Uncomment the line below if you want new tasks to have no date by default
                // window.customCalendar.clearDate();
            } else if (taskDueDate) {
                const today = new Date().toISOString().split('T')[0];
                taskDueDate.value = today;
            }
        }
        
        // Refresh category select options
        if (window.categoryManager && window.categoryManager.populateCategorySelects) {
            window.categoryManager.populateCategorySelects();
            
            // If adding a new task, set the default category to the currently selected one
            if (mode === 'add' && taskCategory && window.categoryManager.setDefaultCategoryInForm) {
                window.categoryManager.setDefaultCategoryInForm(taskCategory);
            }
        }
        
        // Show dialog
        if (taskDialog) taskDialog.classList.add('active');
    }    

    // Close task dialog
    function closeTaskDialog() {
        if (taskDialog) taskDialog.classList.remove('active');
    }

    // Add a new task
    function addTask() {
        if (!taskTitle) return;
        
        const title = taskTitle.value.trim();
        
        if (title === '') return;
        
        // Get date from custom calendar if available, otherwise use original input
        let dueDate = '';
        if (window.customCalendar) {
            dueDate = window.customCalendar.getValue();
        } else if (taskDueDate) {
            dueDate = taskDueDate.value;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title: title,
            description: taskDescription ? taskDescription.value.trim() : '',
            dueDate: dueDate,
            category: taskCategory ? taskCategory.value : '',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        closeTaskDialog();
    }

    function updateTask() {
        if (!editingTaskId || !taskTitle) return;
        
        const title = taskTitle.value.trim();
        
        if (title === '') return;
        
        // Get date from custom calendar if available, otherwise use original input
        let dueDate = '';
        if (window.customCalendar) {
            dueDate = window.customCalendar.getValue();
        } else if (taskDueDate) {
            dueDate = taskDueDate.value;
        }
        
        tasks = tasks.map(task => {
            if (task.id === editingTaskId) {
                return {
                    ...task,
                    title: title,
                    description: taskDescription ? taskDescription.value.trim() : task.description,
                    dueDate: dueDate,
                    category: taskCategory ? taskCategory.value : task.category || ''
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
        // Remove confirmation dialog and delete directly
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
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
        if (filterButtons) {
            filterButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
        }
        
        renderTasks();
    }

    // Get filtered tasks based on current filter and category
    function getFilteredTasks() {
        // First, filter by category (if a category is selected)
        let categoryFiltered = [...tasks];
        
        if (window.categoryManager && window.categoryManager.getCurrentCategory()) {
            const currentCategory = window.categoryManager.getCurrentCategory();
            categoryFiltered = tasks.filter(task => task.category === currentCategory);
        }
        
        // Then, filter by completion status
        switch (currentFilter) {
            case 'active':
                return categoryFiltered.filter(task => !task.completed);
            case 'completed':
                return categoryFiltered.filter(task => task.completed);
            default:
                return categoryFiltered;
        }
    }

    // Get category name by ID
    function getCategoryName(categoryId) {
        if (!categoryId) return '';
        
        if (window.categoryManager && window.categoryManager.getCategoryById) {
            const category = window.categoryManager.getCategoryById(categoryId);
            return category ? category.name : '';
        }
        
        return '';
    }

    // Render tasks to the DOM
    function renderTasks(tasksToRender) {
        // Check if taskList exists
        if (!taskList) {
            console.warn('taskList element not found');
            return;
        }
        
        // Clear current list
        taskList.innerHTML = '';
        
        // Get tasks based on current filter and category
        const filteredTasks = tasksToRender || getFilteredTasks();
        
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
                const currentCategory = window.categoryManager ? window.categoryManager.getCurrentCategory() : null;
                if (currentCategory) {
                    const categoryName = getCategoryName(currentCategory);
                    emptyMessage.textContent = `No ${currentFilter} tasks found in category "${categoryName}".`;
                } else {
                    emptyMessage.textContent = `No ${currentFilter} tasks found.`;
                }
            }
            
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                
                // Add category badge if task has a category
                if (task.category) {
                    const categoryBadge = document.createElement('span');
                    categoryBadge.className = 'task-category';
                    categoryBadge.textContent = getCategoryName(task.category);
                    taskItem.appendChild(categoryBadge);
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

    // Notes functions
    function loadNotes() {
        const storedNotes = localStorage.getItem('notes');
        notes = storedNotes ? JSON.parse(storedNotes) : [];
        console.log('Loaded notes:', notes.length);
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
        
        // Update notes array in window scope for category filtering
        window.notes = notes;
        
        // Update category sidebar if available
        if (window.categoryManager && window.categoryManager.renderCategorySidebar) {
            window.categoryManager.renderCategorySidebar();
        }
    }

    function openNoteDialog(mode = 'add', noteId = null) {
        if (!noteForm) {
            console.warn('noteForm element not found');
            return;
        }
        
        noteForm.reset();
        
        if (mode === 'edit' && noteId) {
            if (noteDialogTitle) noteDialogTitle.textContent = 'Edit Note';
            editingNoteId = noteId;
            
            const noteToEdit = notes.find(note => note.id === noteId);
            
            if (noteToEdit) {
                if (noteTitle) noteTitle.value = noteToEdit.title;
                if (noteContent) noteContent.value = noteToEdit.content || '';
                if (noteCategory) noteCategory.value = noteToEdit.category || '';
            }
        } else {
            if (noteDialogTitle) noteDialogTitle.textContent = 'Add New Note';
            editingNoteId = null;
        }
        
        // Refresh category select options
        if (window.categoryManager && window.categoryManager.populateCategorySelects) {
            window.categoryManager.populateCategorySelects();
            
            // If adding a new note, set the default category to the currently selected one
            if (mode === 'add' && noteCategory && window.categoryManager.setDefaultCategoryInForm) {
                window.categoryManager.setDefaultCategoryInForm(noteCategory);
            }
        }
        
        // Show dialog
        if (noteDialog) noteDialog.classList.add('active');
    }

    function closeNoteDialog() {
        if (noteDialog) noteDialog.classList.remove('active');
    }

    function addNote() {
        if (!noteTitle || !noteContent) {
            console.warn('noteTitle or noteContent elements not found');
            return;
        }
        
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        
        if (title === '' || content === '') return;
        
        const newNote = {
            id: Date.now().toString(),
            title: title,
            content: content,
            category: noteCategory ? noteCategory.value : '',
            createdAt: new Date().toISOString()
        };
        
        notes.push(newNote);
        saveNotes();
        renderNotes();
        closeNoteDialog();
    }

    function updateNote() {
        if (!editingNoteId || !noteTitle || !noteContent) return;
        
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        
        if (title === '' || content === '') return;
        
        notes = notes.map(note => {
            if (note.id === editingNoteId) {
                return {
                    ...note,
                    title: title,
                    content: content,
                    category: noteCategory ? noteCategory.value : note.category || '',
                    updatedAt: new Date().toISOString()
                };
            }
            return note;
        });
        
        saveNotes();
        renderNotes();
        closeNoteDialog();
        editingNoteId = null;
    }

    function deleteNote(id) {
        // Remove confirmation dialog and delete directly
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    }

    // Format timestamp for display
    function formatTimestamp(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString(undefined, options);
    }

    // Get filtered notes based on current category
    function getFilteredNotes() {
        // Filter by category (if a category is selected)
        let categoryFiltered = [...notes];
        
        if (window.categoryManager && window.categoryManager.getCurrentCategory()) {
            const currentCategory = window.categoryManager.getCurrentCategory();
            categoryFiltered = notes.filter(note => note.category === currentCategory);
        }
        
        return categoryFiltered;
    }

    // Render notes to the DOM
    function renderNotes(notesToRender) {
        // Check if notesList exists
        if (!notesList) {
            console.warn('notesList element not found');
            return;
        }
        
        // Clear current list
        notesList.innerHTML = '';
        
        // Get notes based on current category
        const filteredNotes = notesToRender || getFilteredNotes();
        
        // Sort notes by creation date (newest first)
        const sortedNotes = [...filteredNotes].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        // Create note items
        if (sortedNotes.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-list';
            
            if (notes.length === 0) {
                emptyMessage.textContent = 'Your notes list is empty. Add a note to get started!';
            } else {
                const currentCategory = window.categoryManager ? window.categoryManager.getCurrentCategory() : null;
                if (currentCategory) {
                    const categoryName = getCategoryName(currentCategory);
                    emptyMessage.textContent = `No notes found in category "${categoryName}".`;
                } else {
                    emptyMessage.textContent = 'No notes match the current filter.';
                }
            }
            
            notesList.appendChild(emptyMessage);
        } else {
            sortedNotes.forEach(note => {
                const noteItem = document.createElement('div');
                noteItem.className = 'note-item';
                
                // Add category badge if note has a category
                if (note.category) {
                    const categoryBadge = document.createElement('span');
                    categoryBadge.className = 'note-category';
                    categoryBadge.textContent = getCategoryName(note.category);
                    noteItem.appendChild(categoryBadge);
                }
                
                // Create note header
                const noteHeader = document.createElement('div');
                noteHeader.className = 'note-header';
                
                const noteItemTitle = document.createElement('div');
                noteItemTitle.className = 'note-title';
                noteItemTitle.textContent = note.title;
                
                const noteDate = document.createElement('div');
                noteDate.className = 'note-date';
                
                const timestamp = note.updatedAt ? 
                    `Updated: ${formatTimestamp(note.updatedAt)}` : 
                    `Created: ${formatTimestamp(note.createdAt)}`;
                
                noteDate.textContent = timestamp;
                
                noteHeader.appendChild(noteItemTitle);
                noteHeader.appendChild(noteDate);
                
                // Create note content
                const noteItemContent = document.createElement('div');
                noteItemContent.className = 'note-content';
                noteItemContent.textContent = note.content;
                
                // Create note actions
                const noteActions = document.createElement('div');
                noteActions.className = 'note-actions';
                
                const editBtn = document.createElement('button');
                editBtn.className = 'edit-btn';
                editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editBtn.title = 'Edit';
                editBtn.addEventListener('click', () => openNoteDialog('edit', note.id));
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
                deleteBtn.title = 'Delete';
                deleteBtn.addEventListener('click', () => deleteNote(note.id));
                
                noteActions.appendChild(editBtn);
                noteActions.appendChild(deleteBtn);
                
                // Assemble note item
                noteItem.appendChild(noteHeader);
                noteItem.appendChild(noteItemContent);
                noteItem.appendChild(noteActions);
                
                // Add to list
                notesList.appendChild(noteItem);
            });
        }
    }

    // Setup all event listeners
    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Set up tab switching
        setupTabEvents();
        
        // Task-related event listeners
        if (addTaskBtn) {
            addTaskBtn.addEventListener('click', () => openTaskDialog());
        }
        
        if (closeDialog) {
            closeDialog.addEventListener('click', closeTaskDialog);
        }
        
        if (cancelTask) {
            cancelTask.addEventListener('click', closeTaskDialog);
        }
        
        if (saveTask) {
            saveTask.addEventListener('click', () => {
                if (editingTaskId) {
                    updateTask();
                } else {
                    addTask();
                }
            });
        }
        
        if (taskDialog) {
            taskDialog.addEventListener('click', (e) => {
                if (e.target === taskDialog) {
                    closeTaskDialog();
                }
            });
        }
        
        if (taskForm) {
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
        }
        
        // Filter buttons
        if (filterButtons) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    setFilter(btn.dataset.filter);
                });
            });
        }
        
        // Note-related event listeners
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => openNoteDialog());
        }
        
        if (closeNoteDialogBtn) { // Using the renamed variable
            closeNoteDialogBtn.addEventListener('click', closeNoteDialog);
        }
        
        if (cancelNote) {
            cancelNote.addEventListener('click', closeNoteDialog);
        }
        
        if (saveNote) {
            saveNote.addEventListener('click', () => {
                if (editingNoteId) {
                    updateNote();
                } else {
                    addNote();
                }
            });
        }
        
        if (noteDialog) {
            noteDialog.addEventListener('click', (e) => {
                if (e.target === noteDialog) {
                    closeNoteDialog();
                }
            });
        }
        
        if (noteForm) {
            noteForm.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && e.target.id !== 'noteContent') {
                    e.preventDefault();
                    if (editingNoteId) {
                        updateNote();
                    } else {
                        addNote();
                    }
                }
            });
        }
    }

    // Initialize the app
    init();
});