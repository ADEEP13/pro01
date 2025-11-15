// Background Service Worker for Chrome Extension
// Tracks website usage and collects data with daily partitioning

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

let websiteTimeData = {}; // { "example.com": milliseconds }
let activeTabUrl = '';
let activeTabId = null;
let lastActiveTime = Date.now();
let isWindowActive = true;
let currentDate = getTodayDate(); // Track current date for day-change detection

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * -60 * 1000;
  const localDate = new Date(now.getTime() + offsetMs);
  return localDate.getUTCFullYear() + '-' + 
         String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
         String(localDate.getUTCDate()).padStart(2, '0');
}

// Check if day has changed and reset data if needed
function checkAndHandleDayChange() {
  const today = getTodayDate();
  if (today !== currentDate) {
    console.log('[Extension] Day changed from', currentDate, 'to', today);
    console.log('[Extension] Resetting website data for new day');
    
    // Save old day's data before resetting
    const oldDate = currentDate;
    chrome.storage.local.get('dailyDataArchive', (result) => {
      const archive = result.dailyDataArchive || {};
      if (Object.keys(websiteTimeData).length > 0) {
        archive[oldDate] = {
          websites: websiteTimeData,
          timestamp: Date.now()
        };
        chrome.storage.local.set({ dailyDataArchive: archive });
        console.log('[Extension] Archived data for', oldDate);
      }
    });
    
    // Reset for new day
    websiteTimeData = {};
    currentDate = today;
    lastActiveTime = Date.now();
    
    // Save fresh start to storage
    chrome.storage.local.set({
      websiteTimeData: {},
      currentDate: currentDate,
      lastSync: Date.now()
    });
  }
}

// Initialize from storage
chrome.storage.storage.local.get(['websiteTimeData', 'currentDate', 'lastSync'], (result) => {
  const today = getTodayDate();
  const storedDate = result.currentDate;
  
  // If stored date is different from today, it's a new day
  if (storedDate && storedDate !== today) {
    console.log('[Extension] Initializing new day. Old date:', storedDate, 'New date:', today);
    websiteTimeData = {};
    currentDate = today;
  } else if (result.websiteTimeData) {
    websiteTimeData = result.websiteTimeData;
    currentDate = storedDate || today;
    console.log('[Extension] Restored today\'s data. Websites tracked:', Object.keys(websiteTimeData));
  } else {
    websiteTimeData = {};
    currentDate = today;
    console.log('[Extension] Starting fresh for', today);
  }
  
  chrome.storage.local.set({
    websiteTimeData: websiteTimeData,
    currentDate: currentDate,
    lastSync: Date.now()
  });
});

// Monitor active tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  checkAndHandleDayChange(); // Check for day change on every tab switch
  
  if (activeTabId !== null) {
    // Save time for previous tab
    const timeDiff = Date.now() - lastActiveTime;
    if (activeTabUrl) {
      const domain = extractDomain(activeTabUrl);
      websiteTimeData[domain] = (websiteTimeData[domain] || 0) + timeDiff;
    }
  }

  activeTabId = activeInfo.tabId;
  lastActiveTime = Date.now();

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    activeTabUrl = tab.url || '';
    const domain = extractDomain(activeTabUrl);
    console.log('[Extension] Active tab changed to:', domain, 'on date:', currentDate);
  } catch (e) {
    console.log('[Extension] Error getting tab info:', e);
  }
});

// Monitor tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  checkAndHandleDayChange(); // Check for day change on tab update
  
  if (tabId === activeTabId && changeInfo.url) {
    // Save time for previous URL
    const timeDiff = Date.now() - lastActiveTime;
    if (activeTabUrl) {
      const domain = extractDomain(activeTabUrl);
      websiteTimeData[domain] = (websiteTimeData[domain] || 0) + timeDiff;
    }

    activeTabUrl = tab.url || '';
    lastActiveTime = Date.now();
    const domain = extractDomain(activeTabUrl);
    console.log('[Extension] Tab URL changed to:', domain, 'on date:', currentDate);
  }
});

// Monitor window focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  checkAndHandleDayChange(); // Check for day change on window focus change
  
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User switched away from Chrome
    isWindowActive = false;
    if (activeTabId !== null && activeTabUrl) {
      const timeDiff = Date.now() - lastActiveTime;
      const domain = extractDomain(activeTabUrl);
      websiteTimeData[domain] = (websiteTimeData[domain] || 0) + timeDiff;
    }
  } else {
    // User switched back to Chrome
    isWindowActive = true;
    lastActiveTime = Date.now();
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_WEBSITE_DATA') {
    checkAndHandleDayChange(); // Check for day change when data is requested
    sendResponse({
      websites: websiteTimeData,
      currentDate: currentDate,
      timestamp: Date.now()
    });
  }
  
  if (request.type === 'GET_CURRENT_DATE') {
    sendResponse({
      date: currentDate,
      timestamp: Date.now()
    });
  }
});

// Sync data every 5 minutes
setInterval(() => {
  checkAndHandleDayChange(); // Check for day change every sync cycle
  
  if (activeTabId !== null && activeTabUrl && isWindowActive) {
    const timeDiff = Date.now() - lastActiveTime;
    if (timeDiff > 0) {
      const domain = extractDomain(activeTabUrl);
      websiteTimeData[domain] = (websiteTimeData[domain] || 0) + timeDiff;
      lastActiveTime = Date.now();
    }
  }

  // Save to chrome storage with current date
  chrome.storage.local.set({
    websiteTimeData: websiteTimeData,
    currentDate: currentDate,
    lastSync: Date.now()
  });

  // Broadcast to all tabs (including file:// and localhost)
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && (tab.url.includes('localhost') || tab.url.includes('file://') || tab.url.includes('127.0.0.1'))) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'WEBSITE_DATA',
          data: { websites: websiteTimeData, currentDate: currentDate, timestamp: Date.now() }
        }).catch(() => {
          // Tab might not have content script loaded yet
        });
      }
    });
  });

  console.log('[Extension] Synced data to storage:', Object.keys(websiteTimeData).length, 'websites for date:', currentDate);
}, SYNC_INTERVAL);

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname || url;
  } catch (e) {
    return url;
  }
}

// On extension unload, save all data
chrome.runtime.onSuspend.addListener(() => {
  if (activeTabId !== null && activeTabUrl) {
    const timeDiff = Date.now() - lastActiveTime;
    const domain = extractDomain(activeTabUrl);
    websiteTimeData[domain] = (websiteTimeData[domain] || 0) + timeDiff;
  }

  chrome.storage.local.set({
    websiteTimeData: websiteTimeData,
    currentDate: currentDate,
    lastSync: Date.now()
  });
  
  console.log('[Extension] Suspending. Saved data for', currentDate);
});

// Check for day change every minute to ensure we catch it
setInterval(() => {
  checkAndHandleDayChange();
}, 60 * 1000);
