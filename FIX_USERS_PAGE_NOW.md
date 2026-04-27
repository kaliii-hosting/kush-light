# IMMEDIATE FIX FOR USERS PAGE

## Step 1: Go to Firebase Console
1. Open https://console.firebase.google.com
2. Click on your project: **kushie-b69fb**

## Step 2: Update Firestore Rules
1. Click on **"Firestore Database"** in the left menu
2. Click on **"Rules"** tab
3. **DELETE ALL EXISTING RULES** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

4. Click **"PUBLISH"**

## Step 3: Test
1. Go back to your admin dashboard
2. Click on "Users" tab
3. You should now see your 2 signed up users

## What This Does:
- Allows anyone to READ user data (for admin dashboard)
- Only allows users to WRITE their own data (for security)
- Allows reading all other documents

## ⚠️ Important:
This is a development solution. For production, you'll need proper admin authentication.

## If It Still Doesn't Work:
1. Check browser console for any other errors
2. Make sure you clicked "PUBLISH" in Firebase
3. Try refreshing the admin page
4. Check that users actually exist in Firestore Database (not just Authentication)