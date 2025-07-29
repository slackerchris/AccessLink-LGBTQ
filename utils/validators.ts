/**
 * Validation Utilities
 * Centralized validation functions for forms and user input
 */

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validators = {
  email: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  },

  password: (value: string): ValidationResult => {
    if (!value) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (value.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    // For stronger passwords (optional)
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return { 
        isValid: false, 
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
      };
    }
    
    return { isValid: true };
  },

  displayName: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Display name is required' };
    }
    
    if (value.trim().length < 2) {
      return { isValid: false, message: 'Display name must be at least 2 characters long' };
    }
    
    return { isValid: true };
  },

  phone: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Phone number is required' };
    }
    
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }
    
    return { isValid: true };
  },

  required: (value: string, fieldName: string = 'This field'): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    return { isValid: true };
  },

  businessName: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: false, message: 'Business name is required' };
    }
    
    if (value.trim().length < 2) {
      return { isValid: false, message: 'Business name must be at least 2 characters long' };
    }
    
    return { isValid: true };
  },

  url: (value: string): ValidationResult => {
    if (!value || !value.trim()) {
      return { isValid: true }; // Optional field
    }
    
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, message: 'Please enter a valid URL' };
    }
  }
};

/**
 * Validate multiple fields at once
 */
export const validateForm = (fields: { [key: string]: { value: string; validator: (value: string) => ValidationResult } }): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  let isValid = true;

  Object.keys(fields).forEach(fieldName => {
    const { value, validator } = fields[fieldName];
    const result = validator(value);
    
    if (!result.isValid) {
      errors[fieldName] = result.message || 'Invalid value';
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Validate business form data
 */
export const validateBusinessForm = (data: {
  name: string;
  description: string;
  email?: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}) => {
  return validateForm({
    name: { value: data.name, validator: validators.businessName },
    description: { value: data.description, validator: (value) => validators.required(value, 'Description') },
    email: { value: data.email || '', validator: validators.email },
    phone: { value: data.phone || '', validator: validators.phone },
    website: { value: data.website || '', validator: validators.url },
    address: { value: data.address, validator: (value) => validators.required(value, 'Address') },
    city: { value: data.city, validator: (value) => validators.required(value, 'City') },
    state: { value: data.state, validator: (value) => validators.required(value, 'State') },
    zipCode: { value: data.zipCode, validator: (value) => validators.required(value, 'ZIP Code') },
  });
};
