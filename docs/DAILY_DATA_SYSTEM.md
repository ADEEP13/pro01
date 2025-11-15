# Daily Data Storage System

## Overview
The system now implements proper daily-isolated data storage where each day's data is completely separate and independent. Data automatically resets at midnight (00:00 local time) without affecting previous days' data.

## Firebase Structure
```
Firestore Database:
└── users (collection)
    └── {userId} (document)
        └── daily (subcollection)
            ├── 2025-11-14 (document)
            │   ├── date: "2025-11-14"
            │   ├── totalScreenTime: 480 (minutes)
            │   ├── numberOfWebsites: 12
            │   ├── websiteTimeBreakdown: {
            │   │   "github.com": 120,
            │   │   "google.com": 85,
            │   │   ...
            │   }
            │   ├── lastActive: (timestamp)
            │   └── updatedAt: (timestamp)
            │
            └── 2025-11-15 (document)
                ├── date: "2025-11-15"
                ├── totalScreenTime: 0 (fresh start)
                ├── numberOfWebsites: 0
                ├── websiteTimeBreakdown: {}
                ├── lastActive: (timestamp)
                └── updatedAt: (timestamp)
```

## Key Components

### 1. Extension (background.js)
**Responsibilities:**
- Tracks website usage from the browser
- Detects when the day changes
- Resets data at midnight automatically
- Archives old day's data before resetting

**Features:**
- `getTodayDate()`: Returns YYYY-MM-DD in user's local timezone
- `checkAndHandleDayChange()`: Checks if day has changed, archives old data, resets for new day
- Stores `currentDate` alongside `websiteTimeData` in Chrome storage
- Runs day-check on:
  - Every tab activation
  - Every tab URL change
  - Every window focus change
  - Every sync interval (5 minutes)
  - Every minute (dedicated interval)

### 2. Website Tracker (js/tracker.js)
**Responsibilities:**
- Tracks screen time and user activity
- Requests data from extension
- Syncs data to Firebase
- Detects day changes and resets accordingly

**Key Functions:**
- `getTodayDate()`: Returns current date in YYYY-MM-DD format
- `checkAndHandleDayChange()`: 
  - Compares current date with stored date
  - Flushes old day's data one final time
  - Resets all counters for new day
  - Logs the day transition
  
**Sync Flow:**
1. Every 15 seconds: Updates local time counter
2. Every 5 minutes: Flushes to Firebase for that day
3. Every minute: Checks for day changes
4. On page unload: Final flush to Firebase
5. On visibility change: Tracks active/inactive time

### 3. Firebase Sync
**Document Path:** `users/{userId}/daily/{YYYY-MM-DD}`

**Data Written:**
```javascript
{
  date: "2025-11-15",
  totalScreenTime: 480,        // minutes
  numberOfWebsites: 12,
  websiteTimeBreakdown: {
    "github.com": 120,
    "google.com": 85,
    ...
  },
  lastActive: Timestamp,       // Firebase server timestamp
  updatedAt: Timestamp         // Firebase server timestamp
}
```

## How It Works

### Day Change Detection Process
1. **Every check**, the system compares `currentDate` with `getTodayDate()`
2. **If different:**
   - Old day's data is flushed to Firebase immediately
   - Old day's data is archived in Chrome storage
   - All counters reset to 0
   - `currentDate` updates to new date
   - localStorage is cleared for the new day

### Data Flow
```
Extension tracks → Chrome storage → Website checks → Firebase (daily)
    (every 5min)     (at intervals)   (every 5min)   (YYYY-MM-DD docs)
```

### Recovery on Page Reload
When tracker.js initializes:
1. Checks localStorage for stored data
2. Compares stored date with today's date
3. **If dates match:** Restores counters and continues
4. **If dates differ:** Resets all counters for new day

## Local Storage Structure
**Key:** `detox_usage_local_{userId}`
**Value:**
```javascript
{
  totalActiveMs: 28800000,      // milliseconds
  websiteTimeData: {
    "github.com": 7200000,      // milliseconds
    "google.com": 5100000,
    ...
  },
  date: "2025-11-15",
  lastChange: "2025-11-15T10:30:00.000Z"
}
```

## Chrome Extension Storage
**Key:** `websiteTimeData`
**Key:** `currentDate`
**Key:** `dailyDataArchive` (for historical records)

**Value:**
```javascript
{
  "github.com": 7200000,
  "google.com": 5100000,
  ...
}
```

## Testing the System

### Test 1: Verify Daily Reset
1. Open the website at 11:59 PM
2. Perform some activity
3. Wait for midnight or change system time
4. Check console: Should see "Day changed from 2025-11-14 to 2025-11-15"
5. Check Firebase: Should have separate documents for each day

### Test 2: Verify Data Persistence
1. Track usage on 2025-11-15
2. Reload the page
3. Data should persist (same date)
4. Reload next day
5. Data should reset (new date)

### Test 3: Verify Firebase Sync
1. Open browser console
2. Run: `window.flushToFirestore()`
3. Check Firebase console
4. Should see document at: `users/{userId}/daily/{today}`
5. Should contain today's aggregated data

### Test 4: Verify Extension Sync
1. Open console: `console.log(window.DetoxTracker.getCurrentData())`
2. Should show:
   - `date`: Today's date
   - `totalMinutes`: Screen time for today only
   - `websites`: Website breakdown for today only

## Console Commands

```javascript
// Get current day's data
window.DetoxTracker.getCurrentData()

// Get total minutes for today
window.DetoxTracker.getTotalMinutes()

// Get website breakdown
window.DetoxTracker.getWebsiteData()

// Manually flush to Firebase
window.flushToFirestore()

// Get current date
window.DetoxTracker.currentDate()

// Get tracker status
{
  date: window.DetoxTracker.currentDate(),
  totalMinutes: window.DetoxTracker.getTotalMinutes(),
  websites: window.DetoxTracker.getNumberOfWebsites()
}
```

## Important Notes

1. **Timezone Handling:**
   - System uses local timezone for date determination
   - Date resets at local midnight (00:00 local time)
   - NOT UTC midnight

2. **Data Isolation:**
   - Each day is completely independent
   - No data carries over between days
   - Old days' data is archived in Chrome storage

3. **Sync Guarantees:**
   - Data syncs every 5 minutes to Firebase
   - Final sync on page unload
   - Data is merged (not overwritten)

4. **Recovery:**
   - If sync fails, data is stored locally
   - Next successful sync will push all accumulated data
   - No data loss

## Firebase Security Rules (Recommended)
```
match /users/{userId}/daily/{date} {
  allow read, write: if request.auth.uid == userId;
}
```

## Troubleshooting

**Issue: Data not syncing to Firebase**
- Solution: Check Firebase config in js/firebase-config.js
- Verify security rules allow writes
- Check browser console for errors

**Issue: Data from yesterday appears today**
- Solution: Likely a timezone issue
- Check if `getTodayDate()` returns correct date
- Run: `new Date().toISOString().slice(0,10)` in console
- Compare with actual date

**Issue: Data resets unexpectedly**
- Solution: Check if system detected day change incorrectly
- Verify `checkAndHandleDayChange()` logs
- Check if localStorage was cleared

**Issue: Extension not syncing data**
- Solution: Verify extension is loaded (check chrome://extensions)
- Check extension console for errors
- Verify permission for `chrome.storage.local`

## Next Steps

1. **Historical Data View:** Create a date picker to view past days
2. **Weekly/Monthly Reports:** Aggregate data from daily documents
3. **Data Export:** Export daily data to CSV/PDF
4. **Notifications:** Alert user when approaching daily goals
5. **Trends:** Compare daily patterns over time
