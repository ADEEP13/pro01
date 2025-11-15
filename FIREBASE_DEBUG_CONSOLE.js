// ============================================================================
// FIREBASE DATA LOADING DEBUG SCRIPT
// ============================================================================
// Copy and paste this entire script into your browser console (F12)
// on the dashboard.html page, then press Enter
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('🔍 FIREBASE DATA DEBUG - Starting diagnostic checks');
console.log('='.repeat(80) + '\n');

// TEST 1: Check if tracker is loaded
console.log('📋 TEST 1: Checking tracker initialization...');
if (window.DetoxTracker) {
  console.log('✅ DetoxTracker found');
  console.log('   - Current screen time:', window.DetoxTracker.getTotalMinutes(), 'minutes');
  console.log('   - Data:', window.DetoxTracker.getCurrentData());
} else {
  console.log('❌ DetoxTracker NOT found - tracker.js may not be loaded');
}

// TEST 2: Check User ID
console.log('\n📋 TEST 2: Checking User ID...');
const userId = window.DETOX_USER_ID || localStorage.getItem('detox_user_id');
if (userId) {
  console.log('✅ User ID found:', userId);
} else {
  console.log('❌ User ID NOT found');
}

// TEST 3: Check Firebase
console.log('\n📋 TEST 3: Checking Firebase connection...');
try {
  if (window.firebase) {
    console.log('✅ Firebase SDK loaded');
    if (window.firebase.firestore) {
      console.log('✅ Firestore available');
    }
  } else {
    console.log('⚠️ Firebase SDK may not be loaded yet');
  }
} catch (e) {
  console.log('❌ Firebase error:', e.message);
}

// TEST 4: Check localStorage
console.log('\n📋 TEST 4: Checking localStorage data...');
const lsData = JSON.parse(localStorage.getItem('detoxTrackerData') || '{}');
if (Object.keys(lsData).length > 0) {
  console.log('✅ localStorage has data:');
  console.log('   - totalActiveMs:', lsData.totalActiveMs);
  console.log('   - websites:', Object.keys(lsData.websiteTimeData || {}).length);
} else {
  console.log('⚠️ localStorage is empty');
}

// TEST 5: Check console logs for Firebase operations
console.log('\n📋 TEST 5: Checking recent tracker console logs...');
console.log('   (Look for "[tracker]" messages in console above)');
console.log('   - Should see "Firebase data loaded" messages');
console.log('   - Should see conversion of minutes to milliseconds');

// TEST 6: Manual Firebase read
console.log('\n📋 TEST 6: Attempting manual Firebase read...');
console.log('   (This will fetch from Firebase directly)');

(async () => {
  try {
    // We can't import directly, but we can try to access via window
    if (!window.firebase || !window.firebase.firestore) {
      console.log('❌ Firebase not initialized in window');
      return;
    }

    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * -60 * 1000;
    const localDate = new Date(today.getTime() + tzOffset);
    const dateStr = localDate.getUTCFullYear() + '-' + 
                    String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                    String(localDate.getUTCDate()).padStart(2, '0');
    
    console.log('   Today\'s date:', dateStr);
    console.log('   User ID:', userId);
    console.log('   Firebase path: users/' + userId + '/daily/' + dateStr);
    
    // Try to fetch from Firestore
    const db = window.firebase.firestore();
    const docRef = window.firebase.firestore.doc(db, 'users', userId, 'daily', dateStr);
    const snapshot = await window.firebase.firestore.getDoc(docRef);
    
    if (snapshot.exists()) {
      console.log('✅ Firebase document found!');
      const data = snapshot.data();
      console.log('   Data in Firebase:', data);
      console.log('   Total Screen Time: ' + data.totalScreenTime + ' minutes = ' + (data.totalScreenTime * 60 / 60) + ' hours');
      console.log('   Websites: ' + Object.keys(data.websiteTimeBreakdown || {}).length);
    } else {
      console.log('⚠️ Firebase document NOT found for today');
    }
  } catch (err) {
    console.log('⚠️ Could not access Firebase directly from console:', err.message);
    console.log('   This is normal - Firebase SDK may use different module system');
  }
})();

// TEST 7: Check what's displayed on page
console.log('\n📋 TEST 7: Checking what\'s displayed on page...');
const screenTimeEl = document.getElementById('screenTime') || document.getElementById('screen-time');
if (screenTimeEl) {
  console.log('✅ Screen time element found');
  console.log('   Displaying:', screenTimeEl.textContent);
} else {
  console.log('⚠️ Could not find screen time display element');
}

// TEST 8: Check website breakdown
console.log('\n📋 TEST 8: Checking website breakdown display...');
const breakdownEl = document.getElementById('usageBreakdown');
if (breakdownEl) {
  const sites = breakdownEl.querySelectorAll('li');
  console.log('✅ Website breakdown element found');
  console.log('   Websites displayed:', sites.length);
  if (sites.length > 0) {
    console.log('   First few sites:', Array.from(sites).slice(0, 3).map(el => el.textContent).join(', '));
  }
} else {
  console.log('⚠️ Could not find website breakdown element');
}

console.log('\n' + '='.repeat(80));
console.log('📊 SUMMARY');
console.log('='.repeat(80));
console.log('If you see ✅ for most tests, Firebase data should be loading.');
console.log('If you see ❌, tell me which test failed and we\'ll fix it.');
console.log('='.repeat(80) + '\n');
