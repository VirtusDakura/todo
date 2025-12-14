# TaskMaster Pro - Advanced To-Do List Application

A modern, feature-rich task management application built with vanilla JavaScript, HTML5, and CSS3. TaskMaster Pro goes beyond basic to-do lists with powerful features designed for productivity and scalability.

![TaskMaster Pro](https://img.shields.io/badge/version-2.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Key Features

### Core Functionality
- ✅ **Smart Task Management** - Create, edit, complete, and delete tasks with ease
- 🎯 **Priority Levels** - Organize tasks by Low, Medium, or High priority
- 📅 **Due Dates** - Set deadlines and track overdue tasks
- 📁 **Project Categories** - Group tasks into custom projects with color coding
- 🔍 **Advanced Search** - Find tasks instantly with real-time search
- 🎨 **Dark Mode** - Eye-friendly dark theme with persistent settings

### Advanced Features
- 📊 **Statistics Dashboard** - Track completion rates and task metrics
- 🔄 **Drag & Drop** - Reorder tasks with intuitive drag-and-drop
- 🎭 **Smart Filtering** - Filter by status (All, Active, Completed)
- 🔀 **Multiple Sort Options** - Sort by priority, due date, or alphabetically
- 💾 **Data Persistence** - All data saved locally in browser
- 📤 **Export/Import** - Backup and restore tasks as JSON files
- ✏️ **Task Notes** - Add detailed notes to any task
- 🎨 **Color-Coded Projects** - Visual organization with custom colors
- ⚡ **Smooth Animations** - Modern transitions and effects
- 📱 **Fully Responsive** - Works perfectly on all devices

## 🎯 Use Cases

- **Personal Task Management** - Daily to-do lists and personal goals
- **Project Planning** - Organize multiple projects simultaneously
- **Team Collaboration** - Share exported task lists with teammates
- **Academic Planning** - Track assignments with due dates and priorities
- **Goal Tracking** - Monitor completion rates and progress

## 🛠️ Technologies Used

- **HTML5** - Semantic markup and modern structure
- **CSS3** - Advanced styling with CSS Variables, Grid, and Flexbox
- **JavaScript (ES6+)** - Modern vanilla JS with:
  - Arrow functions
  - Template literals
  - Destructuring
  - Array methods (map, filter, sort)
  - Local Storage API
  - Drag and Drop API
  - FileReader API
- **Font Awesome 6** - Icon library for UI elements

## 📦 Installation & Setup

1. **Clone or Download** the repository
2. **Open `ToDoList.html`** in any modern web browser
3. **Start managing tasks!** No build process or dependencies required

```bash
# If using git
git clone [repository-url]
cd todo

# Open in browser
# Windows
start ToDoList.html

# macOS
open ToDoList.html

# Linux
xdg-open ToDoList.html
```

## 💡 How to Use

### Adding Tasks
1. Type your task in the input field
2. Select priority level (Low/Medium/High)
3. Optionally set a due date
4. Choose a project category (or create a new one)
5. Click "Add" or press Enter

### Managing Tasks
- **Complete**: Click the checkbox to mark as done
- **Edit**: Click the edit icon to modify task details
- **Delete**: Click the trash icon to remove
- **Reorder**: Drag and drop tasks to rearrange

### Creating Projects
1. Click "New Project" button
2. Enter project name
3. Choose a color
4. Click "Create Project"

### Using Filters & Search
- **Search Bar**: Type to filter tasks in real-time
- **Filter Buttons**: Show All, Active, or Completed tasks
- **Sort Dropdown**: Organize by priority, date, or alphabetically
- **Project Tabs**: Filter tasks by specific projects

### Statistics
- Click the chart icon to view your productivity stats
- See total, completed, pending tasks, and completion rate

### Dark Mode
- Click the moon/sun icon to toggle dark mode
- Your preference is saved automatically

### Export/Import
- **Export**: Click download icon to save tasks as JSON
- **Import**: Click upload icon to restore from backup

## 🎨 Customization

### Color Schemes
Edit CSS variables in `ToDoList.css`:
```css
:root {
    --primary-color: #ff5945;
    --secondary-color: #153677;
    --accent-color: #4e085f;
    /* Customize colors here */
}
```

### Priority Colors
Modify priority badge colors:
```css
.task-priority.high { color: #f44336; }
.task-priority.medium { color: #FF9800; }
.task-priority.low { color: #4CAF50; }
```

## 📊 Data Structure

Tasks are stored as JSON objects:
```json
{
  "id": 1234567890,
  "text": "Task description",
  "completed": false,
  "priority": "high",
  "dueDate": "2025-12-31",
  "category": "cat_123",
  "createdAt": "2025-12-08T10:00:00.000Z",
  "notes": "Additional notes"
}
```

## 🔐 Privacy & Security

- **100% Client-Side** - No server, no tracking
- **Local Storage Only** - Data stays on your device
- **No Analytics** - Complete privacy
- **Offline Support** - Works without internet

## 🚀 Future Enhancements

Potential features for scaling:
- [ ] Subtasks/Checklist within tasks
- [ ] Task recurring/repeat functionality
- [ ] Tags and labels system
- [ ] Time tracking and pomodoro timer
- [ ] Calendar view integration
- [ ] Collaboration features (when paired with backend)
- [ ] Mobile app version (PWA)
- [ ] Cloud sync with authentication
- [ ] Task templates
- [ ] Advanced analytics and insights

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ IE11 (limited support)

## 📁 File Structure

```
todo/
├── ToDoList.html      # Main HTML structure
├── ToDoList.css       # Styles and themes
├── ToDoList.js        # Application logic
└── README.md          # Documentation
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Development

Built with ❤️ using vanilla JavaScript - no frameworks, no dependencies, pure performance.

---

For questions or feedback, please open an issue in the repository.
