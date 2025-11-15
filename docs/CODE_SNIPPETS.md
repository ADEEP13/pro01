// QUICK CODE SNIPPETS FOR INTEGRATION

// ============================================
// 1. CHECK EXTENSION IS WORKING
// ============================================
// Run in console on dashboard page:

DetoxTracker.getCurrentData()
// Should show: { totalMinutes, numberOfWebsites, websites: [...] }

chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, console.log)
// Should show: { websites: {...}, timestamp: ... }

localStorage.getItem('detox_usage_local_' + DetoxTracker.userId)
// Should show local backup data


// ============================================
// 2. DISPLAY WEBSITE BREAKDOWN IN ANY PAGE
// ============================================

function displayWebsites(websiteData) {
  const container = document.getElementById('website-list');
  
  const html = Object.entries(websiteData)
    .sort((a, b) => b[1] - a[1]) // Sort by time
    .map(([site, mins]) => `
      <div style="display: flex; justify-content: space-between; padding: 8px;">
        <span>${site}</span>
        <span>${mins}m</span>
      </div>
    `).join('');
  
  container.innerHTML = html;
}

// Usage:
displayWebsites(DetoxTracker.getWebsiteData().reduce((acc, item) => {
  acc[item.website] = item.minutes;
  return acc;
}, {}));


// ============================================
// 3. GET FIRESTORE DATA DIRECTLY
// ============================================

import { db } from './firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';

async function getTodayData() {
  const userId = localStorage.getItem('detox_user_id');
  const today = new Date().toISOString().slice(0, 10);
  const docRef = doc(db, 'usage', `${userId}_${today}`);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    console.log('Today data:', snap.data());
    return snap.data();
  }
  return null;
}

// Usage:
const todayData = await getTodayData();


// ============================================
// 4. REAL-TIME LISTENER (ANY PAGE)
// ============================================

import { db } from './firebase-config.js';
import { doc, onSnapshot } from 'firebase/firestore';

function setupRealtimeTracking() {
  const userId = localStorage.getItem('detox_user_id');
  const today = new Date().toISOString().slice(0, 10);
  const docRef = doc(db, 'usage', `${userId}_${today}`);
  
  const unsub = onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log('Data updated:', data);
      
      // Update your UI here
      document.getElementById('total-time').textContent = 
        formatMinutes(data.totalScreenTime);
      
      document.getElementById('website-count').textContent = 
        data.numberOfWebsites;
    }
  });
  
  return unsub;
}

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}


// ============================================
// 5. GET HISTORICAL DATA (PAST DATES)
// ============================================

import { db } from './firebase-config.js';
import { doc, getDoc } from 'firebase/firestore';

async function getDateData(date) {
  // date format: "2025-11-14"
  const userId = localStorage.getItem('detox_user_id');
  const docRef = doc(db, 'usage', `${userId}_${date}`);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

// Usage:
const yesterday = await getDateData('2025-11-13');
const twoDaysAgo = await getDateData('2025-11-12');


// ============================================
// 6. GET WEEK DATA (7 DAYS)
// ============================================

async function getWeekData(startDate) {
  // startDate format: "2025-11-08"
  const weekData = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().slice(0, 10);
    const data = await getDateData(dateStr);
    
    if (data) {
      weekData.push({ date: dateStr, ...data });
    }
  }
  
  return weekData;
}

// Usage:
const thisWeek = await getWeekData('2025-11-08'); // Last Sunday
console.log(thisWeek);


// ============================================
// 7. CALCULATE AVERAGE DAILY TIME
// ============================================

async function getAverageDailyTime(days = 7) {
  const weekData = await getWeekData(
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10)
  );
  
  const total = weekData.reduce((sum, d) => sum + d.totalScreenTime, 0);
  const average = Math.round(total / weekData.length);
  
  console.log(`Average: ${formatMinutes(average)} per day`);
  return average;
}


// ============================================
// 8. GET TOP WEBSITES (WEEK)
// ============================================

async function getTopWebsites(days = 7, limit = 5) {
  const weekData = await getWeekData(
    new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10)
  );
  
  const aggregated = {};
  
  weekData.forEach(day => {
    Object.entries(day.websiteTimeBreakdown || {}).forEach(([site, mins]) => {
      aggregated[site] = (aggregated[site] || 0) + mins;
    });
  });
  
  const sorted = Object.entries(aggregated)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
  
  console.log('Top websites:', sorted);
  return sorted;
}


// ============================================
// 9. PRODUCTIVITY SCORE
// ============================================

const PRODUCTIVE_SITES = [
  'github.com', 'stackoverflow.com', 'dev.to',
  'localhost', 'google.com', 'documentation'
];

const NON_PRODUCTIVE_SITES = [
  'youtube.com', 'twitter.com', 'facebook.com',
  'instagram.com', 'tiktok.com', 'reddit.com'
];

function calculateProductivityScore(websiteBreakdown) {
  if (!websiteBreakdown) return 0;
  
  let productiveTime = 0;
  let totalTime = 0;
  
  Object.entries(websiteBreakdown).forEach(([site, minutes]) => {
    totalTime += minutes;
    
    const isProductive = PRODUCTIVE_SITES.some(ps => site.includes(ps));
    if (isProductive) {
      productiveTime += minutes;
    }
  });
  
  return totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
}

// Usage:
const score = calculateProductivityScore({
  'github.com': 60,
  'youtube.com': 30
});
console.log('Productivity Score:', score + '%'); // Should be 67%


// ============================================
// 10. DRAW SIMPLE CHART (Chart.js)
// ============================================

// First, add to HTML:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// <canvas id="myChart"></canvas>

async function drawWebsiteChart(days = 1) {
  const data = days === 1 
    ? await getTodayData()
    : (await getWeekData(
        new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          .toISOString().slice(0, 10)
      ))[0];
  
  if (!data || !data.websiteTimeBreakdown) return;
  
  const breakdown = data.websiteTimeBreakdown;
  const entries = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8); // Top 8
  
  const ctx = document.getElementById('myChart').getContext('2d');
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
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}


// ============================================
// 11. EXPORT DATA TO CSV
// ============================================

async function exportWeekToCSV(startDate) {
  const weekData = await getWeekData(startDate);
  
  let csv = 'Date,Total Screen Time (min),Websites,Top Website,Top Time\n';
  
  weekData.forEach(day => {
    const topSite = Object.entries(day.websiteTimeBreakdown || {})
      .sort((a, b) => b[1] - a[1])[0] || ['--', 0];
    
    csv += `${day.date},${day.totalScreenTime},${day.numberOfWebsites},"${topSite[0]}",${topSite[1]}\n`;
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tracking-data.csv';
  a.click();
}


// ============================================
// 12. MONITOR EXTENSION SYNC STATUS
// ============================================

let lastSync = null;

function monitorSyncStatus() {
  setInterval(() => {
    const stored = localStorage.getItem('detox_usage_local_' + DetoxTracker.userId);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastChange !== lastSync) {
        console.log('✓ Synced at', new Date().toLocaleTimeString());
        lastSync = parsed.lastChange;
      }
    }
  }, 30000); // Check every 30 seconds
}


// ============================================
// 13. FORCE IMMEDIATE SYNC
// ============================================

async function forceSyncNow() {
  console.log('Forcing sync...');
  await DetoxTracker.flushNow();
  console.log('✓ Data synced to Firebase');
  
  // Wait a bit for Firebase to propagate
  await new Promise(r => setTimeout(r, 2000));
  
  // Get latest data
  const latest = await getTodayData();
  console.log('Latest data:', latest);
}


// ============================================
// 14. ALL UTILITIES IN ONE FILE
// ============================================

// Copy this whole object to use everywhere:

const TrackingUtils = {
  formatMinutes(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  },
  
  async getTodayData() {
    const userId = localStorage.getItem('detox_user_id');
    const today = new Date().toISOString().slice(0, 10);
    const snap = await getDoc(doc(db, 'usage', `${userId}_${today}`));
    return snap.exists() ? snap.data() : null;
  },
  
  async getDateData(date) {
    const userId = localStorage.getItem('detox_user_id');
    const snap = await getDoc(doc(db, 'usage', `${userId}_${date}`));
    return snap.exists() ? snap.data() : null;
  },
  
  calculateScore(breakdown) {
    const productive = ['github.com', 'stackoverflow.com', 'localhost'];
    let prodTime = 0, total = 0;
    Object.entries(breakdown).forEach(([site, mins]) => {
      total += mins;
      if (productive.some(p => site.includes(p))) prodTime += mins;
    });
    return total > 0 ? Math.round((prodTime / total) * 100) : 0;
  }
};

// Usage:
// TrackingUtils.formatMinutes(120)
// TrackingUtils.getTodayData()
// TrackingUtils.calculateScore({...})
