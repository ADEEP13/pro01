# 🔧 TROUBLESHOOTING GUIDE

Complete solutions for every problem you might encounter.

---

## 🔴 CRITICAL ISSUES

### Issue: "Permission Denied" Error in Console

**Where to see it:** Browser Console (F12) → red error messages

**Causes:**
1. Firebase security rules are too restrictive
2. User not authenticated
3. Document doesn't exist yet

**Solution:**

Go to Firebase Console → Firestore → Rules tab → Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // For development/testing - allow all reads
    match /usage/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Then click **Publish**.

**Then test:**
1. Hard refresh page (Ctrl+Shift+R)
2. Check console - error should be gone
3. Dashboard should now show data

---

### Issue: "No Data Available Yet" Message

**Where to see it:** Dashboard page shows empty state

**Causes:**
1. Extension not installed
2. Extension not tracking
3. Data not synced to Firebase yet
4. First sync takes 5-10 minutes

**Solution - Step 1: Check Extension is Installed**

1. Open `chrome://extensions/`
2. Look for "Social Detox" extension
3. If not there, click **Load unpacked** and select `extension/` folder
4. Extension ID should appear (e.g., `jkfhskdjfhsdkjf...`)

**Solution - Step 2: Check Extension is Tracking**

1. Open any website
2. Open DevTools (F12)
3. Go to **Application** tab → **Local Storage**
4. Look for entry starting with `detox_`
5. Click it and see JSON in right panel

**Expected JSON:**
```json
{
  "websites": {
    "google.com": 5,
    "github.com": 12
  },
  "timestamp": 1731619200000
}
```

If you don't see this, extension is not working:
- [ ] Disable and re-enable extension
- [ ] Reload extension (refresh icon in extensions page)
- [ ] Check `extension/background.js` exists

**Solution - Step 3: Check Firebase Sync**

1. Wait 5-10 minutes
2. Go to Firebase Console
3. Firestore Database → **Data** tab
4. Look for `usage` collection
5. Should see document like: `user123_2025-11-14`

If document doesn't appear:
- [ ] Check `js/firebase-config.js` has correct `projectId: "svit-ise-proj"`
- [ ] Check security rules allow writes (see above)
- [ ] Check browser console for Firebase errors

---

### Issue: "Cannot read property 'websiteTimeBreakdown' of undefined"

**Where to see it:** Console errors, dashboard doesn't load

**Causes:**
1. Firestore document structure incorrect
2. Firebase not returning data

**Solution:**

1. Go to Firebase Firestore → Data tab
2. Check document structure. It should have:
   ```json
   {
     "userId": "user123",
     "date": "2025-11-14",
     "totalScreenTime": 120,
     "numberOfWebsites": 5,
     "websiteTimeBreakdown": {
       "google.com": 45,
       "github.com": 30
     }
   }
   ```

3. If fields are missing, manually add them (click **+** in Firestore)
4. Reload page (Ctrl+Shift+R)
5. Error should be fixed

---

## 🟠 COMMON ISSUES

### Issue: Charts Not Showing on Analytics Page

**Where to see it:** Analytics page looks empty or shows "Loading..."

**Causes:**
1. Chart.js library not loaded
2. Canvas elements missing
3. Data not formatting correctly

**Solution:**

1. Check browser console (F12):
   - Should NOT have red errors
   - Should see message: "Analytics updated: {...}"

2. Right-click analytics page → Inspect
3. Look for `<canvas id="usageTrendChart">`
4. If missing, `analytics.html` needs updating

5. Check Chart.js is loaded:
   - Go to Application → Network tab
   - Should see `chart.js` file downloaded
   - If red X, library failed to load

**Fix:** Ensure `analytics.html` has this in `<head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

### Issue: Data Not Real-Time (Takes More Than 10 Minutes)

**Where to see it:** Charts don't update when you visit new website

**Causes:**
1. Extension not syncing frequently
2. Firebase listener not set up
3. Network issues

**Solution:**

**Step 1: Check Extension Sync Interval**

Open `extension/background.js` and verify:
```javascript
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes = correct
```

If it says 30 minutes or more, update it to 5 minutes.

**Step 2: Force Manual Sync**

Open browser console and run:
```javascript
DetoxTracker.flushNow()
```

Should return a Promise that resolves.

**Step 3: Check Firebase Listener**

In console, run:
```javascript
import { db } from './js/firebase-config.js';
console.log('Firebase DB:', db);
```

Should log Firebase object without errors.

**Step 4: Test Real-Time Updates**

1. Open Analytics page
2. Open DevTools Network tab
3. Visit a new website (that you haven't visited yet)
4. In Network tab, should see Firestore request within 5 minutes
5. Page should automatically update

---

### Issue: "Cannot GET /pages/dashboard.html"

**Where to see it:** Browser shows 404 error

**Causes:**
1. Wrong file path
2. Opening file from wrong location

**Solution:**

✅ **Correct ways to open:**

Option 1: Direct file path
```
file:///C:/Users/adeep/OneDrive/Desktop/hackthon/X02/pages/dashboard.html
```

Option 2: Using local server (recommended)
```bash
# In your project folder
python -m http.server 8000
# Then open: http://localhost:8000/pages/dashboard.html
```

Option 3: Use VS Code Live Server extension
- Install: "Live Server" extension
- Right-click `dashboard.html` → Open with Live Server
- Opens at: `http://127.0.0.1:5500/pages/dashboard.html`

❌ **Wrong:**
- Double-clicking HTML file (uses `file://` which may not work)
- Opening without full path

---

### Issue: Extension Shows "Could Not Load"

**Where to see it:** Chrome Extensions page shows error message

**Causes:**
1. `manifest.json` has syntax errors
2. File is corrupted
3. Wrong folder selected

**Solution:**

1. Check `extension/manifest.json` syntax:
   - Open in VS Code
   - Look for red squiggly lines (errors)
   - Should be valid JSON (no trailing commas, etc.)

2. Recreate manifest.json (copy from PRODUCTION_SETUP.md Appendix A)

3. Reload extension:
   - Go to `chrome://extensions/`
   - Find Social Detox
   - Click refresh icon
   - Should load

---

## 🟡 PERFORMANCE ISSUES

### Issue: Page Loads Slowly (>5 seconds)

**Causes:**
1. Too many Firebase queries
2. Chart.js taking time to render
3. Network issues

**Solution:**

1. Open DevTools → Performance tab
2. Record loading process
3. Look for slow tasks (red bars)

**Optimize:**
- Reduce number of Firebase queries
- Lazy-load charts (only load when visible)
- Cache data in localStorage

---

### Issue: High Battery/CPU Usage

**Causes:**
1. Extension checking too frequently
2. Unnecessary timers running
3. Charts updating too often

**Solution:**

Increase sync interval in `extension/background.js`:
```javascript
// Change from 5 minutes to 10 minutes
const SYNC_INTERVAL = 10 * 60 * 1000;
```

---

## 🟢 MINOR ISSUES

### Issue: "User ID Not Found" Message

**Where to see it:** Top of page or in console

**Solution:**

1. Check localStorage:
   ```javascript
   // In console:
   localStorage.getItem('detox_user_id')
   // Should return something like: "user_abc123"
   ```

2. If empty, set it manually:
   ```javascript
   localStorage.setItem('detox_user_id', 'my_user_' + Date.now());
   ```

3. Reload page - should work now

---

### Issue: "Previous Sessions" Shows No Data

**Where to see it:** Analytics page shows empty previous data

**Causes:**
1. No data for previous days yet (normal if just started)
2. Firebase queries not finding documents

**Solution:**

This is normal! Your data accumulates over time:
- Day 1: Only today's data
- Day 2: Today + yesterday
- Week 1: Full week of data

To create test data for previous days, manually add documents to Firebase:

1. Go to Firebase Firestore
2. Click **usage** collection
3. Click **+ Add document**
4. Document ID: `{userId}_2025-11-13` (yesterday)
5. Add fields same as today
6. Click Save

Repeat for more historical data.

---

### Issue: Charts Show Only One Data Point

**Causes:**
1. Only one day of data
2. Trend data not calculated

**Solution:**

This is normal! Charts improve as more data accumulates:
- 1 day: Single bar/point
- 3 days: Mini trend
- 7 days: Clear pattern

Keep using the app - data will accumulate automatically.

---

## 🔍 DIAGNOSTIC COMMANDS

Run these in browser console (F12):

### Check Extension Status
```javascript
console.log('User ID:', localStorage.getItem('detox_user_id'));
console.log('Tracked Data:', localStorage.getItem('detox_tracker'));
```

### Check Firebase Connection
```javascript
import { db } from './js/firebase-config.js';
console.log('Firebase Config OK:', db != null);
```

### Check Tracking Data
```javascript
if (window.DetoxTracker) {
  console.log('Current Data:', DetoxTracker.getCurrentData());
  console.log('Total Minutes:', DetoxTracker.getTotalMinutes());
  console.log('Websites:', DetoxTracker.getWebsiteData());
}
```

### Force Firebase Sync
```javascript
DetoxTracker.flushNow().then(() => console.log('Synced!'));
```

### Check Real-Time Listener
```javascript
// Should see "Analytics updated: {...}" appear in console
// when Firebase data changes
```

---

## 📋 DEBUGGING CHECKLIST

When reporting an issue, collect:

- [ ] Screenshot of error
- [ ] Browser console output (F12)
- [ ] Network tab showing failed requests
- [ ] Firebase Firestore document contents
- [ ] Chrome extension popup status
- [ ] Operating System
- [ ] Browser version (`chrome://version/`)
- [ ] Steps to reproduce

---

## 🆘 STILL HAVING ISSUES?

### Check the Documentation

1. **PRODUCTION_SETUP.md** - Complete setup guide
2. **QUICK_LAUNCH.md** - Quick reference checklist
3. **START_HERE.md** - Getting started guide

### Verify All Files Exist

```
✅ extension/manifest.json
✅ extension/background.js
✅ extension/content.js
✅ js/firebase-config.js
✅ js/tracker.js
✅ js/listeners.js
✅ js/analytics.js (should have real data code)
✅ pages/dashboard.html
✅ pages/analytics.html
✅ css/main.css
```

### Clear Cache & Reload

```javascript
// In console:
localStorage.clear();
sessionStorage.clear();
// Then hard reload: Ctrl+Shift+R
```

### Check Network

1. DevTools → Network tab
2. Reload page
3. Look for failed requests (red X)
4. Check if Firebase requests go through

---

## ✅ EVERYTHING WORKING?

If all checks pass:
- ✅ Extension tracking
- ✅ Data in Firebase
- ✅ Dashboard showing data
- ✅ Analytics showing charts
- ✅ No console errors
- ✅ Real-time updates working

**Congratulations! Your app is production-ready! 🎉**

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
**Status:** Production Ready
