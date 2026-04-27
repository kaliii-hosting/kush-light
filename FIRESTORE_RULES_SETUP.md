# Firestore Security Rules and Indexes Setup

## Quick Setup via Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the contents of `firestore.rules`
5. Click **Publish**

## Setup via Firebase CLI

1. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

4. Deploy the rules and indexes:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## Creating Required Indexes

### Option 1: Via Firebase Console (Easiest)
When you see the error "The query requires an index", click the link provided in the error message. It will take you directly to Firebase Console with the index pre-configured. Just click "Create Index" and wait a few minutes.

### Option 2: Via Firebase CLI
Deploy the indexes using:
```bash
firebase deploy --only firestore:indexes
```

### Option 3: Manual Creation
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. For the invoices query, create:
   - Collection ID: `invoices`
   - Fields: 
     - `createdBy` (Ascending)
     - `createdAt` (Descending)
   - Query scope: Collection
   - Click "Create Index"

## What These Rules Do

### Invoices Collection
- **Read**: Users can only read invoices they created (or admins can read all)
- **Create**: Sales reps and admins can create invoices
- **Update**: Only the creator or admin can update
- **Delete**: Only admins can delete

### Users Collection
- **Read**: All authenticated users can read user data
- **Create**: Admins and sales reps can create users
- **Update**: Users can update their own profile, admins can update any
- **Delete**: Only admins can delete

### Products Collection
- **Read**: Public access (anyone can read)
- **Write**: Only admins can create/update/delete

## Troubleshooting

If you're still getting permission errors after deploying:

1. Make sure the user's role is properly set in the users collection
2. Verify the user document has a `role` field set to either "admin" or "salesRep"
3. Check that the `createdBy` field in invoices matches the user's UID
4. Clear your browser cache and re-authenticate

## Testing in Development

For development, you can temporarily use less restrictive rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ WARNING**: Never use these permissive rules in production!