export interface PasswordStrength {
  isStrong: boolean;
  score: number; // 0-4
  feedback: string[];
}

export const validatePassword = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Include at least one uppercase letter');
  } else {
    score += 1;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Include at least one lowercase letter');
  } else {
    score += 1;
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Include at least one number');
  } else {
    score += 1;
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Include at least one special character');
  } else {
    score += 1;
  }

  return {
    isStrong: score >= 4,
    score,
    feedback,
  };
};

export const getPasswordStrengthColor = (score: number): string => {
  switch (score) {
    case 0:
      return '#ff0000'; // Very weak - Red
    case 1:
      return '#ff4500'; // Weak - Orange Red
    case 2:
      return '#ffa500'; // Fair - Orange
    case 3:
      return '#9acd32'; // Good - Yellow Green
    case 4:
    case 5:
      return '#008000'; // Strong - Green
    default:
      return '#808080'; // Default - Gray
  }
};
