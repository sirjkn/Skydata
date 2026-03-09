/**
 * JWT Authentication utilities for Skyway Suites
 * Replaces Supabase Auth with JWT + bcrypt
 * Version 4.0 - Neon Migration
 */

export interface User {
  user_id: number;
  email: string;
  customer_name: string;
  role: 'Admin' | 'Manager' | 'Customer';
}

const AUTH_STORAGE_KEY = 'skyway_auth_user';
const TOKEN_STORAGE_KEY = 'authToken';

// API Base URL - Update after Vercel deployment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Login user with JWT authentication
 */
export async function login(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Login failed:', error.error);
      return null;
    }

    const { user, token } = await response.json();

    // Store token and user info
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

/**
 * Sign up new user
 */
export async function signup(
  email: string,
  password: string,
  name: string,
  role: 'Customer' | 'Admin' | 'Manager' = 'Customer'
): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Signup failed:', error.error);
      return null;
    }

    const { user, token } = await response.json();

    // Store token and user info
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Signup error:', error);
    return null;
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string, newPassword: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Password reset failed:', error.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    return false;
  }
}

/**
 * Logout user
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!(token && user);
}

/**
 * Check if user has specific role
 */
export function hasRole(role: 'Admin' | 'Manager' | 'Customer'): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('Admin');
}

/**
 * Check if user is admin or manager
 */
export function isAdminOrManager(): boolean {
  const user = getCurrentUser();
  return user?.role === 'Admin' || user?.role === 'Manager';
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

/**
 * Verify token is still valid
 */
export async function verifyToken(): Promise<boolean> {
  try {
    // Try to make an authenticated request
    const response = await authenticatedFetch('/settings');
    return response.ok;
  } catch {
    // Token is invalid or expired
    logout();
    return false;
  }
}
