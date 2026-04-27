# Admin Dashboard - Simple PIN Access

## Admin Access
- **URL**: `/admin`
- **PIN**: `1973`

## How to Access Admin Dashboard

1. Navigate to: http://localhost:5174/admin
2. Enter PIN: **1973** using the keypad
3. You'll be automatically logged in when the correct PIN is entered

## Features

### PIN Keypad Login
- Simple 4-digit PIN entry
- Visual feedback with green dots
- Auto-submit on 4th digit
- Clear and delete buttons
- Incorrect PIN auto-clears after 1.5 seconds

### Admin Dashboard
- **Product Management**: Add, edit, delete products
- **Real-time Sync**: Changes instantly appear in website
- **Statistics**: View product counts by category
- **Logout**: Click logout to return to PIN screen

## Firebase Setup (Still Required)

### 1. Create Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/project/kushie-b69fb)
2. Click **Firestore Database** → **Create Database**
3. Choose **Production mode**
4. Select your region

### 2. Set Firestore Rules
Go to Rules tab and paste:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{document=**} {
      allow read: if true;  // Public can read
      allow write: if true; // PIN protection handles admin access
    }
  }
}
```

## Product Management

### Adding Products
1. Click "Add Product" button
2. Fill in:
   - Name
   - Type (Flower/Edible/Concentrate)
   - Price
   - THC content
   - Description
   - Effects
3. Click "Add Product"

### Editing Products
1. Click edit icon on any product
2. Update fields
3. Click "Update Product"

### Deleting Products
1. Click delete icon
2. Confirm deletion

## Security Note
The PIN (1973) is hardcoded in the app. For production, consider:
- Storing PIN in environment variable
- Using more complex authentication
- Adding rate limiting for PIN attempts