/**
 * COMPREHENSIVE DATA DISPLAY DEBUGGING SCRIPT
 * Paste this entire script into browser console to diagnose display issues
 */

console.log('═══════════════════════════════════════════════════════════');
console.log('  DATA DISPLAY DEBUG SCRIPT - Running Full Diagnostics');
console.log('═══════════════════════════════════════════════════════════');

// 1. Check if tracker is loaded
console.log('\n1️⃣  TRACKER SYSTEM CHECK:');
if (window.DetoxTracker) {
  console.log('✅ DetoxTracker object found');
  console.log('   Methods available:', Object.keys(window.DetoxTracker));
} else {
  console.log('❌ DetoxTracker object NOT found - tracker.js may not be loaded');
}

// 2. Check for userId
console.log('\n2️⃣  USER ID CHECK:');
if (window.DETOX_USER_ID) {
  console.log('✅ DETOX_USER_ID found:', window.DETOX_USER_ID);
} else {
  console.log('❌ DETOX_USER_ID NOT found');
  const stored = localStorage.getItem('detox_user_id');
  if (stored) {
    console.log('   (but found in localStorage:', stored + ')');
  }
}

// 3. Get current tracker data
console.log('\n3️⃣  CURRENT TRACKER DATA:');
if (window.DetoxTracker && window.DetoxTracker.getCurrentData) {
  const data = window.DetoxTracker.getCurrentData();
  console.log('Full Data Object:', data);
  console.log('  - Date:', data.date);
  console.log('  - Total Screen Time:', data.totalScreenTime, 'minutes');
  console.log('  - Number of Websites:', data.numberOfWebsites);
  console.log('  - Website Breakdown:', data.websiteTimeBreakdown);
  
  if (data.totalScreenTime === 0 && data.numberOfWebsites === 0) {
    console.warn('⚠️  Data is all zeros - extension may not be sending data');
  } else {
    console.log('✅ Data is present and non-zero');
  }
} else {
  console.log('❌ Cannot get tracker data');
}

// 4. Check localStorage
console.log('\n4️⃣  LOCAL STORAGE CHECK:');
const userId = window.DETOX_USER_ID || localStorage.getItem('detox_user_id');
if (userId) {
  const storageKey = 'detox_usage_local_' + userId;
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    console.log('✅ Found localStorage data for key:', storageKey);
    const parsed = JSON.parse(stored);
    console.log('   - Stored Date:', parsed.date);
    console.log('   - Total Active Ms:', parsed.totalActiveMs);
    console.log('   - Websites Count:', Object.keys(parsed.websiteTimeData || {}).length);
  } else {
    console.log('❌ No localStorage data found for key:', storageKey);
  }
} else {
  console.log('❌ Cannot check localStorage - no userId');
}

// 5. Check if event system is working
console.log('\n5️⃣  EVENT SYSTEM CHECK:');
let eventFired = false;
const testListener = () => {
  eventFired = true;
  console.log('✅ Event listener triggered!');
};
window.addEventListener('usageUpdated', testListener);

// Force an event
if (window.DetoxTracker) {
  console.log('   Dispatching test event...');
  const testData = window.DetoxTracker.getCurrentData();
  window.dispatchEvent(new CustomEvent('usageUpdated', { detail: testData }));
  
  setTimeout(() => {
    if (eventFired) {
      console.log('✅ Event system is working');
    } else {
      console.log('❌ Event was not detected by listener');
    }
    window.removeEventListener('usageUpdated', testListener);
  }, 100);
}

// 6. Check if DOM elements exist
console.log('\n6️⃣  DOM ELEMENTS CHECK:');
const elementIds = [
  'screenTime', 'screen-time', 'totalScreenTime',
  'focusSessions', 'websites',
  'usageBreakdown', 'websiteList',
  'productivityScore', 'weeklyGoal'
];

let foundElements = 0;
elementIds.forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    foundElements++;
    const currentText = el.textContent || el.value || '(empty)';
    console.log(`  ✅ #${id}: "${currentText}"`);
  }
});
console.log(`\nFound ${foundElements} / ${elementIds.length} expected elements`);

if (foundElements === 0) {
  console.warn('⚠️  No expected elements found - check page HTML IDs');
}

// 7. Check Firebase configuration
console.log('\n7️⃣  FIREBASE CHECK:');
if (window.db) {
  console.log('✅ Firebase database (db) is initialized');
} else {
  console.log('❌ Firebase database (db) not found');
}

// 8. Check extension communication
console.log('\n8️⃣  EXTENSION COMMUNICATION CHECK:');
if (window.chrome && window.chrome.runtime) {
  console.log('✅ Chrome extension API available');
  console.log('   Testing message to extension...');
  
  chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
    if (chrome.runtime.lastError) {
      console.log('❌ Extension not responding:', chrome.runtime.lastError.message);
    } else {
      console.log('✅ Extension responded:', response);
      if (response && response.websites) {
        console.log('   - Websites tracked:', Object.keys(response.websites).length);
        console.log('   - Data:', response.websites);
      }
    }
  });
} else {
  console.log('❌ Chrome extension API not available');
}

// 9. Manual UI update trigger
console.log('\n9️⃣  MANUAL UI UPDATE TEST:');
if (window.updateTrackerUI) {
  console.log('   Calling updateTrackerUI()...');
  window.updateTrackerUI();
  console.log('✅ updateTrackerUI() executed');
} else {
  console.log('❌ updateTrackerUI() function not found');
}

// 10. Summary and recommendations
console.log('\n1️⃣0️⃣  SUMMARY & RECOMMENDATIONS:');
const issues = [];

if (!window.DetoxTracker) {
  issues.push('- tracker.js not loaded or not initialized');
}

if (!window.DETOX_USER_ID) {
  issues.push('- User ID not generated');
}

const data = window.DetoxTracker?.getCurrentData?.();
if (data && data.totalScreenTime === 0 && data.numberOfWebsites === 0) {
  issues.push('- No data collected (extension may not be tracking)');
}

if (foundElements === 0) {
  issues.push('- DOM elements not found (check HTML page structure)');
}

if (issues.length === 0) {
  console.log('✅ ALL SYSTEMS OPERATIONAL!');
  console.log('\nNext steps:');
  console.log('1. Data should now display on the page');
  console.log('2. If not visible, refresh page');
  console.log('3. Check Dashboard and Analytics pages');
  console.log('4. Open DevTools Console to see live logs');
} else {
  console.log('❌ ISSUES FOUND:');
  issues.forEach(issue => console.log(issue));
  console.log('\nRECOMMENDATIONS:');
  console.log('1. Reload Chrome extension: chrome://extensions');
  console.log('2. Refresh the page (Ctrl+R or Cmd+R)');
  console.log('3. Wait 5 seconds for data to populate');
  console.log('4. Check browser console for error messages');
  console.log('5. Visit a few websites to generate tracking data');
}

// 11. Live monitoring
console.log('\n📊 LIVE MONITORING:');
console.log('To monitor data updates in real-time, run:');
console.log('  setInterval(() => {');
console.log('    const data = window.DetoxTracker.getCurrentData();');
console.log('    console.log("Current data:", data.totalScreenTime, "mins,", data.numberOfWebsites, "sites");');
console.log('  }, 5000);');

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  Debug script complete. Check results above.');
console.log('═══════════════════════════════════════════════════════════');

// Export status for programmatic use
window.DEBUG_STATUS = {
  trackerLoaded: !!window.DetoxTracker,
  userIdPresent: !!window.DETOX_USER_ID,
  dataPresent: data && (data.totalScreenTime > 0 || data.numberOfWebsites > 0),
  domElementsFound: foundElements,
  firebaseInitialized: !!window.db,
  extensionAvailable: !!(window.chrome && window.chrome.runtime),
  eventSystemWorking: eventFired,
  hasIssues: issues.length > 0
};

console.log('\nDebug status exported to: window.DEBUG_STATUS');
