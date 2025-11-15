// Analytics Integration Guide
// How to use real-time tracking data in your analytics pages

## QUICK INTEGRATION

### On analytics.html, add this to your script:

```javascript
import { initRealtimeListeners } from '../js/listeners.js';

// Initialize real-time updates
initRealtimeListeners();

// Listen for data updates
window.addEventListener('usageUpdated', (event) => {
  const data = event.detail;
  console.log('New analytics data:', data);
  
  // Update your analytics visualizations here
  updateCharts(data);
});

function updateCharts(data) {
  // data contains:
  // - totalScreenTime: minutes
  // - numberOfWebsites: count
  // - websiteTimeBreakdown: { "site": minutes, ... }
  // - date: YYYY-MM-DD
  // - userId: string
  
  // Example: Update total time
  document.getElementById('analyticsTotalTime').textContent = 
    formatMinutes(data.totalScreenTime);
  
  // Example: Update website count
  document.getElementById('numberOfWebsites').textContent = 
    data.numberOfWebsites;
  
  // Example: Draw chart
  drawWebsiteChart(data.websiteTimeBreakdown);
}
```

---

## DISPLAYING WEBSITE BREAKDOWN

```html
<!-- HTML for website list -->
<div id="websiteList">
  <!-- Populated by JavaScript -->
</div>

<script>
function updateWebsiteList(websiteBreakdown) {
  const container = document.getElementById('websiteList');
  
  const items = Object.entries(websiteBreakdown)
    .sort((a, b) => b[1] - a[1]) // Sort by time descending
    .map(([site, minutes]) => `
      <div class="website-item">
        <span class="website-name">${site}</span>
        <div class="progress-bar">
          <div class="progress" style="width: ${(minutes/totals)*100}%"></div>
        </div>
        <span class="website-time">${minutes}m</span>
      </div>
    `).join('');
  
  container.innerHTML = items;
}
</script>
```

---

## AVAILABLE DATA FROM FIREBASE

Each daily document in Firebase contains:

```javascript
{
  userId: "user_abc123",
  date: "2025-11-14",
  
  // Total screen time in minutes
  totalScreenTime: 480,
  
  // Number of unique websites
  numberOfWebsites: 12,
  
  // Breakdown by website (in minutes)
  websiteTimeBreakdown: {
    "google.com": 120,
    "github.com": 90,
    "stackoverflow.com": 60,
    "youtube.com": 150,
    "twitter.com": 45,
    "localhost": 15
  },
  
  // Timestamps
  lastActive: Timestamp,
  updatedAt: Timestamp
}
```

---

## QUERYING HISTORICAL DATA

### Get today's data (real-time):
```javascript
import { db } from './firebase-config.js';
import { doc, onSnapshot } from "firebase/firestore";

const userId = localStorage.getItem('detox_user_id');
const today = new Date().toISOString().slice(0, 10);
const docId = `${userId}_${today}`;

const unsub = onSnapshot(doc(db, 'usage', docId), (snap) => {
  if (snap.exists()) {
    console.log('Today:', snap.data());
  }
});
```

### Get specific date's data:
```javascript
async function getDateData(userId, date) {
  // date format: "2025-11-14"
  const docId = `${userId}_${date}`;
  const snap = await getDoc(doc(db, 'usage', docId));
  return snap.exists() ? snap.data() : null;
}

// Usage
const data = await getDateData(userId, "2025-11-13");
console.log('Yesterday:', data);
```

### Get week's data:
```javascript
async function getWeekData(userId, startDate) {
  // startDate: "2025-11-08" (Sunday)
  const sevenDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const snap = await getDoc(doc(db, 'usage', `${userId}_${dateStr}`));
    if (snap.exists()) {
      sevenDays.push({ date: dateStr, ...snap.data() });
    }
  }
  return sevenDays;
}
```

### Get month's data:
```javascript
async function getMonthData(userId, year, month) {
  // month: 1-12 (January = 1)
  const monthData = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().slice(0, 10);
    const snap = await getDoc(doc(db, 'usage', `${userId}_${dateStr}`));
    if (snap.exists()) {
      monthData.push({ date: dateStr, ...snap.data() });
    }
  }
  return monthData;
}
```

---

## COMPUTING ANALYTICS

### Average daily screen time:
```javascript
async function getAverageDailyTime(userId, days = 7) {
  const weekData = await getWeekData(userId, getDateNDaysAgo(days));
  const total = weekData.reduce((sum, d) => sum + d.totalScreenTime, 0);
  return Math.round(total / weekData.length);
}
```

### Top websites:
```javascript
function getTopWebsites(weekData, limit = 5) {
  const aggregated = {};
  
  weekData.forEach(day => {
    Object.entries(day.websiteTimeBreakdown).forEach(([site, minutes]) => {
      aggregated[site] = (aggregated[site] || 0) + minutes;
    });
  });
  
  return Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([site, minutes]) => ({ site, minutes }));
}
```

### Productivity score (based on productive vs non-productive sites):
```javascript
const PRODUCTIVE_SITES = ['github.com', 'stackoverflow.com', 'dev.to', 'localhost'];
const NON_PRODUCTIVE_SITES = ['youtube.com', 'twitter.com', 'facebook.com', 'instagram.com'];

function getProductivityScore(websiteBreakdown) {
  let productiveTime = 0;
  let totalTime = 0;
  
  Object.entries(websiteBreakdown).forEach(([site, minutes]) => {
    totalTime += minutes;
    if (PRODUCTIVE_SITES.some(ps => site.includes(ps))) {
      productiveTime += minutes;
    }
  });
  
  return totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
}
```

### Daily usage trend:
```javascript
function getTrend(weekData) {
  return weekData.map(day => ({
    date: day.date,
    time: day.totalScreenTime,
    websites: day.numberOfWebsites,
    score: getProductivityScore(day.websiteTimeBreakdown)
  }));
}
```

---

## CHART.JS INTEGRATION

### Install Chart.js:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### Draw line chart (daily trend):
```javascript
async function drawTrendChart(userId) {
  const weekData = await getWeekData(userId, getDateNDaysAgo(7));
  const trend = getTrend(weekData);
  
  const ctx = document.getElementById('trendChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: trend.map(d => d.date),
      datasets: [{
        label: 'Screen Time (minutes)',
        data: trend.map(d => d.time),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4
      }]
    }
  });
}
```

### Draw pie chart (website breakdown):
```javascript
function drawWebsiteChart(websiteBreakdown) {
  const ctx = document.getElementById('websiteChart').getContext('2d');
  const entries = Object.entries(websiteBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Top 8
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        data: entries.map(e => e[1]),
        backgroundColor: [
          '#2563EB', '#059669', '#7C3AED', '#DC2626',
          '#EA580C', '#16A34A', '#9333EA', '#0891B2'
        ]
      }]
    }
  });
}
```

---

## REAL-TIME UPDATES

Listen to all changes in real-time:

```javascript
import { db } from './firebase-config.js';
import { doc, onSnapshot, collection } from "firebase/firestore";

function initAnalyticsRealtime(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const docId = `${userId}_${today}`;
  
  // Listen to today's data
  const unsub = onSnapshot(doc(db, 'usage', docId), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      
      // Update all visualizations
      updateAnalyticsDashboard(data);
    }
  });
  
  return unsub;
}

function updateAnalyticsDashboard(data) {
  // Update metrics
  document.getElementById('totalTime').textContent = 
    formatMinutes(data.totalScreenTime);
  
  document.getElementById('websites').textContent = 
    data.numberOfWebsites;
  
  document.getElementById('score').textContent = 
    getProductivityScore(data.websiteTimeBreakdown) + '%';
  
  // Update charts
  drawWebsiteChart(data.websiteTimeBreakdown);
}
```

---

## HELPER FUNCTIONS

```javascript
function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getDateNDaysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().slice(0, 10);
}

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function parseDate(dateStr) {
  return new Date(dateStr + 'T00:00:00Z');
}
```

---

## COMPLETE ANALYTICS PAGE EXAMPLE

```html
<!DOCTYPE html>
<html>
<head>
  <title>Analytics - DeepSync</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div id="analytics">
    <div class="metric">
      <h3>Today's Screen Time</h3>
      <p id="totalTime">--</p>
    </div>
    
    <div class="metric">
      <h3>Websites Visited</h3>
      <p id="websites">--</p>
    </div>
    
    <div class="metric">
      <h3>Productivity Score</h3>
      <p id="score">--</p>
    </div>
    
    <canvas id="websiteChart"></canvas>
    <canvas id="trendChart"></canvas>
  </div>

  <script type="module">
    import { db } from '../js/firebase-config.js';
    import { doc, onSnapshot } from "firebase/firestore";
    
    const userId = localStorage.getItem('detox_user_id');
    const today = new Date().toISOString().slice(0, 10);
    const docId = `${userId}_${today}`;
    
    onSnapshot(doc(db, 'usage', docId), (snap) => {
      if (snap.exists()) {
        updateAnalytics(snap.data());
      }
    });
    
    function updateAnalytics(data) {
      document.getElementById('totalTime').textContent = 
        formatMinutes(data.totalScreenTime);
      document.getElementById('websites').textContent = 
        data.numberOfWebsites;
      document.getElementById('score').textContent = 
        getProductivityScore(data.websiteTimeBreakdown) + '%';
      
      drawWebsiteChart(data.websiteTimeBreakdown);
    }
  </script>
</body>
</html>
```

This setup ensures your analytics automatically update every time the extension syncs new data to Firebase (every 5 minutes).
