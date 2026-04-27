# Firebase Security Rules for Cart System

## Firestore Security Rules

Add these rules to your Firebase Console under Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the resource
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Users collection rules
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Prevent accidental deletion
      
      // Subcollection: User's carts
      match /carts/{cartType} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) && 
          cartType in ['shopify', 'wholesale'];
      }
      
      // Subcollection: User's wishlists
      match /wishlists/{wishlistId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId);
      }
    }
    
    // Products collection (read-only for all users)
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || 
         resource.data.customerEmail == request.auth.token.email);
      allow create: if isAuthenticated() && 
        request.resource.data.userId == request.auth.uid;
      allow update: if false;
      allow delete: if false;
    }
    
    // Blog posts (public read)
    match /blog/{postId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Quick Fix for Development

If you need to quickly test the cart functionality during development, you can temporarily use these more permissive rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // TEMPORARY: Allow authenticated users full access to their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow all subcollections under user document
      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Keep other collections as needed
    match /products/{productId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Implementation Steps

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. Navigate to your project: `kushie-b69fb`
3. Go to **Firestore Database** → **Rules**
4. Replace the existing rules with the production rules above
5. Click **Publish**

## Testing the Rules

After publishing the rules, test them:

1. **Authenticated user should be able to**:
   - Read their own user document
   - Read/write their own cart data under `/users/{userId}/carts/shopify` and `/users/{userId}/carts/wholesale`
   - Read/write their own wishlist data

2. **Authenticated user should NOT be able to**:
   - Read other users' data
   - Write to other users' carts
   - Delete user documents

3. **Unauthenticated users should NOT be able to**:
   - Read or write any user data
   - Access cart or wishlist data

## Important Notes

- The cart data is stored under `/users/{userId}/carts/{cartType}` where `cartType` is either 'shopify' or 'wholesale'
- These rules ensure that users can only access their own cart data
- The rules prevent users from creating cart types other than 'shopify' and 'wholesale'
- Make sure users are properly authenticated before attempting to access cart data

## Troubleshooting

If you're still getting permission errors:

1. **Check Authentication State**: Ensure the user is properly logged in
2. **Verify User ID**: Make sure the authenticated user's UID matches the document path
3. **Check Firebase Console**: Look at the Firebase Console Authentication tab to verify the user exists
4. **Test with Simulator**: Use the Firestore Rules Simulator in Firebase Console to test specific operations

## Realtime Database Rules

Add these rules to your Firebase Console under Realtime Database > Rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid",
        "carts": {
          "shopify": {
            ".validate": "newData.hasChildren(['items', 'updatedAt'])"
          },
          "wholesale": {
            ".validate": "newData.hasChildren(['items', 'updatedAt'])"
          }
        }
      }
    },
    "wholesale_invoices": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$invoiceId": {
        ".validate": "newData.hasChildren(['invoiceNumber', 'date', 'customer', 'items', 'total', 'status'])"
      }
    },
    "wholesale_products": {
      ".read": true,
      ".write": "auth != null && auth.token.email == 'admin@kushie.com'"
    }
  }
}
```

## Admin Access for Invoices

For the admin panel to access wholesale invoices, you'll need to ensure:

1. **Admin Authentication**: The admin must be logged in with proper credentials
2. **Invoice Access**: The `wholesale_invoices` rules allow any authenticated user to read invoices
3. **Security Consideration**: In production, you should restrict invoice access to admin users only:

```json
"wholesale_invoices": {
  ".read": "auth != null && auth.token.email == 'admin@kushie.com'",
  ".write": "auth != null",
  "$invoiceId": {
    ".validate": "newData.hasChildren(['invoiceNumber', 'date', 'customer', 'items', 'total', 'status'])"
  }
}
```