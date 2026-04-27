# Quick Fix for Users Management

## Apply These Rules Immediately

### 1. Firestore Rules (Copy and Paste)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow reading all users for admin dashboard
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /orders/{orderId} {
      allow read: if true;
      allow write: if false;
    }
    
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 2. Realtime Database Rules (Copy and Paste)
```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "wishlists": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

## Steps:
1. Go to Firebase Console
2. Navigate to "Firestore Database" > "Rules"
3. Replace with Firestore rules above
4. Navigate to "Realtime Database" > "Rules"  
5. Replace with Realtime Database rules above
6. Click "Publish" for both

This will allow the admin dashboard to read all user data without authentication issues.

⚠️ **Warning**: These are development rules. For production, implement proper authentication.