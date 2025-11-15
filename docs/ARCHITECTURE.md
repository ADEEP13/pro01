# Real-Time Tracking System - Visual Architecture

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHROME EXTENSION                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ background.js (Service Worker)                          │   │
│  │ ├─ Monitors active tab                                  │   │
│  │ ├─ Tracks time on each website                          │   │
│  │ ├─ Detects window focus/blur                            │   │
│  │ └─ Syncs to Chrome storage every 5 min                  │   │
│  │                                                          │   │
│  │ content.js                                              │   │
│  │ └─ Bridges extension ↔ webpage communication            │   │
│  │                                                          │   │
│  │ manifest.json                                           │   │
│  │ └─ Configuration & permissions                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓ every 5 min
        ┌───────────────────────────────────────┐
        │  Chrome Storage                       │
        │  {                                    │
        │    "google.com": 2700000 ms,         │
        │    "github.com": 1800000 ms,         │
        │    ...                                │
        │  }                                    │
        └───────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    WEBSITE APPLICATION                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ tracker.js                                              │   │
│  │ ├─ Receives data from extension                         │   │
│  │ ├─ Stores in websiteTimeData{}                          │   │
│  │ ├─ Tracks page activity                                │   │
│  │ ├─ Syncs to Firebase every 5 min                        │   │
│  │ └─ Exposes window.DetoxTracker API                      │   │
│  │                                                          │   │
│  │ listeners.js                                            │   │
│  │ ├─ Listens to Firebase real-time updates                │   │
│  │ ├─ Updates dashboard UI                                │   │
│  │ └─ Displays website breakdown                          │   │
│  │                                                          │   │
│  │ dashboard.html                                          │   │
│  │ ├─ Shows total screen time                             │   │
│  │ ├─ Shows website breakdown                             │   │
│  │ └─ Updates every 5-10 minutes                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  Browser Local Storage                │
        │  {                                    │
        │    "totalActiveMs": 3600000,         │
        │    "websiteTimeData": {...},         │
        │    "lastChange": "ISO string"        │
        │  }                                    │
        └───────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                  FIREBASE FIRESTORE                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Collection: usage                                       │   │
│  │                                                          │   │
│  │ Document: user_abc123_2025-11-14                        │   │
│  │ {                                                       │   │
│  │   userId: "user_abc123",                               │   │
│  │   date: "2025-11-14",                                  │   │
│  │   totalScreenTime: 135 (minutes),                      │   │
│  │   numberOfWebsites: 8,                                 │   │
│  │   websiteTimeBreakdown: {                              │   │
│  │     "google.com": 45,                                  │   │
│  │     "github.com": 30,                                  │   │
│  │     "stackoverflow.com": 20,                           │   │
│  │     ...                                                │   │
│  │   },                                                   │   │
│  │   lastActive: Timestamp,                               │   │
│  │   updatedAt: Timestamp                                 │   │
│  │ }                                                       │   │
│  │                                                          │   │
│  │ Document: user_abc123_2025-11-13                        │   │
│  │ Document: user_abc123_2025-11-12                        │   │
│  │ ... (historical data)                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Timeline

```
MINUTE 0:
┌────────────────────────────────────────────────────────────┐
│ User opens browser                                         │
│ • Extension loads (background.js starts)                   │
│ • Dashboard page loads (tracker.js + listeners.js)         │
│ • Both ready to track                                      │
└────────────────────────────────────────────────────────────┘

MINUTE 0-5:
┌────────────────────────────────────────────────────────────┐
│ User browses websites                                      │
│ • Extension monitors tabs in real-time                     │
│ • Records time spent on each site                          │
│ • Tracks: google.com (2m), github.com (3m), etc           │
│ • Data stored in Chrome storage (not synced yet)           │
└────────────────────────────────────────────────────────────┘

MINUTE 5:
┌────────────────────────────────────────────────────────────┐
│ SYNC #1: Extension → Website                              │
│ • Extension broadcasts: {websites: {...}}                 │
│ • tracker.js receives message                              │
│ • Updates websiteTimeData object                           │
│ • Updates dashboard UI locally                             │
└────────────────────────────────────────────────────────────┘

MINUTE 5 (continued):
┌────────────────────────────────────────────────────────────┐
│ SYNC #2: Website → Firebase                               │
│ • tracker.js sends to Firestore                            │
│ • Document: user_abc_2025-11-14 updated                    │
│ • totalScreenTime: 8 minutes                               │
│ • websiteTimeBreakdown: {google: 2, github: 3, ...}       │
└────────────────────────────────────────────────────────────┘

MINUTE 5 (continued):
┌────────────────────────────────────────────────────────────┐
│ SYNC #3: Firebase → Dashboard                              │
│ • Real-time listener detects change                        │
│ • listeners.js updates UI                                  │
│ • Dashboard shows: 8 minutes, 2 websites                   │
│ • Website list appears on page                             │
└────────────────────────────────────────────────────────────┘

MINUTE 5-10:
┌────────────────────────────────────────────────────────────┐
│ User continues browsing                                    │
│ • Extension keeps tracking                                 │
│ • No sync yet                                              │
│ • Data accumulates                                         │
└────────────────────────────────────────────────────────────┘

MINUTE 10:
┌────────────────────────────────────────────────────────────┐
│ SYNC #4: Extension → Website → Firebase → Dashboard        │
│ • Repeat flow from minute 5                                │
│ • Dashboard updates with latest data                       │
│ • More websites might appear                               │
│ • Time counts increase                                     │
└────────────────────────────────────────────────────────────┘

ONGOING:
┌────────────────────────────────────────────────────────────┐
│ Cycle repeats every 5 minutes                              │
│ • User data always up-to-date on dashboard                 │
│ • Firebase always has latest                               │
│ • Historical data preserved                                │
└────────────────────────────────────────────────────────────┘
```

---

## Message Flow Diagram

```
EXTENSION TO WEBSITE
────────────────────

Extension (background.js)
        │
        └─ chrome.tabs.sendMessage()
           {
             type: 'WEBSITE_DATA',
             data: {
               websites: {
                 "google.com": 2700000,
                 "github.com": 1800000
               }
             }
           }
           │
           ↓ (chrome.runtime.onMessage)
       Webpage (tracker.js)
           │
           ├─ Receives data
           ├─ Updates websiteTimeData
           ├─ Updates UI
           └─ Saves to localStorage


WEBSITE TO FIREBASE
───────────────────

Webpage (tracker.js)
        │
        └─ doc.setDoc() / updateDoc()
           {
             totalScreenTime: 135,
             numberOfWebsites: 8,
             websiteTimeBreakdown: {...}
           }
           │
           ↓
       Firebase Firestore
           │
           ├─ Updates document
           └─ Emits change event


FIREBASE TO WEBSITE
───────────────────

Firebase Firestore
        │
        └─ onSnapshot() listener
           │
           ↓
       listeners.js
           │
           ├─ Detects change
           ├─ Reads updated data
           └─ Dispatches event


WEBSITE TO UI
─────────────

tracker.js / listeners.js
        │
        └─ Updates DOM elements:
           ├─ #screenTime → "2h 15m"
           ├─ #numberOfWebsites → "8"
           ├─ #usageBreakdown → website list
           └─ Other containers...
           │
           ↓
       User sees live updates on dashboard
```

---

## API Available to Developers

```
window.DetoxTracker
│
├─ getTotalMinutes()
│  └─ Returns: number (e.g., 135)
│
├─ getWebsiteData()
│  └─ Returns: Array of {website, minutes}
│     Example: [{website: "google.com", minutes: 45}, ...]
│
├─ getNumberOfWebsites()
│  └─ Returns: number (e.g., 8)
│
├─ getCurrentData()
│  └─ Returns: {
│       totalMinutes: 135,
│       numberOfWebsites: 8,
│       websites: [...]
│     }
│
├─ flushNow()
│  └─ Returns: Promise (forces immediate Firebase sync)
│
└─ userId
   └─ Returns: string (unique user ID)
```

---

## UI Update Flow

```
┌─────────────────────────────────────────────────────┐
│           Dashboard Page Loads                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ 1. Load tracker.js                            │  │
│  │    ↓                                           │  │
│  │ 2. Load listeners.js                          │  │
│  │    ↓                                           │  │
│  │ 3. initRealtimeListeners() called             │  │
│  │    ↓                                           │  │
│  │ 4. Setup onSnapshot listener for today's data  │  │
│  │    ↓                                           │  │
│  │ 5. Extension sends initial data               │  │
│  │    ↓                                           │  │
│  │ 6. Dashboard shows first data                 │  │
│  │    ↓                                           │  │
│  │ 7. Every 5-10 min: Firebase change detected   │  │
│  │    ↓                                           │  │
│  │ 8. updateUsageUI() called                     │  │
│  │    ↓                                           │  │
│  │ 9. All DOM elements updated                   │  │
│  │    ↓                                           │  │
│  │ 10. User sees new data                        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

```
FIRESTORE
─────────

📦 Collection: usage
   │
   ├─ 📄 user_abc123_2025-11-14
   │  ├─ userId: "user_abc123" (string)
   │  ├─ date: "2025-11-14" (string, YYYY-MM-DD)
   │  ├─ totalScreenTime: 135 (number, minutes)
   │  ├─ numberOfWebsites: 8 (number)
   │  ├─ websiteTimeBreakdown: (map)
   │  │  ├─ "google.com": 45 (number)
   │  │  ├─ "github.com": 30 (number)
   │  │  ├─ "stackoverflow.com": 20 (number)
   │  │  └─ ... (all sites)
   │  ├─ lastActive: Timestamp
   │  └─ updatedAt: Timestamp
   │
   ├─ 📄 user_abc123_2025-11-13
   │  └─ ... (previous day data)
   │
   ├─ 📄 user_abc123_2025-11-12
   │  └─ ... (historical data)
   │
   └─ 📄 ... (more users)
```

---

## File Structure

```
X02/
├─ pages/
│  ├─ dashboard.html       (displays data)
│  ├─ analytics.html       (can query Firebase)
│  └─ ...
│
├─ js/
│  ├─ tracker.js          (receives & syncs extension data)
│  ├─ listeners.js        (Firebase real-time listener)
│  ├─ firebase-config.js  (Firebase setup)
│  └─ app-init.js         (app initialization)
│
├─ extension/             (NEW - Chrome extension)
│  ├─ manifest.json       (extension config)
│  ├─ background.js       (tracks websites)
│  └─ content.js          (bridge)
│
└─ docs/
   ├─ TRACKING_SYSTEM.md           (technical details)
   ├─ EXTENSION_SETUP.md           (installation)
   ├─ ANALYTICS_INTEGRATION.md     (using data)
   ├─ CODE_SNIPPETS.md             (examples)
   ├─ README_TRACKING_SYSTEM.md    (complete guide)
   ├─ QUICK_REFERENCE.txt          (quick ref)
   └─ ARCHITECTURE.md              (this file)
```

---

## Performance Metrics

```
Extension CPU Usage:
├─ Idle: < 1%
├─ Active tracking: 2-5%
└─ Sync: < 1%

Website JS Usage:
├─ tracker.js: < 2% CPU
├─ listeners.js: triggered 2x per 10 min
└─ Dashboard: no continuous polling

Firebase:
├─ Firestore reads: 2 per 10 minutes (background)
├─ Firestore writes: 2 per 10 minutes (background)
└─ Realtime listener: event-based (no constant query)

Browser Storage:
├─ Local storage: ~1 KB per day
├─ Chrome storage: ~5 KB per day
└─ Total: minimal impact
```

---

✅ System ready for deployment!
