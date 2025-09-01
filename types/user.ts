import { FieldValue } from 'firebase/firestore';

export type TimestampField = Date | FieldValue;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'bizmanager' | 'bizowner';
  isEmailVerified: boolean;
  createdAt: TimestampField;
  updatedAt: TimestampField;
  profilePhoto?: string;
  profile: {
    details: Record<string, unknown> & {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        bio?: string;
        interests?: string[];
    };
    identity?: {
      visible?: boolean;
      pronouns?: string;
      identities?: string[];
      preferredName?: string;
    };
    accessibilityPreferences?: {
      wheelchairAccess?: boolean;
      visualImpairment?: boolean;
      hearingImpairment?: boolean;
      cognitiveSupport?: boolean;
      mobilitySupport?: boolean;
      sensoryFriendly?: boolean;
      genderNeutralRestrooms?: boolean;
    };
  };
}
