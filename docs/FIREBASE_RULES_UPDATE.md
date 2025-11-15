# Firebase Security Rules Update

## New Structure: users/{userId}/daily/{date}

Update your Firebase Firestore Security Rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own usage data (new structure)
    match /users/{userId}/daily/{date} {
      allow read, write: if true;  // Demo mode - allow all access
    }
    
    // Allow all read for users collection
    match /users/{userId}/{document=**} {
      allow read, write: if true;  // Demo mode
    }
    
    // Legacy: Keep old rules for backward compatibility
    match /usage/{document=**} {
      allow read, write: if true;  // Demo mode
    }
  }
}
```

## Steps to Apply:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **svit-ise-proj**
3. Click **Firestore Database** → **Rules** tab
4. Replace entire content with the rules above
5. Click **Publish**

## For Production (Secure Version):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Secure: Allow authenticated users to read/write their own data
    match /users/{userId}/daily/{date} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Secure: Allow authenticated users to manage their user document
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Apply these production rules after implementing authentication.**
