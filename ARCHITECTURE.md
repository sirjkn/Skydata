# Skyway Suites - Technical Architecture

## 📐 System Architecture Overview

Skyway Suites is a **client-side web application** built with modern web technologies, featuring a **localStorage-based data persistence layer** and **role-based access control**.

---

## 🏗️ Application Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │           React Application (SPA)                  │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │           UI Components Layer                │ │ │
│  │  │  - Pages (Home, Dashboard, Property, etc.)  │ │ │
│  │  │  - Reusable Components (Header, Modal, etc.)│ │ │
│  │  │  - UI Library (shadcn/ui)                    │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │         Business Logic Layer                 │ │ │
│  │  │  - Authentication (auth.ts)                  │ │ │
│  │  │  - Data Management (storage.ts)              │ │ │
│  │  │  - State Management (React Hooks)            │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │         Data Persistence Layer               │ │ │
│  │  │  - localStorage API                          │ │ │
│  │  │  - JSON Serialization                        │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Component Architecture

### Page Components

```
Pages
├── Public Pages (Accessible to all)
│   ├── Home (/src/app/pages/home.tsx)
│   ├── Property Details (/src/app/pages/property-details.tsx)
│   ├── Login (/src/app/pages/login.tsx)
│   ├── Signup (/src/app/pages/signup.tsx)
│   ├── Custom Page (/src/app/pages/custom-page.tsx)
│   └── Not Found (/src/app/pages/not-found.tsx)
│
├── Admin Pages (Requires authentication)
│   ├── Admin Dashboard (/src/app/pages/admin-dashboard.tsx)
│   ├── Settings (/src/app/pages/settings.tsx)
│   ├── Activity Log (/src/app/pages/activity-log.tsx)
│   └── Menu Pages Manager (/src/app/pages/menu-pages-manager.tsx)
│
└── Shared Components
    ├── Header (/src/app/components/header.tsx)
    ├── Custom Modal (/src/app/components/custom-modal.tsx)
    ├── Rich Text Editor (/src/app/components/rich-text-editor.tsx)
    └── UI Components (/src/app/components/ui/*)
```

### Component Hierarchy

```
App.tsx (RouterProvider)
└── Routes (react-router)
    ├── Public Routes
    │   ├── Header (shared)
    │   └── Page Component
    │       ├── Cards
    │       ├── Buttons
    │       ├── Forms
    │       └── Modals
    │
    └── Protected Routes (Admin)
        ├── Admin Dashboard (sidebar + content)
        │   ├── Sidebar Navigation
        │   └── Content Area
        │       ├── Overview
        │       ├── Properties
        │       ├── Bookings
        │       ├── Customers
        │       ├── Payments
        │       └── Menu Pages
        │
        └── Other Admin Pages
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
┌────────────┐
│   User     │
└─────┬──────┘
      │ 1. Enter credentials
      ▼
┌────────────────────┐
│   Login Page       │
└─────┬──────────────┘
      │ 2. Submit form
      ▼
┌────────────────────┐
│   auth.ts          │
│   login()          │
└─────┬──────────────┘
      │ 3. Validate against DEMO_ACCOUNTS
      ▼
┌────────────────────┐
│   localStorage     │
│   Set 'skyway_     │
│   auth_user'       │
└─────┬──────────────┘
      │ 4. Dispatch events
      ▼
┌────────────────────┐
│   Navigate based   │
│   on role          │
└────────────────────┘
```

### Role-Based Access Control (RBAC)

```typescript
// Role Definition
type Role = 'admin' | 'customer';

// Permission Matrix
const PERMISSIONS = {
  admin: {
    viewDashboard: true,
    manageProperties: true,
    manageBookings: true,
    manageCustomers: true,
    managePayments: true,
    viewActivityLog: true,
    modifySettings: true,
    createPages: true
  },
  customer: {
    viewDashboard: false,
    browseProperties: true,
    makeBookings: true,
    viewOwnBookings: true,
    contactOwner: true
  }
};
```

### Protected Route Implementation

```typescript
// Route guard pattern
function AdminRoute({ children }) {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin(user)) {
    return <Navigate to="/" />;
  }
  
  return children;
}
```

---

## 💾 Data Management

### LocalStorage Schema

```typescript
// Storage Keys
const STORAGE_KEYS = {
  AUTH_USER: 'skyway_auth_user',
  PROPERTIES: 'skyway_properties',
  BOOKINGS: 'skyway_bookings',
  CATEGORIES: 'skyway_categories',
  FEATURES: 'skyway_features',
  ACTIVITY_LOGS: 'skyway_activity_logs',
  MENU_PAGES: 'skyway_menu_pages',
  SETTINGS: 'skyway_settings'
};
```

### Data Flow

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Component   │
│  (React)     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  State       │
│  (useState)  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  storage.ts  │
│  utilities   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ localStorage │
│  (Browser)   │
└──────────────┘
```

### CRUD Operations Pattern

```typescript
// Create
const createProperty = (property: Property) => {
  const properties = getFromStorage<Property[]>('properties', []);
  const newProperty = {
    ...property,
    id: generateId(),
    createdAt: new Date().toISOString()
  };
  properties.push(newProperty);
  saveToStorage('properties', properties);
  logActivity('Create', 'Property', newProperty.id);
  return newProperty;
};

// Read
const getProperty = (id: string) => {
  const properties = getFromStorage<Property[]>('properties', []);
  return properties.find(p => p.id === id);
};

// Update
const updateProperty = (id: string, updates: Partial<Property>) => {
  const properties = getFromStorage<Property[]>('properties', []);
  const index = properties.findIndex(p => p.id === id);
  if (index !== -1) {
    properties[index] = {
      ...properties[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveToStorage('properties', properties);
    logActivity('Update', 'Property', id);
  }
};

// Delete
const deleteProperty = (id: string) => {
  const properties = getFromStorage<Property[]>('properties', []);
  const filtered = properties.filter(p => p.id !== id);
  saveToStorage('properties', filtered);
  logActivity('Delete', 'Property', id);
};
```

---

## 🎨 UI/UX Architecture

### Design System Hierarchy

```
Theme (theme.css)
├── Color Tokens
│   ├── Primary Colors
│   ├── Status Colors
│   └── Neutral Colors
│
├── Typography Scale
│   ├── Headings (h1-h6)
│   ├── Body Text
│   └── Labels
│
└── Component Styles
    ├── Buttons
    ├── Cards
    ├── Forms
    └── Modals
```

### Responsive Breakpoints

```css
/* Tailwind v4 Breakpoints */
sm:  640px   /* Small devices (tablets) */
md:  768px   /* Medium devices (small laptops) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2X large devices */
```

### Component Pattern

```typescript
// Standard component structure
export function ComponentName() {
  // 1. Hooks
  const [state, setState] = useState();
  const navigate = useNavigate();
  
  // 2. Effects
  useEffect(() => {
    // Load data
  }, []);
  
  // 3. Handlers
  const handleAction = () => {
    // Handle user interaction
  };
  
  // 4. Render
  return (
    <div className="container">
      {/* Component JSX */}
    </div>
  );
}
```

---

## 🔄 State Management

### State Architecture

```
Global State (localStorage)
├── User Session (getCurrentUser())
├── Properties (loaded on-demand)
├── Bookings (loaded on-demand)
├── Customers (loaded on-demand)
└── Settings (loaded on-demand)

Local State (React useState)
├── Form Data
├── Modal Visibility
├── Loading States
└── Validation Errors

Derived State (computed)
├── Filtered Lists
├── Payment Status
├── Availability Status
└── Statistics
```

### State Update Pattern

```typescript
// 1. Optimistic Update
setState(newValue);

// 2. Persist to Storage
saveToStorage('key', newValue);

// 3. Log Activity
logActivity('Update', 'Entity', entityId);

// 4. Show Feedback
showModal('success', 'Success', 'Action completed');

// 5. Refresh Dependent Data
refreshDependentData();
```

---

## 🖼️ Image Processing Pipeline

### Image Upload Flow

```
┌─────────────────┐
│  User selects   │
│  image file     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FileReader     │
│  (read as       │
│   data URL)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Image   │
│  element        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Draw on Canvas │
│  (resize)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Convert to     │
│  WebP format    │
│  Quality: 0.8   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Compress to    │
│  max 50KB       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save base64    │
│  to localStorage│
└─────────────────┘
```

### Image Optimization Strategy

- **Format**: WebP (better compression than JPEG/PNG)
- **Max Size**: 50KB per image
- **Quality**: 80% (balance of quality and size)
- **Storage**: Base64 encoded in localStorage
- **Display**: Direct base64 src in img tags

---

## 📊 Booking Logic Architecture

### Booking State Machine

```
┌──────────────┐
│  No Booking  │
└──────┬───────┘
       │ User creates booking
       ▼
┌──────────────────┐
│ Pending Payment  │ ◄───┐
└──────┬───────────┘     │ Partial payment added
       │                 │
       │ Full payment    │
       │ received        │
       ▼                 │
┌──────────────────┐     │
│   Confirmed      │─────┘
└──────┬───────────┘
       │
       │ Checkout date passed
       ▼
┌──────────────────┐
│   Completed      │
└──────────────────┘

       Any state
          │
          │ Admin cancels
          ▼
┌──────────────────┐
│   Cancelled      │
└──────────────────┘
```

### Payment Status Calculation

```typescript
function calculatePaymentStatus(booking: Booking): PaymentStatus {
  const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = booking.totalAmount;
  
  if (totalPaid === 0) {
    return 'Not Paid';
  } else if (totalPaid >= totalAmount) {
    return 'Paid in Full';
  } else {
    return 'Partial Payment';
  }
}
```

### Availability Check Logic

```typescript
function isPropertyAvailable(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): boolean {
  const bookings = getActiveBookings(propertyId);
  
  // Check for overlapping dates
  for (const booking of bookings) {
    const bookingStart = new Date(booking.checkIn);
    const bookingEnd = new Date(booking.checkOut);
    
    // Check if dates overlap
    if (
      (checkIn >= bookingStart && checkIn < bookingEnd) ||
      (checkOut > bookingStart && checkOut <= bookingEnd) ||
      (checkIn <= bookingStart && checkOut >= bookingEnd)
    ) {
      return false; // Conflict found
    }
  }
  
  return true; // Available
}
```

---

## 📝 Activity Logging System

### Log Structure

```typescript
interface ActivityLog {
  id: string;
  action: 'Create' | 'Update' | 'Delete' | 'View';
  entity: 'Property' | 'Booking' | 'Customer' | 'Payment' | 'Page' | 'Setting';
  entityId: string;
  details: string;
  user: string;
  timestamp: string;
}
```

### Logging Pattern

```typescript
// Automatic logging on CRUD operations
function logActivity(
  action: string,
  entity: string,
  entityId: string,
  details?: string
) {
  const user = getCurrentUser();
  const log: ActivityLog = {
    id: generateId(),
    action,
    entity,
    entityId,
    details: details || `${action} ${entity}`,
    user: user?.name || 'System',
    timestamp: new Date().toISOString()
  };
  
  const logs = getFromStorage<ActivityLog[]>('activityLogs', []);
  logs.unshift(log); // Add to beginning
  saveToStorage('activityLogs', logs);
}
```

---

## 🎯 Modal System Architecture

### Modal Types

```typescript
type ModalType = 'success' | 'error' | 'confirm' | 'info';

interface ModalState {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}
```

### Modal Flow

```
User Action
    ↓
Trigger Modal
    ↓
Set Modal State
    ↓
Render Modal Component
    ↓
User Interaction
    ↓
Execute Callback
    ↓
Close Modal
```

---

## 🚀 Performance Optimizations

### Image Optimization
- WebP format (30% smaller than JPEG)
- 50KB max size per image
- Lazy loading with react-slick
- Base64 encoding (no HTTP requests)

### Code Splitting
- Route-based code splitting
- Lazy component loading
- Tree-shaking unused code

### State Management
- Local state for UI-only data
- localStorage for persistent data
- Minimal re-renders with proper dependencies

### Rendering Optimizations
- Virtualized lists (for large datasets)
- Debounced search inputs
- Memoized expensive calculations

---

## 🔒 Security Considerations

### Current Implementation (Development)
- ⚠️ Client-side only authentication
- ⚠️ Plaintext passwords in demo accounts
- ⚠️ No encryption for localStorage
- ⚠️ No HTTPS enforcement
- ⚠️ No CSRF protection

### Production Recommendations
- ✅ Implement backend authentication
- ✅ Hash passwords (bcrypt)
- ✅ Use JWT tokens
- ✅ Encrypt sensitive data
- ✅ Enforce HTTPS
- ✅ Add rate limiting
- ✅ Implement CSRF tokens
- ✅ Add input sanitization

---

## 📱 Responsive Design Strategy

### Mobile-First Approach

```css
/* Base styles (mobile) */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Responsive Patterns

- **Stacked to Grid**: Mobile stacks, desktop grids
- **Hamburger Menu**: Mobile hamburger, desktop sidebar
- **Adaptive Forms**: Mobile full-width, desktop multi-column
- **Touch Targets**: Minimum 44px touch targets on mobile

---

## 🧪 Testing Strategy

### Manual Testing Checklist

#### Authentication
- [ ] Login with admin account
- [ ] Login with customer account
- [ ] Logout functionality
- [ ] Protected route access

#### Property Management
- [ ] Create property
- [ ] Edit property
- [ ] Delete property
- [ ] View property details
- [ ] Upload images

#### Booking System
- [ ] Create booking from property details
- [ ] Create booking from admin dashboard
- [ ] Edit booking
- [ ] Cancel booking
- [ ] Check availability logic

#### Payment Processing
- [ ] Add payment to booking
- [ ] Partial payment flow
- [ ] Full payment auto-confirmation
- [ ] Payment receipt generation

#### Responsive Design
- [ ] Mobile layout (< 640px)
- [ ] Tablet layout (640px - 1024px)
- [ ] Desktop layout (> 1024px)
- [ ] Touch interactions on mobile

---

## 🔮 Future Architecture Enhancements

### Backend Integration
```
Frontend (React) ←→ API Gateway ←→ Backend (Node.js/Express)
                                    ↓
                              Database (PostgreSQL)
                                    ↓
                              File Storage (S3)
```

### Real-time Features
- WebSocket connections for live updates
- Real-time booking notifications
- Live availability updates

### Microservices Architecture
- Property Service
- Booking Service
- Payment Service
- Notification Service
- Auth Service

---

## 📚 Dependencies

### Core Dependencies
- `react@18` - UI library
- `react-router@7` - Client-side routing
- `typescript@5` - Type safety

### UI Dependencies
- `tailwindcss@4` - Styling
- `lucide-react` - Icons
- `react-slick` - Carousels
- `sonner` - Toasts

### Utility Dependencies
- `html2canvas` - Screenshots
- `jspdf` - PDF generation

---

## 🛠️ Development Tools

### Build Tools
- Vite - Fast development server and build
- PostCSS - CSS processing
- TypeScript Compiler - Type checking

### Code Quality
- ESLint - Code linting
- Prettier (recommended) - Code formatting

---

**Architecture Version**: 3.0  
**Last Updated**: 2024
