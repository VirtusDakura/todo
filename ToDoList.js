// TaskMaster Pro - Advanced To-Do List Application
// Data Structure
let tasks = [];
let categories = [];
let currentFilter = 'all';
let currentCategory = 'all';
let currentSort = 'default';
let editingTaskId = null;
let selectedColor = '#ff5945';

// DOM Elements
const elements = {
    taskInput: document.getElementById('taskInput'),
    addTaskBtn: document.getElementById('addTaskBtn'),
    listContainer: document.getElementById('listContainer'),
    prioritySelect: document.getElementById('prioritySelect'),
    dueDateInput: document.getElementById('dueDateInput'),
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
};

// Initialize App
function init() {
    loadFromLocalStorage();
    renderCategories();
    renderTasks();
    updateStats();
    attachEventListeners();
    setMinDate();
}

// Event Listeners
function attachEventListeners() {
    // Add task
    elements.addTaskBtn.addEventListener('click', addTask);
    elements.taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Search
    elements.searchInput.addEventListener('input', renderTasks);

    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderTasks();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // Dark mode
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // Stats
    elements.statsBtn.addEventListener('click', toggleStats);

    // Export/Import
    elements.exportBtn.addEventListener('click', exportTasks);
    elements.importBtn.addEventListener('click', () => elements.importFile.click());
    elements.importFile.addEventListener('change', importTasks);

    // Category modal
    elements.addCategoryBtn.addEventListener('click', openCategoryModal);
    document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
    document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

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
}

// Task Management
function addTask() {
    const taskText = elements.taskInput.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task', 'error');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: elements.prioritySelect.value,
        dueDate: elements.dueDateInput.value,
        category: elements.categorySelect.value,
        createdAt: new Date().toISOString(),
        notes: ''
    };

    tasks.unshift(task);
    elements.taskInput.value = '';
    elements.dueDateInput.value = '';
    
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
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        renderTasks();
        updateStats();
        showNotification('Task deleted', 'success');
    }
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
        dueDateEl.innerHTML = `<span class="${isOverdue ? 'overdue-text' : ''}">${formatFullDate(task.dueDate)}</span>`;
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
    closeDetailsModal();
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
    
    elements.editModal.classList.add('active');
}

function closeEditModal() {
    elements.editModal.classList.remove('active');
    editingTaskId = null;
}

function saveEditTask() {
    const task = tasks.find(t => t.id === editingTaskId);
    if (!task) return;

    task.text = document.getElementById('editTaskInput').value.trim();
    task.notes = document.getElementById('editTaskNotes').value.trim();
    task.priority = document.getElementById('editPrioritySelect').value;
    task.dueDate = document.getElementById('editDueDateInput').value;

    saveToLocalStorage();
    renderTasks();
    closeEditModal();
    showNotification('Task updated', 'success');
}

// Render Functions
function renderTasks() {
    let filteredTasks = filterTasks();
    filteredTasks = sortTasks(filteredTasks);

    elements.listContainer.innerHTML = '';

    if (filteredTasks.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.listContainer.style.display = 'none';
    } else {
        elements.emptyState.classList.add('hidden');
        elements.listContainer.style.display = 'block';

        filteredTasks.forEach(task => {
            const li = createTaskElement(task);
            elements.listContainer.appendChild(li);
        });
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
        
        dueDateSpan.innerHTML = `<i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}`;
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
        renderTasks();
    });

    // Add category buttons
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.dataset.category = category.id;
        btn.innerHTML = `<i class="fas fa-folder" style="color: ${category.color}"></i> ${category.name}`;
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = category.id;
            renderTasks();
        });
        elements.categoriesList.appendChild(btn);
    });

    // Update category select
    elements.categorySelect.innerHTML = '<option value="all">No Project</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        elements.categorySelect.appendChild(option);
    });
}

function openCategoryModal() {
    document.getElementById('categoryNameInput').value = '';
    document.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
    document.querySelector('.color-option').classList.add('selected');
    selectedColor = '#ff5945';
    elements.categoryModal.classList.add('active');
}

function closeCategoryModal() {
    elements.categoryModal.classList.remove('active');
}

function saveCategory() {
    const name = document.getElementById('categoryNameInput').value.trim();
    
    if (!name) {
        showNotification('Please enter a project name', 'error');
        return;
    }

    const category = {
        id: 'cat_' + Date.now(),
        name: name,
        color: selectedColor
    };

    categories.push(category);
    saveToLocalStorage();
    renderCategories();
    closeCategoryModal();
    showNotification('Project created', 'success');
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
function exportTasks() {
    const data = {
        tasks: tasks,
        categories: categories,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskmaster-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Tasks exported successfully', 'success');
}

function importTasks(e) {
    const file = e.target.files[0];
    if (!file) return;

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
            
            showNotification('Tasks imported successfully', 'success');
        } catch (error) {
            showNotification('Error importing file', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    e.target.value = '';
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dueDateInput.setAttribute('min', today);
    document.getElementById('editDueDateInput').setAttribute('min', today);
}

function showNotification(message, type = 'info') {
    // Simple console notification (can be enhanced with toast UI)
    console.log(`[${type.toUpperCase()}] ${message}`);
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