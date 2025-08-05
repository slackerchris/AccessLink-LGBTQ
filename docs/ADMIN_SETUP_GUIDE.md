# Admin Management Guide

## How to Make Users Admin

### Method 1: Using the CLI Tool (Recommended for first admin)

1. **First, make sure the user has registered in your app**
   - The user must have created an account through the app first
   - Check Firebase Console > Authentication to verify the user exists

2. **Run the CLI tool from your project directory:**
   ```bash
   node scripts/make-admin.js user@example.com
   ```

3. **Example:**
   ```bash
   # Make yourself admin (replace with your email)
   node scripts/make-admin.js chris@example.com
   
   # Make another user admin
   node scripts/make-admin.js admin@yourcompany.com
   ```

### Method 2: Using the App Interface (Once you have an admin)

1. **Log in as an admin user**
2. **Navigate to Admin Dashboard** (should appear in user menu)
3. **Go to User Management**
4. **Click "👑 Make Admin" button** in the header
5. **Enter the user's email address**
6. **Confirm the action**

## Admin Capabilities

Once a user is an admin, they can:

- ✅ **Access Admin Dashboard**
- ✅ **Manage Users** (view, suspend, activate)
- ✅ **Promote/Demote Other Admins**
- ✅ **Approve/Reject Business Listings**
- ✅ **Add Admin Notes to User Accounts**
- ✅ **View Platform Statistics**

## Admin User Interface

### Admin Dashboard Features:
- **User Management**: View all users, manage roles and status
- **Business Management**: Approve/reject pending businesses
- **Platform Stats**: Overview of app usage and metrics
- **Debug Tools**: System monitoring and debugging

### User Management Features:
- **Search Users**: Find users by name or email
- **View User Details**: Complete profile and activity history
- **Role Management**: Promote to admin or remove admin privileges
- **Account Status**: Activate, suspend, or deactivate accounts
- **Admin Notes**: Add internal notes for user accounts

## Getting Started

1. **Register your own account in the app first**
2. **Run the CLI tool to make yourself admin:**
   ```bash
   node scripts/make-admin.js your-email@example.com
   ```
3. **Log into the app - you should now see admin options**
4. **Access the Admin Dashboard from the user menu**

## Security Notes

- ⚠️ **Only trusted users should be made admin**
- ⚠️ **Admins can manage other admins** - be careful who you promote
- ⚠️ **CLI tool uses your Firebase config** - keep it secure
- ✅ **All admin actions are logged** for audit purposes
- ✅ **Admin status is checked on every admin operation**

## Troubleshooting

### "User not found" error:
- Make sure the user has registered in the app first
- Check spelling of the email address
- Verify the user exists in Firebase Console > Authentication

### "Permission denied" error:
- Make sure you're running as an admin user
- Check your Firebase security rules
- Verify the user document exists in Firestore

### Admin UI not showing:
- Log out and log back in
- Check that the user's role is set to 'admin' in Firestore
- Verify the usePermissions hook is working correctly

## Firebase Database Structure

Admin users have this structure in Firestore:
```json
{
  "uid": "user-id",
  "email": "user@example.com",
  "role": "admin",  // ← This is the key field
  "displayName": "User Name",
  "isEmailVerified": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

The role field can be:
- `"user"` - Regular user
- `"business_owner"` - Business account
- `"admin"` - Full administrator
