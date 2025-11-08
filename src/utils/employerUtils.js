/**
 * Utility functions for employer-related operations
 */

/**
 * Safely get the employer ID from localStorage
 * @returns {Object} { employerId: number|null, error: string|null }
 */
export function getEmployerIdFromStorage() {
  try {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return { employerId: null, error: "No user data in localStorage" };
    }

    const user = JSON.parse(userStr);
    
    // Check various possible locations for employer data
    const employerId = 
      user.roleData?.employerId ||      // New structure from updated login
      user.employer?.employerId ||      // Old structure
      user.employerId ||                // Direct property
      null;

    if (!employerId) {
      console.warn("Employer ID not found in user data:", user);
      return { 
        employerId: null, 
        error: "Employer profile not found. Please complete your employer profile." 
      };
    }

    return { employerId, error: null };
  } catch (err) {
    console.error("Error getting employer ID:", err);
    return { 
      employerId: null, 
      error: "Failed to parse user data" 
    };
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  return !!token;
}

/**
 * Get current user from localStorage
 * @returns {Object|null}
 */
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("Error getting current user:", err);
    return null;
  }
}

/**
 * Get authentication token
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem("token");
}
