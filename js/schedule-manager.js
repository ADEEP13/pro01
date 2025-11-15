/**
 * Schedule Manager - Handle calendar events and scheduling
 * Manages event creation, editing, and deletion with localStorage persistence
 */

class ScheduleManager {
    constructor() {
        this.events = [];
        this.categories = ['Work', 'Focus', 'Personal'];
        this.categoryColors = {
            'Work': 'primary',
            'Focus': 'secondary',
            'Personal': 'accent'
        };
        this.init();
    }

    init() {
        this.loadEvents();
        this.attachEventListeners();
        this.renderEventButtons();
        this.renderAllExistingEvents();
    }

    renderAllExistingEvents() {
        // Render all stored events in their respective cells
        this.events.forEach(event => {
            if (event.timeSlot && event.dayIndex !== undefined) {
                const cell = document.querySelector(`[data-time-slot="${event.timeSlot}"][data-dayIndex="${event.dayIndex}"]`);
                if (cell && cell.innerHTML.trim() === '') {
                    // Only render if cell is empty
                    this.renderEventInCell(event.dayIndex, event.timeSlot, event);
                }
            }
        });
    }

    loadEvents() {
        const saved = localStorage.getItem('scheduleEvents');
        if (saved) {
            this.events = JSON.parse(saved);
        } else {
            // Initialize with sample events
            this.events = [
                {
                    id: 'evt_1',
                    day: 'Tue', // Nov 5
                    dayIndex: 1,
                    date: '2025-11-05',
                    timeSlot: '10:00 AM',
                    startTime: '10:30 AM',
                    endTime: '11:30 AM',
                    title: 'Code Review',
                    category: 'Work',
                    description: 'Team code review session'
                },
                {
                    id: 'evt_2',
                    day: 'Sun', // Nov 9
                    dayIndex: 6,
                    date: '2025-11-09',
                    timeSlot: '10:00 AM',
                    startTime: '10:00 AM',
                    endTime: '11:30 AM',
                    title: 'Personal Project',
                    category: 'Personal',
                    description: 'Work on personal project'
                }
            ];
            this.saveEvents();
        }
    }

    saveEvents() {
        localStorage.setItem('scheduleEvents', JSON.stringify(this.events));
    }

    attachEventListeners() {
        // Attach click listeners to all empty calendar cells
        document.querySelectorAll('[data-time-slot]').forEach(cell => {
            cell.addEventListener('click', (e) => {
                if (e.target.closest('.event-box')) return; // Don't trigger if clicking existing event
                this.openAddEventModal(e.currentTarget);
            });
        });

        // Attach click listeners to "Add Event" button
        const addEventBtn = document.querySelector('button:has(svg[viewBox="0 0 24 24"]):has-text("Add Event")');
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.openAddEventModal());
        }
    }

    renderEventButtons() {
        // Find all time slot cells and add click handlers
        document.querySelectorAll('[data-time-slot]').forEach(cell => {
            cell.addEventListener('dblclick', () => this.openAddEventModal(cell));
        });
    }

    openAddEventModal(cell = null) {
        const modal = this.createEventModal(cell);
        document.body.appendChild(modal);
        modal.showModal?.() || this.showAsOverlay(modal);
    }

    createEventModal(cell) {
        const dialog = document.createElement('dialog');
        dialog.className = 'schedule-event-modal';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 2rem;
            border-radius: 12px;
            background: white;
            border: none;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            width: 90%;
            max-width: 500px;
        `;

        const dayIndex = cell?.dataset?.dayIndex || 0;
        const timeSlot = cell?.dataset?.timeSlot || '09:00 AM';

        dialog.innerHTML = `
            <div style="position: relative;">
                <button type="button" style="
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: #ef5350;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.3s;
                " class="close-modal">×</button>

                <h2 style="margin: 0 0 1.5rem 0; color: #1a202c; font-size: 1.5rem; font-weight: bold;">Add Event</h2>
                
                <form style="display: flex; flex-direction: column; gap: 1.25rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748;">Event Title</label>
                        <input type="text" placeholder="e.g., Team Meeting" style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 6px;
                            font-size: 1rem;
                            font-family: inherit;
                            transition: border-color 0.3s;
                        " class="event-title" />
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748;">Category</label>
                        <select style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 6px;
                            font-size: 1rem;
                            font-family: inherit;
                            cursor: pointer;
                            transition: border-color 0.3s;
                        " class="event-category">
                            <option value="Work">Work</option>
                            <option value="Focus">Focus</option>
                            <option value="Personal">Personal</option>
                        </select>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748;">Start Time</label>
                            <input type="time" value="10:00" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e2e8f0;
                                border-radius: 6px;
                                font-size: 1rem;
                                font-family: inherit;
                                transition: border-color 0.3s;
                            " class="event-start-time" />
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748;">End Time</label>
                            <input type="time" value="11:00" style="
                                width: 100%;
                                padding: 0.75rem;
                                border: 2px solid #e2e8f0;
                                border-radius: 6px;
                                font-size: 1rem;
                                font-family: inherit;
                                transition: border-color 0.3s;
                            " class="event-end-time" />
                        </div>
                    </div>

                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #2d3748;">Description (Optional)</label>
                        <textarea placeholder="Add event details..." style="
                            width: 100%;
                            padding: 0.75rem;
                            border: 2px solid #e2e8f0;
                            border-radius: 6px;
                            font-size: 1rem;
                            font-family: inherit;
                            resize: vertical;
                            min-height: 80px;
                            transition: border-color 0.3s;
                        " class="event-description"></textarea>
                    </div>

                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button type="button" class="close-modal" style="
                            flex: 1;
                            padding: 0.75rem;
                            background: #f0f2f5;
                            color: #2d3748;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background 0.3s;
                        ">Cancel</button>
                        <button type="submit" style="
                            flex: 1;
                            padding: 0.75rem;
                            background: #0066cc;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background 0.3s;
                        ">Add Event</button>
                    </div>
                </form>
            </div>
        `;

        const closeButtons = dialog.querySelectorAll('.close-modal');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModal(dialog));
        });

        dialog.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            const timeSlot = cell?.dataset?.timeSlot || null;
            this.saveNewEvent(dialog, dayIndex, timeSlot);
            this.closeModal(dialog);
        });

        return dialog;
    }

    closeModal(dialog) {
        dialog.close?.() || dialog.remove();
    }

    showAsOverlay(dialog) {
        // Fallback for browsers without dialog support
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
        `;
        backdrop.addEventListener('click', () => {
            backdrop.remove();
            dialog.remove();
        });
        document.body.appendChild(backdrop);
        document.body.appendChild(dialog);
    }

    saveNewEvent(dialog, dayIndex, timeSlot = null) {
        const title = dialog.querySelector('.event-title').value;
        const category = dialog.querySelector('.event-category').value;
        const startTime = dialog.querySelector('.event-start-time').value;
        const endTime = dialog.querySelector('.event-end-time').value;
        const description = dialog.querySelector('.event-description').value;

        if (!title) {
            alert('Please enter an event title');
            return;
        }

        const event = {
            id: `evt_${Date.now()}`,
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIndex],
            dayIndex: dayIndex,
            date: this.getDateForDay(dayIndex),
            timeSlot: timeSlot,
            startTime: this.formatTime(startTime),
            endTime: this.formatTime(endTime),
            title: title,
            category: category,
            description: description
        };

        this.events.push(event);
        this.saveEvents();
        
        // Render event in the specific cell instead of reloading
        this.renderEventInCell(dayIndex, timeSlot, event);
    }

    renderEventInCell(dayIndex, timeSlot, event) {
        if (!timeSlot) {
            location.reload();
            return;
        }

        // Find the specific cell
        const cell = document.querySelector(`[data-time-slot="${timeSlot}"][data-dayIndex="${dayIndex}"]`);
        if (!cell) {
            location.reload();
            return;
        }

        // Get category color
        const colorClass = this.categoryColors[event.category] || 'primary';
        const bgClass = `bg-${colorClass}-100`;
        const borderClass = `border-${colorClass}-300`;
        const textClass = `text-${colorClass}-800`;
        const subTextClass = `text-${colorClass}-600`;

        // Create event box
        const eventBox = document.createElement('div');
        eventBox.className = `absolute inset-1 ${bgClass} border ${borderClass} rounded p-2 cursor-pointer hover:shadow-subtle transition-shadow event-box`;
        eventBox.dataset.eventId = event.id;
        eventBox.innerHTML = `
            <div class="text-xs font-medium ${textClass}">${event.title}</div>
            <div class="text-xs ${subTextClass}">${event.startTime} - ${event.endTime}</div>
        `;

        // Clear existing content and add event
        cell.innerHTML = '';
        cell.appendChild(eventBox);

        // Add right-click delete functionality
        eventBox.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (confirm('Delete this event?')) {
                this.deleteEvent(event.id);
            }
        });
    }

    formatTime(timeString) {
        if (!timeString) return '10:00 AM';
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    getDateForDay(dayIndex) {
        const baseDate = new Date(2025, 10, 4); // November 4, 2025 (Monday)
        const date = new Date(baseDate);
        date.setDate(date.getDate() + dayIndex);
        return date.toISOString().split('T')[0];
    }

    deleteEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        
        // Remove event from cell without reloading
        if (event && event.timeSlot && event.dayIndex !== undefined) {
            const cell = document.querySelector(`[data-time-slot="${event.timeSlot}"][data-dayIndex="${event.dayIndex}"]`);
            if (cell) {
                cell.innerHTML = '';
            }
        }
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const newTitle = prompt('Edit event title:', event.title);
        if (newTitle !== null) {
            event.title = newTitle;
            this.saveEvents();
            location.reload();
        }
    }
}

// Initialize Schedule Manager on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleManager = new ScheduleManager();
    
    // Also initialize existing event click handlers
    document.querySelectorAll('.event-box').forEach(box => {
        box.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const eventId = box.dataset.eventId;
            if (confirm('Delete this event?')) {
                window.scheduleManager.deleteEvent(eventId);
            }
        });
    });
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ScheduleManager };
}
