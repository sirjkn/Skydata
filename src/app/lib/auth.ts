// Authentication utilities using localStorage

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

// Demo accounts
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@skyway.com',
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@skyway.com',
      name: 'Admin User',
      role: 'admin' as const
    }
  },
  user: {
    email: 'user@skyway.com',
    password: 'user123',
    user: {
      id: '2',
      email: 'user@skyway.com',
      name: 'Demo User',
      role: 'customer' as const
    }
  }
};

const AUTH_STORAGE_KEY = 'skyway_auth_user';

export function login(email: string, password: string): User | null {
  // Check admin account
  if (email === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) {
    const user = DEMO_ACCOUNTS.admin.user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // Dispatch events for synchronization
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authChange'));
    return user;
  }
  
  // Check user account
  if (email === DEMO_ACCOUNTS.user.email && password === DEMO_ACCOUNTS.user.password) {
    const user = DEMO_ACCOUNTS.user.user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // Dispatch events for synchronization
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('authChange'));
    return user;
  }
  
  return null;
}

export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  // Dispatch events for synchronization
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('authChange'));
}

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function isAdmin(user: User | null): boolean {
  return user?.role === 'admin';
}