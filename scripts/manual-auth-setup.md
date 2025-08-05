# Manual Authentication Setup Guide

Since the automated Firebase Auth account creation script is having API key issues, here are the manual steps to create the test accounts for the updated login buttons.

## Method 1: Using Your App's Sign Up Screen (Recommended)

1. **Open your app and go to the Sign Up screen**
2. **Create these accounts one by one:**

### Business Owner Accounts:
- **Rainbow Café Owner**
  - Email: `alex.rainbow@example.com`
  - Password: `rainbow123`
  - Name: `Alex Rivera`
  - Role: Choose "Business Owner" if available

- **Inclusive Health Clinic Owner**
  - Email: `dr.maria.santos@inclusivehealth.com`
  - Password: `health123`
  - Name: `Dr. Maria Santos`
  - Role: Choose "Business Owner" if available

### Business Manager Accounts:
- **Rainbow Café Manager**
  - Email: `jamie.manager@rainbowcafe.com`
  - Password: `manager123`
  - Name: `Jamie Thompson`
  - Role: Choose "Business Owner" if available

- **Spectrum Fitness Trainer**
  - Email: `sam.trainer@spectrumfitness.com`
  - Password: `trainer123`
  - Name: `Sam Rodriguez`
  - Role: Choose "Business Owner" if available

## Method 2: Using Firebase Console

1. **Go to Firebase Console** → Your Project → Authentication → Users
2. **Click "Add User"**
3. **Enter the email and password for each account above**
4. **After creating each account, you'll need to link it to the business data**

## Method 3: Using the Make Admin Script

If you want to convert any existing users to have business permissions:

```bash
# First create a script to promote users to business_owner role
node scripts/make-business-owner.js alex.rainbow@example.com
node scripts/make-business-owner.js dr.maria.santos@inclusivehealth.com
node scripts/make-business-owner.js jamie.manager@rainbowcafe.com
node scripts/make-business-owner.js sam.trainer@spectrumfitness.com
```

## Linking Accounts to Business Data

After creating the Firebase Auth accounts, you'll need to link them to the business data we created. Run this script:

```bash
node scripts/link-auth-to-business.js
```

## Testing the Login Buttons

Once the accounts are created, you can test the new login buttons:

### Business Owner Login Options:
- ☕ **Rainbow Café Owner** - `alex.rainbow@example.com` / `rainbow123`
- 🏥 **Inclusive Health Clinic** - `dr.maria.santos@inclusivehealth.com` / `health123`

### Business Manager Login Options:
- 👔 **Rainbow Café Manager** - `jamie.manager@rainbowcafe.com` / `manager123`
- 🏋️ **Spectrum Fitness Trainer** - `sam.trainer@spectrumfitness.com` / `trainer123`

## Expected Behavior

- **Alex Rivera** should be able to see and manage both Rainbow Café and Spectrum Fitness (multi-business owner)
- **Dr. Maria Santos** should see only Inclusive Health Clinic
- **Jamie Thompson** should be able to manage Rainbow Café as a delegated manager
- **Sam Rodriguez** should be able to manage Spectrum Fitness as a trainer/manager

## Troubleshooting

If login buttons don't work:
1. Verify the accounts exist in Firebase Console → Authentication
2. Check that the user documents exist in Firestore → users collection
3. Verify the business ownership relationships in the users' businessInfo fields
4. Check the console for any authentication errors

## Next Steps

Once the accounts are working, you can test:
- Multi-business ownership (Alex should see 2 businesses)
- Delegated management (Jamie managing for Alex)
- Business-specific permissions
- Role-based UI differences
