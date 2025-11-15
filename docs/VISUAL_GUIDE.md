# 📸 STEP-BY-STEP VISUAL GUIDE

Complete visual walkthrough with screenshots descriptions.

---

## STEP 1: Firebase Setup

### 1A. Create Firestore Database

**Go to:** https://console.firebase.google.com

```
┌─────────────────────────────────────────┐
│ Select Project: svit-ise-proj           │
│ ► Click Firestore Database              │
│ ► Click Create Database                 │
└─────────────────────────────────────────┘
```

**Choose Settings:**
- Mode: **Start in Test Mode** (enables read/write)
- Region: **us-central1** (or closest to your location)
- Click **Enable**

**Result:** You'll see empty Firestore console

---

### 1B. Create Collection

**In Firestore:**
```
┌─────────────────────────────────────────┐
│ Click "Create Collection"               │
│ Name: usage                             │
│ Click Create                            │
└─────────────────────────────────────────┘
```

**Result:** Empty collection ready for data

---

### 1C. Update Security Rules

**In Firestore → Rules tab:**

```
OLD RULES:
┌──────────────────────────────┐
│ allow read, write: if false; │ ❌
└──────────────────────────────┘

NEW RULES:
┌────────────────────────────────────┐
│ allow read: if true;               │ ✅
│ allow write: if true;              │
└────────────────────────────────────┘
```

Copy full rules from PRODUCTION_SETUP.md → Click **Publish**

**Result:** Security rules updated

---

## STEP 2: Chrome Extension Installation

### 2A. Prepare Extension Folder

```
Your Project Folder:
├── extension/                          ✅ Must exist
│   ├── manifest.json                   ✅ Must exist
│   ├── background.js                   ✅ Must exist
│   └── content.js                      ✅ Must exist
├── pages/
├── js/
└── css/
```

**Verify all 3 files exist in extension/ folder**

---

### 2B. Load Extension in Chrome

**Step 1:**
```
Open Chrome → Type: chrome://extensions/
```

**You'll see:**
```
┌────────────────────────────────────┐
│ Extensions (page is empty if none)  │
│ Toggle "Developer mode" ON ➜ (top right) │
└────────────────────────────────────┘
```

**Step 2:**
```
┌────────────────────────────────────┐
│ After enabling Developer Mode:      │
│ ► New buttons appear               │
│ ► Click "Load unpacked"            │
└────────────────────────────────────┘
```

**Step 3:**
```
File Browser Opens
├── Navigate to your project folder
├── Select: extension/ folder
├── Click "Select Folder"
└── ✅ Extension is now loaded
```

**Result:** Extension appears in list with ID and enable toggle

**Example:**
```
┌─────────────────────────────────────────┐
│ 🔘 Social Detox (Enabled)              │
│ ID: jkfhsdkfjhsdkfjhsd...              │
│ Version: 1.0.0                         │
│ Refresh | Remove                        │
└─────────────────────────────────────────┘
```

---

## STEP 3: Test Data Collection

### 3A. Check Extension is Tracking

**Open your project:**
```
file:///C:/Users/adeep/OneDrive/Desktop/hackthon/X02/pages/dashboard.html
```

**Open DevTools:**
```
Press: F12 (or right-click → Inspect)
```

**Check Local Storage:**
```
DevTools:
├── Tab: "Application"
├── Left sidebar: "Local Storage"
├── Click: (URL of your page)
├── Look for key starting with: "detox_"
└── Click it to see value
```

**You should see:**
```json
{
  "websites": {
    "google.com": 5,
    "github.com": 12,
    "stackoverflow.com": 8
  },
  "timestamp": 1731619200000
}
```

**If you see this:** ✅ Extension is tracking!

**If you don't see it:**
- [ ] Extension not loaded (check chrome://extensions/)
- [ ] Visit some websites first
- [ ] Wait a moment then refresh

---

### 3B. Check Firebase Sync

**Time: After 5-10 minutes of browsing**

**Go to Firebase:**
```
https://console.firebase.google.com
│ Your Project: svit-ise-proj
│ ► Firestore Database
│ ► Tab: Data
└─ You should see: usage collection
```

**Expected Structure:**
```
📁 usage (collection)
  └─ 📄 user_abc123xyz_2025-11-14 (document)
      ├─ userId: "user_abc123xyz"
      ├─ date: "2025-11-14"
      ├─ totalScreenTime: 45
      ├─ numberOfWebsites: 3
      └─ websiteTimeBreakdown: (map)
         ├─ google.com: 15
         ├─ github.com: 20
         └─ stackoverflow.com: 10
```

**If you see this:** ✅ Firebase sync working!

**If you don't see it:** Wait 5 minutes and refresh Firebase page

---

## STEP 4: Verify Dashboard

### 4A. Open Dashboard Page

```
Open: pages/dashboard.html in browser
```

**You should see:**

```
┌─────────────────────────────────────────┐
│          SOCIAL DETOX                   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  Total Screen Time                  │ │
│ │  45 minutes                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  Websites Visited                   │ │
│ │  3 websites                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │  Top Website                        │ │
│ │  github.com                         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Website Breakdown:                      │
│ • google.com  15m  33%                  │
│ • github.com  20m  44%                  │
│ • stackoverflow.com  10m  22%           │
└─────────────────────────────────────────┘
```

**Check Console (F12):**
```
Open DevTools → Console tab
You should see:
✅ "Analytics updated: {...}"
✅ No red errors
```

**If data shows:** ✅ Dashboard working!

**If data doesn't show:**
- [ ] Did you browse for 10+ minutes?
- [ ] Wait 5-10 minutes for Firebase sync
- [ ] Refresh page with Ctrl+Shift+R
- [ ] Check console for errors

---

### 4B. Open Analytics Page

```
Open: pages/analytics.html in browser
```

**You should see:**

```
┌────────────────────────────────────────────┐
│         ANALYTICS                          │
│                                            │
│  KEY METRICS                               │
│  ┌──────────┬──────────┬──────────────┐   │
│  │ Screen   │ Websites │ Productivity │   │
│  │ Time     │ Visited  │ Score        │   │
│  │ 45 min   │ 3        │ 65%          │   │
│  └──────────┴──────────┴──────────────┘   │
│                                            │
│  USAGE TREND                               │
│  ┌────────────────────────────────────┐   │
│  │     / Chart showing trend over     │   │
│  │    /  time (line graph)            │   │
│  │   /                                │   │
│  └────────────────────────────────────┘   │
│                                            │
│  WEBSITE BREAKDOWN                        │
│  ┌────────────────────────────────────┐   │
│  │  ● Pie chart showing website       │   │
│  │    distribution by time            │   │
│  └────────────────────────────────────┘   │
│                                            │
│  WEBSITE LIST                              │
│  • google.com    15m  (33%)               │
│  • github.com    20m  (44%)               │
│  • stackoverflow 10m  (22%)               │
└────────────────────────────────────────────┘
```

**Check Console (F12):**
```
Should see:
✅ "Analytics updated: {...}"
✅ No errors
✅ Charts render without errors
```

**If charts show:** ✅ Analytics working!

**If charts don't show:**
- [ ] Check console for errors (F12)
- [ ] Verify Chart.js library loaded (Network tab)
- [ ] Try hard refresh: Ctrl+Shift+R

---

## STEP 5: Real-Time Testing

### 5A. Test Auto-Update

**Open Both Pages Side-by-Side:**

```
Left Window:          Right Window:
analytics.html        Browser tab with real website
              
Charts visible        Open google.com
Metrics showing       Browse for 5 minutes
```

**After 5 minutes:**
- [ ] Charts should update automatically
- [ ] Metrics should increase
- [ ] "Usage Trend" should show new data point

**If updates appear:** ✅ Real-time working!

---

### 5B. Test Mobile Responsive

**In Chrome DevTools:**

```
Open DevTools (F12)
│ Click mobile icon (top-left): 📱
│ Select: iPhone 12
│ Resize to test responsiveness
```

**Check:**
- [ ] All text readable
- [ ] Charts fit on screen
- [ ] No overflow or scrolling issues
- [ ] Buttons clickable on mobile size

**If responsive:** ✅ Mobile ready!

---

## STEP 6: Production Checklist

Create a checklist document with this visual:

```
PRODUCTION READINESS CHECKLIST
══════════════════════════════════════════

FIREBASE
  ✅ Firestore database created
  ✅ Collection "usage" exists
  ✅ Security rules deployed
  ✅ Authentication enabled

EXTENSION
  ✅ manifest.json exists
  ✅ background.js exists
  ✅ content.js exists
  ✅ Extension loaded in Chrome
  ✅ Appears in chrome://extensions/

DATA COLLECTION
  ✅ Extension tracking websites
  ✅ Data visible in LocalStorage
  ✅ Data syncing to Firebase
  ✅ Firestore shows today's document

UI DISPLAY
  ✅ Dashboard shows real metrics
  ✅ Analytics page shows charts
  ✅ Website list displays correctly
  ✅ Numbers match Firefox data

TESTING
  ✅ Browsed 10+ minutes
  ✅ Visited 3+ websites
  ✅ Waited 5+ minutes for sync
  ✅ Refreshed browser (Ctrl+Shift+R)
  ✅ Checked console for errors

OPTIMIZATION
  ✅ No console errors (red)
  ✅ Mobile responsive tested
  ✅ Charts load within 2 seconds
  ✅ Real-time updates working

SECURITY
  ✅ Security rules updated
  ✅ Authentication configured
  ✅ Test mode ready for production

READY TO LAUNCH? ✅ YES / ❌ NO

Last checked: ____________
Checked by: _______________
```

---

## QUICK REFERENCE: File Locations

### Open These Files

| What | Where |
|------|-------|
| Dashboard | `file:///C:/Users/adeep/OneDrive/Desktop/hackthon/X02/pages/dashboard.html` |
| Analytics | `file:///C:/Users/adeep/OneDrive/Desktop/hackthon/X02/pages/analytics.html` |
| Firebase Config | `C:/Users/adeep/OneDrive/Desktop/hackthon/X02/js/firebase-config.js` |
| Extension Files | `C:/Users/adeep/OneDrive/Desktop/hackthon/X02/extension/` |

### Important Settings

| Setting | Location |
|---------|----------|
| Firebase Rules | https://console.firebase.google.com → Firestore → Rules |
| Extension List | `chrome://extensions/` |
| DevTools | Press F12 or Ctrl+Shift+I |
| Network Tab | DevTools → Network tab (click any request) |

---

## TROUBLESHOOTING QUICK MAP

```
Problem                 Check This
─────────────────────────────────────────
No data on dashboard → 1) Extension tracking? (LocalStorage)
                      2) Firebase synced? (Firestore)
                      3) Wait 5+ minutes
                      
Extension not tracking → 1) chrome://extensions/ shows it?
                        2) Click extension icon, check popup
                        3) Reload extension (refresh icon)
                        
Firebase error           → 1) Check security rules
                         2) Update rules to allow read/write
                         3) Check projectId in firebase-config.js
                         
Charts not showing      → 1) Check console for errors
                         2) Verify Chart.js loaded
                         3) Hard refresh (Ctrl+Shift+R)
```

---

**Status: Ready for Production ✅**

Follow these steps in order and your app will be fully functional!
