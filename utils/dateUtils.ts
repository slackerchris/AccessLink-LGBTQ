import { Timestamp } from 'firebase/firestore';

// This type is for data coming from Firestore, which might not be a direct instance of Timestamp
interface FirestoreTimestampLike {
    toDate: () => Date;
}

type TimestampInput = Timestamp | Date | string | FirestoreTimestampLike;

export const normalizeTimestampToDate = (timestamp: TimestampInput | undefined | null | object): Date | null => {
  if (!timestamp) {
    return null;
  }

  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
      return (timestamp as FirestoreTimestampLike).toDate();
    }
    return null;
  } catch (error) {
    console.error('Error normalizing timestamp:', error);
    return null;
  }
};

export const formatTimestamp = (timestamp: TimestampInput | undefined | null | object): string => {
  if (!timestamp) {
    return 'Date not available';
  }

  try {
    let date: Date;
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
      date = (timestamp as FirestoreTimestampLike).toDate();
    }
    else {
      // This will happen for FieldValue sentinels like serverTimestamp() before they are resolved by the server.
      return 'Date pending';
    }

    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};
