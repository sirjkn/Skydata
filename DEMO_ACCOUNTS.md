# Demo Accounts - Quick Reference

## 🔐 Testing Credentials

The following demo accounts are **active and functional** in the Skyway Suites platform. They are not displayed in the login UI but can be manually entered for testing purposes.

---

### 👨‍💼 Admin Account

**Purpose**: Full administrative access to all platform features

```
Email:    admin@skyway.com
Password: admin123
```

**Access Level:**
- ✅ Full admin dashboard access
- ✅ Property management (Create, Edit, Delete)
- ✅ Booking management
- ✅ Customer management
- ✅ Payment processing
- ✅ Activity log access
- ✅ Settings configuration
- ✅ Menu pages management

---

### 👤 Customer Account

**Purpose**: Customer-facing features and booking access

```
Email:    user@skyway.com
Password: user123
```

**Access Level:**
- ✅ Browse properties
- ✅ View property details
- ✅ Make bookings (when logged in)
- ✅ View personal bookings
- ✅ Contact property owners
- ❌ No admin dashboard access

---

## 📝 Usage Instructions

### How to Login with Demo Accounts

1. Navigate to the **Login Page** (`/login`)
2. **Manually enter** the email and password from above
3. Click **"Sign In"**
4. You will be redirected based on your role:
   - **Admin**: Full dashboard access
   - **Customer**: Home page with booking capabilities

### Testing Workflows

#### Test Admin Features
```
1. Login with admin@skyway.com / admin123
2. Access /admin dashboard
3. Test property creation, booking management, etc.
```

#### Test Customer Features
```
1. Login with user@skyway.com / user123
2. Browse properties from home page
3. View property details
4. Test booking flow
```

---

## 🔒 Security Notes

- Demo accounts are **hardcoded** in `/src/app/lib/auth.ts`
- Credentials are **not hashed** (client-side demo only)
- All data stored in **browser localStorage**
- **No backend authentication** - purely frontend simulation

---

## 🛠️ Developer Notes

### Where Demo Accounts Are Defined

**File**: `/src/app/lib/auth.ts`

```typescript
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
```

### Authentication Flow

1. User submits email/password
2. `login()` function checks against `DEMO_ACCOUNTS`
3. On match, user object stored in localStorage
4. App redirects based on role
5. Protected routes check `getCurrentUser()` and `isAdmin()`

---

## 🚀 For Production

### To Remove Demo Accounts

If deploying to production and want to remove demo accounts:

1. **Option A - Keep but Change Credentials**
   ```typescript
   // Change passwords in /src/app/lib/auth.ts
   admin: {
     email: 'admin@yourdomain.com',
     password: 'strongSecurePassword123!',
     // ...
   }
   ```

2. **Option B - Remove Completely**
   ```typescript
   // In /src/app/lib/auth.ts
   // Comment out or remove DEMO_ACCOUNTS object
   // Implement proper backend authentication
   ```

3. **Option C - Add More Accounts**
   ```typescript
   export const DEMO_ACCOUNTS = {
     admin: { /* ... */ },
     user: { /* ... */ },
     manager: { /* ... */ },  // Add new role
   };
   ```

---

## ⚠️ Important Reminders

- 🔓 Demo accounts are **NOT secure** for production
- 💾 All data is **client-side only** (localStorage)
- 🌐 Data is **NOT shared** across browsers or devices
- 🗑️ Clearing browser data **deletes all records**
- 👥 Multiple users **cannot access** the same data simultaneously

---

**Last Updated**: Version 3.0
