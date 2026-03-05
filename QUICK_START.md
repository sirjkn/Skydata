# Skyway Suites - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you set up and run Skyway Suites locally.

---

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** 18+ installed ([Download](https://nodejs.org/))
- ✅ **npm** or **pnpm** package manager
- ✅ A modern web browser (Chrome, Firefox, Safari, Edge)
- ✅ Code editor (VS Code recommended)

---

## ⚡ Installation

### Step 1: Install Dependencies

```bash
# Using npm
npm install

# OR using pnpm
pnpm install
```

### Step 2: Start Development Server

```bash
# Using npm
npm run dev

# OR using pnpm
pnpm dev
```

The app will start at: **http://localhost:5173**

---

## 🔐 First Login

### Option 1: Admin Access

```
Email:    admin@skyway.com
Password: admin123
```

**What you can do:**
- Access full admin dashboard
- Create and manage properties
- Process bookings and payments
- View activity logs

### Option 2: Customer Access

```
Email:    user@skyway.com
Password: user123
```

**What you can do:**
- Browse properties
- Make bookings
- View property details

---

## 🎯 Quick Feature Tour

### 1. Browse Properties (No Login Required)
1. Open **http://localhost:5173**
2. Scroll down to see property listings
3. Click any property to view details

### 2. Create Your First Property (Admin)
1. Login with admin credentials
2. Navigate to **Dashboard** (top-right menu)
3. Click **Properties** in the sidebar
4. Click **"Add Property"** button
5. Fill in property details:
   - Name: "Modern 2BR Apartment"
   - Category: Select from dropdown or create new
   - Location: "Nairobi, Kenya"
   - Price: 5000 (KSh per day)
   - Beds: 2
   - Baths: 1
   - Area: 850 sqft
   - Description: Add details
6. Upload images (automatically optimized)
7. Add features (WiFi, Parking, etc.)
8. Click **"Add Property"**

### 3. Make a Booking (Admin)
1. Go to **Properties** section in admin dashboard
2. Find a property
3. Click the **eye icon** to view details
4. Click **"Book This Property"** button
5. Select or create a customer
6. Choose check-in and check-out dates
7. Click **"Add Booking"**

### 4. Process a Payment (Admin)
1. Navigate to **Payments** in sidebar
2. Find the booking
3. Click **"Add Payment"**
4. Enter payment details:
   - Amount: Enter amount paid
   - Method: Select payment method
   - Transaction ID: Optional reference
5. Click **"Add Payment"**
6. Booking auto-confirms when fully paid

---

## 📁 Project Structure

```
skyway-suites/
├── src/
│   ├── app/
│   │   ├── App.tsx              ← Main app entry
│   │   ├── routes.ts            ← All routes defined here
│   │   ├── pages/               ← Page components
│   │   │   ├── home.tsx
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── property-details.tsx
│   │   │   └── ...
│   │   ├── components/          ← Reusable components
│   │   │   ├── header.tsx
│   │   │   ├── custom-modal.tsx
│   │   │   └── ui/              ← UI library components
│   │   └── lib/                 ← Utilities
│   │       ├── auth.ts          ← Authentication logic
│   │       └── storage.ts       ← LocalStorage utilities
│   └── styles/                  ← CSS files
│       ├── tailwind.css
│       ├── theme.css            ← Color scheme
│       └── ...
├── README.md                     ← Full documentation
├── ARCHITECTURE.md               ← Technical architecture
├── DEMO_ACCOUNTS.md              ← Demo credentials
└── package.json                  ← Dependencies
```

---

## 🎨 Customization

### Change Color Scheme

Edit `/src/styles/theme.css`:

```css
:root {
  --charcoal-grey: #36454F;  /* Primary dark color */
  --olive-green: #6B7F39;    /* Accent color */
  --warm-beige: #FAF4EC;     /* Background color */
}
```

### Add New Property Category

1. Login as admin
2. Go to **Dashboard → Properties**
3. Scroll to **"Property Categories"** section
4. Enter new category name
5. Click **"Add Category"**

### Create Custom Pages

1. Login as admin
2. Navigate to **Menu Pages Manager**
3. Click **"Create New Page"**
4. Fill in:
   - Title: "About Us"
   - Slug: "about" (URL will be /page/about)
   - Content: Use rich text editor
5. Toggle **"Visible in Menu"**
6. Click **"Create Page"**

---

## 🔧 Common Tasks

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

### Clear All Data

Open browser console and run:

```javascript
// Clear all localStorage data
localStorage.clear();
location.reload();
```

### Export Data

```javascript
// In browser console
const data = {
  properties: localStorage.getItem('skyway_properties'),
  bookings: localStorage.getItem('skyway_bookings'),
  // ... other keys
};
console.log(JSON.stringify(data, null, 2));
```

---

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy:

```bash
# Kill process using port 5173
# On Linux/Mac:
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# OR
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Images Not Loading

- Check browser console for errors
- Verify images are optimized to WebP
- Check localStorage size (max ~5-10MB depending on browser)

### Data Not Persisting

- Check if cookies/localStorage are enabled
- Verify not in incognito/private mode
- Check browser storage quota

---

## 📚 Next Steps

### Learn More
1. Read **[README.md](./README.md)** for complete feature documentation
2. Check **[ARCHITECTURE.md](./ARCHITECTURE.md)** for technical details
3. Review **[DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md)** for testing credentials

### Add Features
- Implement email notifications
- Add customer reviews system
- Integrate real payment gateway (M-Pesa API)
- Add SMS notifications
- Create analytics dashboard

### Deploy to Production
1. Build the app: `npm run build`
2. Upload `dist/` folder to hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up custom domain
5. Enable HTTPS

---

## 💡 Pro Tips

### Development Tips
- Use React DevTools for debugging
- Enable hot reload for faster development
- Use browser localStorage inspector to view data
- Test on different screen sizes (responsive)

### Data Management
- Regularly export data for backup
- Test with realistic data volumes
- Monitor localStorage size limits
- Consider backend migration for scale

### Testing
- Test all user flows (customer and admin)
- Verify responsive design on mobile
- Check cross-browser compatibility
- Test with different data scenarios

---

## 🆘 Getting Help

### Resources
- **Documentation**: Check README.md and ARCHITECTURE.md
- **Demo Accounts**: See DEMO_ACCOUNTS.md
- **Code Comments**: Review inline code comments

### Support
- 📧 Email: support@skywaysuites.co.ke
- 💬 WhatsApp: Available through the platform

---

## ✅ Checklist for First-Time Setup

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Accessed app at http://localhost:5173
- [ ] Logged in with admin account
- [ ] Created first property
- [ ] Made first booking
- [ ] Processed first payment
- [ ] Explored all admin sections
- [ ] Tested customer view
- [ ] Reviewed documentation

---

## 🎉 You're Ready!

You now have Skyway Suites running locally. Start building amazing property rental experiences for the Kenyan market!

**Happy Coding! 🚀**

---

**Version**: 3.0  
**Last Updated**: 2024
