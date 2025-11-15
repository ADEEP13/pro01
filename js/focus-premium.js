/**
 * Focus Sessions - Premium Timer & Session Management
 * Handles circular timer, animations, and focus session logic
 */

class FocusSessionTimer {
    constructor(options = {}) {
        this.duration = options.duration || 90 * 60; // Default 90 minutes in seconds
        this.breakDuration = options.breakDuration || 5 * 60; // Default 5 minutes
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = this.duration;
        this.sessionMode = 'focus'; // 'focus' or 'break'
        this.interval = null;
        this.callbacks = {
            onTick: options.onTick || (() => {}),
            onComplete: options.onComplete || (() => {}),
            onBreakStart: options.onBreakStart || (() => {}),
            onBreakEnd: options.onBreakEnd || (() => {})
        };
        
        this.init();
    }

    init() {
        this.createTimerUI();
        this.attachEventListeners();
    }

    createTimerUI() {
        const timerContainer = document.getElementById('circularTimer');
        if (!timerContainer) return;

        const circumference = 2 * Math.PI * 130; // radius = 130
        
        const svg = `
            <svg width="280" height="280" viewBox="0 0 280 280">
                <!-- Background circle -->
                <circle cx="140" cy="140" r="130" fill="none" stroke="#e5e7eb" stroke-width="8"/>
                
                <!-- Progress circle -->
                <circle 
                    class="circular-timer-circle" 
                    cx="140" 
                    cy="140" 
                    r="130" 
                    fill="none" 
                    stroke="url(#gradientTimer)" 
                    stroke-width="8"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${circumference}"
                    stroke-linecap="round"
                />
                
                <!-- Gradient definition -->
                <defs>
                    <linearGradient id="gradientTimer" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#0066cc;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#00d4ff;stop-opacity:1" />
                    </linearGradient>
                </defs>
            </svg>
            
            <div class="circular-timer-content">
                <div class="timer-display" id="timerDisplay">90:00</div>
                <div class="timer-label" id="timerLabel">Focus Time</div>
            </div>
        `;

        timerContainer.innerHTML = svg;
        this.circumference = circumference;
    }

    attachEventListeners() {
        const startBtn = document.getElementById('startSessionBtn');
        const pauseBtn = document.getElementById('pauseSessionBtn');
        const resetBtn = document.getElementById('resetSessionBtn');

        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
    }

    start() {
        if (this.isRunning && !this.isPaused) return;

        this.isRunning = true;
        this.isPaused = false;

        // Show timer section
        const timerSection = document.getElementById('timerSection');
        if (timerSection) {
            timerSection.classList.remove('hidden');
            // Scroll to timer
            timerSection.scrollIntoView({ behavior: 'smooth' });
        }

        this.updateUI();
        this.interval = setInterval(() => this.tick(), 1000);

        // Add animation to timer
        document.getElementById('circularTimer')?.classList.add('session-active');
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearInterval(this.interval);
            document.getElementById('circularTimer')?.classList.remove('session-active');
        } else {
            this.interval = setInterval(() => this.tick(), 1000);
            document.getElementById('circularTimer')?.classList.add('session-active');
        }
    }

    tick() {
        if (this.timeRemaining > 0) {
            this.timeRemaining--;
            this.updateUI();
            this.callbacks.onTick(this.timeRemaining, this.sessionMode);
        } else {
            this.completeSession();
        }
    }

    completeSession() {
        clearInterval(this.interval);
        document.getElementById('circularTimer')?.classList.remove('session-active');

        if (this.sessionMode === 'focus') {
            this.startBreak();
        } else {
            this.isRunning = false;
            this.callbacks.onComplete();
            this.showCompletionNotification();
        }
    }

    startBreak() {
        this.sessionMode = 'break';
        this.timeRemaining = this.breakDuration;
        this.callbacks.onBreakStart();
        
        // Update label
        document.getElementById('timerLabel').textContent = 'Break Time';
        
        // Continue timer
        this.interval = setInterval(() => this.tick(), 1000);
    }

    updateUI() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const displayEl = document.getElementById('timerDisplay');
        if (displayEl) {
            displayEl.textContent = display;
        }

        // Update circular progress
        const progress = 1 - (this.timeRemaining / (this.sessionMode === 'focus' ? this.duration : this.breakDuration));
        const circle = document.querySelector('.circular-timer-circle');
        if (circle && this.circumference) {
            const offset = this.circumference - (progress * this.circumference);
            circle.style.strokeDashoffset = offset;
        }
    }

    stop() {
        clearInterval(this.interval);
        this.isRunning = false;
        this.isPaused = false;
        this.sessionMode = 'focus';
        this.timeRemaining = this.duration;
        this.updateUI();
        document.getElementById('circularTimer')?.classList.remove('session-active');
        
        // Hide timer section
        const timerSection = document.getElementById('timerSection');
        if (timerSection) {
            timerSection.classList.add('hidden');
        }
    }

    reset() {
        this.stop();
    }

    showCompletionNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg fade-in-animate z-50';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                    <p class="font-semibold">Focus Session Complete! 🎉</p>
                    <p class="text-sm opacity-90">Great work! You've completed your focus session.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    setDuration(minutes) {
        this.duration = minutes * 60;
        this.timeRemaining = this.duration;
        this.updateUI();
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            timeRemaining: this.timeRemaining,
            sessionMode: this.sessionMode,
            display: `${Math.floor(this.timeRemaining / 60)}:${String(this.timeRemaining % 60).padStart(2, '0')}`
        };
    }
}

// App Blocking Manager
class AppBlockingManager {
    constructor() {
        this.blockedApps = new Set();
        this.isBlocking = false;
        this.defaultApps = ['Social Media', 'Gaming', 'Entertainment'];
        this.init();
    }

    init() {
        this.loadBlockedApps();
        this.renderApps();
        this.attachEventListeners();
    }

    loadBlockedApps() {
        const saved = localStorage.getItem('focusBlockedApps');
        if (saved) {
            this.blockedApps = new Set(JSON.parse(saved));
        } else {
            // Set defaults
            this.defaultApps.forEach(app => this.blockedApps.add(app));
            this.saveBlockedApps();
        }
    }

    saveBlockedApps() {
        localStorage.setItem('focusBlockedApps', JSON.stringify(Array.from(this.blockedApps)));
    }

    renderApps() {
        const container = document.getElementById('blockedAppsContainer');
        const addBtn = document.getElementById('addBlockedAppBtn');
        if (!container) return;

        const html = Array.from(this.blockedApps).map(appName => `
            <div class="app-block-item flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-sm">📦</div>
                    <span class="text-sm text-text-primary font-medium">${appName}</span>
                </div>
                <button class="remove-app-btn text-error hover:text-red-700 transition-colors" data-app="${appName}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');

        container.innerHTML = html;

        // Attach remove listeners
        container.querySelectorAll('.remove-app-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.blockedApps.delete(appName);
                this.saveBlockedApps();
                this.renderApps();
            });
        });

        // Attach add listener
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const appName = prompt('Enter the name of the application to block:');
                if (appName && appName.trim()) {
                    this.blockedApps.add(appName.trim());
                    this.saveBlockedApps();
                    this.renderApps();
                }
            });
        }
    }

    toggleApp(appName) {
        if (this.blockedApps.has(appName)) {
            this.blockedApps.delete(appName);
        } else {
            this.blockedApps.add(appName);
        }
        this.saveBlockedApps();
    }

    attachEventListeners() {
        // Additional event listeners if needed
    }

    startBlocking() {
        this.isBlocking = true;
        console.log('🚫 App blocking started:', Array.from(this.blockedApps));
    }

    stopBlocking() {
        this.isBlocking = false;
        console.log('✅ App blocking stopped');
    }
}

// Break Activities Manager
class BreakActivityManager {
    constructor() {
        this.activities = [
            { emoji: '🚶', name: 'Walk Around', description: 'Take a short walk to refresh' },
            { emoji: '💧', name: 'Drink Water', description: 'Stay hydrated' },
            { emoji: '🧘', name: 'Meditate', description: '5 minutes of mindfulness' },
            { emoji: '👀', name: 'Eye Exercise', description: 'Look away from screen' },
            { emoji: '🤸', name: 'Stretch', description: 'Quick body stretches' },
            { emoji: '☕', name: 'Coffee Break', description: 'Grab a beverage' },
            { emoji: '🎵', name: 'Listen Music', description: 'Enjoy some music' },
            { emoji: '📱', name: 'Check Phone', description: 'Catch up on messages' }
        ];
        this.init();
    }

    init() {
        this.renderActivities();
    }

    renderActivities() {
        const container = document.getElementById('breakActivitiesGrid');
        if (!container) return;

        const html = this.activities.map((activity, idx) => `
            <div class="break-activity-card cursor-pointer" 
                 style="animation-delay: ${idx * 50}ms;" 
                 title="${activity.description}">
                <div class="break-icon">
                    ${activity.emoji}
                </div>
                <h3 class="font-semibold text-text-primary text-center text-sm">${activity.name}</h3>
            </div>
        `).join('');

        container.innerHTML = html;
    }
}

// Calendar Integration Manager
class CalendarIntegrationManager {
    constructor() {
        this.events = [];
        this.init();
    }

    init() {
        this.loadEvents();
        this.renderCalendar();
    }

    loadEvents() {
        // Sample calendar events
        this.events = [
            { title: 'Team Meeting', time: '10:00 AM', status: 'blocked' },
            { title: 'Lunch Break', time: '12:00 PM', status: 'blocked' },
            { title: 'Project Review', time: '2:00 PM', status: 'blocked' },
            { title: 'Deep Work Available', time: '3:00 PM', status: 'available' }
        ];
    }

    renderCalendar() {
        const container = document.getElementById('calendarEventsList');
        if (!container) return;

        const html = this.events.map(event => `
            <div class="calendar-event p-4 mb-3 flex items-center justify-between 
                ${event.status === 'available' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}">
                <div>
                    <p class="font-medium text-text-primary">${event.title}</p>
                    <p class="text-sm text-text-secondary">${event.time}</p>
                </div>
                <span class="text-xs font-semibold px-3 py-1 rounded-full 
                    ${event.status === 'available' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                    ${event.status === 'available' ? 'Available' : 'Blocked'}
                </span>
            </div>
        `).join('');

        container.innerHTML = html;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Session type durations
    const sessionTypes = {
        'Deep Focus': 90 * 60,
        'Creative Work': 75 * 60,
        'Admin Tasks': 45 * 60
    };

    // Initialize timer with default Deep Focus
    window.focusTimer = new FocusSessionTimer({
        duration: sessionTypes['Deep Focus'],
        breakDuration: 5 * 60,
        onTick: (remaining, mode) => {
            console.log(`[${mode}] ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`);
        },
        onComplete: () => {
            console.log('✅ Session complete!');
        },
        onBreakStart: () => {
            console.log('☕ Break time started!');
        }
    });

    // Handle session type selection
    const sessionTypeButtons = document.querySelectorAll('.session-type-btn');
    sessionTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            sessionTypeButtons.forEach(b => b.classList.remove('active', 'border-primary', 'border-secondary', 'border-orange-500', 'bg-primary-50'));
            
            // Add active class to clicked
            btn.classList.add('active', 'border-primary', 'bg-primary-50');
            
            // Get session type name
            const sessionName = btn.querySelector('.font-medium')?.textContent || 'Deep Focus';
            const duration = sessionTypes[sessionName] || sessionTypes['Deep Focus'];
            
            // Update timer duration
            window.focusTimer.duration = duration;
            window.focusTimer.timeRemaining = duration;
            window.focusTimer.updateUI();
            
            console.log(`✅ Session type changed to: ${sessionName} (${Math.floor(duration / 60)} minutes)`);
        });
    });

    // Handle Start Session button
    const startBtn = document.getElementById('startSessionBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            window.focusTimer.start();
        });
    }

    // Initialize app blocking
    window.appBlocker = new AppBlockingManager();

    // Initialize break activities
    window.breakActivities = new BreakActivityManager();

    // Initialize calendar
    window.calendarManager = new CalendarIntegrationManager();

    console.log('✅ Focus Sessions Premium Features Initialized');
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FocusSessionTimer, AppBlockingManager, BreakActivityManager, CalendarIntegrationManager };
}
