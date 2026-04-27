# Admin Setup Instructions

## Admin Email
**kushieweb@gmail.com**

## Firebase Setup Steps:

### 1. Create Admin User in Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/project/kushie-b69fb/authentication/users)
2. Click "Add user"
3. Enter:
   - Email: **kushieweb@gmail.com**
   - Password: (choose a secure password)
4. Click "Add user"

### 2. Get the User UID
1. After creating the user, you'll see it in the users list
2. Copy the UID (it will look like: `abc123def456...`)
3. Update `src/config/firebase.js` with this UID:

```javascript
// Replace this line with your actual admin UID
export const ADMIN_UID = "YOUR_COPIED_UID_HERE";
```

### 3. Enable Authentication
Make sure Email/Password authentication is enabled:
1. Go to Authentication → Sign-in method
2. Enable Email/Password if not already enabled

### 4. Login to Admin Dashboard
1. Navigate to: http://localhost:5174/admin
2. Login with:
   - Email: kushieweb@gmail.com
   - Password: (the password you created)

## Important Notes:
- Only the user with the matching UID can access the admin dashboard
- Make sure to use a strong password
- Keep your admin UID private and secure