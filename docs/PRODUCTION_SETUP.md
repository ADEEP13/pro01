# 🚀 Social Detox - Production Level Setup Guide

A complete step-by-step guide to take your Social Detox app from development to production-ready.

---

## 📋 Table of Contents

1. [Phase 1: Firebase Database Setup](#phase-1-firebase-database-setup)
2. [Phase 2: Chrome Extension Installation](#phase-2-chrome-extension-installation)
3. [Phase 3: Testing & Verification](#phase-3-testing--verification)
4. [Phase 4: Production Deployment](#phase-4-production-deployment)
5. [Phase 5: Monitoring & Maintenance](#phase-5-monitoring--maintenance)

---

## ⏱️ Time Estimate: 30-45 minutes

---

# PHASE 1: Firebase Database Setup

## Step 1.1: Create Firestore Database

**Time: 5 minutes**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **svit-ise-proj**
3. Click **Firestore Database** (left sidebar under Build)
4. Click **Create Database**
5. Choose **Start in Test Mode** (for development)
6. Select region: **us-central1** (or closest to you)
7. Click **Enable**

✅ Your Firestore database is now created and ready to use.

---

## Step 1.2: Create Collections & Set Security Rules

**Time: 10 minutes**

### Create the "usage" Collection

1. In Firestore, click **Create Collection**
2. Name: `usage`
3. Click **Create**

### Set Up Security Rules (Important!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own usage data
    match /usage/{userId}/{allDocuments=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read for demo mode (optional - remove for production)
    match /usage/{document=**} {
      allow read: if true;
    }
  }
}
```

3. Click **Publish**

✅ Security rules are now configured.

---

## Step 1.3: Enable Firebase Authentication

**Time: 5 minutes**

1. Go to **Authentication** (left sidebar under Build)
2. Click **Get Started**
3. Enable **Anonymous Sign-in** (for demo use)
4. Click **Enable** → **Save**

Alternative: Enable **Email/Password** for production

✅ Authentication is now enabled.

---

## Step 1.4: Verify Firebase Config

**Time: 2 minutes**

Check your `js/firebase-config.js`:

```javascript
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCotUyLpRTNxZx-s_kAWoq5k4B_yt28jsc",
  authDomain: "svit-ise-proj.firebaseapp.com",
  projectId: "svit-ise-proj",
  storageBucket: "svit-ise-proj.firebasestorage.app",
  messagingSenderId: "781166034018",
  appId: "1:781166034018:web:0c273de9aef9b0df18253b",
  measurementId: "G-Z3NTWCL6C6"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

✅ Firebase config is verified and correct.

---

# PHASE 2: Chrome Extension Installation

## Step 2.1: Verify Extension Files

**Time: 5 minutes**

Check that you have the extension folder with these files:

```
extension/
├── manifest.json      ✅ Must exist
├── background.js      ✅ Must exist
└── content.js         ✅ Must exist (optional but recommended)
```

If files are missing, create them. See **Appendix A** below.

---

## Step 2.2: Load Extension in Chrome

**Time: 5 minutes**

### Method 1: Load Unpacked (Recommended for Development)

1. Open Chrome
2. Go to **chrome://extensions/**
3. Toggle **Developer mode** (top-right corner)
4. Click **Load unpacked**
5. Select your **extension** folder
6. Extension will appear in the list with an ID (e.g., `jkflhkdjfhksd...`)

✅ Extension is now installed and active.

---

## Step 2.3: Verify Extension is Working

**Time: 5 minutes**

1. Open any website (google.com, github.com, etc.)
2. Open DevTools (F12)
3. Go to **Application** tab → **Local Storage**
4. Look for entry with key starting with `detox_`
5. You should see JSON data with tracked websites

**Example:**
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

✅ Extension is tracking data successfully.

---

# PHASE 3: Testing & Verification

## Step 3.1: Test Data Collection

**Time: 15 minutes**

1. **Open your app:** `pages/dashboard.html`
2. **Set your User ID** (if prompted)
3. **Browse websites** for 10-15 minutes:
   - Visit google.com (5 minutes)
   - Visit github.com (5 minutes)
   - Visit another site (5 minutes)
   - Switch between windows/tabs

4. **Check local data:**
   - Open DevTools (F12)
   - Go to **Application** → **Local Storage**
   - Find and click `detox_` entry
   - Should show websites with time in minutes

✅ Data is being collected locally.

---

## Step 3.2: Test Firebase Sync

**Time: 10 minutes**

1. **Wait 5-10 minutes** (first sync happens automatically)
2. **Open Firebase Console:**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Select **svit-ise-proj**
   - Go to **Firestore Database** → **Data** tab
3. **Check the "usage" collection:**
   - Should see a document with today's date
   - Document ID format: `{userId}_2025-11-14`
   - Contains fields:
     - `totalScreenTime`: number (minutes)
     - `numberOfWebsites`: number
     - `websiteTimeBreakdown`: object with sites and times

**Example document:**
```json
{
  userId: "user_abc123xyz",
  date: "2025-11-14",
  totalScreenTime: 45,
  numberOfWebsites: 3,
  websiteTimeBreakdown: {
    "google.com": 15,
    "github.com": 20,
    "stackoverflow.com": 10
  },
  lastActive: Timestamp,
  updatedAt: Timestamp
}
```

✅ Data is synced to Firebase.

---

## Step 3.3: Test Dashboard Display

**Time: 10 minutes**

1. **Open dashboard:** `pages/dashboard.html`
2. **Verify sections display:**
   - ✅ Total Screen Time (e.g., "45 min")
   - ✅ Website Count (e.g., "3 websites")
   - ✅ Productivity Score (e.g., "65%")
   - ✅ Top Website (e.g., "github.com")
   - ✅ Website breakdown chart
   - ✅ Website list with times

3. **Check console** (F12):
   - No red errors
   - Should see Firebase messages like "Analytics updated: {...}"

✅ Dashboard is displaying real data correctly.

---

## Step 3.4: Test Analytics Page

**Time: 10 minutes**

1. **Open analytics:** `pages/analytics.html`
2. **Verify all sections:**
   - ✅ Key Metrics cards (Total Time, Websites, Productivity, Top Site)
   - ✅ Usage Trend chart (line graph)
   - ✅ Website Breakdown chart (pie chart)
   - ✅ Website List with time breakdown

3. **Wait for real-time updates:**
   - Open a new website
   - Wait 5 minutes
   - Charts should update automatically

✅ Analytics page is working with real data.

---

## Step 3.5: Checklist - Verify Everything

**Time: 5 minutes**

- [ ] Firebase database created
- [ ] Security rules deployed
- [ ] Extension installed in Chrome
- [ ] Extension tracking data (check LocalStorage)
- [ ] Firebase syncing data (check Firestore)
- [ ] Dashboard showing real data
- [ ] Analytics showing charts
- [ ] No console errors

---

# PHASE 4: Production Deployment

## Step 4.1: Update Security Rules for Production

**Time: 5 minutes**

Go to Firestore → Rules and update to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to access their own data
    match /usage/{userId}/{allDocuments=**} {
      allow read, write: if 
        request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

Click **Publish**.

✅ Production security rules are deployed.

---

## Step 4.2: Set Up User Authentication

**Time: 15 minutes**

Choose one method:

### Option A: Anonymous Authentication (Quickest)

```javascript
// Add to js/app-init.js
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => {
    const uid = auth.currentUser.uid;
    localStorage.setItem('detox_user_id', uid);
    console.log('Signed in anonymously as:', uid);
  })
  .catch(err => console.error('Auth error:', err));
```

### Option B: Email/Password Authentication

```javascript
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Add signup form in HTML
async function signup(email, password) {
  const auth = getAuth();
  const user = await createUserWithEmailAndPassword(auth, email, password);
  localStorage.setItem('detox_user_id', user.user.uid);
}
```

---

## Step 4.3: Create Deployment Checklist

**Time: 5 minutes**

Create `.env.production` or use environment variables:

```
FIREBASE_PROJECT_ID=svit-ise-proj
FIREBASE_AUTH_DOMAIN=svit-ise-proj.firebaseapp.com
EXTENSION_VERSION=1.0.0
APP_VERSION=1.0.0
```

---

## Step 4.4: Prepare for Distribution

**Time: 10 minutes**

### For Chrome Web Store:

1. **Create extension package:**
   ```
   - extension/manifest.json
   - extension/background.js
   - extension/content.js (if present)
   ```

2. **Prepare screenshots** (1280x800px):
   - Dashboard screenshot
   - Analytics screenshot
   - Extension popup screenshot

3. **Write extension description:**
   ```
   Social Detox - Track your screen time and website usage in real-time.
   Privacy-focused digital wellness tracker with instant insights.
   ```

4. **Test all features one more time:**
   - [ ] Tracking works
   - [ ] Data syncs to Firebase
   - [ ] Dashboard displays correctly
   - [ ] Analytics page works
   - [ ] No console errors
   - [ ] Mobile responsive

---

## Step 4.5: Optimize for Performance

**Time: 10 minutes**

### Minify CSS & JavaScript

```bash
# Install minifiers
npm install -g terser

# Minify JavaScript files
terser js/*.js -o js/dist/app.min.js

# CSS is already optimized via Tailwind
```

### Optimize Images

- Compress PNGs/JPGs to <100KB
- Use WebP format where possible
- Add lazy loading to analytics page

---

# PHASE 5: Monitoring & Maintenance

## Step 5.1: Set Up Monitoring

**Time: 10 minutes**

### Monitor Firebase Quota

1. Go to Firebase Console
2. Click **Project Settings** (gear icon)
3. Go to **Usage & Billing**
4. Set up billing alerts

### Add Error Tracking

Add error logging to `js/app-init.js`:

```javascript
window.addEventListener('error', (event) => {
  console.error('Error:', event);
  // Send to Firebase or logging service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise:', event);
});
```

---

## Step 5.2: Regular Maintenance Tasks

**Weekly:**
- [ ] Check Firebase quota usage
- [ ] Review user error logs
- [ ] Monitor extension performance

**Monthly:**
- [ ] Update security rules if needed
- [ ] Review analytics data retention
- [ ] Update dependencies

**Quarterly:**
- [ ] Performance optimization
- [ ] Feature updates
- [ ] Security audit

---

## Step 5.3: Create Backup Strategy

**Time: 5 minutes**

### Backup Firestore Data

```bash
# Using Firebase CLI
npm install -g firebase-tools
firebase login
firebase firestore:export gs://your-bucket/backups/backup-$(date +%s)
```

---

## Step 5.4: Scaling Considerations

**Time: 5 minutes**

As your app grows:

1. **Implement data archiving** (move old data to storage)
2. **Set up auto-scaling** in Firebase settings
3. **Use Cloud Functions** for complex operations
4. **Add caching** for frequently accessed data
5. **Implement rate limiting** to prevent abuse

---

# 📊 Data Structure Reference

## Firestore Schema

```
/usage
  ├── {userId}_2025-11-14
  │   ├── userId: string
  │   ├── date: string (YYYY-MM-DD)
  │   ├── totalScreenTime: number (minutes)
  │   ├── numberOfWebsites: number
  │   ├── websiteTimeBreakdown: {
  │   │   "google.com": 45,
  │   │   "github.com": 30,
  │   │   "youtube.com": 60
  │   │ }
  │   ├── lastActive: timestamp
  │   └── updatedAt: timestamp
  │
  ├── {userId}_2025-11-13
  │   └── ... (same structure)
  │
  └── {userId}_2025-11-12
      └── ... (same structure)
```

---

# 🔧 API Reference

## DetoxTracker Object

```javascript
// Get current session data
DetoxTracker.getCurrentData()
// Returns: {totalMinutes, numberOfWebsites, websites: [...]}

// Get total screen time in minutes
DetoxTracker.getTotalMinutes()
// Returns: 120

// Get all websites with time
DetoxTracker.getWebsiteData()
// Returns: [{website: "google.com", minutes: 45}, ...]

// Get number of unique websites
DetoxTracker.getNumberOfWebsites()
// Returns: 8

// Force immediate sync to Firebase
DetoxTracker.flushNow()
// Returns: Promise

// User ID
DetoxTracker.userId
// Returns: "user_abc123xyz"
```

---

# ✅ Final Verification Checklist

## Before Going Live

- [ ] Firebase database created and configured
- [ ] Security rules deployed
- [ ] Chrome extension installed and tracking
- [ ] Data syncing to Firestore every 5 minutes
- [ ] Dashboard displays real data
- [ ] Analytics page showing all charts
- [ ] No console errors in any page
- [ ] Mobile responsive design verified
- [ ] Performance optimized (CSS/JS minified)
- [ ] Error tracking set up
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured
- [ ] Documentation complete and clear
- [ ] Team tested all features
- [ ] Ready for production deployment

---

# 🚀 Launch Checklist

## Day Before Launch
- [ ] Final security audit
- [ ] Full system test
- [ ] Performance test
- [ ] Load test (simulate users)

## Launch Day
- [ ] Deploy rules to production
- [ ] Enable monitoring
- [ ] Notify users of launch
- [ ] Monitor error logs in real-time
- [ ] Be ready to rollback if needed

## After Launch
- [ ] Monitor for 24 hours
- [ ] Collect user feedback
- [ ] Address critical issues
- [ ] Plan next features

---

# 📞 Support & Troubleshooting

## Common Issues & Solutions

### Issue: Extension not tracking
**Solution:**
1. Check `chrome://extensions/` - Extension should be enabled
2. Open console (F12) and check for errors
3. Reload extension: click the refresh icon

### Issue: Data not syncing to Firebase
**Solution:**
1. Check network in DevTools
2. Verify Firebase config has correct projectId
3. Check Firestore rules allow write
4. Wait at least 5 minutes for sync

### Issue: Dashboard shows no data
**Solution:**
1. Check if extension is tracking (check LocalStorage)
2. Check if Firebase sync happened (check Firestore)
3. Hard refresh page (Ctrl+Shift+R)
4. Check browser console for errors

### Issue: Permission denied in Firebase
**Solution:**
1. Update security rules to allow your requests
2. Verify user is authenticated
3. Check if document ID format matches rules

---

# 📚 Appendix A: Extension Files

If you don't have extension files, create them:

## manifest.json

```json
{
  "manifest_version": 3,
  "name": "Social Detox",
  "version": "1.0.0",
  "description": "Track your website usage and improve digital wellness",
  "permissions": ["activeTab", "storage", "tabs"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_start"
    }
  ],
  "action": {
    "default_popup": "popup.html"
  }
}
```

## background.js

```javascript
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function getActiveWebsite() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    const url = new URL(tabs[0].url);
    return url.hostname.replace('www.', '');
  }
  return null;
}

chrome.tabs.onActivated.addListener(async () => {
  const site = await getActiveWebsite();
  if (site) {
    const data = (await chrome.storage.local.get('detox_tracker')) || {};
    if (!data.detox_tracker) {
      data.detox_tracker = { websites: {}, timestamp: Date.now() };
    }
    if (!data.detox_tracker.websites[site]) {
      data.detox_tracker.websites[site] = 0;
    }
    data.detox_tracker.websites[site] += 1;
    await chrome.storage.local.set(data);
  }
});
```

---

**Congratulations! Your Social Detox app is now production-ready! 🎉**

Follow the phases above and you'll have a fully functional, secure, and scalable screen time tracking application.

