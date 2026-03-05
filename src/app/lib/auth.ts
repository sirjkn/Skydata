/**
 * Authentication utilities with Supabase integration
 * Version 3.0 - Cloud-based authentication
 */

import { fetchAuthUserByEmail, updateAuthUser } from '../../lib/supabaseData';
import { checkConnection } from '../../lib/connectionStatus';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Customer';
}

// Demo accounts for offline/testing mode
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@skyway.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@skyway.com',
      name: 'Admin User',
      role: 'Admin' as const
    }
  },
  user: {
    email: 'user@skyway.com',
    password: 'user123',
    user: {
      id: '2',
      email: 'user@skyway.com',
      name: 'Demo User',
      role: 'Customer' as const
    }
  }
};

const AUTH_STORAGE_KEY = 'skyway_auth_user';

/**
 * Login user - Checks Supabase database for authentication
 */
export async function login(email: string, password: string): Promise<User | null> {
  // Check if connected
  if (!checkConnection()) {
    console.error('Cannot login: No internet connection');
    return null;
  }

  try {
    // Fetch user from Supabase
    const authUser = await fetchAuthUserByEmail(email);
    
    if (!authUser) {
      console.error('User not found');
      return null;
    }

    // Verify password (in production, use bcrypt comparison)
    if (authUser.password !== password) {
      console.error('Invalid password');
      return null;
    }

    // Check if user is active
    if (!authUser.is_active) {
      console.error('User account is inactive');
      return null;
    }

    // Update last login
    await updateAuthUser(authUser.user_id!, {
      last_login: new Date().toISOString()
    });

    // Create session user object
    const user: User = {
      id: authUser.user_id!.toString(),
      email: authUser.email,
      name: authUser.customer_name,
      role: authUser.role
    };

    // Store in sessionStorage (not localStorage - session only)
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    
    // Dispatch events for synchronization
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authChange'));
    
    console.log('✅ Login successful:', user.name, '(' + user.role + ')');
    return user;
  } catch (error) {
    console.error('Login error:', error);
    
    // Fallback to demo accounts if Supabase fails
    if (email === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) {
      const user = DEMO_ACCOUNTS.admin.user;
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authChange'));
      console.warn('⚠️ Using demo admin account (offline mode)');
      return user;
    }
    
    if (email === DEMO_ACCOUNTS.user.email && password === DEMO_ACCOUNTS.user.password) {
      const user = DEMO_ACCOUNTS.user.user;
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authChange'));
      console.warn('⚠️ Using demo user account (offline mode)');
      return user;
    }
    
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY); // Clear old localStorage if exists
  // Dispatch events for synchronization
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('authChange'));
  console.log('✅ Logout successful');
}

export function getCurrentUser(): User | null {
  // Check sessionStorage first
  let userJson = sessionStorage.getItem(AUTH_STORAGE_KEY);
  
  // Fallback to localStorage for backward compatibility
  if (!userJson) {
    userJson = localStorage.getItem(AUTH_STORAGE_KEY);
    if (userJson) {
      // Migrate to sessionStorage
      try {
        const user = JSON.parse(userJson);
        sessionStorage.setItem(AUTH_STORAGE_KEY, userJson);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return user;
      } catch {
        return null;
      }
    }
  }
  
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'Admin';
}

export function isManager(user: User | null): boolean {
  return user?.role === 'Manager';
}

export function isCustomer(user: User | null): boolean {
  return user?.role === 'Customer';
}

export function hasRole(user: User | null, roles: string[]): boolean {
  return user ? roles.includes(user.role) : false;
}