# Skyway Suites - Property Management Platform

A modern, full-featured property listing and management platform for the Kenyan rental market. Built with React, TypeScript, Tailwind CSS, and Supabase with **real-time synchronization**.

## Features

### Customer-Facing Features
- **Property Browse & Search**: Advanced filtering by price, bedrooms, location, and property type
- **Real-time Updates**: See new properties instantly as they're added
- **Property Details**: Comprehensive property information with image galleries
- **Booking System**: Easy-to-use booking request system with live status updates
- **WhatsApp Integration**: Quick inquiries via WhatsApp
- **User Authentication**: Secure login and registration
- **Booking Management**: View and track booking requests with real-time status changes

### Admin Dashboard Features
- **Property Management**: Create, edit, and delete property listings with instant updates
- **Real-time Booking Management**: Review and update booking statuses that sync across all users
- **Customer View**: Overview of all customers and their booking history
- **Dashboard Analytics**: Live key metrics and statistics
- **Sample Data Seeding**: Quick setup with pre-populated sample properties
- **Multi-user Support**: Changes made by any admin are instantly visible to all users

### Real-time Synchronization
- ✨ **Instant Updates**: All changes to properties and bookings are synchronized in real-time
- 🔄 **Live Status Updates**: Booking status changes (pending → confirmed → cancelled) appear immediately
- 👥 **Multi-user Collaboration**: Multiple admins can work simultaneously without conflicts
- 📊 **Live Dashboard Stats**: Statistics update automatically as data changes
- 🚀 **No Manual Refresh**: All users see updates instantly without refreshing the page

## Design System

- **Primary Color**: Charcoal Grey (#36454F)
- **Accent Color**: Olive Green (#6B7F39)
- **Background**: Warm Beige (#FAF4EC)
- **Typography**: Century Gothic
- **Currency**: Kenyan Shillings (Ksh)

## Getting Started

### 1. Access the Admin Dashboard

To use the admin features, you need to sign up with the admin email:

**Admin Email**: `admin@skyway.com`
**Password**: Choose any password (minimum 6 characters)

### 2. Seed Sample Data

After logging in as admin:
1. Navigate to **Admin Dashboard** → **Manage Properties**
2. If no properties exist, click the **"Seed Sample Properties"** button
3. This will populate the database with 6 sample properties

### 3. Explore the Platform

**As a Customer:**
- Browse properties on the home page
- Use filters to find your ideal property
- Click on properties to view details
- Submit booking requests (requires login)
- Contact property managers via WhatsApp

**As an Admin:**
- View dashboard statistics
- Manage property listings
- Review and approve/reject bookings
- View customer information

## Pages & Routes

- `/` - Home page with property listings
- `/property/:id` - Property details and booking
- `/my-bookings` - User's booking history
- `/login` - Login and signup
- `/admin` - Admin dashboard
- `/admin/properties` - Property management
- `/admin/bookings` - Booking management
- `/admin/customers` - Customer overview

## Technical Stack

- **Frontend**: React 18, TypeScript
- **Routing**: React Router v7 (Data Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Server**: Hono web framework on Deno
- **Icons**: Lucide React
- **Toast Notifications**: Sonner

## Database Structure

The platform uses Supabase's key-value store with the following prefixes:

- `property:` - Property listings
- `booking:` - Booking requests
- `inquiry:` - Customer inquiries

## Authentication

Authentication is handled by Supabase Auth with the following features:
- Email/password authentication
- Session management
- Protected routes for admin and user areas
- Auto-confirmed emails (no email server configuration needed for prototyping)

## WhatsApp Integration

The platform integrates WhatsApp for customer inquiries. Click the "Inquire via WhatsApp" button on any property to send a pre-formatted message to the property manager.

**Note**: Update the phone number in `/src/app/pages/property-details.tsx` (line with `wa.me/254700000000`) to your actual WhatsApp business number.

## Admin Configuration

To add more admin users, update the `adminEmails` array in:
- `/src/app/components/navbar.tsx`
- `/src/app/pages/admin/dashboard.tsx`
- `/src/app/pages/admin/properties.tsx`
- `/src/app/pages/admin/bookings.tsx`
- `/src/app/pages/admin/customers.tsx`

## Customization

### Colors
Update the theme in `/src/styles/theme.css`:
- `--primary`: Main brand color (currently Charcoal Grey)
- `--accent`: Accent color (currently Olive Green)
- `--background`: Page background (currently Warm Beige)

### Typography
The Century Gothic font is loaded via CDN in `/src/styles/fonts.css`. To use a different font:
1. Update the font import in `fonts.css`
2. Modify the font-family in the CSS

### Sample Data
Modify `/src/app/utils/sample-data.ts` to customize the sample properties that get seeded.

## Important Notes

⚠️ **This is a prototype**: Figma Make is designed for demonstration and prototyping purposes. It's not intended for production use with real customer data or PII.

⚠️ **Email Confirmation**: User emails are auto-confirmed since an email server hasn't been configured. In production, you'd need to set up Supabase email configuration.

⚠️ **Admin Access**: The admin email check is done client-side for simplicity. In production, implement proper role-based access control.

## Future Enhancements

Potential features to add:
- Advanced search with maps integration
- Payment processing
- Property favorites/wishlists
- Review and rating system
- Email notifications
- Advanced analytics
- Multi-language support
- Mobile app

## Support

For questions or issues, refer to the Figma Make documentation or Supabase documentation.

---

Built with ❤️ for the Kenyan property market