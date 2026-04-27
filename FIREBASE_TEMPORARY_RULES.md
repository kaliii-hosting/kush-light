# Temporary Firebase Rules for Development

**IMPORTANT**: These are temporary rules to get authentication working. Apply more restrictive rules for production.

## Firestore Rules (Temporary)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary: Allow authenticated users to read/write their own user document
    // Admin can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.email == 'admin@kushie.com');
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if false; // Temporarily disabled
    }
    
    // Orders
    match /orders/{orderId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Blog posts
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if false; // Temporarily disabled
    }
  }
}
```

## Steps to Apply:

1. Go to Firebase Console
2. Navigate to Firestore Database > Rules
3. Replace with the temporary rules above
4. Click "Publish"

This will allow users to create and manage their own documents during signup/signin.