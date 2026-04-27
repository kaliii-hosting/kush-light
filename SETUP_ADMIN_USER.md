# Setup Admin User for Firebase

To enable the admin dashboard to access user data, you need to create an admin user in Firebase Authentication.

## Steps to Create Admin User:

### 1. Go to Firebase Console
1. Navigate to https://console.firebase.google.com
2. Select your project (kushie-b69fb)

### 2. Create Admin User in Authentication
1. Go to "Authentication" in the left sidebar
2. Click on "Users" tab
3. Click "Add user" button
4. Enter the following:
   - Email: `admin@kushie.com`
   - Password: `KushieAdmin2024!` (or your preferred secure password)
5. Click "Add user"

### 3. Create Admin Document in Firestore
1. Go to "Firestore Database" in the left sidebar
2. Navigate to the "users" collection
3. Find the document with the UID of the admin user you just created
4. If it doesn't exist, create it with:
   ```json
   {
     "uid": "[admin-user-uid]",
     "email": "admin@kushie.com",
     "displayName": "Admin",
     "role": "admin",
     "createdAt": [timestamp],
     "isOnline": false
   }
   ```
5. Make sure the "role" field is set to "admin"

### 4. Update Admin Password (if needed)
If you used a different password, update it in:
`/src/context/AdminAuthContext.jsx` line 17:
```javascript
const ADMIN_PASSWORD = 'YourNewPasswordHere';
```

### 5. Apply Firebase Security Rules
Use the rules from `FIREBASE_SECURITY_RULES.md` which allow:
- Admin users to read all user documents
- Regular users to read/write their own documents
- Proper authentication checks

## How It Works:

1. Admin enters PIN (1973) on the login page
2. System authenticates the PIN locally
3. System signs in to Firebase using the admin account
4. Admin can now access all user data through Firestore
5. When admin logs out, Firebase session is also terminated

## Security Notes:

- The admin email/password in the code is for development only
- For production, use environment variables or a more secure method
- Consider using Firebase Admin SDK for server-side operations
- Regularly rotate the admin password
- Monitor admin access logs

## Alternative Solution (More Secure):

Instead of hardcoding credentials, you could:
1. Create a Cloud Function that validates the PIN
2. The Cloud Function returns a custom token
3. Use the custom token to authenticate the admin
4. This way, credentials are never exposed in the client code