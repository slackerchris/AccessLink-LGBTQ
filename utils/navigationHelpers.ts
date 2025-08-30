/**
 * Navigation Helper Utilities
 * Functions for safely passing data in navigation parameters and preventing crashes
 */

/**
 * Safe navigation goBack that prevents crashes from double navigation
 */
export const safeGoBack = (navigation: any, fallbackRoute?: string) => {
  try {
    if (navigation && typeof navigation.goBack === 'function') {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else if (fallbackRoute) {
        navigation.navigate(fallbackRoute);
      }
    }
  } catch (error) {
    console.error('Navigation goBack error:', error);
    // If goBack fails and we have a fallback, try that
    if (fallbackRoute && navigation?.navigate) {
      try {
        navigation.navigate(fallbackRoute);
      } catch (fallbackError) {
        console.error('Fallback navigation error:', fallbackError);
      }
    }
  }
};

/**
 * Safe navigation with error handling
 */
export const safeNavigate = (navigation: any, routeName: string, params?: any) => {
  try {
    if (navigation && typeof navigation.navigate === 'function') {
      navigation.navigate(routeName, params);
    }
  } catch (error) {
    console.error('Navigation error:', error);
  }
};

/**
 * Debounced navigation to prevent rapid-fire navigation calls
 */
let lastNavigationTime = 0;
const NAVIGATION_DEBOUNCE_MS = 500;

export const debouncedNavigate = (navigation: any, routeName: string, params?: any) => {
  const now = Date.now();
  if (now - lastNavigationTime > NAVIGATION_DEBOUNCE_MS) {
    lastNavigationTime = now;
    safeNavigate(navigation, routeName, params);
  } else {
    console.log('Navigation debounced - too soon since last navigation');
  }
};

export const debouncedGoBack = (navigation: any, fallbackRoute?: string) => {
  const now = Date.now();
  if (now - lastNavigationTime > NAVIGATION_DEBOUNCE_MS) {
    lastNavigationTime = now;
    safeGoBack(navigation, fallbackRoute);
  } else {
    console.log('GoBack debounced - too soon since last navigation');
  }
};

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
