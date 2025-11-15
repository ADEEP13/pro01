# Real-Time Screen Time Tracking System

## Overview

This system provides real-time data collection of screen time, website usage, and time spent per website. Data flows from a Chrome extension through Firebase to your website dashboard, with updates every 5-10 minutes.

## Architecture

```
Chrome Extension (background.js) 
    ↓ (collects website data)
    ↓
Firefox/Chrome Storage
    ↓ (syncs every 5 min)
    ↓
Firebase Firestore (usage collection)
    ↓ (real-time listener)
    ↓
Website Dashboard (tracker.js + listeners.js)
    ↓ (displays data)
    ↓
Analytics Page (uses stored data)
```

## Components

### 1. **Browser Extension** (`/extension/`)

#### manifest.json
- Defines extension metadata
- Requests permissions: tabs, activeTab, scripting, storage
- Runs background.js as service worker

#### background.js
- Tracks active tab and URL changes
- Records time spent on each website
- Detects window focus changes
- Syncs data to Chrome storage every 5 minutes
- Broadcasts data to website via `chrome.tabs.sendMessage()`

#### content.js
- Listens for messages from background script
- Bridges extension and web page data transfer

### 2. **Website Tracking** (`/js/tracker.js`)

**Key Features:**
- Listens for extension messages via `chrome.runtime.onMessage`
- Tracks page visibility (tab active/inactive)
- Monitors user activity (mouse, keyboard, touch)
- Stores data locally and syncs to Firebase every 5 minutes
- Exposes `window.DetoxTracker` API

**Data Structure:**
```javascript
{
  totalActiveMs: 3600000,        // milliseconds of active time
  websiteTimeData: {
    "google.com": 900000,        // 15 minutes
    "github.com": 1200000,       // 20 minutes
    "localhost": 1500000         // 25 minutes
  }
}
```

**Firebase Storage Structure:**
```
Collection: usage
Document ID: {userId}_{date}
Fields:
  - userId: string
  - date: YYYY-MM-DD
  - totalScreenTime: minutes
  - numberOfWebsites: number
  - websiteTimeBreakdown: {
      "google.com": 15,
      "github.com": 20,
      ...
    }
  - lastActive: timestamp
  - updatedAt: timestamp
```

### 3. **Real-Time Listener** (`/js/listeners.js`)

**Functions:**

#### `initRealtimeListeners(userId)`
- Sets up Firebase onSnapshot listener for today's usage doc
- Updates UI every time data changes in Firebase
- Runs on dashboard.html load

**UI Updates:**
- Screen time display
- Number of websites
- Website breakdown list
- Productivity metrics

### 4. **Data Flow Timeline**

```
1. User opens website
   └─ tracker.js initialized
   └─ Requests website data from extension
   
2. Extension tracks websites (continuous)
   └─ Every 5 minutes: broadcasts to website
   
3. Website receives data
   └─ Updates UI locally
   └─ Flushes to Firebase
   
4. Firebase stores data
   └─ Real-time listener triggers
   
5. Dashboard displays updates
   └─ Shows total screen time
   └─ Lists all websites with time spent
   └─ Updates analytics
```

## Setup Instructions

### Step 1: Install Browser Extension

**Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `/extension/` folder from this project
5. Extension will appear in your toolbar

### Step 2: Verify Extension is Running

1. Click extension icon in toolbar
2. Open Developer Tools (F12) → Background service worker
3. You should see: "Extension loaded. Websites tracked: [...]"

### Step 3: Test Data Collection

1. Open the website dashboard (e.g., `http://localhost:3000/pages/dashboard.html`)
2. Visit some websites (google.com, github.com, etc.)
3. Switch between tabs - tracker should record time
4. Check dashboard - should see:
   - Total screen time updating
   - Website breakdown list
   - Number of websites counter

### Step 4: Verify Firebase Integration

1. Open Firebase Console → Firestore
2. Look for `usage` collection
3. Should see documents like: `user_xxx_2025-11-14`
4. Check fields for `totalScreenTime`, `websiteTimeBreakdown`

## Key Updates Made

### tracker.js
- ✅ Added website time tracking via extension
- ✅ Created `websiteTimeData` object
- ✅ Implemented extension message listener
- ✅ Updated Firebase data structure with website breakdown
- ✅ Flush interval changed from 30s to 5 minutes
- ✅ Added `getWebsiteData()`, `getNumberOfWebsites()`, `getCurrentData()` to API

### listeners.js
- ✅ Enhanced to handle `websiteTimeBreakdown` from Firebase
- ✅ Sorts websites by time spent (descending)
- ✅ Updates `numberOfWebsites` display
- ✅ Listens for custom `usageUpdated` event from tracker

### dashboard.html
- ✅ Fixed `usageBreakdown` container placement
- ✅ Now displays website list with time spent
- ✅ Updates in real-time as data changes

## API Reference

### window.DetoxTracker

**Methods:**

```javascript
// Get total screen time in minutes
DetoxTracker.getTotalMinutes()
// Returns: number

// Get website time data
DetoxTracker.getWebsiteData()
// Returns: [{ website: "google.com", minutes: 15 }, ...]

// Get number of unique websites
DetoxTracker.getNumberOfWebsites()
// Returns: number

// Get all current data
DetoxTracker.getCurrentData()
// Returns: { 
//   totalMinutes: 120,
//   numberOfWebsites: 5,
//   websites: [...]
// }

// Force immediate Firebase sync
DetoxTracker.flushNow()
// Returns: Promise

// Get user ID
DetoxTracker.userId
// Returns: string (e.g., "user_abc123")
```

## Troubleshooting

### Extension not collecting data
1. Verify extension is loaded: `chrome://extensions/`
2. Check service worker: Extension menu → Inspect service worker
3. Look for errors in console

### Data not showing on dashboard
1. Open DevTools → Console
2. Run: `DetoxTracker.getCurrentData()`
3. Should show collected data
4. Check Network tab for Firebase requests

### Firebase sync failing
1. Verify Firebase config in `js/firebase-config.js`
2. Check Firestore rules allow reads/writes for your user
3. Check browser console for Firebase errors

### Real-time updates not working
1. Open DevTools → Application → IndexedDB
2. Verify `_firebase_` database exists
3. Check Firestore listener status in console

## Data Retention

- **Local Storage**: Data saved in browser, persists for current user
- **Firebase**: Daily documents created (e.g., `user_xxx_2025-11-14`)
- **Aggregation**: Weekly/monthly data can be computed from daily docs

## Privacy & Security

- Extension only tracks website domain (hostname), not full URLs
- All data stored locally first, then synced to Firebase
- Users can delete data anytime from settings
- Data associated with unique user ID in localStorage

## Future Enhancements

1. **Idle Detection**: Pause tracking when user inactive for 5+ minutes
2. **Website Categories**: Group websites (Social, Productivity, etc.)
3. **Goals & Alerts**: Set daily screen time limits
4. **Export Data**: Download usage reports as CSV/PDF
5. **Multi-Device Sync**: Sync data across devices
6. **Focus Mode**: Block distracting websites during focus sessions
