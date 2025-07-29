/**
 * A map of technical error codes to user-friendly messages.
 * This helps abstract away implementation details from the user.
 */

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again or contact support if the problem persists.';

const errorMessages: { [key: string]: string } = {
  // Firebase Auth Errors
  'auth/invalid-email': 'The email address you entered is not valid. Please check and try again.',
  'auth/user-disabled': 'This user account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address. Please sign up or try a different email.',
  'auth/wrong-password': 'Incorrect password. Please check your password and try again.',
  'auth/email-already-in-use': 'An account already exists with this email address. Please sign in or use a different email.',
  'auth/weak-password': 'The password is too weak. Please use a stronger password.',
  'auth/requires-recent-login': 'This action requires you to have logged in recently. Please sign out and sign back in.',

  // Custom App Errors
  'network/request-failed': 'Could not connect to the server. Please check your internet connection and try again.',
  'validation/invalid-input': 'Some of the information you provided is invalid. Please review the fields and try again.',
  'permissions/denied': 'You do not have permission to perform this action.',

  // Default
  'unknown_error': DEFAULT_ERROR_MESSAGE,
};

/**
 * Gets a user-friendly error message for a given error code.
 * @param code - The technical error code (e.g., 'auth/user-not-found').
 * @returns A user-friendly string.
 */
export const getErrorMessage = (code: string | undefined): string => {
  if (code && errorMessages[code]) {
    return errorMessages[code];
  }
  return DEFAULT_ERROR_MESSAGE;
};
