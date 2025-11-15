# Fix Corrupted Firebase Data

## Problem Identified

Your Firebase shows:
```
totalScreenTime: 41 minutes
websiteTimeBreakdown:
  127.0.0.1: 255  ← WRONG! (255 >> 41)
  chatgpt.com: 6
  console.firebase.google.com: 35
  others: 0
```

**The issue:** Website breakdown values (255 + 6 + 35 = 296 min) don't match total (41 min). This means the data was corrupted when it was originally saved.

## Solution

Delete the corrupted Firebase document and let fresh data be collected:

### Step 1: Delete Corrupted Document
1. In Firebase Console, go to: `users/user_176317757.../ daily/2025-11-15`
2. Click the **three dots** menu (top right)
3. Click **Delete document**
4. Confirm

### Step 2: Refresh Dashboard
1. Refresh `pages/dashboard.html`
2. New data will be collected from extension
3. When it saves to Firebase, it will be clean

### Step 3: Verify Conversion
When new data saves, you should see in console:
```
[tracker] Website: google.com = 1234567 ms = 21 minutes
[tracker] Website: github.com = 543210 ms = 9 minutes
[tracker] 📊 Sum check: websites total = 30 min, global total = 30 min
[tracker] ✅ Successfully flushed to Firebase
```

**Key indicator:** `websites total = global total` ✅

## What Was Changed in Code

**File:** `/workspaces/pro01/js/tracker.js`

### When Saving (flushToFirestore):
- ✅ Added debug logging showing each website conversion
- ✅ Added sum verification (websites total vs global total)
- ✅ Ensures all milliseconds are properly divided by 60000

### When Loading (loadFirebaseDataOnStartup):
- ✅ Added validation check
- ✅ Warns if website breakdown total ≠ global total
- ✅ Helps catch future corruption

## Testing

1. **Delete corrupted Firebase document** (see Step 1 above)
2. **Refresh dashboard**
3. **Wait 30 seconds** for extension to send data
4. **Check console** for validation message
5. **Verify Firebase** shows matching totals

Expected in Firebase after fix:
```
totalScreenTime: 41 ✓
websiteTimeBreakdown:
  (each website): proportional to 41 total
  (sum of all): ≈ 41 minutes ✓
```

---

**Do this now:**
1. Go to Firebase Console
2. Delete the corrupted 2025-11-15 document
3. Refresh dashboard
4. Wait for fresh data
5. Check if totals match in Firebase

Let me know once done!
