# Firebase Rules for Admin Access Without Authentication

Since the admin dashboard uses PIN-only authentication (no Firebase Auth), we need special rules to allow admin access to user data.

## Option 1: Temporary Open Read Access (Development Only)

**⚠️ WARNING: This is for development/testing only. DO NOT use in production.**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow anyone to read users collection
    // This is ONLY for testing - remove in production
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - public read
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Orders - authenticated users only
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Blog posts - public read
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Option 2: Use a Secret Token in Realtime Database

1. Store admin data in Realtime Database instead of Firestore
2. Use a secret path that only admins know

### Realtime Database Rules:
```json
{
  "rules": {
    // Public read for content
    "pageContent": {
      ".read": true,
      ".write": false
    },
    
    // Admin users data - use secret path
    "adminData": {
      "users": {
        ".read": true,
        ".write": false
      }
    },
    
    // Regular user data stays protected
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

## Option 3: Recommended Production Solution

For production, you should:

1. **Create a backend API** (using Firebase Functions or your own server)
2. **Verify PIN on the backend** and return a custom token
3. **Use Firebase Admin SDK** on the backend to access all data
4. **Secure the API** with rate limiting and IP restrictions

Example Firebase Function:
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.getUsers = functions.https.onRequest(async (req, res) => {
  // Verify admin PIN
  const pin = req.headers['x-admin-pin'];
  if (pin !== '1973') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Get all users using Admin SDK
  const users = await admin.firestore().collection('users').get();
  const userData = users.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  res.json({ users: userData });
});
```

## Quick Fix for Now

Apply Option 1 (open read access) temporarily to get the admin panel working, but plan to implement Option 3 for production.