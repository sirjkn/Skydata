# Skyway Suites - Property Rental Management Platform

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [User Roles & Access](#user-roles--access)
- [Core Modules](#core-modules)
- [Demo Accounts](#demo-accounts)
- [Design System](#design-system)
- [Data Storage](#data-storage)
- [Version Information](#version-information)

---

## 🏠 Overview

**Skyway Suites** is a modern, full-featured property listing and management platform built specifically for the Kenyan rental market. The platform provides a complete solution for property owners, managers, and customers with comprehensive booking management, payment tracking, and administrative tools.

### Key Highlights
- 🇰🇪 **Kenya-focused**: Prices in Kenyan Shillings (KSh)
- 📱 **WhatsApp Integration**: Direct customer communication
- 🎨 **Modern UI**: Responsive design with custom color scheme
- 💾 **LocalStorage-based**: No backend required - all data stored locally
- 🔐 **Role-Based Access Control**: Admin, Manager, and Customer roles
- 📊 **Comprehensive Analytics**: Real-time booking and revenue tracking
- 🖼️ **Image Optimization**: WebP conversion with 50KB compression
- 📄 **Print-Ready Receipts**: Professional booking and payment receipts

---

## ✨ Features

### 🏡 Property Management
- **Property Listings**: Create, edit, and delete properties
- **Category Management**: Custom property categories (Apartment, House, Villa, etc.)
- **Feature Tags**: Add amenities (WiFi, Parking, Kitchen, etc.)
- **Image Gallery**: Multi-image upload with carousel display
- **Real-time Availability**: Dynamic booking status with color-coded badges
- **Property Search**: Filter by category, price, and features
- **Property Details**: Comprehensive property pages with all information

### 📅 Booking System
- **Smart Booking**: Book properties with check-in/check-out dates
- **Availability Detection**: Automatic conflict prevention
- **Booking Status**: Pending, Confirmed, Completed, Cancelled
- **Auto-confirmation**: Automatic confirmation when full payment received
- **Booking from Properties**: Direct booking action from property details
- **Customer Assignment**: Link bookings to specific customers
- **Date Calculation**: Automatic price calculation based on days

### 💰 Payment Management
- **Multiple Payment Methods**: M-Pesa, Cash, Bank Transfer, Card (coming soon)
- **Partial Payments**: Support for installment payments
- **Payment Tracking**: Complete payment history per booking
- **Auto-status Updates**: Booking status updates based on payment
- **Color-coded Status Labels**:
  - 🟢 **"Paid in Full"** - Green badge
  - 🟣 **"Partial Payment"** - Purple badge
  - 🔴 **"Not Paid"** - Red badge
- **Payment Receipts**: Professional printable receipts

### 👥 Customer Management
- **Customer Profiles**: Name, email, phone, address
- **Customer Dashboard**: View customer booking history
- **Customer Activity**: Track all customer interactions
- **Registration**: Customer signup and account creation

### 🎛️ Admin Dashboard
- **Overview Dashboard**: Key metrics and statistics
- **Property Management**: Full CRUD operations
- **Booking Management**: View, edit, cancel bookings
- **Customer Management**: View and manage customer accounts
- **Payment Tracking**: Monitor all payments and revenue
- **Activity Log**: Complete audit trail of all actions
- **Settings Module**: Platform configuration and customization
- **Menu Pages Manager**: Create custom pages (About, Privacy, Terms, etc.)

### 📊 Analytics & Reporting
- **Real-time Stats**: Total properties, active bookings, monthly revenue
- **Payment Status Breakdown**: Visual representation of payment states
- **Revenue Tracking**: Completed vs pending revenue
- **Booking Trends**: Active, completed, and cancelled bookings
- **Property Performance**: Individual property revenue and booking counts

### 🛠️ Additional Features
- **Activity Log**: Complete system audit trail with timestamps
- **Custom Modal System**: 4 types (Success, Error, Confirmation, Info)
- **Print Functionality**: Print booking and payment receipts
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **WhatsApp Integration**: Direct contact via WhatsApp button
- **Rich Text Editor**: For page content and descriptions
- **Version Control**: Standardized versioning across modules

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Tailwind CSS v4** - Utility-first styling
- **Shadcn/ui** - Component library
- **Lucide React** - Icon system
- **React Slick** - Image carousels
- **Sonner** - Toast notifications
- **html2canvas** - Screenshot generation
- **jsPDF** - PDF generation

### Development
- **Vite** - Build tool and dev server
- **PostCSS** - CSS processing
- **ESLint** - Code linting

### Data Management
- **LocalStorage API** - Client-side data persistence
- **Custom Storage Utilities** - Type-safe data operations

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd skyway-suites
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Start development server**
```bash
npm run dev
# or
pnpm dev
```

4. **Build for production**
```bash
npm run build
# or
pnpm build
```

5. **Preview production build**
```bash
npm run preview
# or
pnpm preview
```

---

## 👤 User Roles & Access

### 🔑 Role-Based Access Control (RBAC)

#### Admin
- **Full Access** to all features
- Manage properties, bookings, customers, payments
- Access admin dashboard
- View activity logs
- Modify settings
- Create custom pages

#### Manager
- **Limited Access**
- Manage properties and bookings
- View customer information
- Process payments
- Cannot modify system settings

#### Customer
- **User Access**
- Browse properties
- View property details
- Make bookings (when logged in)
- View personal booking history
- Contact property owners

---

## 🧩 Core Modules

### 1. Home Page (`/`)
- Hero section with featured properties
- Property category filters
- Search and browse functionality
- WhatsApp contact integration
- Responsive property grid

### 2. Property Details (`/property/:id`)
- Property image carousel
- Comprehensive property information
- Amenities display
- Real-time availability status
- Booking form (for logged-in users)
- Payment method selection
- WhatsApp contact button

### 3. Admin Dashboard (`/admin`)
**Requires: Admin or Manager role**

#### Sidebar Menu
- 📊 Dashboard Overview
- 🏠 Properties
- 📅 Bookings
- 👥 Customers
- 💳 Payments
- 📄 Menu Pages
- ⚙️ Settings
- 📋 Activity Log
- 🚪 Logout

#### Dashboard Overview
- Total Properties count
- Active Bookings count
- Total Users count
- Monthly Revenue (KSh)
- Recent bookings list

#### Properties Section
- List all properties
- Add new property
- Edit existing properties
- Delete properties
- View property details modal
- Book property directly from modal
- Category management
- Feature management
- Image upload and optimization

#### Bookings Section
- View all bookings
- Color-coded payment status
- Quick navigation to Customers, Payments, Properties
- Edit booking details
- Cancel bookings
- View booking receipts
- Print booking receipts

#### Customers Section
- List all customers
- View customer details
- Customer booking history
- Delete customers (with confirmation)

#### Payments Section
- View all payments
- Add payments to bookings
- Payment method tracking
- Transaction ID recording
- Payment receipts
- Print payment receipts
- Payment status indicators

### 4. Activity Log (`/admin/activity-log`)
**Requires: Admin role**
- Complete audit trail
- Action timestamps
- User attribution
- Action types (Create, Update, Delete)
- Entity tracking (Property, Booking, Customer, Payment, etc.)
- Search and filter capabilities

### 5. Settings (`/admin/settings`)
**Requires: Admin role**
- Platform configuration
- System preferences
- User management
- Version information

### 6. Menu Pages Manager (`/admin/menu-pages`)
**Requires: Admin role**
- Create custom pages (About Us, Privacy Policy, Terms, Contact)
- Rich text editor
- Page visibility controls
- URL slug management
- Navigation menu integration

### 7. Authentication
- **Login** (`/login`) - Email/password authentication
- **Signup** (`/signup`) - Customer registration
- Demo accounts still functional (not displayed in UI)

---

## 🔐 Demo Accounts

Demo accounts are **still active** in the system for testing purposes but are **hidden from the login UI** for a cleaner production look.

### Available Demo Accounts

#### Admin Account
- **Email**: `admin@skyway.com`
- **Password**: `admin123`
- **Access**: Full administrative access

#### Customer Account
- **Email**: `user@skyway.com`
- **Password**: `user123`
- **Access**: Customer portal access

> **Note**: You can manually enter these credentials to test the system with different roles.

---

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--charcoal-grey: #36454F;   /* Headers, primary text */
--olive-green: #6B7F39;     /* CTAs, highlights */
--warm-beige: #FAF4EC;      /* Backgrounds, cards */

/* Accent Colors */
--beige-accent: #D4C5B0;    /* Price tags, badges */
--beige-border: #B8A586;    /* Borders, outlines */
```

### Status Color Codes
- **🟢 Green**: Available, Confirmed, Paid in Full, Success
- **🔴 Red**: Booked, Unavailable, Cancelled, Not Paid, Error
- **🟣 Purple**: Partial Payment, Pending
- **🟡 Yellow**: Pending Payment, Warning
- **🔵 Blue**: Info, Navigation actions

### Typography
- **Headings**: Bold, Charcoal Grey (#36454F)
- **Body**: Regular, Dark Grey
- **Labels**: Medium weight, smaller size

### UI Components
- **Buttons**: Olive Green primary, outline variants
- **Cards**: White background, subtle shadows
- **Inputs**: Border focus effect, Olive Green accent
- **Modals**: Backdrop blur, centered positioning
- **Badges**: Rounded, color-coded by status

---

## 💾 Data Storage

### LocalStorage Structure

All data is stored in browser localStorage with the following keys:

```typescript
// User Authentication
'currentUser': User object
'users': User[] array

// Property Data
'properties': Property[] array
'categories': string[] array
'features': string[] array

// Booking Data
'bookings': Booking[] array

// Payment Data
Stored within booking objects as payments array

// Activity Logs
'activityLogs': ActivityLog[] array

// Custom Pages
'menuPages': MenuPage[] array

// Settings
'settings': Settings object
```

### Data Models

#### User
```typescript
{
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  role: 'Admin' | 'Manager' | 'Customer';
  createdAt: string;
}
```

#### Property
```typescript
{
  id: string;
  name: string;
  category: string;
  location: string;
  price: number; // per day in KSh
  beds: number;
  baths: number;
  area: number; // sqft
  description: string;
  features: string[];
  images: string[]; // base64 WebP images
  createdAt: string;
  updatedAt: string;
}
```

#### Booking
```typescript
{
  id: string;
  customerName: string;
  customerId: string;
  propertyId: string;
  propertyName: string;
  propertyPrice: number;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  status: 'Pending Payment' | 'Confirmed' | 'Completed' | 'Cancelled';
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}
```

#### Payment
```typescript
{
  id: string;
  amount: number;
  method: 'mpesa' | 'cash' | 'bank' | 'card';
  transactionId?: string;
  date: string;
}
```

#### Activity Log
```typescript
{
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  user: string;
  timestamp: string;
}
```

---

## 📌 Version Information

**Current Version**: `3.0`

All admin modules are standardized with version 3.0:
- Admin Dashboard
- Settings Module
- Activity Log
- Menu Pages Manager

### Version History
- **2.35** - Current stable release
  - Standardized version numbering
  - Added dashboard sidebar to Activity Log
  - Removed "Add Booking" button from Bookings section
  - Added "Book This Property" action in property details modal
  - Enhanced booking workflow

---

## 🚀 Key Workflows

### Creating a Property
1. Login as Admin
2. Navigate to Dashboard → Properties
3. Click "Add Property"
4. Fill in property details
5. Upload images (auto-optimized to WebP 50KB)
6. Add category and features
7. Click "Add Property"

### Making a Booking
**From Property Details (Customer/Admin):**
1. Browse properties from home page
2. Click property to view details
3. Select check-in and check-out dates
4. Choose payment method
5. Click "Book Now"

**From Admin Dashboard:**
1. Navigate to Properties
2. Click eye icon to view property details
3. Click "Book This Property"
4. Select customer
5. Set booking dates
6. Click "Add Booking"

### Processing Payments
1. Navigate to Dashboard → Payments
2. Find the booking
3. Click "Add Payment"
4. Enter payment amount and method
5. Add transaction ID (optional)
6. Click "Add Payment"
7. Booking auto-confirms when fully paid

### Printing Receipts
1. Navigate to Bookings or Payments
2. Find the booking/payment
3. Click "Receipt" button
4. Click "Print Receipt"
5. Use browser print dialog

---

## 🔧 Customization

### Adding Custom Pages
1. Login as Admin
2. Navigate to Menu Pages Manager
3. Click "Create New Page"
4. Enter page details (title, slug, content)
5. Use rich text editor for formatting
6. Toggle visibility
7. Click "Create Page"

### Managing Categories & Features
1. Navigate to Dashboard → Properties
2. Scroll to Categories or Features section
3. Add new items or delete existing ones
4. All changes apply immediately

### Configuring Settings
1. Navigate to Dashboard → Settings
2. Modify platform configurations
3. Save changes

---

## 📱 WhatsApp Integration

WhatsApp contact buttons are integrated throughout the platform:

- Property details page
- Customer inquiry flows
- Direct phone number links

**Format**: `https://wa.me/254XXXXXXXXX`

---

## 🐛 Known Issues & Debugging

### Property Availability Bug
There's a known issue where properties show "Available for booking" even when there are active bookings. Console logging is in place on the property details page to debug the booking detection logic.

**Location**: `/src/app/pages/property-details.tsx`
**Debug logs**: Check browser console for booking detection output

---

## 📄 File Structure

```
skyway-suites/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app component
│   │   ├── routes.ts                  # Route definitions
│   │   ├── components/
│   │   │   ├── custom-modal.tsx       # Custom modal system
│   │   │   ├── header.tsx             # Site header
│   │   │   ├── rich-text-editor.tsx   # WYSIWYG editor
│   │   │   └── ui/                    # Shadcn UI components
│   │   ├── lib/
│   │   │   ├── auth.ts                # Authentication logic
│   │   │   └── storage.ts             # LocalStorage utilities
│   │   └── pages/
│   │       ├── home.tsx               # Landing page
│   │       ├── property-details.tsx   # Property detail page
│   │       ├── login.tsx              # Login page
│   │       ├── signup.tsx             # Registration page
│   │       ├── admin-dashboard.tsx    # Admin dashboard
│   │       ├── settings.tsx           # Settings module
│   │       ├── activity-log.tsx       # Activity log
│   │       ├── menu-pages-manager.tsx # Custom pages manager
│   │       ├── custom-page.tsx        # Custom page renderer
│   │       └── not-found.tsx          # 404 page
│   └── styles/
│       ├── index.css                  # Main styles
│       ├── tailwind.css               # Tailwind imports
│       ├── theme.css                  # Color theme
│       ├── fonts.css                  # Font imports
│       └── slider.css                 # Carousel styles
├── public/                            # Static assets
├── README.md                          # This file
├── package.json                       # Dependencies
└── vite.config.ts                     # Vite configuration
```

---

## 🤝 Contributing

This is a proprietary project for the Kenyan rental market. For feature requests or bug reports, contact the development team.

---

## 📞 Support

For support, please contact:
- **Email**: support@skywaysuites.co.ke
- **WhatsApp**: Available through the platform

---

## 📝 License

Copyright © 2024 Skyway Suites. All rights reserved.

---

## 🎯 Future Enhancements

- [ ] Card payment integration
- [ ] Email notifications
- [ ] SMS notifications (for Kenya)
- [ ] Advanced search filters
- [ ] Property comparison tool
- [ ] Customer reviews and ratings
- [ ] Mobile app (React Native)
- [ ] Multi-language support (English/Swahili)
- [ ] Cloud backup integration
- [ ] Export data to Excel/PDF

---

**Built with ❤️ for Kenya's rental market**
