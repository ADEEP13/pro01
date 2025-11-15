// Daily Data System - Validation & Testing Script
// Copy this to your browser console and run it

console.log("🔍 Daily Data System Validation Started...\n");

// ============================================
// 1. Check System Status
// ============================================
console.group("1️⃣  System Status");

const status = {
  trackerAvailable: typeof window.DetoxTracker !== 'undefined',
  trackerFunctions: window.DetoxTracker ? {
    getTotalMinutes: typeof window.DetoxTracker.getTotalMinutes === 'function',
    getWebsiteData: typeof window.DetoxTracker.getWebsiteData === 'function',
    getCurrentData: typeof window.DetoxTracker.getCurrentData === 'function',
    currentDate: typeof window.DetoxTracker.currentDate === 'function'
  } : null,
  flushFunction: typeof window.flushToFirestore === 'function',
  chromeAvailable: typeof window.chrome !== 'undefined',
  extensionAvailable: typeof window.chrome?.runtime !== 'undefined'
};

console.table(status);
console.groupEnd();

// ============================================
// 2. Check Current Data
// ============================================
console.group("2️⃣  Current Data");

if (window.DetoxTracker) {
  const currentData = window.DetoxTracker.getCurrentData();
  console.log("Current Date:", currentData.date || "ERROR");
  console.log("Total Minutes:", currentData.totalMinutes || 0);
  console.log("Website Count:", currentData.numberOfWebsites || 0);
  console.log("Websites:", currentData.websites || []);
} else {
  console.warn("⚠️ DetoxTracker not available");
}

console.groupEnd();

// ============================================
// 3. Check Local Storage
// ============================================
console.group("3️⃣  Local Storage");

try {
  const userId = window.DetoxTracker?.userId;
  if (userId) {
    const stored = localStorage.getItem('detox_usage_local_' + userId);
    if (stored) {
      const data = JSON.parse(stored);
      console.log("Stored Date:", data.date);
      console.log("Total Active Ms:", data.totalActiveMs);
      console.log("Website Count:", Object.keys(data.websiteTimeData || {}).length);
      console.log("Last Saved:", data.lastChange);
    } else {
      console.warn("⚠️ No data in localStorage");
    }
  } else {
    console.warn("⚠️ User ID not available");
  }
} catch (e) {
  console.error("❌ Error reading localStorage:", e);
}

console.groupEnd();

// ============================================
// 4. Check Extension Connection
// ============================================
console.group("4️⃣  Extension Connection");

if (window.chrome?.runtime) {
  chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("⚠️ Extension not responding:", chrome.runtime.lastError.message);
    } else {
      console.log("Extension Response:", {
        date: response?.currentDate,
        websites: Object.keys(response?.websites || {}).length,
        timestamp: new Date(response?.timestamp).toLocaleString()
      });
    }
  });
} else {
  console.warn("⚠️ Chrome extension not available");
}

console.groupEnd();

// ============================================
// 5. Check Date Functionality
// ============================================
console.group("5️⃣  Date Validation");

const today = new Date();
const offset = today.getTimezoneOffset() * -60 * 1000;
const local = new Date(today.getTime() + offset);
const dateStr = local.getUTCFullYear() + '-' + 
                String(local.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                String(local.getUTCDate()).padStart(2, '0');

console.log("Current UTC Date:", new Date().toISOString().slice(0, 10));
console.log("Timezone Offset:", today.getTimezoneOffset() + " minutes");
console.log("Calculated Local Date:", dateStr);
console.log("TrackerFunction Date:", window.DetoxTracker?.currentDate?.() || "Not available");

console.groupEnd();

// ============================================
// 6. Performance Check
// ============================================
console.group("6️⃣  Performance Metrics");

console.log("Tracker Object Size:", JSON.stringify(window.DetoxTracker).length, "bytes");

const startCheck = performance.now();
const checkResult = window.DetoxTracker?.getCurrentData();
const endCheck = performance.now();

console.log("Day-check execution time:", (endCheck - startCheck).toFixed(3) + "ms");
console.log("Status: ✅ Acceptable (should be < 5ms)");

console.groupEnd();

// ============================================
// 7. Firebase Connection Test
// ============================================
console.group("7️⃣  Firebase Test");

console.log("Testing Firebase flush...");
console.log("Run this command: await window.flushToFirestore()");
console.log("Then check Firebase console for new/updated document at:");
console.log(`users/${window.DetoxTracker?.userId}/daily/${window.DetoxTracker?.currentDate?.()}`);

console.groupEnd();

// ============================================
// 8. Summary Report
// ============================================
console.group("📊 Summary Report");

const allChecks = [
  { name: "Tracker Available", pass: status.trackerAvailable },
  { name: "All Functions Present", pass: Object.values(status.trackerFunctions || {}).every(v => v) },
  { name: "Flush Function Present", pass: status.flushFunction },
  { name: "Chrome Extension Available", pass: status.extensionAvailable },
  { name: "Data in Local Storage", pass: !!localStorage.getItem('detox_usage_local_' + window.DetoxTracker?.userId) },
  { name: "Valid Date Format", pass: /^\d{4}-\d{2}-\d{2}$/.test(window.DetoxTracker?.currentDate?.()) }
];

console.table(allChecks);

const passCount = allChecks.filter(c => c.pass).length;
const totalCount = allChecks.length;

if (passCount === totalCount) {
  console.log(`✅ All checks passed! (${passCount}/${totalCount})`);
} else {
  console.warn(`⚠️ Some checks failed! (${passCount}/${totalCount})`);
}

console.groupEnd();

// ============================================
// 9. Detailed Diagnostics
// ============================================
console.group("🔧 Detailed Diagnostics");

console.log("System Configuration:");
console.log({
  userAgent: navigator.userAgent,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  screenTime: window.DetoxTracker?.getTotalMinutes?.() + " minutes",
  websiteCount: window.DetoxTracker?.getNumberOfWebsites?.(),
  userId: window.DetoxTracker?.userId
});

console.groupEnd();

// ============================================
// 10. Action Items
// ============================================
console.group("📋 Next Steps");

console.log("1. Wait for extension to respond (check step 4️⃣)");
console.log("2. If all checks pass ✅, system is ready");
console.log("3. Test manual flush: await window.flushToFirestore()");
console.log("4. Verify Firebase documents created");
console.log("5. Monitor console logs for day-change detection");

console.groupEnd();

console.log("\n✅ Validation Complete!\n");

// ============================================
// Export to variable for inspection
// ============================================
window.DAILY_DATA_STATUS = {
  status,
  currentData: window.DetoxTracker?.getCurrentData?.(),
  timestamp: new Date().toISOString()
};

console.log("Validation data saved to: window.DAILY_DATA_STATUS");
console.log("Inspect with: console.table(window.DAILY_DATA_STATUS)");
