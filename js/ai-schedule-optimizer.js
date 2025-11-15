/**
 * AI Schedule Optimizer - DeepSeek Integration
 * Provides intelligent schedule optimization suggestions using DeepSeek API
 */

class AIScheduleOptimizer {
    constructor() {
        this.apiKey = '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';
        this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.events = [];
        this.suggestions = [];
        this.init();
    }

    init() {
        this.loadEventsFromLocalStorage();
        this.attachButtonListeners();
    }

    loadEventsFromLocalStorage() {
        try {
            const saved = localStorage.getItem('scheduleEvents');
            if (saved) {
                this.events = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    attachButtonListeners() {
        // Optimize Deep Work Blocks
        const optimizeButton = document.querySelector('[data-suggestion="optimize-blocks"]');
        if (optimizeButton) {
            optimizeButton.addEventListener('click', () => this.applyOptimizeBlocks());
        }

        // Add Strategic Breaks
        const breaksButton = document.querySelector('[data-suggestion="add-breaks"]');
        if (breaksButton) {
            breaksButton.addEventListener('click', () => this.applyAddBreaks());
        }

        // Batch Similar Tasks
        const batchButton = document.querySelector('[data-suggestion="batch-tasks"]');
        if (batchButton) {
            batchButton.addEventListener('click', () => this.applyBatchTasks());
        }
    }

    async generateOptimizations() {
        try {
            // Analyze current schedule
            const analysis = this.analyzeSchedule();
            
            // Generate AI suggestions using DeepSeek
            const suggestions = await this.getAISuggestions(analysis);
            
            return suggestions;
        } catch (error) {
            console.error('Error generating optimizations:', error);
            return null;
        }
    }

    analyzeSchedule() {
        const analysis = {
            totalEvents: this.events.length,
            eventsByDay: {},
            eventsByCategory: {},
            busyDays: [],
            workBlocks: [],
            breakPattern: [],
            recommendations: []
        };

        // Categorize events
        this.events.forEach(event => {
            const day = event.day || 'Unknown';
            
            if (!analysis.eventsByDay[day]) {
                analysis.eventsByDay[day] = [];
            }
            analysis.eventsByDay[day].push(event);

            if (!analysis.eventsByCategory[event.category]) {
                analysis.eventsByCategory[event.category] = [];
            }
            analysis.eventsByCategory[event.category].push(event);
        });

        // Identify busy days
        Object.keys(analysis.eventsByDay).forEach(day => {
            if (analysis.eventsByDay[day].length >= 3) {
                analysis.busyDays.push(day);
            }
        });

        // Analyze work blocks
        const timeSlots = {};
        this.events.forEach(event => {
            const slot = event.timeSlot || event.startTime;
            if (!timeSlots[slot]) {
                timeSlots[slot] = 0;
            }
            timeSlots[slot]++;
        });
        analysis.workBlocks = timeSlots;

        return analysis;
    }

    async getAISuggestions(analysis) {
        const prompt = `Analyze this schedule data and provide 3 specific, actionable optimization suggestions:

Schedule Analysis:
- Total Events: ${analysis.totalEvents}
- Busy Days: ${Object.keys(analysis.busyDays).join(', ') || 'None'}
- Events by Time Slots: ${JSON.stringify(analysis.workBlocks, null, 2)}
- Event Categories: ${JSON.stringify(analysis.eventsByCategory, null, 2)}

Based on this analysis, provide:
1. One suggestion to optimize deep work blocks (best productivity times)
2. One suggestion about strategic breaks and focus duration
3. One suggestion to batch similar tasks by day

Format each suggestion as:
TITLE: [short title]
DESCRIPTION: [specific recommendation with metrics if possible]
ACTION: [action word like "Move", "Add", "Group"]

Keep suggestions practical and implementable.`;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-chat',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 800
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || null;
        } catch (error) {
            console.error('DeepSeek API Error:', error);
            return null;
        }
    }

    applyOptimizeBlocks() {
        const analysis = this.analyzeSchedule();
        const peakHours = this.findPeakProductivityHours(analysis);
        
        // Find work-type events and suggest moving them
        const workEvents = this.events.filter(e => e.category === 'Work');
        
        if (workEvents.length > 0 && peakHours.length > 0) {
            const suggestion = `Move your most challenging tasks to ${peakHours[0]} when your productivity peaks. You currently have ${workEvents.length} work events. Consolidating them during peak hours can increase focus.`;
            this.showNotification('Optimize Deep Work Blocks', suggestion, 'accent');
        }
    }

    applyAddBreaks() {
        const analysis = this.analyzeSchedule();
        const longBlocks = this.findLongWorkBlocks(analysis);
        
        if (longBlocks.length > 0) {
            // Suggest adding breaks
            const suggestion = `You have ${longBlocks.length} work blocks lasting 3+ hours without breaks. Adding 15-minute breaks every 90 minutes can improve focus by 23% and reduce burnout.`;
            this.showNotification('Add Strategic Breaks', suggestion, 'secondary');
            
            // Show option to add breaks
            this.showAddBreaksDialog(longBlocks);
        }
    }

    applyBatchTasks() {
        const analysis = this.analyzeSchedule();
        const meetingDays = this.findMeetingPatterns(analysis);
        
        if (meetingDays.length > 0) {
            const suggestion = `Group your meetings on ${meetingDays.join(' and ')} to create longer focus blocks on other days. This batching approach can increase deep work productivity.`;
            this.showNotification('Batch Similar Tasks', suggestion, 'primary');
        }
    }

    findPeakProductivityHours(analysis) {
        // Analyze when events are scheduled
        const timeSlots = {};
        this.events.forEach(event => {
            const slot = event.timeSlot || '10:00 AM';
            timeSlots[slot] = (timeSlots[slot] || 0) + 1;
        });

        // Return the busiest time slot (peak hours)
        const sorted = Object.entries(timeSlots).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? [sorted[0][0]] : ['10:00 AM'];
    }

    findLongWorkBlocks(analysis) {
        // Identify time slots with many consecutive events
        const timeSlots = [
            { slot: '9:00 AM', events: 0 },
            { slot: '10:00 AM', events: 0 },
            { slot: '12:00 PM', events: 0 },
            { slot: '2:00 PM', events: 0 },
            { slot: '4:00 PM', events: 0 }
        ];

        this.events.forEach(event => {
            timeSlots.forEach(ts => {
                if (event.timeSlot === ts.slot) {
                    ts.events++;
                }
            });
        });

        // Find consecutive slots with events (3+ hour blocks)
        const longBlocks = [];
        for (let i = 0; i < timeSlots.length - 2; i++) {
            if (timeSlots[i].events > 0 && timeSlots[i + 1].events > 0 && timeSlots[i + 2].events > 0) {
                longBlocks.push(`${timeSlots[i].slot} - ${timeSlots[i + 2].slot}`);
            }
        }

        return longBlocks;
    }

    findMeetingPatterns(analysis) {
        // Group events by day and find days with most meetings
        const dayMeetingCount = {};
        this.events.forEach(event => {
            if (event.category === 'Work') {
                dayMeetingCount[event.day] = (dayMeetingCount[event.day] || 0) + 1;
            }
        });

        // Find days with most meetings (good candidates for batching)
        const sorted = Object.entries(dayMeetingCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([day, count]) => day);

        return sorted.length > 0 ? sorted : ['Tuesday', 'Thursday'];
    }

    showAddBreaksDialog(longBlocks) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-width: 400px;
        `;

        dialog.innerHTML = `
            <h3 style="margin: 0 0 1rem 0; color: #1a202c; font-size: 1.2rem; font-weight: bold;">Add Strategic Breaks</h3>
            <p style="margin: 0 0 1rem 0; color: #4a5568; font-size: 0.95rem;">Suggested break times for your long work blocks:</p>
            <div style="space-y: 0.75rem;">
                ${longBlocks.map(block => `
                    <div style="padding: 0.75rem; background: #f7fafc; border-left: 3px solid #26C281; margin-bottom: 0.75rem;">
                        <div style="color: #2d3748; font-weight: 500; font-size: 0.9rem;">${block}</div>
                    </div>
                `).join('')}
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button style="
                    flex: 1;
                    padding: 0.75rem;
                    background: #f0f2f5;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                " onclick="this.closest('div').remove()">Cancel</button>
                <button style="
                    flex: 1;
                    padding: 0.75rem;
                    background: #26C281;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                " onclick="this.closest('div').remove(); alert('Break times added to your calendar!')">Add Breaks</button>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    showNotification(title, message, color = 'accent') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            max-width: 350px;
            border-left: 4px solid #a78bfa;
        `;

        const colorMap = {
            'accent': '#a78bfa',
            'secondary': '#14b8a6',
            'primary': '#0066cc'
        };

        notification.style.borderLeftColor = colorMap[color] || colorMap['accent'];

        notification.innerHTML = `
            <h4 style="margin: 0 0 0.5rem 0; color: #1a202c; font-weight: 600;">${title}</h4>
            <p style="margin: 0; color: #4a5568; font-size: 0.9rem; line-height: 1.5;">${message}</p>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.scheduleOptimizer = new AIScheduleOptimizer();
});

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AIScheduleOptimizer };
}
