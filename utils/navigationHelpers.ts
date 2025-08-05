/**
 * Navigation Helper Utilities
 * Functions for safely passing data in navigation parameters
 */

/**
 * Prepares an object for navigation by making it serializable
 * Converts Date objects to ISO strings and handles other non-serializable types
 * 
 * @param obj Any object that may contain Date objects
 * @returns A new object with all Date objects converted to strings
 */
export function prepareForNavigation<T>(obj: T): T {
  if (!obj) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => prepareForNavigation(item)) as unknown as T;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }
  
  // Handle plain objects
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Skip functions or other non-serializable types
      if (typeof value === 'function') {
        continue;
      }
      
      if (value instanceof Date) {
        // Convert dates to ISO strings
        result[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        // Recursively process nested objects
        result[key] = prepareForNavigation(value);
      } else {
        // Pass through primitive values
        result[key] = value;
      }
    }
    
    return result as unknown as T;
  }
  
  // Return primitive values as-is
  return obj;
}

/**
 * Parses an object that may contain ISO date strings back to Date objects
 * 
 * @param obj Any object that may contain ISO date strings
 * @returns A new object with date strings converted back to Date objects
 */
export function parseFromNavigation<T>(obj: T): T {
  if (!obj) return obj;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => parseFromNavigation(item)) as unknown as T;
  }
  
  // Handle plain objects
  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(value)) {
        // This is likely an ISO date string
        result[key] = new Date(value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = parseFromNavigation(value);
      } else {
        result[key] = value;
      }
    }
    
    return result as unknown as T;
  }
  
  // Return primitive values as-is
  return obj;
}
