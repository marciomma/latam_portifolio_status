/**
 * Utility functions for authentication and development bypass
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  approvedAt?: string;
  lastLogin?: string;
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is using development bypass
 */
export function isDevBypassUser(): boolean {
  const user = getCurrentUser();
  return user?.id === 'dev_bypass_admin';
}

/**
 * Check if the current user is an admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === 'admin';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if development features should be shown
 */
export function shouldShowDevFeatures(): boolean {
  return isDevelopment() && isAdmin();
}

/**
 * Create a development bypass session
 */
export function createDevBypassSession(): void {
  if (!isDevelopment()) {
    console.warn('Dev bypass is only available in development mode');
    return;
  }

  const mockUser: User = {
    id: 'dev_bypass_admin',
    name: 'Dev Admin',
    email: 'dev@localhost',
    role: 'admin',
    approvedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };

  localStorage.setItem('user', JSON.stringify(mockUser));
}

/**
 * Clear the current user session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
} 