# Firebase Realtime Database Setup

Your app is now configured to use Firebase Realtime Database. Here's how to ensure it's working properly:

## Quick Setup (3 minutes)

### Step 1: Go to Firebase Console

1. Open: https://console.firebase.google.com/project/kushie-b69fb/database
2. Make sure you're logged into the Google account that owns this project

### Step 2: Enable Realtime Database (if not already enabled)

If you see a "Create Database" button:
1. Click **"Create Database"**
2. Choose your location (us-central1 recommended)
3. Select **"Start in test mode"** for now
4. Click **"Enable"**

### Step 3: Set Database Rules

1. In the Realtime Database page, click on **"Rules"** tab
2. Replace the existing rules with:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **"Publish"**

### Step 4: Test Your Setup

1. Go to your admin panel: http://localhost:5174/admin
2. Login with PIN: **1973**
3. Add a new product
4. You should see "Product added successfully!" (not "stored locally")

### Step 5: Verify in Firebase Console

1. Go back to Firebase Console
2. Click on "Data" tab in Realtime Database
3. You should see your products under the "products" node

## How It Works

- **Admin Panel**: Adds, updates, and deletes products in Firebase
- **3D Hero Shop**: Automatically displays products from Firebase in real-time
- **Local Fallback**: If Firebase is unavailable, uses localStorage
- **Real-time Sync**: Changes appear instantly across all browser tabs

## Security Rules for Production

Once everything works, update to more secure rules:

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": false,
      ".validate": "newData.hasChildren(['name', 'price', 'type'])"
    },
    "admin": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

Note: For production, implement proper authentication instead of PIN-based access.

## Troubleshooting

### "Permission denied" errors?
- Check that rules are published
- Make sure you're in test mode initially
- Clear browser cache and refresh

### Products not showing?
- Check browser console for errors
- Verify Firebase project is active
- Check internet connection

### Data not syncing?
- Ensure same Firebase project is used
- Check that databaseURL in config matches your project
- Look for errors in browser console

## Data Structure

Products are stored in Firebase like this:
```
kushie-b69fb
└── products
    ├── -ABC123
    │   ├── name: "OG Kush"
    │   ├── type: "flower"
    │   ├── price: 45
    │   ├── thc: "22%"
    │   ├── imageUrl: "https://..."
    │   └── ...
    └── -XYZ789
        └── ...
```

## Success Indicators

✅ No "Using Local Storage" notice in admin
✅ Products appear in Firebase Console
✅ Changes sync instantly between tabs
✅ Products persist after clearing browser data

## Next Steps

1. Add authentication for admin access
2. Implement image upload to Firebase Storage
3. Add customer orders functionality
4. Set up Firebase Analytics

Your Firebase Realtime Database is now ready to use!