// scripts/migrate-profile-details.ts
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
  });
}

const db = getFirestore();

async function migrateProfileDetails() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  let migrated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (!data.profile) continue;
    const profile = data.profile;
    // Only migrate if not already migrated
    if (profile.details) continue;
    const details: any = {};
    // Move editable fields
    if ('firstName' in profile) details.firstName = profile.firstName;
    if ('lastName' in profile) details.lastName = profile.lastName;
    if ('phoneNumber' in profile) details.phoneNumber = profile.phoneNumber;
    if ('bio' in profile) details.bio = profile.bio;
    if ('preferredPronouns' in profile) details.preferredPronouns = profile.preferredPronouns;
    if ('interests' in profile) details.interests = profile.interests;
    // Remove from root profile
    const newProfile = { ...profile, details };
    delete newProfile.firstName;
    delete newProfile.lastName;
    delete newProfile.phoneNumber;
    delete newProfile.bio;
    delete newProfile.preferredPronouns;
    delete newProfile.interests;
    await usersRef.doc(doc.id).update({ profile: newProfile });
    migrated++;
    console.log(`Migrated user ${doc.id}`);
  }
  console.log(`Migration complete. Migrated ${migrated} users.`);
}

migrateProfileDetails().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
