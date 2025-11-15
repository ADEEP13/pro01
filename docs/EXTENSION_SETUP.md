// Extension Installation & Testing Guide

## QUICK START (5 minutes)

### 1. Install Extension
- Open Chrome
- Go to `chrome://extensions/`
- Enable "Developer mode" (toggle top-right)
- Click "Load unpacked"
- Select: `X02/extension/` folder
- ✅ Extension now loaded!

### 2. Test the System
- Open: `pages/dashboard.html` in your browser
- Visit some websites (google.com, github.com, stackoverflow.com, etc.)
- Switch between Chrome and other windows
- Wait 5-10 minutes (or check console: `console.log(DetoxTracker.getCurrentData())`)

### 3. Check Dashboard
You should see on dashboard:
- ✓ Screen time updating
- ✓ Website breakdown list
- ✓ Number of websites
- ✓ Firebase sync every 5 minutes

---

## TROUBLESHOOTING

### Extension not collecting data
```javascript
// In console on dashboard page:
chrome.runtime.sendMessage({ type: 'GET_WEBSITE_DATA' }, console.log)
// Should show: { websites: {...}, timestamp: ... }
```

### Data not appearing on dashboard
```javascript
// Check tracked data:
DetoxTracker.getCurrentData()

// Force sync:
DetoxTracker.flushNow()

// Check local storage:
localStorage.getItem('detox_usage_local_' + DetoxTracker.userId)
```

### Firebase not syncing
1. Check Firebase config: Open `js/firebase-config.js`
2. Verify your new Firebase project details are correct
3. Check Firestore security rules allow writes

### View Firebase data
1. Open Firebase Console
2. Go to Firestore Database
3. Look for `usage` collection
4. Should see daily documents: `user_xxx_2025-11-14`

---

## EXTENSION FILE STRUCTURE

```
extension/
├── manifest.json       # Extension configuration
├── background.js       # Tracks websites (service worker)
└── content.js          # Bridges extension & page
```

### What Each File Does

**manifest.json**
- Tells Chrome what permissions the extension needs
- Registers background script
- Sets extension icon

**background.js** 
- Runs in background all the time
- Records time spent on each website
- Detects tab changes and window focus
- Syncs data every 5 minutes to Chrome storage
- Sends data to your website

**content.js**
- Receives messages from background
- Passes them to your webpage
- Handles two-way communication

---

## DATA FLOW DIAGRAM

```
STEP 1: Extension Tracking (Continuous)
┌─────────────────────────────────────┐
│ User browses websites               │
│  - background.js monitors tabs      │
│  - Tracks time on each website      │
│  - Stores in Chrome storage         │
└─────────────────────────────────────┘
              ↓ every 5 min

STEP 2: Send to Website
┌─────────────────────────────────────┐
│ Extension → Dashboard Website       │
│  - Uses chrome.tabs.sendMessage()   │
│  - Sends: { websites: {...} }       │
└─────────────────────────────────────┘
              ↓

STEP 3: Website Receives Data
┌─────────────────────────────────────┐
│ tracker.js receives message         │
│  - Stores in websiteTimeData        │
│  - Updates UI with website list     │
│  - Prepares for Firebase            │
└─────────────────────────────────────┘
              ↓ every 5 min

STEP 4: Firebase Sync
┌─────────────────────────────────────┐
│ Website → Firebase Firestore        │
│  - Document: user_xxx_2025-11-14    │
│  - Stores: totalScreenTime          │
│  - Stores: websiteTimeBreakdown     │
└─────────────────────────────────────┘
              ↓

STEP 5: Real-Time Update
┌─────────────────────────────────────┐
│ Real-time listener (listeners.js)   │
│  - Firebase change detected         │
│  - Dashboard updates automatically  │
│  - Shows website breakdown          │
└─────────────────────────────────────┘
              ↓

STEP 6: Display to User
┌─────────────────────────────────────┐
│ Dashboard shows:                    │
│  - Total: 2h 15m                    │
│  - Websites:                        │
│    • google.com: 45m                │
│    • github.com: 30m                │
│    • stackoverflow.com: 20m         │
│    • localhost: 60m                 │
└─────────────────────────────────────┘
```

---

## TESTING CHECKLIST

- [ ] Extension loads without errors
- [ ] Visit 3-5 different websites
- [ ] Switch between tabs (data records)
- [ ] Minimize/restore Chrome window (tracks)
- [ ] Wait 5 minutes
- [ ] Dashboard updates with website list
- [ ] Firebase Console shows usage document
- [ ] Switch pages (analytics/schedule) - still tracking
- [ ] Close/reopen browser - data persists

---

## LIVE TESTING COMMANDS

Run these in console on dashboard.html:

```javascript
// View all collected data
DetoxTracker.getCurrentData()

// Get screen time in minutes
console.log(DetoxTracker.getTotalMinutes() + ' minutes')

// Get websites
DetoxTracker.getWebsiteData()

// Force Firebase sync now
await DetoxTracker.flushNow()

// Your user ID
console.log('User ID: ' + DetoxTracker.userId)

// Local storage backup
localStorage.getItem('detox_usage_local_' + DetoxTracker.userId)
```

---

## EXPECTED OUTPUTS

After 5 minutes of browsing:

**Console Output:**
```
{
  totalMinutes: 12,
  numberOfWebsites: 4,
  websites: [
    { site: "google.com", minutes: 5 },
    { site: "github.com", minutes: 3 },
    { site: "localhost", minutes: 2 },
    { site: "stackoverflow.com", minutes: 2 }
  ]
}
```

**Dashboard Display:**
```
Screen Time Today
─────────────────
12m (or 0h 12m)

Today's Usage Breakdown
─────────────────────────
google.com        5m
github.com        3m
localhost         2m
stackoverflow.com 2m

Number of Websites: 4
```

**Firebase Document:**
```
Collection: usage
Document: user_abc123_2025-11-14

{
  userId: "user_abc123",
  date: "2025-11-14",
  totalScreenTime: 12,
  numberOfWebsites: 4,
  websiteTimeBreakdown: {
    "google.com": 5,
    "github.com": 3,
    "localhost": 2,
    "stackoverflow.com": 2
  },
  updatedAt: Timestamp,
  lastActive: Timestamp
}
```

---

## NEXT STEPS

1. ✅ Extension installed and working
2. ✅ Data flowing to dashboard
3. ✅ Firebase storing data
4. Then: 
   - Set up analytics page to show trends
   - Create weekly/monthly reports
   - Add focus session tracking
   - Set daily goals and limits
