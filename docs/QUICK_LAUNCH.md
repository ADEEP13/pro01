# SOCIAL DETOX - QUICK START CHECKLIST

Complete these 5 phases to take your app live. ~45 minutes total.

---

## ⏱️ PHASE 1: Firebase Setup (10 minutes)

- [ ] 1. Go to Firebase Console → Select `svit-ise-proj`
- [ ] 2. Click Firestore Database → Create Database
- [ ] 3. Select "Start in Test Mode" + region `us-central1`
- [ ] 4. Create collection named `usage`
- [ ] 5. Go to Rules tab → Copy production rules (see PRODUCTION_SETUP.md)
- [ ] 6. Click Publish
- [ ] 7. Go to Authentication → Enable Anonymous Sign-in

✅ Firebase ready

---

## ⏱️ PHASE 2: Chrome Extension (5 minutes)

- [ ] 1. Ensure you have folder: `extension/` with:
  - [ ] manifest.json
  - [ ] background.js
  - [ ] content.js (optional)
- [ ] 2. Open Chrome → go to `chrome://extensions/`
- [ ] 3. Enable "Developer mode" (top right)
- [ ] 4. Click "Load unpacked"
- [ ] 5. Select your `extension/` folder
- [ ] 6. Extension now appears in list ✓

✅ Extension installed

---

## ⏱️ PHASE 3: Test Data Collection (15 minutes)

- [ ] 1. Open `pages/dashboard.html` in browser
- [ ] 2. Browse websites for 10+ minutes:
  - [ ] Visit google.com (5 min)
  - [ ] Visit github.com (5 min)
  - [ ] Switch windows/tabs
- [ ] 3. Open DevTools (F12) → Application → Local Storage
- [ ] 4. Find entry with key starting with `detox_`
- [ ] 5. Should show JSON with tracked websites ✓
- [ ] 6. Wait 5-10 minutes (first sync)
- [ ] 7. Open Firebase Console → Firestore → Data tab
- [ ] 8. Should see `usage` collection with today's document ✓

✅ Data tracking works

---

## ⏱️ PHASE 4: Verify UI Display (10 minutes)

### Dashboard Page (pages/dashboard.html)
- [ ] Shows "Total Screen Time" (e.g., "45 min")
- [ ] Shows "Websites Visited" (e.g., "3")
- [ ] Shows "Top Website" (e.g., "github.com")
- [ ] Shows website breakdown list with times
- [ ] No red errors in console (F12)

### Analytics Page (pages/analytics.html)
- [ ] Shows Key Metrics cards
- [ ] Shows Usage Trend chart (line graph)
- [ ] Shows Website Breakdown chart (pie chart)
- [ ] Shows Website List with percentages
- [ ] Charts auto-update (wait 5 min, visit new site)

✅ UI displays real data correctly

---

## ⏱️ PHASE 5: Production Ready (5 minutes)

- [ ] Update security rules (PRODUCTION_SETUP.md)
- [ ] Enable authentication in app
- [ ] Add error tracking
- [ ] Test on mobile (responsive design)
- [ ] No console errors
- [ ] Performance check (all resources load <2s)

✅ App is production-ready

---

## 🚀 YOU'RE LIVE!

Your Social Detox app is now:
- ✅ Tracking real website usage
- ✅ Syncing to Firebase
- ✅ Displaying data in real-time
- ✅ Production-secure
- ✅ Ready for users

---

## 📞 Quick Links

| Issue | Solution |
|-------|----------|
| Extension not tracking | Check `chrome://extensions/` - enable it |
| Data not in Firebase | Wait 5+ min for sync, verify rules |
| Dashboard empty | Refresh page (Ctrl+Shift+R), check console |
| Charts not showing | Check browser console for errors |
| Mobile not responsive | Use Chrome DevTools to test mobile view |

---

## 🔗 Important Files

- **Config:** `js/firebase-config.js` (verify projectId)
- **Tracking:** `js/tracker.js` (receives extension data)
- **Display:** `js/listeners.js` (shows Firebase data)
- **Analytics:** `pages/analytics.html` + `js/analytics.js`
- **Rules:** Update in Firebase Console → Firestore → Rules tab

---

**Total Time: 45 minutes | Full System Ready ✓**

For detailed guidance, see: `PRODUCTION_SETUP.md`
