import { db } from './firebase-config.js';
import { doc, setDoc, serverTimestamp, updateDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// Verify Firebase is loaded
console.log('[tracker] Firebase config loaded, db:', typeof db);

function getUserId() {
  // First try to use the global ID set by app-init.js
  if (window.DETOX_USER_ID) {
    console.log('[tracker] Using global userId from app-init:', window.DETOX_USER_ID);
    return window.DETOX_USER_ID;
  }
  
  // Fallback to localStorage
  let id = localStorage.getItem('detox_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('detox_user_id', id);
    console.log('[tracker] Generated fallback userId:', id);
  }
  console.log('[tracker] Using localStorage userId:', id);
  return id;
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * -60 * 1000;
  const localDate = new Date(now.getTime() + offsetMs);
  return localDate.getUTCFullYear() + '-' + 
         String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
         String(localDate.getUTCDate()).padStart(2, '0');
}

const USER_ID = getUserId();

function todayId() { 
  return `${USER_ID}_${getTodayDate()}`; 
}

let active = !document.hidden;
let lastChange = Date.now();
let totalActiveMs = 0;
let websiteTimeData = {}; // Track time per website
let lastWebsiteHash = '';
let currentDate = getTodayDate(); // Track current date
let lastFlushedDate = null;

// Store Firebase data separately to prevent overwriting
let firebaseLoaded = false;
let firebaseWebsites = {};

function hashWebsiteData(obj) {
  try {
    const minutes = Object.entries(obj)
      .map(([k, v]) => [k, Math.round((v || 0) / 60000)])
      .sort((a, b) => a[0].localeCompare(b[0]));
    return JSON.stringify(minutes);
  } catch (e) {
    return Math.random().toString(36);
  }
}

// Check if day has changed and reset data if needed
function checkAndHandleDayChange() {
  const today = getTodayDate();
  if (today !== currentDate) {
    console.log('[tracker] Day changed from', currentDate, 'to', today);
    console.log('[tracker] Flushing final data for old day before reset');
    
    // Flush the old day's data one final time
    flushToFirestore().then(() => {
      console.log('[tracker] Successfully flushed old day data');
      
      // Now reset for new day
      totalActiveMs = 0;
      websiteTimeData = {};
      currentDate = today;
      lastFlushedDate = null;
      lastWebsiteHash = '';
      
      saveToLocal();
      console.log('[tracker] Reset data for new day:', today);
    }).catch(err => {
      console.error('[tracker] Error flushing old day data:', err);
    });
  }
}

// Request website data from extension immediately on load
function requestExtensionData() {
  if (!window.chrome || !window.chrome.runtime) {
    console.log('[tracker] Chrome extension not available');
    return;
  }
  
  try {
    chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('[tracker] Extension not ready:', chrome.runtime.lastError);
        return;
      }
      
      console.log('[tracker] Got response from extension:', response);
      
      // Check if day changed
      if (response && response.currentDate) {
        if (response.currentDate !== currentDate) {
          console.log('[tracker] Extension reports different date:', response.currentDate);
          checkAndHandleDayChange();
        }
      }
      
      // Only accept extension data if Firebase hasn't been loaded yet
      if (response && response.websites && !firebaseLoaded) {
        const incoming = response.websites || {};
        const newHash = hashWebsiteData(incoming);
        if (newHash !== lastWebsiteHash) {
          lastWebsiteHash = newHash;
          websiteTimeData = incoming;
          updateWebsiteUI(websiteTimeData);
        }
        console.log('[tracker] Updated UI with extension data (Firebase not loaded yet):', websiteTimeData);
      } else if (firebaseLoaded) {
        console.log('[tracker] ⏸️ Ignoring extension data because Firebase data already loaded');
      }
    });
  } catch (e) {
    console.warn('[tracker] Error requesting extension data:', e);
  }
}

// Message listener for extension data
if (window.chrome && window.chrome.runtime) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'WEBSITE_DATA') {
      // Check for day change
      if (request.data && request.data.currentDate) {
        if (request.data.currentDate !== currentDate) {
          console.log('[tracker] Day change detected via extension message');
          currentDate = request.data.currentDate;
          checkAndHandleDayChange();
        }
      }
      
      // Receive website tracking data from extension - only if Firebase not loaded
      if (request.data && request.data.websites && !firebaseLoaded) {
        const incoming = request.data.websites || {};
        const newHash = hashWebsiteData(incoming);
        if (newHash !== lastWebsiteHash) {
          lastWebsiteHash = newHash;
          websiteTimeData = incoming;
          updateWebsiteUI(websiteTimeData);
        }
        console.log('[tracker] Received website data from extension via message:', websiteTimeData);
      } else if (firebaseLoaded) {
        console.log('[tracker] ⏸️ Ignoring extension message data because Firebase already loaded');
      }
    }
    if (request.type === 'TOTAL_SCREEN_TIME' && !firebaseLoaded) {
      // Only use extension total if Firebase hasn't provided it
      totalActiveMs = request.totalTime || 0;
    }
  });
}

// Also listen for window messages from content script
window.addEventListener('message', (event) => {
  if (event.data.type === 'FROM_EXTENSION_WEBSITE_DATA' && !firebaseLoaded) {
    // Only accept if Firebase hasn't loaded yet
    if (event.data.data && event.data.data.websites) {
      const incoming = event.data.data.websites || {};
      const newHash = hashWebsiteData(incoming);
      if (newHash !== lastWebsiteHash) {
        lastWebsiteHash = newHash;
        websiteTimeData = incoming;
        updateWebsiteUI(websiteTimeData);
      }
      console.log('[tracker] Received website data from content script:', websiteTimeData);
    }
  }
});

function saveToLocal() {
  const key = 'detox_usage_local_' + USER_ID;
  localStorage.setItem(key, JSON.stringify({
    totalActiveMs,
    websiteTimeData,
    date: currentDate,
    lastChange: new Date().toISOString()
  }));
  console.log('[tracker] Saved to localStorage for date:', currentDate);
}

function updateWebsiteUI(websites) {
  // Skip if no effective change
  const currentHash = hashWebsiteData(websites || {});
  if (currentHash === lastWebsiteHash) return;
  lastWebsiteHash = currentHash;

  // Update website list in dashboard
  const container = document.getElementById('usageBreakdown');
  if (container) {
    container.innerHTML = Object.entries(websites)
      .map(([site, time]) => {
        const minutes = Math.round(time / 60000);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
        return `<div class="flex justify-between p-2 bg-gray-100 rounded"><span>${site}</span><span>${timeStr}</span></div>`;
      })
      .join('');
  }

  // Trigger chart update on dashboard
  if (window.updateCategoryChart) {
    window.updateCategoryChart(websites);
  }
}

async function flushToFirestore(){
  try{
    const today = getTodayDate();
    
    console.log('[tracker] Flushing to Firebase for date:', today, {
      totalScreenTime: Math.round(totalActiveMs/60000),
      websites: Object.keys(websiteTimeData).length
    });
    
    // Create/update document for today's data only
    // Path: users/{userId}/daily/{YYYY-MM-DD}
    const ref = doc(db, 'users', USER_ID, 'daily', today);
    
    // Prepare website breakdown - ENSURE proper conversion
    const usageBreakdown = {};
    let sumOfWebsites = 0;
    
    Object.entries(websiteTimeData).forEach(([site, time]) => {
      // Ensure time is in milliseconds, convert to minutes
      let timeInMs = time;
      if (typeof time === 'number' && time > 0) {
        // If value looks like it's already in minutes (< 1000), assume milliseconds needed
        // If value is huge (> 1000000), it's milliseconds, convert properly
        timeInMs = Math.round(time); // Ensure it's a number
      }
      const minutes = Math.round(timeInMs / 60000);
      usageBreakdown[site] = minutes;
      sumOfWebsites += minutes;
      
      if (minutes > 0) {
        console.log('[tracker] Website:', site, '=', timeInMs, 'ms =', minutes, 'minutes');
      }
    });
    
    const numWebsites = Object.keys(websiteTimeData).length;
    const totalMinutes = Math.round(totalActiveMs/60000);
    
    console.log('[tracker] 📊 Sum check: websites total =', sumOfWebsites, 'min, global total =', totalMinutes, 'min');
    
    const dataToWrite = {
      date: today,
      totalScreenTime: totalMinutes,
      numberOfWebsites: numWebsites,
      websiteTimeBreakdown: usageBreakdown,
      lastActive: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    console.log('[tracker] Writing to Firebase path: users/' + USER_ID + '/daily/' + today);
    console.log('[tracker] Data:', dataToWrite);
    
    // Always create/update the document for today, even if totalMinutes is 0
    const result = await setDoc(ref, dataToWrite, { merge: true });
    
    lastFlushedDate = today;
    
    console.log('[tracker] ✅ Successfully flushed to Firebase', { 
      totalMinutes, 
      numWebsites, 
      websitesTotal: sumOfWebsites,
      path: `users/${USER_ID}/daily/${today}` 
    });
  }catch(e){ 
    console.error('[tracker] Firestore flush FAILED with error:', {
      message: e.message,
      code: e.code,
      error: e
    });
  }
  saveToLocal();
}

document.addEventListener('visibilitychange', ()=>{
  checkAndHandleDayChange(); // Check for day change on visibility change
  const now=Date.now();
  if(!document.hidden){ lastChange=now; active=true; } else { if(active){ totalActiveMs += now-lastChange; saveToLocal(); } active=false; lastChange=now; }
});

['mousemove','keydown','scroll','pointerdown','touchstart'].forEach(ev=> window.addEventListener(ev, ()=>{ if(active){ lastChange=Date.now(); } else { active=true; lastChange=Date.now(); } }, {passive:true}));

// Track activity every 15 seconds
setInterval(()=>{ 
  checkAndHandleDayChange(); // Check for day change every activity cycle
  const now=Date.now(); 
  if(active){ totalActiveMs += now-lastChange; lastChange=now; } 
  saveToLocal(); 
}, 15000);

// Flush to Firebase every 5 minutes
setInterval(()=>{ 
  checkAndHandleDayChange(); // Check for day change before flush
  flushToFirestore(); 
}, 300000);

// Also flush when user leaves
window.addEventListener('beforeunload', () => {
  checkAndHandleDayChange(); // Final day check
  flushToFirestore();
});

// NOTE: localStorage restoration moved to loadFirebaseDataOnStartup() as fallback
// This ensures Firebase data is loaded FIRST, not cached data

// Load data from Firebase on page load - FIREBASE ONLY, NO LOCAL FALLBACK
async function loadFirebaseDataOnStartup() {
  const today = getTodayDate();
  
  try {
    console.log('[tracker] 🔄 Starting Firebase data load...');
    const ref = doc(db, 'users', USER_ID, 'daily', today);
    
    console.log('[tracker] Fetching from Firebase: users/' + USER_ID + '/daily/' + today);
    const snapshot = await getDoc(ref);
    
    if (snapshot.exists()) {
      const fbData = snapshot.data();
      console.log('[tracker] ✅ Firebase data found:', fbData);
      
      // CLEAR any existing local data first
      totalActiveMs = 0;
      websiteTimeData = {};
      
      // Convert Firebase data (in minutes) back to milliseconds
      if (fbData.totalScreenTime !== undefined) {
        totalActiveMs = fbData.totalScreenTime * 60000; // Convert minutes to ms
        console.log('[tracker] ✅ Set totalActiveMs from Firebase:', fbData.totalScreenTime, 'minutes =', totalActiveMs, 'ms');
      }
      
      // Load website breakdown - VALIDATE and convert properly
      if (fbData.websiteTimeBreakdown && Object.keys(fbData.websiteTimeBreakdown).length > 0) {
        let totalFromWebsites = 0;
        Object.entries(fbData.websiteTimeBreakdown).forEach(([site, minutes]) => {
          // Firebase stores in minutes - convert to milliseconds for internal storage
          websiteTimeData[site] = minutes * 60000; // Convert minutes to ms
          firebaseWebsites[site] = minutes * 60000; // Keep Firebase copy
          totalFromWebsites += minutes;
        });
        
        console.log('[tracker] ✅ Loaded', Object.keys(websiteTimeData).length, 'websites from Firebase');
        console.log('[tracker] 📊 Validation: total from websites =', totalFromWebsites, 'min, global total =', fbData.totalScreenTime, 'min');
        
        // Warn if mismatch
        if (Math.abs(totalFromWebsites - fbData.totalScreenTime) > 1) {
          console.warn('[tracker] ⚠️ Website breakdown total (' + totalFromWebsites + 'm) does NOT match totalScreenTime (' + fbData.totalScreenTime + 'm)');
        }
      }
      
      // Update date tracking
      currentDate = today;
      lastFlushedDate = today;
      firebaseLoaded = true;  // Mark Firebase as loaded
      
      return true;
    } else {
      console.log('[tracker] ⚠️ No Firebase data found for today (' + today + ') - starting fresh with 0 minutes');
      
      // NO FALLBACK - Reset to empty
      totalActiveMs = 0;
      websiteTimeData = {};
      currentDate = today;
      lastFlushedDate = null;
      
      return false;
    }
  } catch (err) {
    console.error('[tracker] ❌ Error loading Firebase data:', err.message);
    
    // NO FALLBACK - Reset to empty
    totalActiveMs = 0;
    websiteTimeData = {};
    currentDate = getTodayDate();
    lastFlushedDate = null;
    
    return false;
  }
}

// Startup sequence - this is critical
async function startupSequence() {
  console.log('[tracker] 🚀 Starting up...');
  
  // First, load Firebase data
  await loadFirebaseDataOnStartup();
  console.log('[tracker] Firebase data loaded, totalActiveMs:', totalActiveMs);
  
  // Then request extension data
  console.log('[tracker] Requesting extension data...');
  requestExtensionData();
}

// Load Firebase data immediately when script loads
startupSequence().catch(err => console.error('[tracker] Startup error:', err));

// Check for day change every minute
setInterval(() => {
  checkAndHandleDayChange();
}, 60 * 1000);

// Poll for new data every 10 seconds
setInterval(requestExtensionData, 10000);

// Update UI elements with current tracker data
function updateTrackerUI() {
  const totalMinutes = Math.round(totalActiveMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const screenTimeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  
  // Update screen time elements
  const screenTimeElements = [
    document.getElementById('screenTime'),
    document.getElementById('screen-time')
  ];
  screenTimeElements.forEach(el => {
    if (el) el.textContent = screenTimeStr;
  });
  
  // Update website breakdown
  updateWebsiteUI(websiteTimeData);
  
  // Dispatch event for UI updates
  window.dispatchEvent(new CustomEvent('usageUpdated', { detail: {
    totalScreenTime: totalMinutes,
    numberOfWebsites: Object.keys(websiteTimeData).length,
    websiteTimeBreakdown: Object.fromEntries(
      Object.entries(websiteTimeData).map(([site, time]) => [
        site,
        Math.round(time / 60000)
      ])
    ),
    date: currentDate
  }}));
}

// When DOM is loaded, update UI and ensure Firebase data is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('[tracker] ✅ DOM Content Loaded');
  console.log('[tracker] Current data - totalActiveMs:', totalActiveMs, 'websites:', Object.keys(websiteTimeData).length);
  updateTrackerUI();
});

// Update UI every 5 seconds
setInterval(() => {
  updateTrackerUI();
}, 5000);

// Real-time listener for Firebase updates
window.initTrackerListener = function() {
  const today = getTodayDate();
  const ref = doc(db, 'users', USER_ID, 'daily', today);
  
  console.log('[tracker] Setting up real-time listener for:', ref.path);
  
  const unsub = onSnapshot(ref, snap => {
    if (!snap.exists()) {
      console.log('[tracker] No data for today yet');
      return;
    }
    const data = snap.data();
    console.log('[tracker] Real-time update for', today, ':', data);
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('usageUpdated', { detail: data }));
  });
  
  return unsub;
}

window.DetoxTracker = {
  getTotalMinutes: ()=> Math.round(totalActiveMs/60000),
  getWebsiteData: () => Object.entries(websiteTimeData).map(([site, time]) => ({
    website: site,
    site: site,
    minutes: Math.round(time / 60000)
  })),
  getNumberOfWebsites: () => Object.keys(websiteTimeData).length,
  flushNow: flushToFirestore,
  userId: USER_ID,
  currentDate: () => currentDate,
  getCurrentData: () => ({
    date: currentDate,
    totalScreenTime: Math.round(totalActiveMs / 60000),
    totalMinutes: Math.round(totalActiveMs / 60000),
    numberOfWebsites: Object.keys(websiteTimeData).length,
    websiteTimeBreakdown: Object.fromEntries(
      Object.entries(websiteTimeData).map(([site, time]) => [
        site,
        Math.round(time / 60000)
      ])
    ),
    websites: Object.entries(websiteTimeData).map(([site, time]) => ({
      site,
      minutes: Math.round(time / 60000)
    }))
  })
};

// Also expose flushToFirestore directly to window for easy console access
window.flushToFirestore = flushToFirestore;