// FIREBASE DATA LOAD DEBUGGING SCRIPT
// Copy this entire code to browser console to debug Firebase loading

console.log('═══════════════════════════════════════════════════════════');
console.log('  FIREBASE DATA LOADING - COMPLETE DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════\n');

// 1. Check if tracker is loaded
console.log('1️⃣  TRACKER SYSTEM:');
if (window.DetoxTracker) {
  console.log('✅ DetoxTracker loaded');
  const currentData = window.DetoxTracker.getCurrentData();
  console.log('   Current data:', currentData);
  console.log('   - Date:', currentData.date);
  console.log('   - Total minutes:', currentData.totalScreenTime);
  console.log('   - Websites:', currentData.numberOfWebsites);
  console.log('   - Breakdown:', currentData.websiteTimeBreakdown);
} else {
  console.log('❌ DetoxTracker not loaded');
}

// 2. Check User ID
console.log('\n2️⃣  USER ID:');
if (window.DETOX_USER_ID) {
  console.log('✅ User ID:', window.DETOX_USER_ID);
} else {
  console.log('❌ User ID not found');
}

// 3. Check Firebase
console.log('\n3️⃣  FIREBASE:');
if (window.db) {
  console.log('✅ Firebase database initialized');
} else {
  console.log('❌ Firebase not initialized');
}

// 4. Check localStorage
console.log('\n4️⃣  LOCAL STORAGE:');
const keys = Object.keys(localStorage);
const trackerKeys = keys.filter(k => k.includes('detox'));
console.log('Tracker-related keys:', trackerKeys);
trackerKeys.forEach(key => {
  const data = JSON.parse(localStorage.getItem(key));
  console.log(`\n   ${key}:`);
  console.log('   ', data);
});

// 5. Manual Firebase read test
console.log('\n5️⃣  MANUAL FIREBASE READ TEST:');
console.log('Attempting to read Firebase document manually...\n');

(async () => {
  try {
    const { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js');
    
    const userId = window.DETOX_USER_ID;
    const today = new Date();
    const offsetMs = today.getTimezoneOffset() * -60 * 1000;
    const localDate = new Date(today.getTime() + offsetMs);
    const dateStr = localDate.getUTCFullYear() + '-' + 
                    String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                    String(localDate.getUTCDate()).padStart(2, '0');
    
    const ref = doc(window.db, 'users', userId, 'daily', dateStr);
    console.log('Reading from Firebase path:');
    console.log(`  users/${userId}/daily/${dateStr}\n`);
    
    const snapshot = await getDoc(ref);
    
    if (snapshot.exists()) {
      console.log('✅ Firebase document found!');
      const data = snapshot.data();
      console.log('\nDocument data:');
      console.log(data);
      
      console.log('\n📊 DATA BREAKDOWN:');
      console.log('  - totalScreenTime:', data.totalScreenTime, 'minutes');
      console.log('  - numberOfWebsites:', data.numberOfWebsites);
      console.log('  - lastActive:', data.lastActive?.toDate?.());
      console.log('  - Websites in breakdown:', Object.keys(data.websiteTimeBreakdown || {}).length);
      
      if (data.websiteTimeBreakdown) {
        console.log('\n  Website breakdown:');
        Object.entries(data.websiteTimeBreakdown).forEach(([site, mins]) => {
          console.log(`    ${site}: ${mins} minutes`);
        });
      }
    } else {
      console.log('❌ No Firebase document found for today');
      console.log('   Path checked: users/' + userId + '/daily/' + dateStr);
    }
  } catch (err) {
    console.error('❌ Error reading Firebase:', err);
  }
})();

// 6. Check what tracker currently has in memory
console.log('\n6️⃣  TRACKER MEMORY STATE:');
setTimeout(() => {
  if (window.DetoxTracker) {
    const data = window.DetoxTracker.getCurrentData();
    console.log('✅ Current tracker data in memory:');
    console.log('   Total minutes:', data.totalScreenTime);
    console.log('   Websites:', data.numberOfWebsites);
    
    if (data.totalScreenTime === 0 && data.numberOfWebsites === 0) {
      console.log('\n⚠️  ISSUE: Tracker data is still empty!');
      console.log('   This means Firebase data was NOT loaded into memory.');
      console.log('   Check console above for any error messages.');
    } else {
      console.log('\n✅ SUCCESS: Data is loaded in memory!');
      console.log('   Firebase data has been successfully loaded.');
    }
  }
}, 2000);

console.log('\n═══════════════════════════════════════════════════════════');
console.log('Diagnostic complete. Check results above.');
console.log('═══════════════════════════════════════════════════════════');
