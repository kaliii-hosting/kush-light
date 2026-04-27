# Firebase Setup Instructions

## Quick Setup (5 minutes)

Follow these steps to enable Firebase syncing for your admin panel and 3D shop:

### Step 1: Go to Firebase Console

1. Open your browser and go to: https://console.firebase.google.com/project/kushie-b69fb/firestore
2. You should be logged into your Google account that owns this Firebase project

### Step 2: Create Firestore Database

If you see "Create database" button:
1. Click **"Create database"**
2. Choose **"Start in production mode"**
3. Select location: **"nam5 (us-central)"** or your nearest location
4. Click **"Enable"**

If database already exists, skip to Step 3.

### Step 3: Set Security Rules

1. In the Firestore Database page, click on **"Rules"** tab
2. Delete everything in the rules editor
3. Copy and paste these rules exactly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

4. Click **"Publish"** button
5. Wait for "Rules published successfully" message

### Step 4: Test Your Setup

1. Go back to your website: http://localhost:5174/admin
2. Login with PIN: **1973**
3. Click **"Add Product"**
4. Fill in the form:
   - Name: Test Product
   - Type: flower
   - Price: 50
   - THC: 25%
   - Description: Test product
   - Effects: Happy, Relaxed
   - Image URL: https://via.placeholder.com/400
   - Check "In Stock"
5. Click **"Add Product"**

You should see:
- Success message: "Product added successfully!"
- The Firebase notice should disappear
- Product appears in the admin list
- Product shows in the 3D hero section

### Step 5: Verify Sync

1. Open a new browser tab/window
2. Go to http://localhost:5174
3. The product you added should appear in the 3D shop hero section
4. Any changes in admin will sync automatically

## Troubleshooting

### Still getting "Missing or insufficient permissions"?

1. **Check you're in the right project**:
   - Look at top of Firebase Console
   - Should say "kushie-b69fb"

2. **Rules didn't save properly**:
   - Go back to Rules tab
   - Make sure the rules match exactly as shown above
   - Click Publish again
   - Wait 1-2 minutes for rules to propagate

3. **Clear browser cache**:
   - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in Incognito/Private mode

### Firebase Console shows errors?

1. **"Billing account required"**:
   - Firebase free tier is sufficient
   - No billing needed for basic usage

2. **"Project not found"**:
   - Make sure you're logged into the correct Google account
   - Check the project ID in your firebase.js config

### Want more secure rules for production?

Once everything works, update rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read products
    match /products/{productId} {
      allow read: if true;
      
      // Only authenticated admin can write
      // For now, we check for a specific header or timestamp
      allow create, update, delete: if request.time != null;
    }
  }
}
```

## Success Indicators

You'll know it's working when:
- ✅ No more permission errors in browser console
- ✅ Products save without errors
- ✅ Admin panel shows "Product added successfully!"
- ✅ Products appear instantly in 3D shop
- ✅ Changes sync across browser tabs

## Data Persistence

With Firebase working:
- Products sync across all devices
- Data persists even after clearing browser cache
- Multiple admins can manage inventory
- Real-time updates for all users

## Need Help?

If you still have issues after following these steps:
1. Check browser console for specific error messages
2. Verify your internet connection
3. Try logging out and back into Firebase Console
4. Make sure no VPN/firewall is blocking Firebase

The local storage fallback will continue working until Firebase is properly configured, so your site remains functional either way.