/**
 * API service for handling network requests
 */

// Base URL for the API
const API_BASE_URL = 'https://api.example.com/v1';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchWithErrorHandling(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    // Check if response is OK
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    // Return response data if successful
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// API methods
const ApiService = {
  /**
   * GET request
   */
  get: async (endpoint: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}${endpoint}`);
  },

  /**
   * POST request
   */
  post: async (endpoint: string, data: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  put: async (endpoint: string, data: any) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete: async (endpoint: string) => {
    return await fetchWithErrorHandling(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
    });
  },
};

export default ApiService;
