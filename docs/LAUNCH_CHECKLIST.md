# ✅ PRODUCTION LAUNCH CHECKLIST

Print this and check off each item as you complete it.

---

## 📋 PRE-LAUNCH CHECKLIST

**Date Started:** ________________  
**Team Member:** ________________  
**Project:** Social Detox  
**Target Launch Date:** ________________  

---

## PHASE 1: FIREBASE SETUP ⏱️ 10 minutes

### Firebase Console Setup
- [ ] Logged into Firebase Console (console.firebase.google.com)
- [ ] Selected project: **svit-ise-proj**
- [ ] Navigated to Firestore Database
- [ ] Clicked "Create Database"
- [ ] Selected "Start in Test Mode"
- [ ] Selected region: **us-central1** (or closest)
- [ ] Clicked "Enable" to create database
- [ ] Database is now visible in Firestore console

### Create Collection
- [ ] In Firestore, clicked "Create Collection"
- [ ] Named collection: **usage** (exactly)
- [ ] Collection created and empty

### Deploy Security Rules
- [ ] Navigated to Firestore → Rules tab
- [ ] Copied rules from PRODUCTION_SETUP.md
- [ ] Replaced default rules with new rules
- [ ] Clicked "Publish"
- [ ] Rules now show in console (no errors)

### Enable Authentication
- [ ] Went to Authentication section
- [ ] Clicked "Get Started"
- [ ] Enabled "Anonymous Sign-in"
- [ ] Clicked "Enable" and "Save"

### Verify Firebase Config
- [ ] Opened: `js/firebase-config.js`
- [ ] Verified `projectId: "svit-ise-proj"` is correct
- [ ] Verified `authDomain`, `apiKey` are present
- [ ] Config file syntax is correct (no errors)

✅ **PHASE 1 COMPLETE** - Firebase ready

---

## PHASE 2: CHROME EXTENSION ⏱️ 5 minutes

### Verify Extension Files
- [ ] Checked folder: `extension/`
- [ ] File exists: `manifest.json` ✓
- [ ] File exists: `background.js` ✓
- [ ] File exists: `content.js` ✓
- [ ] All 3 files are present

### Load Extension in Chrome
- [ ] Opened Chrome
- [ ] Typed: `chrome://extensions/`
- [ ] Toggled "Developer mode" ON (top right)
- [ ] Clicked "Load unpacked"
- [ ] Selected `extension/` folder
- [ ] Extension now appears in list

### Verify Extension Status
- [ ] Extension shows as **Enabled** ✓
- [ ] Extension has an ID (long string)
- [ ] No error messages shown
- [ ] Can see extension icon in toolbar (optional)

✅ **PHASE 2 COMPLETE** - Extension installed

---

## PHASE 3: TEST DATA COLLECTION ⏱️ 15 minutes

### Step 1: Verify Extension Tracking

**Time:** 0-2 minutes

- [ ] Opened: `pages/dashboard.html` in browser
- [ ] Pressed F12 to open DevTools
- [ ] Clicked "Application" tab
- [ ] Clicked "Local Storage" in left sidebar
- [ ] Found entry starting with `detox_`
- [ ] Clicked it to view content
- [ ] JSON shows websites with minutes (e.g., google.com: 5)

**Result:** ✅ Extension tracking locally

---

### Step 2: Browse and Collect Data

**Time:** 3-12 minutes

- [ ] Browsed google.com for ~5 minutes
- [ ] Browsed github.com for ~5 minutes
- [ ] Browsed another site (stackoverflow, dev.to, etc.) for ~5 minutes
- [ ] Switched between tabs and windows several times
- [ ] Returned to dashboard.html after 10+ minutes of browsing

**Data in LocalStorage should now show:**
```
google.com: ~45 minutes
github.com: ~30 minutes
other site: ~10+ minutes
```

- [ ] LocalStorage shows multiple websites with time

**Result:** ✅ Tracking multiple websites

---

### Step 3: Wait for Firebase Sync

**Time:** 13-23 minutes

- [ ] Waited 5-10 minutes minimum
- [ ] Did NOT close dashboard tab
- [ ] Kept extension enabled

---

### Step 4: Verify Firebase Contains Data

**Time:** 23-25 minutes

- [ ] Opened: https://console.firebase.google.com
- [ ] Selected project: **svit-ise-proj**
- [ ] Went to: Firestore Database → **Data** tab
- [ ] Expanded: **usage** collection
- [ ] Found document with today's date format: `{userId}_2025-11-14`
- [ ] Clicked document to view contents

**Document should contain:**
- [ ] Field: `userId` (string)
- [ ] Field: `date` (string, format: 2025-11-14)
- [ ] Field: `totalScreenTime` (number, minutes)
- [ ] Field: `numberOfWebsites` (number)
- [ ] Field: `websiteTimeBreakdown` (map with sites)
  - [ ] Contains: google.com: 45
  - [ ] Contains: github.com: 30
  - [ ] Contains: other sites

- [ ] All fields show correct values
- [ ] Numbers match your browsing time approximately

**Result:** ✅ Firebase syncing data

---

## PHASE 4: VERIFY UI DISPLAY ⏱️ 10 minutes

### Dashboard Page (pages/dashboard.html)

- [ ] Opened: `pages/dashboard.html`
- [ ] Metric 1 - Total Screen Time shows (e.g., "45 min")
- [ ] Metric 2 - Websites shows count (e.g., "3")
- [ ] Metric 3 - Top Website shows domain (e.g., "github.com")
- [ ] Metric 4 - Productivity Score shows percentage
- [ ] Website list displays with times
- [ ] Website list shows percentages
- [ ] Pressed F12 to check console
- [ ] No red errors in console
- [ ] Console shows message like: "Analytics updated: {...}"

✅ Dashboard verified

---

### Analytics Page (pages/analytics.html)

- [ ] Opened: `pages/analytics.html`
- [ ] Key Metrics section displays 4 cards
- [ ] Cards show:
  - [ ] Total Screen Time (e.g., "45m")
  - [ ] Websites Visited (e.g., "3")
  - [ ] Productivity Score (e.g., "65%")
  - [ ] Top Website (e.g., "github.com")

**Charts Section:**

- [ ] Usage Trend chart visible (line graph)
- [ ] Website Breakdown chart visible (pie/doughnut chart)
- [ ] Website List displays below charts
- [ ] List shows websites with times and percentages

**Console Check:**

- [ ] Pressed F12
- [ ] Console shows no red errors
- [ ] Console shows: "Analytics updated: {...}"
- [ ] Charts rendered without errors

✅ Analytics verified

---

### Real-Time Test

**Time: +5 minutes**

- [ ] Kept analytics.html open in one window
- [ ] Opened new browser tab with website
- [ ] Browsed new website for 5 minutes
- [ ] Returned to analytics.html
- [ ] Waited a few seconds
- [ ] Charts automatically updated
- [ ] New website appears in website list

**Result:** ✅ Real-time updates working

---

## PHASE 5: PRODUCTION HARDENING ⏱️ 5 minutes

### Update Security Rules (Important!)

- [ ] Opened Firebase Firestore Rules tab
- [ ] Replaced test mode rules with production rules:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /usage/{userId}/{allDocuments=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```
- [ ] Clicked "Publish"
- [ ] Rules updated successfully

### Enable Proper Authentication

- [ ] Opened: `js/app-init.js`
- [ ] Added anonymous authentication code (see PRODUCTION_SETUP.md)
- [ ] Tested that authentication works
- [ ] Users are assigned unique IDs

### Performance Optimization

- [ ] Verified CSS is minified (main.css exists)
- [ ] Checked JavaScript loads quickly (<2 seconds)
- [ ] All images are optimized
- [ ] No console warnings about performance

### Error Tracking

- [ ] Added error event listener to app-init.js (optional)
- [ ] Console logs any JavaScript errors
- [ ] Firebase errors are caught and logged

✅ **PHASE 5 COMPLETE** - Production ready

---

## FINAL VERIFICATION ⏱️ 5 minutes

### Data Flow Check

- [ ] Extension tracking: **✅ YES** / **❌ NO**
- [ ] LocalStorage shows websites: **✅ YES** / **❌ NO**
- [ ] Firebase Firestore has document: **✅ YES** / **❌ NO**
- [ ] Dashboard displays metrics: **✅ YES** / **❌ NO**
- [ ] Analytics displays charts: **✅ YES** / **❌ NO**
- [ ] Real-time updates work: **✅ YES** / **❌ NO**

### Quality Check

- [ ] No console errors: **✅ YES** / **❌ NO**
- [ ] Page loads in <2 seconds: **✅ YES** / **❌ NO**
- [ ] Mobile responsive: **✅ YES** / **❌ NO**
- [ ] Charts render correctly: **✅ YES** / **❌ NO**
- [ ] All metrics show data: **✅ YES** / **❌ NO**

### Security Check

- [ ] Security rules deployed: **✅ YES** / **❌ NO**
- [ ] Authentication enabled: **✅ YES** / **❌ NO**
- [ ] No sensitive data in URLs: **✅ YES** / **❌ NO**
- [ ] API keys not exposed: **✅ YES** / **❌ NO**

---

## ✅ LAUNCH APPROVAL

**All Checks Passed?**

- [ ] **YES - Ready to Launch!** 🚀
- [ ] **NO - Issues Found** (list below)

---

### If Issues Found, Document Them:

**Issue 1:**
- [ ] Problem: _________________________________
- [ ] Solution: _________________________________
- [ ] Resolved: **✅ YES** / **❌ NO**

**Issue 2:**
- [ ] Problem: _________________________________
- [ ] Solution: _________________________________
- [ ] Resolved: **✅ YES** / **❌ NO**

**Issue 3:**
- [ ] Problem: _________________________________
- [ ] Solution: _________________________________
- [ ] Resolved: **✅ YES** / **❌ NO**

---

## 📊 LAUNCH METRICS

**Data Collected:**
- Total screen time tracked: __________ minutes
- Websites tracked: __________
- Sync attempts: __________
- Firebase documents created: __________

**Performance:**
- Dashboard load time: __________ seconds
- Analytics page load time: __________ seconds
- Chart rendering time: __________ seconds

**Quality Score:**
- Console errors: __________
- Console warnings: __________
- Missing features: __________

---

## 🎯 GO/NO-GO DECISION

**Team Lead Sign-off:**

```
Project: Social Detox v1.0.0

Ready to Launch?  ☐ GO  ☐ NO-GO

Signed by: _____________________

Date: __________________________

Time: __________________________
```

---

## 📞 POST-LAUNCH MONITORING

**First 24 Hours:**
- [ ] Monitor Firebase for errors
- [ ] Check console logs for issues
- [ ] Verify data continues syncing
- [ ] Get user feedback
- [ ] Track any bug reports

**First Week:**
- [ ] Weekly check on Firebase quota
- [ ] Review user analytics
- [ ] Monitor performance
- [ ] Plan Phase 2 features

---

## 📝 NOTES

Additional notes, issues, or observations:

```
_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________

_______________________________________________________________________
```

---

## 🎊 LAUNCH COMPLETE!

**Congratulations!** Your Social Detox app is now live! 🚀

- ✅ Real-time tracking working
- ✅ Data syncing to Firebase
- ✅ Dashboard displaying metrics
- ✅ Analytics showing charts
- ✅ Security configured
- ✅ Ready for users

---

**Next Steps:**
1. Gather user feedback
2. Monitor error logs
3. Plan new features
4. Scale as needed
5. Celebrate your launch! 🎉

---

**Document Prepared By:** __________________  
**Date:** __________________  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

---

For support, see: TROUBLESHOOTING.md
