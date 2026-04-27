# Firebase Security Rules Setup

## Firestore Security Rules

To fix the "Missing or insufficient permissions" error for the users collection, you need to update your Firestore security rules in the Firebase Console.

### Steps to Update Firestore Rules:

1. Go to Firebase Console (https://console.firebase.google.com)
2. Select your project
3. Navigate to "Firestore Database" in the left sidebar
4. Click on the "Rules" tab
5. Replace the existing rules with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        request.auth.token.email == 'admin@kushie.com';
    }
    
    // Users collection rules
    match /users/{userId} {
      // Allow users to read their own document or admins to read all
      allow read: if request.auth != null && 
        (request.auth.uid == userId || isAdmin());
      
      // Allow users to create their own document during signup
      allow create: if request.auth != null && 
        request.auth.uid == userId &&
        request.resource.data.keys().hasAll(['uid', 'email', 'role']) &&
        request.resource.data.uid == userId &&
        request.resource.data.role == 'customer';
      
      // Allow users to update their own document (except role) or admins to update any
      allow update: if request.auth != null && 
        ((request.auth.uid == userId && 
          (!request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']))) ||
         isAdmin());
      
      // Only admins can delete users
      allow delete: if isAdmin();
    }
    
    // Products can be read by everyone, written only by admins
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - users can read their own, admins can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Blog posts - public read, admin write
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

6. Click "Publish" to save the rules

## Realtime Database Rules

For the Realtime Database (used for page content, music tracks, etc.):

1. In Firebase Console, navigate to "Realtime Database"
2. Click on the "Rules" tab
3. Update with these rules:

```json
{
  "rules": {
    // Page content - public read, admin write
    "pageContent": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    
    // Homepage sections - public read, admin write
    "homepageSections": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    
    // Music tracks - public read, admin write
    "musicTracks": {
      ".read": true,
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },
    
    // Users in Realtime Database (for role checking)
    "users": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    
    // Wishlists - users can read/write their own
    "wishlists": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },
    
    // Admin data - read-only access for admin dashboard
    "adminData": {
      "users": {
        ".read": true,
        ".write": false
      }
    }
  }
}
```

4. Click "Publish" to save the rules

## Important Notes:

1. **Admin Setup**: Make sure at least one user has the 'admin' role in Firestore. You can do this manually in the Firebase Console by:
   - Going to Firestore Database
   - Finding the users collection
   - Editing a user document and setting `role: "admin"`

2. **Authentication Required**: These rules require users to be authenticated. The admin panel should handle authentication before attempting to access protected resources.

3. **Security**: These rules provide a basic security model. For production, consider:
   - Adding more granular permissions
   - Implementing custom claims for roles
   - Adding validation rules for data integrity

4. **Debugging**: If you still get permission errors:
   - Check the browser console for specific error messages
   - Verify the user is properly authenticated
   - Ensure the user has the admin role in Firestore
   - Use the Firebase Console's Rules Playground to test your rules