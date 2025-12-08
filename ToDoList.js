// TaskMaster Pro - Advanced To-Do List Application
// Data Structure
let tasks = [];
let categories = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'default';
let editingTaskId = null;
let selectedColor = '#ff5945';
let currentPage = 1;
const tasksPerPage = 5;

// DOM Elements
const elements = {
    taskInput: document.getElementById('taskInput'),
    taskNotesInput: document.getElementById('taskNotesInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    listContainer: document.getElementById('listContainer'),
    prioritySelect: document.getElementById('prioritySelect'),
    dueDateInput: document.getElementById('dueDateInput'),
    dueTimeInput: document.getElementById('dueTimeInput'),
    categorySelect: document.getElementById('categorySelect'),
    searchInput: document.getElementById('searchInput'),
    sortSelect: document.getElementById('sortSelect'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    statsBtn: document.getElementById('statsBtn'),
    statsContainer: document.getElementById('statsContainer'),
    exportBtn: document.getElementById('exportBtn'),
    importBtn: document.getElementById('importBtn'),
    importFile: document.getElementById('importFile'),
    emptyState: document.getElementById('emptyState'),
    categoriesList: document.getElementById('categoriesList'),
    addCategoryBtn: document.getElementById('addCategoryBtn'),
    categoryModal: document.getElementById('categoryModal'),
    editModal: document.getElementById('editModal'),
    detailsModal: document.getElementById('detailsModal'),
    confirmModal: document.getElementById('confirmModal'),
    exportModal: document.getElementById('exportModal'),
    notificationToast: document.getElementById('notificationToast'),
    paginationContainer: document.getElementById('paginationContainer'),
};

// Confirmation callback
let confirmCallback = null;
let editingCategoryId = null;

// Initialize App
function init() {
    loadFromLocalStorage();
    renderCategories();
    renderTasks();
    updateStats();
    attachEventListeners();
    setMinDate();
    initMobileOptimizations();
}

// Mobile Optimizations
function initMobileOptimizations() {
    // Prevent double-tap zoom on buttons
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Add touch feedback class
    document.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('task-action-btn') || 
            e.target.classList.contains('icon-btn') ||
            e.target.classList.contains('filter-btn') ||
            e.target.classList.contains('category-btn')) {
            e.target.style.opacity = '0.7';
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.target.classList.contains('task-action-btn') || 
            e.target.classList.contains('icon-btn') ||
            e.target.classList.contains('filter-btn') ||
            e.target.classList.contains('category-btn')) {
            setTimeout(() => {
                e.target.style.opacity = '1';
            }, 100);
        }
    });
    
    // Improve scroll performance
    if ('scrollBehavior' in document.documentElement.style) {
        document.documentElement.style.scrollBehavior = 'smooth';
    }
    
    // Detect mobile/tablet
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        document.body.classList.add('mobile-device');
    }
}

// Event Listeners
function attachEventListeners() {
    // Add task
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Search
    elements.searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderTasks();
    });

    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        currentPage = 1;
        renderTasks();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            currentPage = 1;
            renderTasks();
        });
    });

    // Dark mode
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // Stats
    elements.statsBtn.addEventListener('click', toggleStats);

    // Export/Import
    elements.exportBtn.addEventListener('click', openExportModal);
    elements.importBtn.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', importTasks);

    // Category modal
    elements.addCategoryBtn.addEventListener('click', openCategoryModal);
    document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
    document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    
    // Projects dropdown for mobile
    const projectsDropdownBtn = document.getElementById('projectsDropdownBtn');
    const projectsDropdown = document.getElementById('projectsDropdown');
    if (projectsDropdownBtn && projectsDropdown) {
        projectsDropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleProjectsDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!projectsDropdown.contains(e.target)) {
                closeProjectsDropdown();
            }
        });
    }

    // Color picker
    document.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            selectedColor = e.target.dataset.color;
        });
    });

    // Edit modal
    document.getElementById('closeEditModal').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('saveEditBtn').addEventListener('click', saveEditTask);

    // Details modal
    document.getElementById('closeDetailsModal').addEventListener('click', closeDetailsModal);
    document.getElementById('closeDetailsBtn').addEventListener('click', closeDetailsModal);
    document.getElementById('editFromDetailsBtn').addEventListener('click', editFromDetails);

    // Confirmation modal
    document.getElementById('closeConfirmModal').addEventListener('click', closeConfirmModal);
    document.getElementById('cancelConfirmBtn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirmActionBtn').addEventListener('click', handleConfirmAction);

    // Category scroll arrows
    document.getElementById('scrollLeftBtn').addEventListener('click', scrollCategoriesLeft);
    document.getElementById('scrollRightBtn').addEventListener('click', scrollCategoriesRight);
    elements.categoriesList.addEventListener('scroll', updateScrollArrows);
    
    // Global ESC key to close modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.categoryModal.classList.contains('active')) {
                closeCategoryModal();
            } else if (elements.editModal.classList.contains('active')) {
                closeEditModal();
            } else if (elements.detailsModal.classList.contains('active')) {
                closeDetailsModal();
            } else if (elements.confirmModal.classList.contains('active')) {
                closeConfirmModal();
            }
        }
    });
}

// Task Management
function addTask() {
    const taskText = elements.taskInput.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task description', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: elements.prioritySelect.value,
        dueDate: elements.dueDateInput.value,
        dueTime: elements.dueTimeInput.value,
        category: elements.categorySelect.value,
        createdAt: new Date().toISOString(),
        notes: elements.taskNotesInput.value.trim()
    };

    tasks.unshift(task);
    elements.taskInput.value = '';
    elements.taskNotesInput.value = '';
    elements.dueDateInput.value = '';
    elements.dueTimeInput.value = '';
    
    currentPage = 1;
    saveToLocalStorage();
    renderTasks();
    updateStats();
    showNotification('Task added successfully', 'success');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        renderTasks();
        updateStats();
    }
}

function deleteTask(id) {
    showConfirmModal(
        'Delete Task',
        'Are you sure you want to delete this task? This action cannot be undone.',
        () => {
            tasks = tasks.filter(t => t.id !== id);
            saveToLocalStorage();
            renderTasks();
            updateStats();
            showNotification('Task deleted successfully', 'success');
        }
    );
}

function openDetailsModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;

    // Set task title
    document.getElementById('detailTaskTitle').textContent = task.text;

    // Set priority with badge
    const priorityEl = document.getElementById('detailPriority');
    priorityEl.innerHTML = `<span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>`;

    // Set due date
    const dueDateEl = document.getElementById('detailDueDate');
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate < today && !task.completed;
        let dateTimeText = formatFullDate(task.dueDate);
        if (task.dueTime) {
            dateTimeText += ` <i class="fas fa-clock"></i> ${task.dueTime}`;
        }
        dueDateEl.innerHTML = `<span class="${isOverdue ? 'overdue-text' : ''}">${dateTimeText}</span>`;
    } else {
        dueDateEl.textContent = 'No due date';
        dueDateEl.style.color = 'var(--text-muted)';
    }

    // Set category
    const categoryEl = document.getElementById('detailCategory');
    if (task.category && task.category !== 'all') {
        const category = categories.find(c => c.id === task.category);
        if (category) {
            categoryEl.innerHTML = `<i class="fas fa-folder" style="color: ${category.color}"></i> ${category.name}`;
        } else {
            categoryEl.textContent = 'No project';
            categoryEl.style.color = 'var(--text-muted)';
        }
    } else {
        categoryEl.textContent = 'No project';
        categoryEl.style.color = 'var(--text-muted)';
    }

    // Set status
    const statusEl = document.getElementById('detailStatus');
    statusEl.innerHTML = task.completed 
        ? '<span style="color: var(--success-color);"><i class="fas fa-check-circle"></i> Completed</span>' 
        : '<span style="color: var(--warning-color);"><i class="fas fa-clock"></i> Pending</span>';

    // Set created date
    document.getElementById('detailCreated').textContent = formatFullDate(task.createdAt);

    // Set notes
    const notesEl = document.getElementById('detailNotes');
    if (task.notes && task.notes.trim()) {
        notesEl.textContent = task.notes;
        notesEl.style.color = 'var(--text-dark)';
    } else {
        notesEl.textContent = 'No notes added';
        notesEl.style.color = 'var(--text-muted)';
        notesEl.style.fontStyle = 'italic';
    }

    elements.detailsModal.classList.add('active');
}

function closeDetailsModal() {
    elements.detailsModal.classList.remove('active');
    editingTaskId = null;
}

function editFromDetails() {
    elements.detailsModal.classList.remove('active');
    openEditModal(editingTaskId);
}

function openEditModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingTaskId = id;
    document.getElementById('editTaskInput').value = task.text;
    document.getElementById('editTaskNotes').value = task.notes || '';
    document.getElementById('editPrioritySelect').value = task.priority;
    document.getElementById('editDueDateInput').value = task.dueDate || '';
    document.getElementById('editDueTimeInput').value = task.dueTime || '';
    document.getElementById('editCategorySelect').value = task.category || 'all';
    
    elements.editModal.classList.add('active');
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
    editingTaskId = null;
}

function saveEditTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    const taskText = document.getElementById('editTaskInput').value.trim();
    if (!taskText) {
        showNotification('Task description cannot be empty', 'error');
        return;
    }

    task.text = taskText;
    task.notes = document.getElementById('editTaskNotes').value.trim();
    task.priority = document.getElementById('editPrioritySelect').value;
    task.dueDate = document.getElementById('editDueDateInput').value;
    task.dueTime = document.getElementById('editDueTimeInput').value;
    task.category = document.getElementById('editCategorySelect').value;

    saveToLocalStorage();
    renderTasks();
    closeEditModal();
    showNotification('Task updated successfully', 'success');
}

// Render Functions
function renderTasks() {
    let filteredTasks = filterTasks();
    filteredTasks = sortTasks(filteredTasks);
    
    // Prioritize upcoming tasks
    filteredTasks = prioritizeUpcomingTasks(filteredTasks);

    elements.listContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.listContainer.style.display = 'none';
        elements.paginationContainer.style.display = 'none';
    } else {
        elements.emptyState.classList.add('hidden');
        elements.listContainer.style.display = 'block';

        // Pagination
        const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);
        const startIndex = (currentPage - 1) * tasksPerPage;
        const endIndex = startIndex + tasksPerPage;
        const tasksToDisplay = filteredTasks.slice(startIndex, endIndex);

        tasksToDisplay.forEach(task => {
            const li = createTaskElement(task);
            elements.listContainer.appendChild(li);
        });

        // Render pagination
        renderPagination(totalPages, filteredTasks.length);
    }
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `priority-${task.priority}`;
    if (task.completed) li.classList.add('completed');
    li.draggable = true;
    li.dataset.id = task.id;

    // Checkbox
    const checkbox = document.createElement('div');
    checkbox.className = 'task-checkbox';
    checkbox.onclick = () => toggleTask(task.id);

    // Task content
    const content = document.createElement('div');
    content.className = 'task-content';

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.text;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    // Priority badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `task-priority ${task.priority}`;
    priorityBadge.innerHTML = `<i class="fas fa-flag"></i> ${task.priority}`;
    meta.appendChild(priorityBadge);

    // Due date
    if (task.dueDate) {
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'task-due-date';
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dueDate < today && !task.completed) {
            dueDateSpan.classList.add('overdue');
        }
        
        let dateTimeText = formatDate(task.dueDate);
        if (task.dueTime) {
            dateTimeText += ` <i class="fas fa-clock"></i> ${task.dueTime}`;
        }
        
        dueDateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${dateTimeText}`;
        meta.appendChild(dueDateSpan);
    }

    // Category
    if (task.category && task.category !== 'all') {
        const category = categories.find(c => c.id === task.category);
        if (category) {
            const categorySpan = document.createElement('span');
            categorySpan.className = 'task-meta-item';
            categorySpan.innerHTML = `<i class="fas fa-folder" style="color: ${category.color}"></i> ${category.name}`;
            meta.appendChild(categorySpan);
        }
    }

    content.appendChild(title);
    content.appendChild(meta);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn edit';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = (e) => {
        e.stopPropagation();
        openEditModal(task.id);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    };

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(actions);

    // Click on task content to view details
    content.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetailsModal(task.id);
    });
    content.style.cursor = 'pointer';

    // Drag events
    li.addEventListener('dragstart', handleDragStart);
    li.addEventListener('dragend', handleDragEnd);
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('drop', handleDrop);

    return li;
}

function filterTasks() {
    let filtered = tasks;

    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(t => t.category === currentCategory);
    }

    // Filter by status
    if (currentFilter === 'active') {
        filtered = filtered.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.completed);
    }

    // Filter by search
    const searchTerm = elements.searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(t => 
            t.text.toLowerCase().includes(searchTerm) ||
            (t.notes && t.notes.toLowerCase().includes(searchTerm))
        );
    }

    return filtered;
}

function sortTasks(tasks) {
    const sorted = [...tasks];

    switch (currentSort) {
        case 'priority':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            break;
        case 'dueDate':
            sorted.sort((a, b) => {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });
            break;
        case 'alphabetical':
            sorted.sort((a, b) => a.text.localeCompare(b.text));
            break;
        default:
            // Keep default order (newest first)
            break;
    }

    return sorted;
}

function prioritizeUpcomingTasks(tasks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = [];
    const overdue = [];
    const noDueDate = [];
    const completed = [];
    
    tasks.forEach(task => {
        if (task.completed) {
            completed.push(task);
        } else if (!task.dueDate) {
            noDueDate.push(task);
        } else {
            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            if (dueDate < today) {
                overdue.push(task);
            } else {
                upcoming.push(task);
            }
        }
    });
    
    // Sort overdue by date (closest to today first)
    overdue.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    
    // Sort upcoming by date (soonest first)
    upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Return in priority order: overdue, upcoming, no due date, completed
    return [...overdue, ...upcoming, ...noDueDate, ...completed];
}

function renderPagination(totalPages, totalTasks) {
    if (totalPages <= 1) {
        elements.paginationContainer.style.display = 'none';
        return;
    }

    elements.paginationContainer.style.display = 'flex';
    elements.paginationContainer.innerHTML = '';

    // Task count info
    const info = document.createElement('div');
    info.className = 'pagination-info';
    const startTask = (currentPage - 1) * tasksPerPage + 1;
    const endTask = Math.min(currentPage * tasksPerPage, totalTasks);
    info.textContent = `Showing ${startTask}-${endTask} of ${totalTasks} tasks`;
    elements.paginationContainer.appendChild(info);

    // Pagination buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'pagination-buttons';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
            scrollToTop();
        }
    });
    buttonsContainer.appendChild(prevBtn);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstBtn = createPageButton(1);
        buttonsContainer.appendChild(firstBtn);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            buttonsContainer.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = createPageButton(i);
        buttonsContainer.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            buttonsContainer.appendChild(dots);
        }
        const lastBtn = createPageButton(totalPages);
        buttonsContainer.appendChild(lastBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
            scrollToTop();
        }
    });
    buttonsContainer.appendChild(nextBtn);

    elements.paginationContainer.appendChild(buttonsContainer);
}

function createPageButton(pageNum) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    if (pageNum === currentPage) {
        btn.classList.add('active');
    }
    btn.textContent = pageNum;
    btn.addEventListener('click', () => {
        currentPage = pageNum;
        renderTasks();
        scrollToTop();
    });
    return btn;
}

function scrollToTop() {
    elements.listContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollCategoriesLeft() {
    elements.categoriesList.scrollBy({
        left: -200,
        behavior: 'smooth'
    });
}

function scrollCategoriesRight() {
    elements.categoriesList.scrollBy({
        left: 200,
        behavior: 'smooth'
    });
}

function toggleProjectsDropdown() {
    const dropdown = document.getElementById('projectsDropdown');
    const isActive = dropdown.classList.contains('active');
    
    if (isActive) {
        closeProjectsDropdown();
    } else {
        openProjectsDropdown();
    }
}

function openProjectsDropdown() {
    const dropdown = document.getElementById('projectsDropdown');
    dropdown.classList.add('active');
    populateDropdownCategories();
}

function closeProjectsDropdown() {
    const dropdown = document.getElementById('projectsDropdown');
    dropdown.classList.remove('active');
}

function populateDropdownCategories() {
    const dropdownList = document.getElementById('dropdownCategoriesList');
    if (!dropdownList) return;
    
    dropdownList.innerHTML = '';
    
    // Add "All Tasks" button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn' + (currentCategory === 'all' ? ' active' : '');
    allBtn.innerHTML = '<i class="fas fa-inbox"></i> All Tasks';
    allBtn.addEventListener('click', () => {
        filterByCategory('all');
        closeProjectsDropdown();
    });
    dropdownList.appendChild(allBtn);
    
    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn' + (currentCategory === category.name ? ' active' : '');
        btn.innerHTML = `<i class="fas fa-circle" style="color: ${category.color}"></i> ${category.name}`;
        btn.addEventListener('click', () => {
            filterByCategory(category.name);
            closeProjectsDropdown();
        });
        dropdownList.appendChild(btn);
    });
}

function updateScrollArrows() {
    const container = elements.categoriesList;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    
    const leftBtn = document.getElementById('scrollLeftBtn');
    const rightBtn = document.getElementById('scrollRightBtn');
    
    // Hide left arrow if at start
    if (scrollLeft <= 0) {
        leftBtn.style.opacity = '0';
        leftBtn.style.pointerEvents = 'none';
    } else {
        leftBtn.style.opacity = '1';
        leftBtn.style.pointerEvents = 'auto';
    }
    
    // Hide right arrow if at end
    if (scrollLeft + clientWidth >= scrollWidth - 1) {
        rightBtn.style.opacity = '0';
        rightBtn.style.pointerEvents = 'none';
    } else {
        rightBtn.style.opacity = '1';
        rightBtn.style.pointerEvents = 'auto';
    }
}

// Category Management
function renderCategories() {
    // Clear existing categories except "All Tasks"
    const allTasksBtn = elements.categoriesList.querySelector('[data-category="all"]');
    elements.categoriesList.innerHTML = '';
    elements.categoriesList.appendChild(allTasksBtn);
    
    // Re-attach event listener to "All Tasks" button
    allTasksBtn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = 'all';
        currentPage = 1;
        renderTasks();
    });

    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = category.id;
        btn.innerHTML = `
            <span class="category-content" data-id="${category.id}">
                <i class="fas fa-folder" style="color: ${category.color}"></i>
                <span class="category-name">${category.name}</span>
            </span>
            <span class="category-menu-btn" data-id="${category.id}">
                <i class="fas fa-ellipsis-v"></i>
            </span>
        `;
        
        // Click to filter tasks
        const categoryContent = btn.querySelector('.category-content');
        categoryContent.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = category.id;
            currentPage = 1;
            renderTasks();
        });
        
        // Toggle menu
        const menuBtn = btn.querySelector('.category-menu-btn');
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCategoryMenu(category.id, btn);
        });
        
        elements.categoriesList.appendChild(btn);
    });

    // Update category select
    elements.categorySelect.innerHTML = '<option value="all">No Project</option>';
    const editCategorySelect = document.getElementById('editCategorySelect');
    if (editCategorySelect) {
        editCategorySelect.innerHTML = '<option value="all">No Project</option>';
    }
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.categorySelect.appendChild(option);
        
        if (editCategorySelect) {
            const editOption = document.createElement('option');
            editOption.value = category.id;
            editOption.textContent = category.name;
            editCategorySelect.appendChild(editOption);
        }
    });
    
    // Update scroll arrows visibility
    setTimeout(updateScrollArrows, 100);
}

function openCategoryModal() {
    editingCategoryId = null;
    document.getElementById('categoryModalTitle').textContent = 'New Project';
    document.getElementById('categoryNameInput').value = '';
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
    document.querySelector('.color-option').classList.add('selected');
    selectedColor = '#ff5945';
    document.getElementById('saveCategoryBtn').textContent = 'Create Project';
    elements.categoryModal.classList.add('active');
}

function openEditCategoryModal(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    editingCategoryId = id;
    document.getElementById('categoryModalTitle').textContent = 'Edit Project';
    document.getElementById('categoryNameInput').value = category.name;
    
    // Select the current color
    document.querySelectorAll('.color-option').forEach(b => {
        b.classList.remove('selected');
        if (b.dataset.color === category.color) {
            b.classList.add('selected');
        }
    });
    selectedColor = category.color;
    document.getElementById('saveCategoryBtn').textContent = 'Save Changes';
    elements.categoryModal.classList.add('active');
}

function closeCategoryModal() {
    elements.categoryModal.classList.remove('active');
    editingCategoryId = null;
}

function deleteCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    const tasksInCategory = tasks.filter(t => t.category === id).length;
    const message = tasksInCategory > 0 
        ? `Delete "${category.name}"? This project has ${tasksInCategory} task(s). Tasks will be moved to "No Project".`
        : `Delete "${category.name}"?`;
    
    showConfirmModal(
        'Delete Project',
        message,
        () => {
            // Remove category
            categories = categories.filter(c => c.id !== id);
            
            // Update tasks in this category
            tasks.forEach(task => {
                if (task.category === id) {
                    task.category = 'all';
                }
            });
            
            // Reset to "All Tasks" view if deleting current category
            if (currentCategory === id) {
                currentCategory = 'all';
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                document.querySelector('[data-category="all"]').classList.add('active');
            }
            
            saveToLocalStorage();
            renderCategories();
            renderTasks();
            showNotification('Project deleted successfully', 'success');
        }
    );
}

function toggleCategoryMenu(categoryId, buttonElement) {
    // Remove any existing menu
    const existingMenu = document.querySelector('.category-dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    // Create dropdown menu
    const menu = document.createElement('div');
    menu.className = 'category-dropdown-menu';
    menu.innerHTML = `
        <button class="dropdown-item" data-action="edit">
            <i class="fas fa-edit"></i> Edit Project
        </button>
        <button class="dropdown-item danger" data-action="delete">
            <i class="fas fa-trash"></i> Delete Project
        </button>
    `;
    
    // Position menu
    const rect = buttonElement.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left}px`;
    
    // Add to body
    document.body.appendChild(menu);
    
    // Focus first item for keyboard accessibility
    setTimeout(() => menu.querySelector('.dropdown-item').focus(), 0);
    
    // Event listeners
    menu.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
        e.stopPropagation();
        menu.remove();
        openEditCategoryModal(categoryId);
    });
    
    menu.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
        e.stopPropagation();
        menu.remove();
        deleteCategory(categoryId);
    });
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
        
        // Close menu on ESC key
        document.addEventListener('keydown', function closeMenuEsc(e) {
            if (e.key === 'Escape') {
                menu.remove();
                document.removeEventListener('keydown', closeMenuEsc);
                buttonElement.focus(); // Return focus to button
            }
        });
    }, 0);
}

function saveCategory() {
    const name = document.getElementById('categoryNameInput').value.trim();
    
    if (!name) {
        showNotification('Please enter a project name', 'error');
        return;
    }

    if (editingCategoryId) {
        // Edit existing category
        const category = categories.find(c => c.id === editingCategoryId);
        if (category) {
            category.name = name;
            category.color = selectedColor;
            saveToLocalStorage();
            renderCategories();
            renderTasks(); // Re-render to update category display in tasks
            closeCategoryModal();
            showNotification('Project updated successfully', 'success');
        }
    } else {
        // Create new category
        const category = {
            id: 'cat_' + Date.now(),
            name: name,
            color: selectedColor
        };

        categories.push(category);
        saveToLocalStorage();
        renderCategories();
        closeCategoryModal();
        showNotification('Project created successfully', 'success');
    }
}

// Statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('completionRate').textContent = rate + '%';
}

function toggleStats() {
    elements.statsContainer.classList.toggle('hidden');
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    const icon = elements.darkModeToggle.querySelector('i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Export/Import
function openExportModal() {
    elements.exportModal.classList.add('active');
    
    // Add event listeners to format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.onclick = () => {
            const format = btn.dataset.format;
            exportTasks(format);
            elements.exportModal.classList.remove('active');
        };
    });
    
    // Close button
    document.getElementById('closeExportModalBtn').onclick = () => {
        elements.exportModal.classList.remove('active');
    };
    
    // Click outside to close
    elements.exportModal.onclick = (e) => {
        if (e.target === elements.exportModal) {
            elements.exportModal.classList.remove('active');
        }
    };
}

function exportTasks(format) {
    const timestamp = Date.now();
    const dateStr = new Date().toISOString().split('T')[0];
    
    switch(format) {
        case 'json':
            exportAsJSON(timestamp);
            break;
        case 'csv':
            exportAsCSV(dateStr);
            break;
        case 'xlsx':
            exportAsExcel(dateStr);
            break;
        case 'pdf':
            exportAsPDF(dateStr);
            break;
        default:
            exportAsJSON(timestamp);
    }
}

function exportAsJSON(timestamp) {
    const data = {
        tasks: tasks,
        categories: categories,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `taskmaster-backup-${timestamp}.json`);
    showNotification('Tasks exported as JSON successfully', 'success');
}

function exportAsCSV(dateStr) {
    // CSV Headers
    const headers = ['Task', 'Priority', 'Status', 'Due Date', 'Time', 'Project', 'Notes'];
    let csv = headers.join(',') + '\n';
    
    // Add tasks
    tasks.forEach(task => {
        const project = categories.find(c => c.id === task.category)?.name || 'No Project';
        const status = task.completed ? 'Completed' : 'Pending';
        const dueDate = task.dueDate || '-';
        const time = task.dueTime || '-';
        const notes = (task.notes || '').replace(/"/g, '""').replace(/\n/g, ' ');
        const taskText = task.text.replace(/"/g, '""');
        
        const row = [
            `"${taskText}"`,
            `"${task.priority.toUpperCase()}"`,
            `"${status}"`,
            `"${dueDate}"`,
            `"${time}"`,
            `"${project}"`,
            `"${notes}"`
        ];
        
        csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `taskmaster-export-${dateStr}.csv`);
    showNotification('Tasks exported as CSV successfully', 'success');
}

function exportAsExcel(dateStr) {
    // Create styled HTML table for Excel
    let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
        <meta charset="UTF-8">
        <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #ff5945; color: white; font-weight: bold; padding: 10px; border: 1px solid #ddd; }
            td { padding: 8px; border: 1px solid #ddd; }
            .priority-high { background-color: #ffebee; color: #c62828; font-weight: bold; }
            .priority-medium { background-color: #fff3e0; color: #ef6c00; font-weight: bold; }
            .priority-low { background-color: #e8f5e9; color: #2e7d32; font-weight: bold; }
        </style>
    </head>
    <body>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Time</th>
                    <th>Project</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tasks.forEach((task, index) => {
        const project = categories.find(c => c.id === task.category)?.name || 'No Project';
        const status = task.completed ? 'Completed' : 'Pending';
        const dueDate = task.dueDate || '-';
        const time = task.dueTime || '-';
        const notes = task.notes || '-';
        
        html += '<tr>';
        html += `<td>${index + 1}</td>`;
        html += `<td>${task.text}</td>`;
        html += `<td class="priority-${task.priority}">${task.priority.toUpperCase()}</td>`;
        html += `<td>${status}</td>`;
        html += `<td>${dueDate}</td>`;
        html += `<td>${time}</td>`;
        html += `<td>${project}</td>`;
        html += `<td>${notes}</td>`;
        html += '</tr>';
    });
    
    html += `
            </tbody>
        </table>
    </body>
    </html>`;
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    downloadFile(blob, `taskmaster-export-${dateStr}.xls`);
    showNotification('Tasks exported as Excel table successfully', 'success');
}

function exportAsPDF(dateStr) {
    // Create printable HTML with table
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>TaskMaster Pro - Task List</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #ff5945; margin-bottom: 10px; }
            .date { color: #666; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #ff5945; color: white; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #ddd; }
            tr:hover { background: #f5f5f5; }
            .priority { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; display: inline-block; }
            .high { background: #ffebee; color: #c62828; }
            .medium { background: #fff3e0; color: #ef6c00; }
            .low { background: #e8f5e9; color: #2e7d32; }
            .completed { color: #4caf50; font-weight: 600; }
            .pending { color: #ff9800; font-weight: 600; }
            .notes-cell { font-size: 13px; color: #666; max-width: 250px; }
        </style>
    </head>
    <body>
        <h1>📋 TaskMaster Pro - Task List</h1>
        <div class="date">Exported on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Time</th>
                    <th>Project</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tasks.forEach((task, index) => {
        const project = categories.find(c => c.id === task.category)?.name || 'No Project';
        const status = task.completed ? 'Completed' : 'Pending';
        const statusClass = task.completed ? 'completed' : 'pending';
        const dueDate = task.dueDate || '-';
        const time = task.dueTime || '-';
        const notes = task.notes || '-';
        
        html += `<tr>`;
        html += `<td>${index + 1}</td>`;
        html += `<td><strong>${task.text}</strong></td>`;
        html += `<td><span class="priority ${task.priority}">${task.priority.toUpperCase()}</span></td>`;
        html += `<td><span class="${statusClass}">${status}</span></td>`;
        html += `<td>${dueDate}</td>`;
        html += `<td>${time}</td>`;
        html += `<td>${project}</td>`;
        html += `<td class="notes-cell">${notes}</td>`;
        html += `</tr>`;
    });
    
    html += `
            </tbody>
        </table>
        <script>
            // Auto-print dialog when opened
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            };
        </script>
    </body>
    </html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    downloadFile(blob, `taskmaster-print-${dateStr}.html`);
    showNotification('Download complete! Open the HTML file - it will auto-print. Choose "Save as PDF"', 'success');
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function importTasks(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'json') {
        importJSON(file);
    } else if (extension === 'csv') {
        importCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
        showNotification('Excel import coming soon - Use CSV format instead', 'warning');
    } else {
        showNotification('Unsupported file format - Use JSON or CSV', 'error');
    }
    
    // Reset file input
    e.target.value = '';
}

function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (data.tasks) tasks = data.tasks;
            if (data.categories) categories = data.categories;
            
            saveToLocalStorage();
            renderCategories();
            renderTasks();
            updateStats();
            
            showNotification('Tasks imported from JSON successfully', 'success');
        } catch (error) {
            showNotification('Error importing JSON file', 'error');
        }
    };
    reader.readAsText(file);
}

function importCSV(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const csv = event.target.result;
            const lines = csv.split('\\n');
            const imported = [];
            
            // Skip header
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                const columns = parseCSVLine(lines[i]);
                if (columns.length < 4) continue;
                
                const task = {
                    id: Date.now() + i,
                    text: columns[0] || 'Untitled Task',
                    priority: (columns[1] || 'medium').toLowerCase(),
                    completed: columns[2] === 'Completed',
                    dueDate: columns[3] !== 'No date' ? columns[3] : null,
                    dueTime: columns[4] !== 'No time' ? columns[4] : null,
                    category: 'all',
                    notes: columns[6] || ''
                };
                
                imported.push(task);
            }
            
            if (imported.length > 0) {
                tasks = [...tasks, ...imported];
                saveToLocalStorage();
                renderTasks();
                updateStats();
                showNotification(`Imported ${imported.length} tasks from CSV`, 'success');
            } else {
                showNotification('No tasks found in CSV file', 'warning');
            }
        } catch (error) {
            showNotification('Error importing CSV file', 'error');
        }
    };
    reader.readAsText(file);
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Drag and Drop
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const draggedOver = this;
    if (draggedElement !== draggedOver) {
        draggedOver.classList.add('drag-over');
    }
    
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();
    
    const draggedId = parseInt(draggedElement.dataset.id);
    const droppedId = parseInt(this.dataset.id);
    
    if (draggedId !== droppedId) {
        const draggedIndex = tasks.findIndex(t => t.id === draggedId);
        const droppedIndex = tasks.findIndex(t => t.id === droppedId);
        
        const [draggedTask] = tasks.splice(draggedIndex, 1);
        tasks.splice(droppedIndex, 0, draggedTask);
        
        saveToLocalStorage();
        renderTasks();
    }
    
    return false;
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function formatFullDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatDateWithTime(dateString, timeString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    const dateFormatted = date.toLocaleDateString('en-US', options);
    return `${dateFormatted} at ${timeString}`;
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dueDateInput.setAttribute('min', today);
    document.getElementById('editDueDateInput').setAttribute('min', today);
}

function showNotification(message, type = 'info') {
    const toast = elements.notificationToast;
    const icon = document.getElementById('toastIcon');
    const messageEl = document.getElementById('toastMessage');

    // Remove existing classes
    toast.className = 'toast';
    
    // Set icon based on type
    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-exclamation-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };
    
    icon.innerHTML = icons[type] || icons.info;
    messageEl.textContent = message;
    
    // Add type class and show
    toast.classList.add(`toast-${type}`, 'show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showConfirmModal(title, message, onConfirm) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').textContent = message;
    confirmCallback = onConfirm;
    elements.confirmModal.classList.add('active');
}

function closeConfirmModal() {
    elements.confirmModal.classList.remove('active');
    confirmCallback = null;
}

function handleConfirmAction() {
    if (confirmCallback) {
        confirmCallback();
        confirmCallback = null;
    }
    closeConfirmModal();
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    const savedCategories = localStorage.getItem('categories');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }

    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }

    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
        const icon = elements.darkModeToggle.querySelector('i');
        icon.className = 'fas fa-sun';
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);