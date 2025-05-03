/**
 * Category Management for Productivity App
 * Handles categories for both tasks and notes
 */
document.addEventListener('DOMContentLoaded', function() {
    // Category-related DOM elements
    const categoriesList = document.getElementById('categoriesList');
    const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
    const categoryDialog = document.getElementById('categoryDialog');
    const closeCategoryDialogBtn = document.getElementById('closeCategoryDialog');
    const saveCategoryChanges = document.getElementById('saveCategoryChanges');
    const newCategoryName = document.getElementById('newCategoryName');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const categoryManagementList = document.getElementById('categoryManagementList');
    
    // Task and Note category select elements
    const taskCategorySelect = document.getElementById('taskCategory');
    const noteCategorySelect = document.getElementById('noteCategory');
    
    // State variables
    let categories = [];
    let currentCategory = null;
    let taskListRef = document.getElementById('taskList');
    let notesListRef = document.getElementById('notesList');
    
    // Initialize
    function init() {
        console.log('Initializing categories...');
        loadCategories();
        renderCategorySidebar();
        populateCategorySelects();
        setupEventListeners();
    }
    
    // Load categories from localStorage
    function loadCategories() {
        const storedCategories = localStorage.getItem('categories');
        categories = storedCategories ? JSON.parse(storedCategories) : [
            // Default categories
            { id: 'personal', name: 'Personal', icon: 'fa-user' },
            { id: 'work', name: 'Work', icon: 'fa-briefcase' }
        ];
        console.log('Loaded categories:', categories.length);
    }
    
    // Save categories to localStorage
    function saveCategories() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }
    
    // Render categories in sidebar
    function renderCategorySidebar() {
        if (!categoriesList) return;
        
        // Clear current list
        categoriesList.innerHTML = '';
        
        // Add "All" category at the top
        const allCategoryItem = document.createElement('li');
        allCategoryItem.className = 'category-item' + (currentCategory === null ? ' active' : '');
        allCategoryItem.setAttribute('data-category', '');
        allCategoryItem.innerHTML = `
            <span class="category-icon"><i class="fa-solid fa-layer-group"></i></span>
            <span class="category-name">All Items</span>
            <span class="category-count">${getTotalItemsCount()}</span>
        `;
        allCategoryItem.addEventListener('click', () => {
            selectCategory(null);
        });
        categoriesList.appendChild(allCategoryItem);
        
        // Create category items
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category-item' + (currentCategory === category.id ? ' active' : '');
            categoryItem.setAttribute('data-category', category.id);
            categoryItem.innerHTML = `
                <span class="category-icon"><i class="fa-solid ${category.icon}"></i></span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">${getItemsCountByCategory(category.id)}</span>
            `;
            categoryItem.addEventListener('click', () => {
                selectCategory(category.id);
            });
            categoriesList.appendChild(categoryItem);
        });
    }
    
    // Count total items (tasks + notes)
    function getTotalItemsCount() {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        return tasks.length + notes.length;
    }
    
    // Count items by category
    function getItemsCountByCategory(categoryId) {
        const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        const tasksCount = tasks.filter(task => task.category === categoryId).length;
        const notesCount = notes.filter(note => note.category === categoryId).length;
        
        return tasksCount + notesCount;
    }
    
    // Select a category and filter items
    function selectCategory(categoryId) {
        currentCategory = categoryId;
        
        // Update active category in sidebar
        const categoryItems = document.querySelectorAll('.category-item');
        categoryItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-category') === (categoryId || ''));
        });
        
        // Filter tasks and notes by category
        filterItemsByCategory();
    }
    
    // Filter tasks and notes by current category
    function filterItemsByCategory() {
        // Filter tasks
        if (window.filterTasksByCategory) {
            window.filterTasksByCategory(currentCategory);
        } else {
            // Fallback if the filter function isn't available yet
            const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            const filteredTasks = currentCategory ? 
                tasks.filter(task => task.category === currentCategory) : tasks;
            
            // Temporarily modify window.tasks to show filtered results
            // (This will be improved when integrated with the main app)
            if (window.tasks) {
                window.tasks = filteredTasks;
                if (window.renderTasks) {
                    window.renderTasks();
                }
            }
        }
        
        // Filter notes
        if (window.filterNotesByCategory) {
            window.filterNotesByCategory(currentCategory);
        } else {
            // Fallback if the filter function isn't available yet
            const notes = JSON.parse(localStorage.getItem('notes') || '[]');
            const filteredNotes = currentCategory ? 
                notes.filter(note => note.category === currentCategory) : notes;
            
            // Temporarily modify window.notes to show filtered results
            // (This will be improved when integrated with the main app)
            if (window.notes) {
                window.notes = filteredNotes;
                if (window.renderNotes) {
                    window.renderNotes();
                }
            }
        }
        
        // Update category counts
        renderCategorySidebar();
    }
    
    // Populate category select dropdowns
    function populateCategorySelects() {
        const selects = [taskCategorySelect, noteCategorySelect];
        
        selects.forEach(select => {
            if (!select) return;
            
            // Keep the first option (None) and remove others
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add categories as options
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
        });
    }
    
    // Open category management dialog
    function openCategoryDialog() {
        renderCategoryManagementList();
        if (categoryDialog) categoryDialog.classList.add('active');
    }
    
    // Close category management dialog
    function closeCategoryDialog() {
        if (categoryDialog) categoryDialog.classList.remove('active');
    }
    
    // Render the category list in the management dialog
    function renderCategoryManagementList() {
        if (!categoryManagementList) return;
        
        // Clear current list
        categoryManagementList.innerHTML = '';
        
        // Create category items
        categories.forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.className = 'category-management-item';
            categoryItem.innerHTML = `
                <span class="category-management-name">
                    <i class="fa-solid ${category.icon}"></i> ${category.name}
                </span>
                <button class="delete-category-btn" data-id="${category.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;
            categoryManagementList.appendChild(categoryItem);
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = categoryManagementList.querySelectorAll('.delete-category-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-id');
                deleteCategory(categoryId);
            });
        });
    }
    
    // Add a new category
    function addCategory() {
        if (!newCategoryName) return;
        
        const name = newCategoryName.value.trim();
        if (name === '') return;
        
        // Check if category already exists
        if (categories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
            alert('A category with this name already exists');
            return;
        }
        
        // Create a new category with a random icon
        const icons = ['fa-folder', 'fa-tag', 'fa-bookmark', 'fa-star', 'fa-flag', 
                       'fa-circle', 'fa-heart', 'fa-cube', 'fa-gem'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        
        const newCategory = {
            id: 'cat_' + Date.now(),
            name: name,
            icon: randomIcon
        };
        
        categories.push(newCategory);
        saveCategories();
        
        // Clear input field
        newCategoryName.value = '';
        
        // Update UI
        renderCategoryManagementList();
        renderCategorySidebar();
        populateCategorySelects();
    }
    
    // Delete a category
    function deleteCategory(categoryId) {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this category? Items in this category will not be deleted but will no longer be categorized.')) {
            return;
        }
        
        // Remove category
        categories = categories.filter(cat => cat.id !== categoryId);
        saveCategories();
        
        // Update tasks and notes to remove this category
        updateItemsAfterCategoryDelete(categoryId);
        
        // Update UI
        renderCategoryManagementList();
        renderCategorySidebar();
        populateCategorySelects();
        
        // If current category is deleted, switch to "All"
        if (currentCategory === categoryId) {
            selectCategory(null);
        }
    }
    
    // Update tasks and notes after a category is deleted
    function updateItemsAfterCategoryDelete(categoryId) {
        // Update tasks
        let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        let tasksUpdated = false;
        
        tasks = tasks.map(task => {
            if (task.category === categoryId) {
                tasksUpdated = true;
                return { ...task, category: '' };
            }
            return task;
        });
        
        if (tasksUpdated) {
            localStorage.setItem('tasks', JSON.stringify(tasks));
            // Update tasks array in window scope if it exists
            if (window.tasks) {
                window.tasks = tasks;
            }
        }
        
        // Update notes
        let notes = JSON.parse(localStorage.getItem('notes') || '[]');
        let notesUpdated = false;
        
        notes = notes.map(note => {
            if (note.category === categoryId) {
                notesUpdated = true;
                return { ...note, category: '' };
            }
            return note;
        });
        
        if (notesUpdated) {
            localStorage.setItem('notes', JSON.stringify(notes));
            // Update notes array in window scope if it exists
            if (window.notes) {
                window.notes = notes;
            }
        }
        
        // Refresh tasks and notes display if the rendering functions exist
        if (window.renderTasks && tasksUpdated) {
            window.renderTasks();
        }
        
        if (window.renderNotes && notesUpdated) {
            window.renderNotes();
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', openCategoryDialog);
        }
        
        if (closeCategoryDialogBtn) {
            closeCategoryDialogBtn.addEventListener('click', closeCategoryDialog);
        }
        
        if (saveCategoryChanges) {
            saveCategoryChanges.addEventListener('click', () => {
                closeCategoryDialog();
                // Re-render everything
                renderCategorySidebar();
                if (window.renderTasks) window.renderTasks();
                if (window.renderNotes) window.renderNotes();
            });
        }
        
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                addCategory();
            });
        }
        
        if (newCategoryName) {
            newCategoryName.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addCategory();
                }
            });
        }
        
        if (categoryDialog) {
            categoryDialog.addEventListener('click', (e) => {
                if (e.target === categoryDialog) {
                    closeCategoryDialog();
                }
            });
        }
    }
    
    // Export functions to window for main app integration
    window.categoryManager = {
        renderCategorySidebar,
        populateCategorySelects,
        selectCategory,
        getCategories: () => categories,
        getCategoryById: (id) => categories.find(cat => cat.id === id) || null,
        getCurrentCategory: () => currentCategory,
        setDefaultCategoryInForm: (selectElement) => {
            if (!selectElement) return;
            // If a category is currently selected, use it as default
            if (currentCategory) {
                selectElement.value = currentCategory;
            }
        }
    };
    
    // Register filtering functions for use by main app
    window.filterTasksByCategory = function(categoryId) {
        if (!window.tasks) return;
        
        if (categoryId) {
            window.filteredTasks = window.tasks.filter(task => task.category === categoryId);
        } else {
            window.filteredTasks = [...window.tasks];
        }
        
        if (window.renderTasks) {
            window.renderTasks(window.filteredTasks);
        }
    };
    
    window.filterNotesByCategory = function(categoryId) {
        if (!window.notes) return;
        
        if (categoryId) {
            window.filteredNotes = window.notes.filter(note => note.category === categoryId);
        } else {
            window.filteredNotes = [...window.notes];
        }
        
        if (window.renderNotes) {
            window.renderNotes(window.filteredNotes);
        }
    };
    
    // Initialize when DOM is fully loaded
    init();
});