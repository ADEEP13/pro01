// Quick Firebase-Only Debug Test
// Paste this in console to verify Firebase is being read

console.log('\n🔥 FIREBASE-ONLY DATA TEST');
console.log('=' .repeat(60));

// Check current tracker state
console.log('\n1. Current Tracker Data:');
if (window.DetoxTracker) {
  const data = window.DetoxTracker.getCurrentData();
  console.log('   Screen Time:', window.DetoxTracker.getTotalMinutes(), 'minutes');
  console.log('   Data:', data);
  console.log('   Is this Firebase (350m) or Local (40m)?', 
    data.totalScreenTime === 350 ? '✅ FIREBASE' : '❌ LOCAL or WRONG');
} else {
  console.log('   ❌ DetoxTracker not loaded');
}

// Check localStorage has stale data
console.log('\n2. localStorage Content:');
const lsKey = 'detox_usage_local_' + (window.DETOX_USER_ID || localStorage.getItem('detox_user_id'));
const lsValue = localStorage.getItem(lsKey);
if (lsValue) {
  try {
    const obj = JSON.parse(lsValue);
    console.log('   ⚠️  localStorage has:', obj.totalActiveMs, 'ms =', Math.round(obj.totalActiveMs / 60000), 'minutes');
    console.log('   This should be IGNORED if Firebase loading correctly');
  } catch (e) {
    console.log('   Error parsing:', e.message);
  }
} else {
  console.log('   ✅ No stale localStorage data');
}

// Show what should be displayed
console.log('\n3. Expected Result:');
console.log('   ✅ Screen Time: 5h 50m (350 minutes from Firebase)');
console.log('   ✅ Websites: 14');
console.log('   ✅ Data source: Firebase ONLY, not localStorage');

console.log('\n' + '='.repeat(60));
