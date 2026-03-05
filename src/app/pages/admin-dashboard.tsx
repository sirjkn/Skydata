import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  LogOut,
  CreditCard,
  FileText,
  Settings,
  Menu,
  X,
  Plus,
  Tag,
  Star,
  Search,
  Activity,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Printer,
  Download
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getCurrentUser, logout, isAdmin } from '../lib/auth';
import { CustomModal } from '../components/custom-modal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
// Connection monitoring
import { checkConnection } from '../../lib/connectionStatus';
import { ConnectionStatusBanner } from '../components/connection-status';
import {
  fetchProperties,
  fetchCustomers,
  fetchBookings,
  fetchCategories,
  fetchFeatures,
  fetchPayments,
  fetchActivityLogs,
  createProperty,
  updateProperty,
  deleteProperty,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createBooking,
  updateBooking,
  deleteBooking,
  createCategory,
  deleteCategory,
  createFeature,
  deleteFeature,
  createPayment,
  deletePayment,
  fetchPaymentsByBooking,
  createActivityLog
} from '../../lib/supabaseData';
import * as adminHelpers from '../lib/adminHelpers';

// App version - keep consistent across all modules
const APP_VERSION = '3.0';

/**
 * =============================================================================
 * BOOKING MANAGEMENT - COMPLETE INTEGRATION DOCUMENTATION
 * =============================================================================
 * 
 * When admin clicks "Book Now" in the Add Booking modal, the system performs:
 * 
 * 1. DATA LINKING (3 Connections):
 *    ✅ Booking → Customer (via customerId)
 *    ✅ Booking → Property (via propertyId)
 *    ✅ Booking → Booking List (localStorage + state)
 * 
 * 2. AUTOMATIC STATUS UPDATES (4 Locations):
 *    ✅ Properties List (Admin Dashboard)
 *       - Shows "Booked, Available from [date]" (red badge)
 *       - Uses bookingsRefreshKey to trigger immediate update
 *    
 *    ✅ Property Details Modal (Admin Dashboard)
 *       - Updates booking count and availability status
 *       - Recalculates on modal open
 *    
 *    ✅ Home Page (Customer View)
 *       - Shows updated status when page loads
 *       - Uses same booking filter logic
 *    
 *    ✅ Property Details Page (Customer View)
 *       - Shows updated availability badge
 *       - Prevents double booking attempts
 * 
 * 3. AVAILABILITY LOGIC (Applied Consistently):
 *    Property shows as "Booked" if it has ANY booking with:
 *    - Status: 'Confirmed' OR 'Pending Payment'
 *    - Checkout date is in the future
 *    - (No payment requirement - changed per user request)
 * 
 * 4. BOOKING FLOWS (2 Entry Points):
 *    a) From Bookings Module → Add Booking button
 *       - Admin selects property from dropdown
 *       - Admin selects customer from dropdown
 *    
 *    b) From Property Details Modal → Book Property button
 *       - Property is pre-filled
 *       - Admin only needs to select customer
 * 
 * 5. CUSTOMER INTEGRATION:
 *    - Customer's "My Bookings" page shows booking immediately
 *    - Uses customerId to filter bookings for logged-in customer
 *    - Booking status shows as 'Confirmed' (admin created)
 * 
 * =============================================================================
 */

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [activeMenu, setActiveMenu] = useState('overview');
  // Default sidebar open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showViewPropertyModal, setShowViewPropertyModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [showBookPropertyDropdown, setShowBookPropertyDropdown] = useState(false);
  const [bookPropertySearchTerm, setBookPropertySearchTerm] = useState('');
  const bookPropertyDropdownRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsRefreshKey, setBookingsRefreshKey] = useState(0); // Force refresh trigger
  
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Customer Management states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false);
  const [showDeleteCustomerConfirm, setShowDeleteCustomerConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    password: ''
  });
  const [showCustomerPassword, setShowCustomerPassword] = useState(false);
  const [showNewCustomerPassword, setShowNewCustomerPassword] = useState(false);
  
  // Action modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewPaymentsModal, setShowViewPaymentsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [paymentsRefreshKey, setPaymentsRefreshKey] = useState(0);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState(false);
  
  // Booking Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    propertyId: '',
    propertyName: '',
    propertyPrice: 0,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    checkIn: '',
    checkOut: '',
    numberOfPeople: '1'
  });
  const [bookingModalSource, setBookingModalSource] = useState<'property' | 'booking' | null>(null);
  const [propertySearchTerm, setPropertySearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [receiptType, setReceiptType] = useState<'booking' | 'payment'>('booking'); // Track receipt type
  const receiptRef = useRef<HTMLDivElement>(null);
  
  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    totalAmount: '',
    paidAmount: '',
    paymentMode: 'Cash',
    transactionId: ''
  });
  
  const [showCardPaymentAlert, setShowCardPaymentAlert] = useState(false);
  
  // Cancel reason
  const [cancelReason, setCancelReason] = useState('');
  
  // Edit Property states
  const [showEditPropertyModal, setShowEditPropertyModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    totalUsers: 0,
    monthlyRevenue: 0
  });
  
  // Connection status
  const [isOnline, setIsOnline] = useState(checkConnection());
  const [payments, setPayments] = useState<any[]>([]);
  
  // Property form state
  const [propertyForm, setPropertyForm] = useState({
    name: '',
    category: '',
    selectedFeatures: [] as string[],
    location: '',
    price: '',
    description: '',
    beds: '',
    baths: '',
    area: ''
  });
  
  // Photo upload state
  const [photos, setPhotos] = useState({
    livingRoom: [] as string[],
    bedroom: [] as string[],
    bathroom: [] as string[],
    dining: [] as string[],
    others: [] as string[]
  });
  const [activePhotoTab, setActivePhotoTab] = useState<'livingRoom' | 'bedroom' | 'bathroom' | 'dining' | 'others'>('livingRoom');

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState({ current: 0, total: 0 });
  const [showMigrationButton, setShowMigrationButton] = useState(false);

  // Modal States
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Show Modal Helper
  const showModal = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) => {
    setModalState({
      show: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      onCancel: () => setModalState({ ...modalState, show: false })
    });
  };

  const closeModal = () => {
    setModalState({ ...modalState, show: false });
  };

  const handleModalConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  // Print receipt function
  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${receiptType === 'payment' ? 'Payment' : 'Booking'} Receipt - Skyway Suites</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .bg-white { background-color: white; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .font-semibold { font-weight: 600; }
                .font-medium { font-weight: 500; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-6 { margin-bottom: 24px; }
                .mb-8 { margin-bottom: 32px; }
                .mt-1 { margin-top: 4px; }
                .mt-2 { margin-top: 8px; }
                .mt-4 { margin-top: 16px; }
                .mt-12 { margin-top: 48px; }
                .p-3 { padding: 12px; }
                .p-4 { padding: 16px; }
                .pb-2 { padding-bottom: 8px; }
                .pb-3 { padding-bottom: 12px; }
                .pb-6 { padding-bottom: 24px; }
                .pt-3 { padding-top: 12px; }
                .pt-6 { padding-top: 24px; }
                .pl-4 { padding-left: 16px; }
                .gap-3 { gap: 12px; }
                .gap-4 { gap: 16px; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .justify-center { justify-center: center; }
                .justify-between { justify-content: space-between; }
                .rounded-lg { border-radius: 8px; }
                .border-b-4 { border-bottom: 4px solid; }
                .border-b-2 { border-bottom: 2px solid; }
                .border-b { border-bottom: 1px solid; }
                .border-t-2 { border-top: 2px solid; }
                .border-gray-300 { border-color: #d1d5db; }
                .bg-gray-50 { background-color: #f9fafb; }
                .text-gray-500 { color: #6b7280; }
                .text-gray-600 { color: #4b5563; }
                .text-gray-700 { color: #374151; }
                .text-green-600 { color: #059669; }
                .text-orange-600 { color: #ea580c; }
                .text-sm { font-size: 14px; line-height: 20px; }
                .text-base { font-size: 16px; line-height: 24px; }
                .text-lg { font-size: 18px; line-height: 28px; }
                .text-xl { font-size: 20px; line-height: 28px; }
                .text-2xl { font-size: 24px; line-height: 32px; }
                .text-3xl { font-size: 30px; line-height: 36px; }
                .text-4xl { font-size: 36px; line-height: 40px; }
                @media print {
                  body { margin: 0; padding: 0; }
                  @page { size: A4; margin: 20mm; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    }
  };

  // Download receipt as PDF
  const handleDownloadPDF = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`Skyway-Receipt-${receiptData?.booking?.id || Date.now()}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
        showModal('error', 'PDF Generation Failed', 'Could not generate PDF. Please try printing instead.');
      }
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    
    // Redirect if not logged in or not admin
    if (!currentUser || !isAdmin(currentUser)) {
      navigate('/');
      return;
    }
    
    setUser(currentUser);

    // Listen for auth changes (cross-tab sync)
    const handleStorageChange = () => {
      const updatedUser = getCurrentUser();
      if (!updatedUser || !isAdmin(updatedUser)) {
        navigate('/');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Menu items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, active: true },
    { id: 'properties', label: 'Properties', icon: Home, active: true },
    { id: 'bookings', label: 'Bookings', icon: Calendar, active: true },
    { id: 'customers', label: 'Customers', icon: Users, active: true },
    { id: 'payments', label: 'Payments', icon: CreditCard, active: true },
    { id: 'menu-pages', label: 'Menu Pages', icon: FileText, active: true },
    { id: 'activity-log', label: 'Activity Log', icon: Activity, active: true },
    { id: 'settings', label: 'Settings', icon: Settings, active: true }
  ];

  // Check connection status
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOnline(checkConnection());
    };

    checkOnlineStatus();
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  // Load all data from Supabase or use demo data
  useEffect(() => {
    const loadAllData = async () => {
      // Check if we're using demo accounts (offline mode)
      const currentUser = getCurrentUser();
      const isDemoMode = currentUser?.email === 'admin@skyway.com' || currentUser?.email === 'user@skyway.com';
      
      if (isDemoMode) {
        console.log('⚠️ Demo mode detected - Using demo data instead of Supabase');
        // Set empty demo data for now
        setCategories(['Apartment', 'Villa', 'Townhouse', 'Studio', 'Penthouse']);
        setFeatures(['WiFi', 'Parking', 'Pool', 'Gym', 'Security', 'Generator']);
        setProperties([]);
        setBookings([]);
        setCustomers([]);
        setPayments([]);
        setActivityLogs([]);
        setIsLoading(false);
        return;
      }
      
      if (!isOnline) {
        console.log('⚠️ Offline - Cannot load data');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📡 Loading Admin Dashboard data from Supabase...');
        
        // Load categories
        const categoriesData = await fetchCategories();
        const categoryNames = categoriesData.map(c => c.category_name);
        setCategories(categoryNames);
        console.log('✅ Categories loaded:', categoryNames.length);
        
        // Load features
        const featuresData = await fetchFeatures();
        const featureNames = featuresData.map(f => f.feature_name);
        setFeatures(featureNames);
        console.log('✅ Features loaded:', featureNames.length);
        
        // Load properties
        const propertiesData = await fetchProperties();
        const mappedProperties = propertiesData.map(p => ({
          id: p.property_id,
          name: p.property_name,
          category: p.category_id,
          location: p.location,
          beds: p.no_of_beds,
          baths: p.bathrooms,
          area: p.area_sqft,
          price: p.price_per_month,
          photos: p.photos ? JSON.parse(p.photos) : {},
          features: p.features ? JSON.parse(p.features) : [],
          description: p.description || '',
          viewCount: p.view_count,
          isFeatured: p.is_featured,
          isAvailable: p.is_available
        }));
        setProperties(mappedProperties);
        console.log('✅ Properties loaded:', mappedProperties.length);
        
        // Load bookings
        const bookingsData = await fetchBookings();
        const mappedBookings = bookingsData.map(b => ({
          id: b.booking_id,
          propertyId: b.property_id,
          customerId: b.customer_id,
          checkIn: b.check_in_date,
          checkOut: b.check_out_date,
          status: b.booking_status,
          totalAmount: b.total_amount,
          amountPaid: b.amount_paid,
          paymentStatus: b.payment_status,
          paymentMode: b.payment_method,
          transactionId: b.payment_reference,
          notes: b.notes,
          payments: []
        }));
        setBookings(mappedBookings);
        console.log('✅ Bookings loaded:', mappedBookings.length);
        
        // Load customers
        const customersData = await fetchCustomers();
        const mappedCustomers = customersData.map(c => ({
          id: c.customer_id,
          name: c.customer_name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          password: c.password
        }));
        setCustomers(mappedCustomers);
        console.log('✅ Customers loaded:', mappedCustomers.length);
        
        // Load payments
        const paymentsData = await fetchPayments();
        const mappedPayments = paymentsData.map(p => ({
          id: p.payment_id,
          bookingId: p.booking_id,
          paidAmount: p.amount,
          paymentMode: p.payment_method,
          transactionId: p.payment_reference,
          date: p.payment_date
        }));
        setPayments(mappedPayments);
        console.log('✅ Payments loaded:', mappedPayments.length);
        
        // Load activity logs
        const logsData = await fetchActivityLogs(100);
        const mappedLogs = logsData.map(l => ({
          id: l.activity_id,
          userId: l.user_id,
          userName: l.user_name,
          userRole: l.user_role,
          activity: l.activity,
          timestamp: l.created_at
        }));
        setActivityLogs(mappedLogs);
        console.log('✅ Activity logs loaded:', mappedLogs.length);
        
        console.log('✅ All Admin Dashboard data loaded successfully!');
      } catch (error: any) {
        if (error.message === 'NO_CONNECTION') {
          console.error('⚠️ No connection - data loading aborted');
        } else {
          console.error('❌ Error loading Admin Dashboard data:', error);
          showModal('error', 'Data Load Error', 'Failed to load dashboard data. Please refresh the page.');
        }
      }
    };

    loadAllData();
  }, [isOnline]);

  // Real-time sync for bookings - reload whenever we switch to relevant menus
  useEffect(() => {
    if (!isOnline) return;
    
    if (activeMenu === 'overview' || activeMenu === 'properties' || activeMenu === 'bookings') {
      const loadBookings = async () => {
        try {
          const bookingsData = await fetchBookings();
          const mappedBookings = bookingsData.map(b => ({
            id: b.booking_id,
            propertyId: b.property_id,
            customerId: b.customer_id,
            checkIn: b.check_in_date,
            checkOut: b.check_out_date,
            status: b.booking_status,
            totalAmount: b.total_amount,
            amountPaid: b.amount_paid,
            paymentStatus: b.payment_status,
            paymentMode: b.payment_method,
            transactionId: b.payment_reference,
            notes: b.notes,
            payments: []
          }));
          setBookings(mappedBookings);
          setBookingsRefreshKey(prev => prev + 1);
        } catch (error) {
          console.error('Error reloading bookings:', error);
        }
      };

      // Load immediately when switching to these menus
      loadBookings();

      // Set up interval to check for updates every 5 seconds while on these menus
      const interval = setInterval(loadBookings, 5000);

      // Clean up interval when leaving or unmounting
      return () => clearInterval(interval);
    }
  }, [activeMenu, isOnline]);

  // Calculate stats whenever properties, bookings, or customers change
  useEffect(() => {
    // Calculate total properties
    const totalProperties = properties.length;
    
    // Calculate active bookings (Confirmed and Pending, not Cancelled)
    const activeBookings = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending').length;
    
    // Calculate total users (customers)
    const totalUsers = customers.length;
    
    // Calculate monthly revenue from all payments
    const monthlyRevenue = payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && 
               paymentDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    
    setStats({
      totalProperties,
      activeBookings,
      totalUsers,
      monthlyRevenue
    });
  }, [properties, bookings, customers, payments]);

  // Populate payment form when booking is selected
  useEffect(() => {
    if (selectedBooking && showPaymentModal) {
      // Get existing payments for this booking
      const bookingPayments = payments.filter((p: any) => p.bookingId === selectedBooking.id);
      
      // Calculate total paid amount
      const totalPaid = bookingPayments.reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);
      
      // Calculate remaining balance
      const remainingBalance = (selectedBooking.totalAmount || 0) - totalPaid;
      
      setPaymentForm(prev => ({
        ...prev,
        totalAmount: Math.max(0, remainingBalance).toString(), // Ensure non-negative
        paidAmount: Math.max(0, remainingBalance).toString() // Default paid amount to remaining balance
      }));
    }
  }, [selectedBooking, showPaymentModal, payments]);

  // Handle click outside for book property dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bookPropertyDropdownRef.current && !bookPropertyDropdownRef.current.contains(event.target as Node)) {
        setShowBookPropertyDropdown(false);
      }
    };
    
    if (showBookPropertyDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBookPropertyDropdown]);

  // Helper function to calculate booking payment status
  const getBookingPaymentStatus = (booking: any) => {
    const bookingPayments = payments.filter((p: any) => p.bookingId === booking.id);
    const totalPaid = bookingPayments.reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);
    const remaining = (booking.totalAmount || 0) - totalPaid;
    
    return {
      totalPaid,
      remaining: Math.max(0, remaining),
      status: totalPaid === 0 ? 'Not Paid' : 
              remaining > 0 ? 'Partial Payment' : 
              'Paid in Full'
    };
  };

  // Generate 6-character alphanumeric ID
  const generatePaymentId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Force reload bookings from Supabase
  const forceReloadBookings = async () => {
    if (!isOnline) return;
    
    try {
      const bookingsData = await fetchBookings();
      const mappedBookings = bookingsData.map(b => ({
        id: b.booking_id,
        propertyId: b.property_id,
        customerId: b.customer_id,
        checkIn: b.check_in_date,
        checkOut: b.check_out_date,
        status: b.booking_status,
        totalAmount: b.total_amount,
        amountPaid: b.amount_paid,
        paymentStatus: b.payment_status,
        paymentMode: b.payment_method,
        transactionId: b.payment_reference,
        notes: b.notes,
        payments: []
      }));
      setBookings(mappedBookings);
      setBookingsRefreshKey(prev => prev + 1); // Trigger re-render
    } catch (error) {
      console.error('Error reloading bookings:', error);
    }
  };

  // Helper function to check localStorage usage
  const getStorageUsage = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: (total / 1024).toFixed(2), // KB
      usedMB: (total / 1024 / 1024).toFixed(2), // MB
      percentage: ((total / (5 * 1024 * 1024)) * 100).toFixed(1) // Assuming 5MB quota
    };
  };

  // Handle Add Category
  const handleAddCategory = async () => {
    if (!isOnline) {
      showModal('error', 'No Connection', 'Cannot add category while offline.');
      return;
    }
    
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      try {
        await createCategory({
          category_name: newCategory.trim(),
          description: null,
          icon: null
        });
        
        const updatedCategories = [...categories, newCategory.trim()];
        setCategories(updatedCategories);
        setNewCategory('');
        setShowCategoryModal(false);
        showModal('success', 'Category Added', `Category "${newCategory.trim()}" has been added successfully.`);
      } catch (error) {
        console.error('Error adding category:', error);
        showModal('error', 'Error', 'Failed to add category. Please try again.');
      }
    }
  };

  // Handle Add Feature
  const handleAddFeature = async () => {
    if (!isOnline) {
      showModal('error', 'No Connection', 'Cannot add feature while offline.');
      return;
    }
    
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      try {
        await createFeature({
          feature_name: newFeature.trim(),
          description: null,
          icon: null
        });
        
        const updatedFeatures = [...features, newFeature.trim()];
        setFeatures(updatedFeatures);
        setNewFeature('');
        setShowFeatureModal(false);
        showModal('success', 'Feature Added', `Feature "${newFeature.trim()}" has been added successfully.`);
      } catch (error) {
        console.error('Error adding feature:', error);
        showModal('error', 'Error', 'Failed to add feature. Please try again.');
      }
    }
  };

  // Helper function to compress image to WebP with max 50KB size
  const compressImage = (file: File, maxSizeKB: number = 50): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Start with reasonable dimensions
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          // Scale down if too large
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          // Function to compress with given quality and dimensions
          const tryCompress = (currentWidth: number, currentHeight: number, quality: number): string | null => {
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
            
            // Convert to WebP
            const webpData = canvas.toDataURL('image/webp', quality);
            
            // Calculate size in KB (base64 string length / 1.37 ≈ original bytes, then / 1024 for KB)
            const sizeKB = (webpData.length * 0.75) / 1024;
            
            if (sizeKB <= maxSizeKB) {
              return webpData;
            }
            return null;
          };

          // Try different quality levels and dimensions to get under 50KB
          const qualityLevels = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
          
          for (const quality of qualityLevels) {
            const result = tryCompress(width, height, quality);
            if (result) {
              resolve(result);
              return;
            }
          }

          // If still too large, reduce dimensions and try again
          let scaleFactor = 0.9;
          while (scaleFactor > 0.3) {
            const scaledWidth = Math.floor(width * scaleFactor);
            const scaledHeight = Math.floor(height * scaleFactor);
            
            for (const quality of [0.8, 0.6, 0.4, 0.3]) {
              const result = tryCompress(scaledWidth, scaledHeight, quality);
              if (result) {
                resolve(result);
                return;
              }
            }
            
            scaleFactor -= 0.1;
          }

          // Last resort: very small size with low quality
          const finalResult = tryCompress(Math.floor(width * 0.3), Math.floor(height * 0.3), 0.2);
          if (finalResult) {
            resolve(finalResult);
          } else {
            reject(new Error('Could not compress image below 50KB'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Compress base64 image to WebP with max 50KB
  const compressBase64Image = (base64String: string, maxSizeKB: number = 50): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Start with reasonable dimensions
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200;

        // Scale down if too large
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        
        // Function to compress with given quality and dimensions
        const tryCompress = (currentWidth: number, currentHeight: number, quality: number): string | null => {
          canvas.width = currentWidth;
          canvas.height = currentHeight;
          ctx.drawImage(img, 0, 0, currentWidth, currentHeight);
          
          // Convert to WebP
          const webpData = canvas.toDataURL('image/webp', quality);
          
          // Calculate size in KB
          const sizeKB = (webpData.length * 0.75) / 1024;
          
          if (sizeKB <= maxSizeKB) {
            return webpData;
          }
          return null;
        };

        // Try different quality levels and dimensions to get under 50KB
        const qualityLevels = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2];
        
        for (const quality of qualityLevels) {
          const result = tryCompress(width, height, quality);
          if (result) {
            resolve(result);
            return;
          }
        }

        // If still too large, reduce dimensions and try again
        let scaleFactor = 0.9;
        while (scaleFactor > 0.3) {
          const scaledWidth = Math.floor(width * scaleFactor);
          const scaledHeight = Math.floor(height * scaleFactor);
          
          for (const quality of [0.8, 0.6, 0.4, 0.3]) {
            const result = tryCompress(scaledWidth, scaledHeight, quality);
            if (result) {
              resolve(result);
              return;
            }
          }
          
          scaleFactor -= 0.1;
        }

        // Last resort: very small size with low quality
        const finalResult = tryCompress(Math.floor(width * 0.3), Math.floor(height * 0.3), 0.2);
        if (finalResult) {
          resolve(finalResult);
        } else {
          reject(new Error('Could not compress image below 50KB'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64String;
    });
  };

  // Migrate all existing images to WebP with 50KB max
  const migrateExistingImages = async () => {
    if (isMigrating) return;
    
    setIsMigrating(true);
    const savedProperties = localStorage.getItem('skyway_properties');
    if (!savedProperties) {
      setIsMigrating(false);
      showModal('error', 'Migration Error', 'No properties found to migrate.');
      return;
    }

    try {
      const allProperties = JSON.parse(savedProperties);
      const totalProperties = allProperties.length;
      let processedProperties = 0;
      let totalImagesProcessed = 0;
      let totalImagesSaved = 0;

      console.log(`🔄 Starting migration of ${totalProperties} properties...`);

      const migratedProperties = [];

      for (const property of allProperties) {
        processedProperties++;
        setMigrationProgress({ current: processedProperties, total: totalProperties });

        if (!property.photos) {
          migratedProperties.push(property);
          continue;
        }

        const migratedPhotos: any = {
          livingRoom: [],
          bedroom: [],
          bathroom: [],
          dining: [],
          others: []
        };

        let propertyImagesProcessed = 0;

        for (const [roomType, photoArray] of Object.entries(property.photos)) {
          const roomPhotos: string[] = [];
          
          for (const photo of photoArray as string[]) {
            totalImagesProcessed++;
            propertyImagesProcessed++;

            try {
              // Check if already optimized
              const sizeKB = (photo.length * 0.75) / 1024;
              const isWebP = photo.startsWith('data:image/webp');

              if (isWebP && sizeKB <= 55) {
                // Already optimized, keep as is
                roomPhotos.push(photo);
                console.log(`✓ Image ${propertyImagesProcessed} already optimized (${sizeKB.toFixed(1)}KB)`);
              } else {
                // Needs compression
                const compressedImage = await compressBase64Image(photo, 50);
                const newSizeKB = (compressedImage.length * 0.75) / 1024;
                const savedKB = sizeKB - newSizeKB;
                totalImagesSaved += savedKB;
                roomPhotos.push(compressedImage);
                console.log(`✓ Compressed image ${propertyImagesProcessed}: ${sizeKB.toFixed(1)}KB → ${newSizeKB.toFixed(1)}KB (saved ${savedKB.toFixed(1)}KB)`);
              }
            } catch (error) {
              console.error(`Failed to process image ${propertyImagesProcessed}:`, error);
              // Keep original if compression fails
              roomPhotos.push(photo);
            }
          }

          migratedPhotos[roomType] = roomPhotos;
        }

        migratedProperties.push({
          ...property,
          photos: migratedPhotos
        });

        console.log(`✓ Completed property ${processedProperties}/${totalProperties}: ${property.name}`);
      }

      // Save migrated properties
      try {
        localStorage.setItem('skyway_properties', JSON.stringify(migratedProperties));
        setProperties(migratedProperties);
        setShowMigrationButton(false);
        
        const summary = `✅ Migration Complete!\n\n` +
          `Properties processed: ${totalProperties}\n` +
          `Images processed: ${totalImagesProcessed}\n` +
          `Storage saved: ~${totalImagesSaved.toFixed(0)}KB\n\n` +
          `All images are now WebP format (max 50KB each)`;
        
        console.log(summary);
        showModal('success', 'Migration Complete', summary);
      } catch (storageError: any) {
        if (storageError.name === 'QuotaExceededError') {
          showModal('error', 'Storage Error', 'Storage quota exceeded during migration. The migration was partially successful but ran out of space.');
        } else {
          throw storageError;
        }
      }
    } catch (error) {
      console.error('Migration failed:', error);
      showModal('error', 'Migration Failed', 'Migration failed. Please check console for details.');
    } finally {
      setIsMigrating(false);
      setMigrationProgress({ current: 0, total: 0 });
    }
  };

  // Handle file upload with compression
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    
    // Limit total photos per property to 30
    const currentPhotoCount = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0);
    if (currentPhotoCount + filesArray.length > 30) {
      showModal('error', 'Photo Limit Reached', 'Maximum 30 photos allowed per property. Please remove some photos before adding more.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    try {
      for (const file of filesArray) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
          console.warn(`File ${file.name} is too large. Skipping...`);
          failCount++;
          continue;
        }

        try {
          // Compress to WebP with max 50KB
          const compressedImage = await compressImage(file, 50);
          
          // Calculate compressed size
          const compressedSizeKB = ((compressedImage.length * 0.75) / 1024).toFixed(1);
          console.log(`✓ Compressed ${file.name} to ${compressedSizeKB}KB as WebP`);
          
          setPhotos(prev => ({
            ...prev,
            [activePhotoTab]: [...prev[activePhotoTab], compressedImage]
          }));
          
          successCount++;
        } catch (compressError) {
          console.error(`Failed to compress ${file.name}:`, compressError);
          failCount++;
        }
      }

      // Show summary
      if (successCount > 0 && failCount === 0) {
        // Success - no need for alert, just log
        console.log(`Successfully compressed ${successCount} image(s) to WebP format (max 50KB each)`);
      } else if (successCount > 0 && failCount > 0) {
        showModal('info', 'Partial Success', `Processed ${successCount} image(s) successfully. ${failCount} image(s) failed to compress.`);
      } else if (failCount > 0) {
        showModal('error', 'Processing Failed', `Failed to process ${failCount} image(s). They may be corrupted or too large.`);
      }
    } catch (error) {
      console.error('Error processing images:', error);
      showModal('error', 'Processing Error', 'Failed to process images. Please try again.');
    }
    
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
  };

  // Handle remove photo
  const handleRemovePhoto = (roomType: string, index: number) => {
    setPhotos(prev => ({
      ...prev,
      [roomType]: prev[roomType as keyof typeof prev].filter((_, i) => i !== index)
    }));
  };

  // Handle feature toggle
  const toggleFeature = (feature: string) => {
    setPropertyForm(prev => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter(f => f !== feature)
        : [...prev.selectedFeatures, feature]
    }));
  };

  // Handle Add Property Submit
  const handleAddPropertySubmit = async () => {
    // Validate form
    if (!propertyForm.name || !propertyForm.category || !propertyForm.location || !propertyForm.price) {
      showModal('error', 'Missing Fields', 'Please fill in all required fields');
      return;
    }

    // Check connection
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot create property. Please check your internet connection.');
      return;
    }

    try {
      // Create new property via Supabase
      const newProperty = await adminHelpers.addProperty(propertyForm, photos);
      
      // Update state to show new property immediately
      setProperties([...properties, newProperty]);
      
      // Log activity
      const currentUser = getCurrentUser();
      if (currentUser && parseInt(currentUser.id)) {
        try {
          await adminHelpers.logActivity(
            parseInt(currentUser.id),
            currentUser.name,
            currentUser.role,
            `Created property: ${propertyForm.name}`,
            'create',
            'property',
            newProperty.id
          );
        } catch (logError) {
          console.error('Failed to log activity:', logError);
        }
      }

      // Reset form
      setPropertyForm({
        name: '',
        category: '',
        selectedFeatures: [],
        location: '',
        price: '',
        description: '',
        beds: '',
        baths: '',
        area: ''
      });
      setPhotos({
        livingRoom: [],
        bedroom: [],
        bathroom: [],
        dining: [],
        others: []
      });
      setShowPropertyModal(false);
      
      // Show success message
      showModal('success', 'Property Added', 'Property added successfully!');
    } catch (error) {
      console.error('Error adding property:', error);
      showModal('error', 'Error', 'Failed to add property. Please try again.');
    }
  };

  // Handle Edit Property Submit
  const handleEditPropertySubmit = async () => {
    // Validate form
    if (!propertyForm.name || !propertyForm.category || !propertyForm.location || !propertyForm.price) {
      showModal('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    // Check connection
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot update property. Please check your internet connection.');
      return;
    }

    try {
      // Update property via Supabase
      const updatedProperty = await adminHelpers.modifyProperty(editingProperty.id, propertyForm, photos);
      
      // Update state
      const updatedProperties = properties.map(prop => 
        prop.id === editingProperty.id ? updatedProperty : prop
      );
      setProperties(updatedProperties);
      
      // Log activity
      const currentUser = getCurrentUser();
      if (currentUser && parseInt(currentUser.id)) {
        try {
          await adminHelpers.logActivity(
            parseInt(currentUser.id),
            currentUser.name,
            currentUser.role,
            `Updated property: ${propertyForm.name}`,
            'update',
            'property',
            editingProperty.id
          );
        } catch (logError) {
          console.error('Failed to log activity:', logError);
        }
      }
      
      // Reset form
      setEditingProperty(null);
      
      // Show success message
      showModal('success', 'Success', 'Property updated successfully!');
    } catch (error) {
      console.error('Error updating property:', error);
      showModal('error', 'Update Failed', 'Failed to update property. Please try again.');
    }
  };

  // Handle Add Customer
  const handleAddCustomer = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot create customer. Please check your internet connection.');
      return;
    }
    
    if (customerForm.name.trim()) {
      try {
        const createdCustomer = await adminHelpers.addCustomer(customerForm);
        const updatedCustomers = [...customers, createdCustomer];
        setCustomers(updatedCustomers);
      
      // Reset form
      setCustomerForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        password: ''
      });
        setShowCustomerPassword(false);
        setShowCustomerModal(false);
        showModal('success', 'Success', 'Customer added successfully!');
      } catch (error) {
        console.error('Error adding customer:', error);
        showModal('error', 'Error', 'Failed to add customer. Please try again.');
      }
    }
  };

  // Handle Delete Customer
  const handleDeleteCustomer = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot delete customer. Please check your internet connection.');
      return;
    }
    
    if (selectedCustomer) {
      try {
        await adminHelpers.removeCustomer(selectedCustomer.id);
        const updatedCustomers = customers.filter(c => c.id !== selectedCustomer.id);
        setCustomers(updatedCustomers);
        setShowDeleteCustomerConfirm(false);
        setSelectedCustomer(null);
        showModal('success', 'Success', 'Customer deleted successfully!');
      } catch (error) {
        console.error('Error deleting customer:', error);
        showModal('error', 'Error', 'Failed to delete customer. Please try again.');
      }
    }
  };

  // Handle Add Booking
  const handleAddBooking = async () => {
    /**
     * ADD BOOKING FLOW - Complete Documentation
     * =========================================
     * When admin clicks "Book Now", this function:
     * 
     * 1. VALIDATION:
     *    - Validates all required fields (property, customer, dates)
     *    - Checks date logic (checkout must be after checkin)
     *    - Prevents double booking by checking for conflicts
     * 
     * 2. BOOKING CREATION:
     *    - Creates new booking with auto-confirmed status
     *    - Links to PROPERTY via propertyId
     *    - Links to CUSTOMER via customerId
     *    - Calculates days and total amount
     * 
     * 3. DATA PERSISTENCE:
     *    - Saves to bookings array in localStorage
     *    - Updates React state
     *    - Increments bookingsRefreshKey to trigger re-renders
     * 
     * 4. AUTOMATIC UPDATES:
     *    - Properties List (Admin Dashboard) - recalculates availability status
     *    - Property Details Modal - updates booking count and status
     *    - Home Page - will show updated status on next visit
     *    - Customer's My Bookings - booking appears automatically
     * 
     * 5. AVAILABILITY STATUS:
     *    - Property automatically shows "Booked, Available from [checkout date]"
     *    - Uses same logic as other locations (Home, Property Details)
     *    - Status is red badge, appears immediately after booking
     */
    
    // Validate form
    if (!bookingForm.propertyId || !bookingForm.customerId || !bookingForm.checkIn || !bookingForm.checkOut) {
      showModal('error', 'Incomplete Information', 'Please fill all required fields!');
      return;
    }

    // Validate dates
    if (bookingForm.checkIn >= bookingForm.checkOut) {
      showModal('error', 'Invalid Dates', 'Check-out date must be after check-in date!');
      return;
    }

    // Check for double booking
    const requestedCheckIn = new Date(bookingForm.checkIn);
    const requestedCheckOut = new Date(bookingForm.checkOut);

    const conflictingBooking = bookings.find((b: any) => {
      if (String(b.propertyId) !== String(bookingForm.propertyId)) return false;
      if (b.status !== 'Confirmed' && b.status !== 'Pending Payment' && b.status !== 'Pending Approval') return false;

      const existingCheckIn = new Date(b.checkIn);
      const existingCheckOut = new Date(b.checkOut);

      return (
        (requestedCheckIn >= existingCheckIn && requestedCheckIn < existingCheckOut) ||
        (requestedCheckOut > existingCheckIn && requestedCheckOut <= existingCheckOut) ||
        (requestedCheckIn <= existingCheckIn && requestedCheckOut >= existingCheckOut)
      );
    });

    if (conflictingBooking) {
      showModal('error', 'Property Already Booked', `This property is already booked during the selected dates.\nThe property will be available after ${new Date(conflictingBooking.checkOut).toLocaleDateString()}.`);
      return;
    }

    // Calculate days and total amount
    const checkIn = new Date(bookingForm.checkIn);
    const checkOut = new Date(bookingForm.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalAmount = days * bookingForm.propertyPrice;

    // Create new booking
    // When admin creates a booking for a customer, the booking is:
    // 1. Auto-confirmed (status: 'Confirmed')
    // 2. Linked to the customer via customerId (so the customer's account is properly associated)
    // 3. Includes all customer details for record-keeping
    const newBooking = {
      id: Date.now(),
      propertyId: bookingForm.propertyId,
      propertyName: bookingForm.propertyName,
      customerId: bookingForm.customerId, // Links this booking to the selected customer's account
      customerName: bookingForm.customerName,
      customerEmail: bookingForm.customerEmail,
      customerPhone: bookingForm.customerPhone,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      numberOfPeople: parseInt(bookingForm.numberOfPeople) || 1,
      days: days,
      totalAmount: totalAmount,
      status: 'Confirmed', // Admin bookings are auto-confirmed (unlike customer bookings which are 'Pending Approval')
      payments: [],
      createdAt: new Date().toISOString()
    };

    // Check connection
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot create booking. Please check your internet connection.');
      return;
    }

    // Save to Supabase
    try {
      const bookingData = {
        customerId: parseInt(newBooking.customerId),
        propertyId: parseInt(newBooking.propertyId),
        checkIn: newBooking.checkIn,
        checkOut: newBooking.checkOut,
        totalAmount: newBooking.totalAmount,
        amountPaid: 0,
        paymentStatus: 'Not Paid',
        status: newBooking.status,
        paymentMode: '',
        transactionId: '',
        notes: ''
      };
      const createdBooking = await adminHelpers.addBooking(bookingData);
      const updatedBookings = [...bookings, { ...newBooking, id: createdBooking.id }];
      setBookings(updatedBookings);
      setBookingsRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error creating booking:', error);
      showModal('error', 'Error', 'Failed to create booking. Please try again.');
      return;
    }

    // Log successful booking creation with all linked data
    console.log('✅ Booking Added Successfully:');
    console.log('- Booking ID:', newBooking.id);
    console.log('- Property ID:', newBooking.propertyId, '| Property Name:', newBooking.propertyName);
    console.log('- Customer ID:', newBooking.customerId, '| Customer Name:', newBooking.customerName);
    console.log('- Status:', newBooking.status);
    console.log('- Check-in:', newBooking.checkIn, '| Check-out:', newBooking.checkOut);
    console.log('- Total Amount: KSh', totalAmount.toLocaleString());
    console.log('- Booking is now linked to customer account and property');
    console.log('- Property availability status will update automatically');

    // Reset form and close modal
    setBookingForm({
      propertyId: '',
      propertyName: '',
      propertyPrice: 0,
      customerId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      checkIn: '',
      checkOut: '',
      numberOfPeople: '1'
    });
    setShowBookingModal(false);
    setBookingModalSource(null);
    setSelectedProperty(null);
    setPropertySearchTerm('');
    setCustomerSearchTerm('');
    setShowPropertyDropdown(false);
    setShowCustomerDropdown(false);

    showModal('success', 'Booking Created', `Booking created successfully!\n\nProperty: ${bookingForm.propertyName}\nCustomer: ${bookingForm.customerName}\nDays: ${days}\nTotal Amount: KSh ${totalAmount.toLocaleString()}`);
  };

  // Calculate booking amount
  const calculateBookingAmount = () => {
    if (bookingForm.checkIn && bookingForm.checkOut && bookingForm.propertyPrice) {
      const checkIn = new Date(bookingForm.checkIn);
      const checkOut = new Date(bookingForm.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        return days * bookingForm.propertyPrice;
      }
    }
    return 0;
  };

  const calculatedAmount = calculateBookingAmount();
  const calculatedDays = bookingForm.checkIn && bookingForm.checkOut ? 
    Math.ceil((new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <>
      <ConnectionStatusBanner />
      <div className="min-h-screen bg-[#f0f0f0] flex">
        {/* Sidebar */}
        <aside className={`bg-[#36454F] border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-600">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full flex items-center justify-between text-white hover:text-[#6B7F39] transition"
            >
              {sidebarOpen ? (
                <>
                  <span className="font-semibold">Menu</span>
                  <X className="w-5 h-5" />
                </>
              ) : (
                <Menu className="w-5 h-5 mx-auto" />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              const isClickable = item.active;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isClickable) {
                      if (item.id === 'settings') {
                        navigate('/admin/settings');
                      } else if (item.id === 'activity-log') {
                        navigate('/admin/activity-log');
                      } else {
                        setActiveMenu(item.id);
                      }
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                    isActive
                      ? 'bg-[#6B7F39] text-white'
                      : isClickable
                      ? 'text-white hover:bg-[#2a3440]'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${sidebarOpen ? '' : 'mx-auto'}`} />
                  {sidebarOpen && (
                    <div className="flex items-center justify-between flex-1">
                      <span className="font-medium">{item.label}</span>
                      {!item.active && (
                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                          Soon
                        </span>
                      )}
                      {item.id === 'settings' && showMigrationButton && (
                        <span className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-1 rounded-full animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          Action
                        </span>
                      )}
                    </div>
                  )}
                  {/* Notification dot when sidebar is collapsed */}
                  {!sidebarOpen && item.id === 'settings' && showMigrationButton && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Version Info at Bottom */}
          <div className="p-4 border-t border-gray-600">
            {sidebarOpen ? (
              <div className="bg-gradient-to-br from-[#2a3640] to-[#1f2a33] rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Info className="w-3 h-3 text-white/70" />
                  <p className="text-xs text-white/70 font-medium">Version</p>
                </div>
                <p className="text-xl font-bold text-white">{APP_VERSION}</p>
                <p className="text-xs text-white/50 mt-1">Skyway Suites</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-white/70 font-bold">{APP_VERSION}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#36454F] text-white shadow-lg">
          <div className="px-3 md:px-6 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 md:gap-3 cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="bg-[#6B7F39] rounded-lg p-1.5 md:p-2">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold">Skyway Suites</h1>
                  <p className="text-xs text-gray-300 hidden sm:block">Admin Dashboard</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-300">{user?.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-white text-black bg-white hover:bg-gray-100 text-xs md:text-sm h-8 md:h-10"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="px-3 md:px-6">
            <div className="flex gap-3 md:gap-6">
              <button
                onClick={() => navigate('/')}
                className="px-2 md:px-4 py-3 md:py-4 text-sm md:text-base text-gray-600 hover:text-[#6B7F39] hover:border-b-2 hover:border-[#6B7F39] transition"
              >
                Home
              </button>
              <button className="px-2 md:px-4 py-3 md:py-4 text-sm md:text-base text-[#6B7F39] border-b-2 border-[#6B7F39] font-medium">
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 md:px-6 py-4 md:py-8">
            {/* Welcome Section */}
            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold text-[#36454F] mb-2">
                {activeMenu === 'overview' && `Welcome back, ${user?.name}!`}
                {activeMenu === 'properties' && 'Property Management'}
                {activeMenu === 'bookings' && 'Booking Management'}
              </h2>
              <p className="text-sm md:text-base text-gray-600">
                {activeMenu === 'overview' && "Here's what's happening with your properties today."}
                {activeMenu === 'properties' && "Manage your property listings and categories."}
                {activeMenu === 'bookings' && "Track and manage all your bookings."}
              </p>
            </div>

            {/* Overview Content */}
            {activeMenu === 'overview' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
                  {[
                    { title: 'Total Properties', value: stats.totalProperties.toString(), icon: Home, color: 'bg-blue-500' },
                    { title: 'Active Bookings', value: stats.activeBookings.toString(), icon: Calendar, color: 'bg-green-500' },
                    { title: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'bg-purple-500' },
                    { title: 'Monthly Revenue', value: `KSh ${stats.monthlyRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-500' }
                  ].map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-gray-600 mb-1">{stat.title}</p>
                            <p className="text-xl md:text-3xl font-bold text-[#36454F]">{stat.value}</p>
                          </div>
                          <div className={`${stat.color} p-2 md:p-3 rounded-lg mt-2 md:mt-0 w-fit`}>
                            <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">Recent Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {bookings.length > 0 ? (
                        bookings
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                          .slice(0, 5)
                          .map((booking) => {
                            const paymentStatus = getBookingPaymentStatus(booking);
                            
                            return (
                            <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#FAF4EC] rounded-lg hover:bg-[#f5ede0] transition gap-3 sm:gap-0">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                  <h4 className="font-semibold text-[#36454F] text-sm">{booking.propertyName}</h4>
                                  <span className={`px-2 py-0.5 rounded text-xs ${
                                    booking.status === 'Pending Approval' ? 'bg-purple-100 text-purple-700' :
                                    paymentStatus.status === 'Paid in Full' ? 'bg-green-100 text-green-700' : 
                                    paymentStatus.status === 'Partial Payment' ? 'bg-purple-100 text-purple-700' : 
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {booking.status === 'Pending Approval' ? 'Pending Approval' : paymentStatus.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs text-gray-600">
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1" />
                                    {booking.customerName}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {booking.checkIn} - {booking.checkOut}
                                  </div>
                                  <span className="text-[#6B7F39] font-medium">Total: KSh {booking.totalAmount.toLocaleString()}</span>
                                  {booking.status !== 'Pending Approval' && (
                                    <span className={`font-medium ${paymentStatus.remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                      Remaining: KSh {paymentStatus.remaining.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:ml-4">
                                {/* Reprint Receipt */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setReceiptData({ booking });
                                    setReceiptType('booking');
                                    setShowReceiptModal(true);
                                  }}
                                  className="hover:bg-white h-8 w-8 p-0"
                                  title="View Booking Receipt"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                                
                                {/* View Details */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowViewPaymentsModal(true);
                                  }}
                                  className="hover:bg-white h-8 w-8 p-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            );
                          })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No bookings yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Featured Properties */}
                <Card className="mt-6 md:mt-8">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">Featured Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {properties.length > 0 ? (
                        properties
                          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                          .slice(0, 6)
                          .map((property) => (
                            <div key={property.id} className="bg-[#FAF4EC] rounded-lg overflow-hidden">
                              {/* Property Image */}
                              <div className="relative h-40 bg-gray-200">
                                {property.photos && Object.values(property.photos).flat().length > 0 ? (
                                  <img 
                                    src={Object.values(property.photos).flat()[0]} 
                                    alt={property.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                    <Home className="w-12 h-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Property Details */}
                              <div className="p-4">
                                <h3 className="font-semibold text-[#36454F] text-sm md:text-base mb-1 line-clamp-1">{property.name}</h3>
                                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {property.location}
                                </p>
                                <div className="flex items-center justify-between">
                                  <p className="text-xs md:text-sm font-bold bg-[#D4C5B0] text-[#36454F] px-2 py-1 rounded-lg border border-[#B8A586]">
                                    KSh {property.price.toLocaleString()}/day
                                  </p>
                                  <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                                    {property.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="col-span-full text-center py-12 text-gray-500">
                          <Home className="w-16 h-16 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No properties yet</p>
                          <Button 
                            onClick={() => setActiveMenu('properties')}
                            className="mt-4 bg-[#6B7F39] hover:bg-[#5a6930] text-white text-sm"
                          >
                            Add Your First Property
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Properties Content */}
            {activeMenu === 'properties' && (
              <>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-6 md:mb-8">
                  <Button 
                    onClick={() => setShowPropertyModal(true)}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-[#6B7F39] hover:bg-[#5a6930] text-white text-xs md:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Property</span>
                  </Button>
                  <Button 
                    onClick={() => setShowCategoryModal(true)}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm"
                  >
                    <Tag className="w-4 h-4" />
                    <span>Add Category</span>
                  </Button>
                  <Button 
                    onClick={() => setShowFeatureModal(true)}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                  >
                    <Star className="w-4 h-4" />
                    <span>Add Feature</span>
                  </Button>
                </div>

                {/* List of Properties */}
                <Card key={`properties-${bookingsRefreshKey}`}>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">List of Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {properties.map((property) => {
                        // Check if property is currently booked
                        const today = new Date();
                        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                        
                        const activePropertyBookings = bookings.filter(
                          b => {
                            if (String(b.propertyId) !== String(property.id)) return false;
                            if (b.status !== 'Confirmed' && b.status !== 'Pending Payment') return false;
                            
                            // Check if the booking's checkout date is in the future
                            const checkoutDate = new Date(b.checkOut);
                            checkoutDate.setHours(0, 0, 0, 0);
                            if (checkoutDate < today) return false;
                            
                            return true; // Consider as booked if it has any booking
                          }
                        );
                        
                        const isBooked = activePropertyBookings.length > 0;
                        
                        // Find the latest checkout date
                        let propertyStatusText = 'Available for booking';
                        let availableFrom = null;
                        if (isBooked) {
                          const latestCheckout = activePropertyBookings.reduce((latest, booking) => {
                            const checkoutDate = new Date(booking.checkOut);
                            return checkoutDate > latest ? checkoutDate : latest;
                          }, new Date(activePropertyBookings[0].checkOut));
                          
                          availableFrom = latestCheckout.toLocaleDateString();
                          propertyStatusText = `Booked, Available from ${availableFrom}`;
                        }
                        
                        return (
                        <div key={`${property.id}-${bookingsRefreshKey}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#FAF4EC] rounded-lg hover:bg-[#f5ede0] transition gap-3 sm:gap-0">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                              <h4 className="font-semibold text-[#36454F] text-sm">{property.name}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
                                isBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {propertyStatusText}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {property.location}
                              </div>
                              <span className="text-xs font-semibold bg-[#D4C5B0] text-[#36454F] px-2 py-1 rounded-lg border border-[#B8A586]">KSh {property.price.toLocaleString()}/day</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowViewPropertyModal(true);
                              }}
                              className="hover:bg-white h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingProperty(property);
                                setPropertyForm({
                                  name: property.name,
                                  category: property.category || '',
                                  selectedFeatures: property.features || [],
                                  location: property.location,
                                  price: property.price.toString(),
                                  description: property.description || '',
                                  beds: property.beds?.toString() || '',
                                  baths: property.baths?.toString() || '',
                                  area: property.area?.toString() || ''
                                });
                                setPhotos(property.photos || {
                                  livingRoom: [],
                                  bedroom: [],
                                  bathroom: [],
                                  dining: [],
                                  others: []
                                });
                                setShowEditPropertyModal(true);
                              }}
                              className="hover:bg-white h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowDeleteConfirm(true);
                              }}
                              className="hover:bg-white text-red-600 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Bookings Content */}
            {activeMenu === 'bookings' && (
              <>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-6 md:mb-8">
                  {/* Book Property with Search Dropdown */}
                  <div className="relative" ref={bookPropertyDropdownRef}>
                    <Button
                      onClick={() => {
                        setShowBookPropertyDropdown(!showBookPropertyDropdown);
                        setBookPropertySearchTerm('');
                      }}
                      className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-[#6B7F39] hover:bg-[#5a6930] text-black text-xs md:text-sm font-semibold"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Property</span>
                    </Button>
                    
                    {showBookPropertyDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border-2 border-[#6B7F39] z-50 max-h-80 overflow-hidden flex flex-col">
                        {/* Search Input */}
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search properties..."
                              value={bookPropertySearchTerm}
                              onChange={(e) => setBookPropertySearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6B7F39] focus:border-transparent text-sm"
                              autoFocus
                            />
                          </div>
                        </div>
                        
                        {/* Properties List */}
                        <div className="overflow-y-auto flex-1">
                          {properties.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No properties available
                            </div>
                          ) : (
                            (() => {
                              const filteredProperties = properties.filter(p =>
                                p.name.toLowerCase().includes(bookPropertySearchTerm.toLowerCase()) ||
                                p.location.toLowerCase().includes(bookPropertySearchTerm.toLowerCase())
                              );
                              
                              return filteredProperties.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                  No properties found
                                </div>
                              ) : (
                                <div className="py-2">
                                  {filteredProperties.map((property) => (
                                    <button
                                      key={property.id}
                                      onClick={() => {
                                        // Pre-fill booking form with selected property
                                        setBookingForm({
                                          propertyId: property.id.toString(),
                                          propertyName: property.name,
                                          propertyPrice: property.price,
                                          customerId: '',
                                          customerName: '',
                                          customerEmail: '',
                                          customerPhone: '',
                                          checkIn: '',
                                          checkOut: '',
                                          numberOfPeople: '1'
                                        });
                                        setBookingModalSource('property');
                                        setShowBookingModal(true);
                                        setShowBookPropertyDropdown(false);
                                        setBookPropertySearchTerm('');
                                      }}
                                      className="w-full px-4 py-3 text-left hover:bg-[#FAF4EC] transition-colors border-b border-gray-100 last:border-b-0"
                                    >
                                      <div className="font-semibold text-[#36454F] text-sm">{property.name}</div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                        <span className="flex items-center">
                                          <MapPin className="w-3 h-3 mr-1" />
                                          {property.location}
                                        </span>
                                        <span className="text-[#6B7F39] font-medium">
                                          KSh {property.price.toLocaleString()}/day
                                        </span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              );
                            })()
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => setActiveMenu('customers')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Customers</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu('payments')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payments</span>
                  </Button>
                </div>

                {/* List of Bookings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">List of Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">No bookings yet. Go to Properties to book a property.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {bookings.map((booking) => {
                          const paymentStatus = getBookingPaymentStatus(booking);
                          
                          return (
                          <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#FAF4EC] rounded-lg hover:bg-[#f5ede0] transition gap-3 sm:gap-0">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                <h4 className="font-semibold text-[#36454F] text-sm">{booking.propertyName}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  booking.status === 'Pending Approval' ? 'bg-purple-100 text-purple-700' :
                                  paymentStatus.status === 'Paid in Full' ? 'bg-green-100 text-green-700' : 
                                  paymentStatus.status === 'Partial Payment' ? 'bg-purple-100 text-purple-700' : 
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {booking.status === 'Pending Approval' ? 'Pending Approval' : paymentStatus.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-1 text-xs text-gray-600">
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  {booking.customerName}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {booking.checkIn} - {booking.checkOut}
                                </div>
                                <span className="text-[#6B7F39] font-medium">Total: KSh {booking.totalAmount.toLocaleString()}</span>
                                {booking.status !== 'Pending Approval' && (
                                  <span className={`font-medium ${paymentStatus.remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    Remaining: KSh {paymentStatus.remaining.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:ml-4">
                              {/* Approve/Disapprove buttons for Pending Approval status */}
                              {booking.status === 'Pending Approval' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      if (!checkConnection()) {
                                        showModal('error', 'No Connection', 'Cannot approve booking. Please check your internet connection.');
                                        return;
                                      }
                                      
                                      try {
                                        // Approve booking
                                        await adminHelpers.modifyBooking(booking.id, { booking_status: 'Confirmed' });
                                        const updatedBookings = bookings.map((b) =>
                                          b.id === booking.id
                                            ? { ...b, status: 'Confirmed' }
                                            : b
                                        );
                                        setBookings(updatedBookings);
                                      } catch (error) {
                                        console.error('Error approving booking:', error);
                                        showModal('error', 'Error', 'Failed to approve booking. Please try again.');
                                        return;
                                      }
                                      
                                      // SMS Notification Logic
                                      const smsSettings = JSON.parse(localStorage.getItem('skyway_sms_settings') || '{}');
                                      const generalSettings = JSON.parse(localStorage.getItem('skyway_general_settings') || '{}');
                                      const defaultMessage = smsSettings?.defaultMessages?.bookingApprovedCustomer || 
                                        'Booking approved! We will call you if more information is needed.';
                                      
                                      // Find customer to get phone number
                                      const customer = customers.find(c => c.name === booking.customerName);
                                      
                                      console.log('📱 SMS Notification:');
                                      console.log(`Provider: ${smsSettings.provider || 'Not configured'}`);
                                      console.log(`To: ${customer?.phone || booking.customerName}`);
                                      console.log(`Message: ${defaultMessage}`);
                                      console.log(`Property: ${booking.propertyName}`);
                                      console.log(`Check-in: ${booking.checkIn}`);
                                      
                                      showModal('success', 'Booking Approved', 'Booking approved successfully!\n\n✅ SMS notification would be sent to customer.');
                                    }}
                                    className="hover:bg-white h-8 px-2 text-xs bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      // Disapprove booking
                                      showModal('confirm', 'Disapprove Booking', 'Are you sure you want to disapprove this booking? This will cancel the booking.', async () => {
                                        if (!checkConnection()) {
                                          showModal('error', 'No Connection', 'Cannot disapprove booking. Please check your internet connection.');
                                          return;
                                        }
                                        
                                        try {
                                          await adminHelpers.modifyBooking(booking.id, { booking_status: 'Cancelled' });
                                          const updatedBookings = bookings.map((b) =>
                                            b.id === booking.id
                                              ? { ...b, status: 'Cancelled', cancelReason: 'Disapproved by admin' }
                                              : b
                                          );
                                          setBookings(updatedBookings);
                                          showModal('success', 'Booking Disapproved', 'Booking disapproved and cancelled.');
                                        } catch (error) {
                                          console.error('Error disapproving booking:', error);
                                          showModal('error', 'Error', 'Failed to disapprove booking. Please try again.');
                                        }
                                      }, 'Disapprove', 'Cancel');
                                    }}
                                    className="hover:bg-white h-8 px-2 text-xs bg-red-500 hover:bg-red-600 text-white"
                                  >
                                    Disapprove
                                  </Button>
                                </>
                              )}
                              
                              {/* Only show Add Payment if not Pending Approval and not fully paid */}
                              {booking.status !== 'Pending Approval' && paymentStatus.status !== 'Paid in Full' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowPaymentModal(true);
                                  }}
                                  className="hover:bg-white h-8 px-2 text-xs bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                                >
                                  Add Payment
                                </Button>
                              )}
                              
                              {/* View Payments Button */}
                              {booking.status !== 'Pending Approval' && (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowViewPaymentsModal(true);
                                  }}
                                  className="hover:bg-white h-8 px-2 text-xs bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                  View Payments
                                </Button>
                              )}
                              
                              {/* Reprint Receipt */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReceiptData({ booking });
                                  setReceiptType('booking');
                                  setShowReceiptModal(true);
                                }}
                                className="hover:bg-white h-8 px-2 text-xs"
                                title="Reprint Booking Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelConfirm(true);
                                }}
                                className="hover:bg-white h-8 w-8 p-0 text-orange-600"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowDeleteConfirm(true);
                                }}
                                className="hover:bg-white text-red-600 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )})}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Customer Management Content */}
            {activeMenu === 'customers' && (
              <>
                {/* Page Header */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#36454F] mb-2">Customer Management</h2>
                  <p className="text-sm md:text-base text-gray-600">Track and manage all customers.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-6 md:mb-8">
                  <Button 
                    onClick={() => setShowCustomerModal(true)}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-[#6B7F39] hover:bg-[#5a6930] text-white text-xs md:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Customer</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu('bookings')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-xs md:text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Bookings</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu('payments')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payments</span>
                  </Button>
                </div>

                {/* List of Customers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">Customers List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {customers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">No customers yet. Add your first customer above.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {customers.map((customer) => {
                          // Calculate customer balance
                          // Filter by customerId if available, otherwise fallback to customerName for backwards compatibility
                          const customerBookings = bookings.filter(b => 
                            b.customerId ? String(b.customerId) === String(customer.id) : b.customerName === customer.name
                          );
                          const totalBookingAmount = customerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                          
                          // Get all payments for this customer's bookings
                          const customerPayments = payments.filter((p: any) => 
                            customerBookings.some(b => b.id === p.bookingId)
                          );
                          const totalPaid = customerPayments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
                          
                          const balance = totalBookingAmount - totalPaid;
                          
                          return (
                          <div key={customer.id} className="flex items-center justify-between p-3 bg-[#FAF4EC] rounded-lg hover:bg-[#f5ede0] transition gap-3">
                            <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                              <div className="flex-shrink-0 min-w-[120px] md:min-w-[150px]">
                                <h4 className="font-semibold text-[#36454F] text-sm truncate">{customer.name}</h4>
                              </div>
                              <div className="flex items-center flex-shrink-0 min-w-[100px] md:min-w-[120px]">
                                <span className="text-xs text-gray-600 truncate">{customer.phone || 'No phone'}</span>
                              </div>
                              <div className="flex items-center flex-shrink-0 min-w-[100px] md:min-w-[150px]">
                                <span className="text-xs text-gray-600 truncate">{customer.email || 'No email'}</span>
                              </div>
                              <div className="flex items-center flex-shrink-0 min-w-[100px] md:min-w-[130px]">
                                <span className={`text-xs font-semibold ${
                                  balance === 0 ? 'text-green-600' : 
                                  balance > 0 ? 'text-orange-600' : 
                                  'text-gray-600'
                                }`}>
                                  Balance: KSh {balance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowViewCustomerModal(true);
                                }}
                                className="hover:bg-white h-8 w-8 p-0"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowDeleteCustomerConfirm(true);
                                }}
                                className="hover:bg-white text-red-600 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )})}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Payments Content */}
            {activeMenu === 'payments' && (
              <>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 md:gap-3 mb-6 md:mb-8">
                  <Button 
                    onClick={() => {
                      // Open payment modal without a specific booking
                      setSelectedBooking(null);
                      setShowPaymentModal(true);
                    }}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-[#6B7F39] hover:bg-[#5a6930] text-white text-xs md:text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Payment</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu('customers')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm"
                  >
                    <Users className="w-4 h-4" />
                    <span>Customers</span>
                  </Button>
                  <Button 
                    onClick={() => setActiveMenu('bookings')}
                    className="h-10 px-3 md:px-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Bookings</span>
                  </Button>
                </div>

                <Card key={paymentsRefreshKey}>
                  <CardHeader>
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">List of Payments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const allPayments = payments;
                      
                      if (allPayments.length === 0) {
                        return (
                          <div className="text-center py-12 text-gray-500">
                            <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg">No Payments Yet</p>
                            <p className="text-sm mt-2">Payments will appear here once added to bookings</p>
                          </div>
                        );
                      }

                      // Calculate totals - Fixed to calculate from bookings not from payment balance field
                      const totalReceived = allPayments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0);
                      
                      // Calculate outstanding balance from all bookings with confirmed status
                      let totalBalance = 0;
                      const allBookings = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Pending Approval');
                      allBookings.forEach((booking: any) => {
                        const paymentStatus = getBookingPaymentStatus(booking);
                        totalBalance += paymentStatus.remaining;
                      });

                      return (
                        <>
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-green-600 font-medium mb-1">Total Received</p>
                              <p className="text-2xl font-bold text-green-700">KSh {totalReceived.toLocaleString()}</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <p className="text-sm text-orange-600 font-medium mb-1">Outstanding Balance</p>
                              <p className="text-2xl font-bold text-orange-700">KSh {totalBalance.toLocaleString()}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm text-blue-600 font-medium mb-1">Total Payments</p>
                              <p className="text-2xl font-bold text-blue-700">{allPayments.length}</p>
                            </div>
                          </div>

                          {/* Payments Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                              <thead>
                                <tr className="bg-[#36454F] text-white">
                                  <th className="text-left px-3 py-3 text-xs md:text-sm font-semibold">Date</th>
                                  <th className="text-left px-3 py-3 text-xs md:text-sm font-semibold">Customer</th>
                                  <th className="text-right px-3 py-3 text-xs md:text-sm font-semibold">Amount</th>
                                  <th className="text-center px-3 py-3 text-xs md:text-sm font-semibold">Status</th>
                                  <th className="text-center px-3 py-3 text-xs md:text-sm font-semibold">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {allPayments
                                  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                  .map((payment: any) => (
                                    <tr key={payment.id} className="border-b hover:bg-[#FAF4EC] transition">
                                      <td className="px-3 py-3 text-xs md:text-sm text-gray-700">
                                        {new Date(payment.createdAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-3 py-3">
                                        <div className="text-xs md:text-sm text-gray-700">{payment.customerName}</div>
                                        <div className="text-xs text-gray-500">{payment.customerEmail}</div>
                                      </td>
                                      <td className="px-3 py-3 text-right">
                                        <span className="text-xs md:text-sm font-semibold text-green-600">
                                          KSh {(payment.paidAmount || 0).toLocaleString()}
                                        </span>
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                          payment.balance > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                          {payment.balance > 0 ? 'Partial' : 'Paid'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setShowPaymentDetailsModal(true);
                                            }}
                                            className="hover:bg-white h-7 px-2 text-xs"
                                            title="View Payment Details"
                                          >
                                            <Eye className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              const booking = bookings.find(b => b.id === payment.bookingId);
                                              if (booking) {
                                                setReceiptData({ booking, payment });
                                                setReceiptType('payment');
                                                setShowReceiptModal(true);
                                              }
                                            }}
                                            className="hover:bg-white h-7 px-2 text-xs"
                                            title="Print Payment Receipt"
                                          >
                                            <FileText className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setSelectedPayment(payment);
                                              setShowDeletePaymentConfirm(true);
                                            }}
                                            className="hover:bg-red-50 h-7 px-2 text-xs text-red-600 hover:text-red-700"
                                            title="Delete Payment"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Menu Pages Content */}
            {activeMenu === 'menu-pages' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">Menu Pages</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate('/admin/menu-pages')}
                        className="bg-[#6B7F39] hover:bg-[#5a6930]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Manage Menu
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-[#6B7F39]" />
                    <p className="text-lg font-semibold text-[#36454F] mb-2">Menu Pages Management</p>
                    <p className="text-sm text-gray-600 mb-6">
                      Create custom pages, link internal pages, or add external URLs to your site navigation
                    </p>
                    <Button
                      onClick={() => navigate('/admin/menu-pages')}
                      className="bg-[#6B7F39] hover:bg-[#5a6930]"
                    >
                      Get Started
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Content */}
            {activeMenu === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl font-bold text-[#36454F]">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Storage Optimization Section */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-[#36454F] mb-2 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#6B7F39]" />
                        Storage Optimization
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Convert all existing property images to WebP format and compress to maximum 50KB each. This significantly reduces storage usage.
                      </p>
                      
                      {/* Storage Info */}
                      {(() => {
                        const storage = getStorageUsage();
                        const storagePercent = parseFloat(storage.percentage);
                        return (
                          <div className={`mb-4 p-3 rounded-lg border ${
                            storagePercent > 90 ? 'bg-red-50 border-red-200' :
                            storagePercent > 70 ? 'bg-orange-50 border-orange-200' :
                            'bg-green-50 border-green-200'
                          }`}>
                            <div className="text-sm font-medium">
                              Current Storage: {storage.usedMB}MB / {storage.totalMB}MB ({storage.percentage}%)
                            </div>
                          </div>
                        );
                      })()}
                      
                      {showMigrationButton && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm text-blue-800 mb-2">
                            ⚠️ Your property images can be optimized! Click the button below to compress all images to WebP format (max 50KB each).
                          </p>
                          <p className="text-xs text-blue-600">
                            This may take a few minutes depending on the number of properties.
                          </p>
                        </div>
                      )}
                      
                      {isMigrating && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-700"></div>
                            <div className="text-sm text-yellow-800">
                              Migrating images... Property {migrationProgress.current} of {migrationProgress.total}
                            </div>
                          </div>
                          <div className="mt-2 bg-yellow-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-yellow-600 h-full transition-all duration-300"
                              style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-yellow-700 mt-2">
                            Please don't close this page until migration is complete.
                          </p>
                        </div>
                      )}
                      
                      <Button
                        onClick={migrateExistingImages}
                        disabled={isMigrating || !showMigrationButton}
                        className={`w-full ${
                          showMigrationButton && !isMigrating
                            ? 'bg-[#6B7F39] hover:bg-[#5a6b2f]'
                            : 'bg-gray-300 cursor-not-allowed'
                        } text-white`}
                      >
                        {isMigrating ? 'Migrating Images...' : 
                         showMigrationButton ? 'Optimize All Images to WebP (50KB)' : 
                         '✓ All Images Already Optimized'}
                      </Button>
                      
                      <p className="text-xs text-gray-500 mt-3">
                        💡 New images uploaded through "Add Property" are automatically optimized to WebP (50KB max).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowCategoryModal(false);
                setNewCategory('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#36454F] mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddCategory}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add Category
              </Button>
              <Button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategory('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            
            {/* Categories List */}
            {categories.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Existing Categories ({categories.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-[#36454F]">{category}</span>
                      <button
                        onClick={async () => {
                          if (!checkConnection()) {
                            showModal('error', 'No Connection', 'Cannot delete category. Please check your internet connection.');
                            return;
                          }
                          try {
                            await adminHelpers.removeCategory(categories[index]);
                            const updatedCategories = categories.filter((_, i) => i !== index);
                            setCategories(updatedCategories);
                          } catch (error) {
                            console.error('Error deleting category:', error);
                            showModal('error', 'Error', 'Failed to delete category. Please try again.');
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {categories.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No categories yet. Add your first category above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Feature Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowFeatureModal(false);
                setNewFeature('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#36454F] mb-4">Add New Feature</h3>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Enter feature name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
            />
            <div className="flex gap-3 mb-6">
              <Button
                onClick={handleAddFeature}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Add Feature
              </Button>
              <Button
                onClick={() => {
                  setShowFeatureModal(false);
                  setNewFeature('');
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
            
            {/* Features List */}
            {features.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Existing Features ({features.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-[#36454F]">{feature}</span>
                      <button
                        onClick={async () => {
                          if (!checkConnection()) {
                            showModal('error', 'No Connection', 'Cannot delete feature. Please check your internet connection.');
                            return;
                          }
                          try {
                            await adminHelpers.removeFeature(features[index]);
                            const updatedFeatures = features.filter((_, i) => i !== index);
                            setFeatures(updatedFeatures);
                          } catch (error) {
                            console.error('Error deleting feature:', error);
                            showModal('error', 'Error', 'Failed to delete feature. Please try again.');
                          }
                        }}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {features.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No features yet. Add your first feature above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showPropertyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl my-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#36454F]">Add New Property</h3>
                <p className="text-sm text-gray-600 mt-1">Fill in the details to add a new property</p>
              </div>
              <button
                onClick={() => {
                  setShowPropertyModal(false);
                  setPropertyForm({
                    name: '',
                    category: '',
                    selectedFeatures: [],
                    location: '',
                    price: '',
                    description: '',
                    beds: '',
                    baths: '',
                    area: ''
                  });
                  setPhotos({
                    livingRoom: [],
                    bedroom: [],
                    bathroom: [],
                    dining: [],
                    others: []
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Property Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
                <input
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                  placeholder="Enter property name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={propertyForm.category}
                  onChange={(e) => setPropertyForm({...propertyForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                  placeholder="e.g., Westlands, Nairobi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (KSh) *</label>
                <input
                  type="number"
                  value={propertyForm.price}
                  onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
                  placeholder="e.g., 85000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Property Details - Beds, Baths, Area */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. of Beds</label>
                  <input
                    type="number"
                    value={propertyForm.beds}
                    onChange={(e) => setPropertyForm({...propertyForm, beds: e.target.value})}
                    placeholder="e.g., 3"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={propertyForm.baths}
                    onChange={(e) => setPropertyForm({...propertyForm, baths: e.target.value})}
                    placeholder="e.g., 2"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (Sqft)</label>
                  <input
                    type="number"
                    value={propertyForm.area}
                    onChange={(e) => setPropertyForm({...propertyForm, area: e.target.value})}
                    placeholder="e.g., 1500"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                  placeholder="Enter property description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={propertyForm.selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-[#6B7F39] border-gray-300 rounded focus:ring-[#6B7F39] flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Photos</label>
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    Auto-converts to WebP • Max 50KB each
                  </span>
                </div>
                {/* Photo Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[
                    { id: 'livingRoom', label: 'Living Room' },
                    { id: 'bedroom', label: 'Bedroom' },
                    { id: 'bathroom', label: 'Bathroom' },
                    { id: 'dining', label: 'Dining' },
                    { id: 'others', label: 'Others' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePhotoTab(tab.id as typeof activePhotoTab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activePhotoTab === tab.id
                          ? 'bg-[#6B7F39] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tab.label} ({photos[tab.id as keyof typeof photos].length})
                    </button>
                  ))}
                </div>

                {/* File Upload */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mb-2 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#6B7F39] file:text-white hover:file:bg-[#5a6930] cursor-pointer"
                />
                
                {/* Storage Warning */}
                {(() => {
                  const currentPhotoCount = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0);
                  const storage = getStorageUsage();
                  const storagePercent = parseFloat(storage.percentage);
                  
                  return (
                    <div className="mb-4">
                      {currentPhotoCount > 0 && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs mb-2">
                          ✓ {currentPhotoCount} photo{currentPhotoCount !== 1 ? 's' : ''} uploaded (≤50KB each as WebP)
                        </div>
                      )}
                      {currentPhotoCount > 10 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-xs mb-2">
                          ⚠️ You have {currentPhotoCount} photos. Recommend 5-10 photos per property for best performance.
                        </div>
                      )}
                      {storagePercent > 70 && (
                        <div className={`border px-3 py-2 rounded-lg text-xs ${
                          storagePercent > 90 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-orange-50 border-orange-200 text-orange-800'
                        }`}>
                          {storagePercent > 90 ? '🚨' : '⚠️'} Storage: {storage.usedMB}MB used ({storage.percentage}% full). 
                          {storagePercent > 90 && ' Consider deleting old properties.'}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Photo Preview */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {photos[activePhotoTab].map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo} alt={`${activePhotoTab} ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => handleRemovePhoto(activePhotoTab, index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddPropertySubmit}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Add Property
              </Button>
              <Button
                onClick={() => {
                  setShowPropertyModal(false);
                  setPropertyForm({
                    name: '',
                    category: '',
                    selectedFeatures: [],
                    location: '',
                    price: '',
                    description: ''
                  });
                  setPhotos({
                    livingRoom: [],
                    bedroom: [],
                    bathroom: [],
                    dining: [],
                    others: []
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditPropertyModal && editingProperty && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl my-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-[#36454F]">Edit Property</h3>
                <p className="text-sm text-gray-600 mt-1">Update property details</p>
              </div>
              <button
                onClick={() => {
                  setShowEditPropertyModal(false);
                  setEditingProperty(null);
                  setPropertyForm({
                    name: '',
                    category: '',
                    selectedFeatures: [],
                    location: '',
                    price: '',
                    description: '',
                    beds: '',
                    baths: '',
                    area: ''
                  });
                  setPhotos({
                    livingRoom: [],
                    bedroom: [],
                    bathroom: [],
                    dining: [],
                    others: []
                  });
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Property Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
                <input
                  type="text"
                  value={propertyForm.name}
                  onChange={(e) => setPropertyForm({...propertyForm, name: e.target.value})}
                  placeholder="Enter property name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={propertyForm.category}
                  onChange={(e) => setPropertyForm({...propertyForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={propertyForm.location}
                  onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                  placeholder="e.g., Westlands, Nairobi"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (KSh) *</label>
                <input
                  type="number"
                  value={propertyForm.price}
                  onChange={(e) => setPropertyForm({...propertyForm, price: e.target.value})}
                  placeholder="e.g., 85000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Property Details - Beds, Baths, Area */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. of Beds</label>
                  <input
                    type="number"
                    value={propertyForm.beds}
                    onChange={(e) => setPropertyForm({...propertyForm, beds: e.target.value})}
                    placeholder="e.g., 3"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <input
                    type="number"
                    value={propertyForm.baths}
                    onChange={(e) => setPropertyForm({...propertyForm, baths: e.target.value})}
                    placeholder="e.g., 2"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (Sqft)</label>
                  <input
                    type="number"
                    value={propertyForm.area}
                    onChange={(e) => setPropertyForm({...propertyForm, area: e.target.value})}
                    placeholder="e.g., 1500"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={propertyForm.description}
                  onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                  placeholder="Enter property description"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {features.map((feature) => (
                    <label key={feature} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition">
                      <input
                        type="checkbox"
                        checked={propertyForm.selectedFeatures.includes(feature)}
                        onChange={() => toggleFeature(feature)}
                        className="w-4 h-4 text-[#6B7F39] border-gray-300 rounded focus:ring-[#6B7F39] flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Photos</label>
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                    Auto-converts to WebP • Max 50KB each
                  </span>
                </div>
                {/* Photo Tabs */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[
                    { id: 'livingRoom', label: 'Living Room' },
                    { id: 'bedroom', label: 'Bedroom' },
                    { id: 'bathroom', label: 'Bathroom' },
                    { id: 'dining', label: 'Dining' },
                    { id: 'others', label: 'Others' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActivePhotoTab(tab.id as typeof activePhotoTab)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        activePhotoTab === tab.id
                          ? 'bg-[#6B7F39] text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tab.label} ({photos[tab.id as keyof typeof photos].length})
                    </button>
                  ))}
                </div>

                {/* File Upload */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mb-2 w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#6B7F39] file:text-white hover:file:bg-[#5a6930] cursor-pointer"
                />
                
                {/* Storage Warning */}
                {(() => {
                  const currentPhotoCount = Object.values(photos).reduce((sum, arr) => sum + arr.length, 0);
                  const storage = getStorageUsage();
                  const storagePercent = parseFloat(storage.percentage);
                  
                  return (
                    <div className="mb-4">
                      {currentPhotoCount > 0 && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs mb-2">
                          ✓ {currentPhotoCount} photo{currentPhotoCount !== 1 ? 's' : ''} uploaded (≤50KB each as WebP)
                        </div>
                      )}
                      {currentPhotoCount > 10 && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-xs mb-2">
                          ⚠️ You have {currentPhotoCount} photos. Recommend 5-10 photos per property for best performance.
                        </div>
                      )}
                      {storagePercent > 70 && (
                        <div className={`border px-3 py-2 rounded-lg text-xs ${
                          storagePercent > 90 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-orange-50 border-orange-200 text-orange-800'
                        }`}>
                          {storagePercent > 90 ? '🚨' : '⚠️'} Storage: {storage.usedMB}MB used ({storage.percentage}% full). 
                          {storagePercent > 90 && ' Consider deleting old properties.'}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Photo Preview */}
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {photos[activePhotoTab].map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo} alt={`${activePhotoTab} ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      <button
                        onClick={() => handleRemovePhoto(activePhotoTab, index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleEditPropertySubmit}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Update Property
              </Button>
              <Button
                onClick={() => {
                  setShowEditPropertyModal(false);
                  setEditingProperty(null);
                  setPropertyForm({
                    name: '',
                    category: '',
                    selectedFeatures: [],
                    location: '',
                    price: '',
                    description: ''
                  });
                  setPhotos({
                    livingRoom: [],
                    bedroom: [],
                    bathroom: [],
                    dining: [],
                    others: []
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedBooking(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#36454F] mb-4">Add Payment</h3>
            
            {/* Booking Selection (if no booking selected) */}
            {!selectedBooking && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Booking *</label>
                <select
                  onChange={(e) => {
                    const booking = bookings.find(b => b.id === parseInt(e.target.value));
                    if (booking) {
                      setSelectedBooking(booking);
                      // Calculate remaining balance
                      const bookingPayments = payments.filter((p: any) => p.bookingId === booking.id);
                      const totalPaid = bookingPayments.reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);
                      const remaining = booking.totalAmount - totalPaid;
                      setPaymentForm({
                        ...paymentForm,
                        totalAmount: remaining.toString()
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                >
                  <option value="">Choose a booking...</option>
                  {bookings
                    .filter(b => b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Pending Payment')
                    .map(booking => (
                      <option key={booking.id} value={booking.id}>
                        {booking.propertyName} - {booking.customerName} (KSh {booking.totalAmount.toLocaleString()})
                      </option>
                    ))}
                </select>
              </div>
            )}
            
            {selectedBooking && (
              <>
                <div className="mb-4 p-4 bg-[#FAF4EC] rounded-lg">
                  <p className="text-sm text-gray-600">Booking for:</p>
                  <p className="font-semibold text-[#36454F]">{selectedBooking.propertyName}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedBooking.customerName}</p>
                  
                  {/* Show payment summary if there are existing payments */}
                  {(() => {
                    const bookingPayments = payments.filter((p: any) => p.bookingId === selectedBooking.id);
                    const totalPaid = bookingPayments.reduce((sum: number, payment: any) => sum + (payment.paidAmount || 0), 0);
                    
                    if (bookingPayments.length > 0) {
                      return (
                        <div className="mt-3 pt-3 border-t border-[#6B7F39]/20">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Booking Total:</span>
                            <span className="font-medium text-[#36454F]">KSh {(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-600">Already Paid:</span>
                            <span className="font-medium text-green-600">KSh {totalPaid.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm mt-1 font-semibold">
                            <span className="text-gray-700">Remaining:</span>
                            <span className="text-orange-600">KSh {Math.max(0, (selectedBooking.totalAmount || 0) - totalPaid).toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="space-y-4">
              {/* Total Amount - Read Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due (KSh) *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={`KSh ${parseFloat(paymentForm.totalAmount || '0').toLocaleString()}`}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Remaining Balance
                  </span>
                </div>
              </div>

              {/* Paid Amount and Payment Mode in same row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Paid Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount (KSh) *</label>
                  <input
                    type="number"
                    value={paymentForm.paidAmount}
                    onChange={(e) => setPaymentForm({...paymentForm, paidAmount: e.target.value})}
                    placeholder="Enter paid amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>

                {/* Payment Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
                  <select
                    value={paymentForm.paymentMode}
                    onChange={(e) => {
                      const selectedMode = e.target.value;
                      if (selectedMode === 'Card') {
                        setShowCardPaymentAlert(true);
                        setTimeout(() => {
                          setShowCardPaymentAlert(false);
                          setPaymentForm({...paymentForm, paymentMode: 'Mpesa', transactionId: ''});
                        }, 5000);
                      } else {
                        setPaymentForm({...paymentForm, paymentMode: selectedMode, transactionId: ''});
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Mpesa">Mpesa</option>
                  </select>
                </div>
              </div>

              {/* Balance Display */}
              {paymentForm.totalAmount && paymentForm.paidAmount && (
                <div className="p-4 bg-[#FAF4EC] rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Balance:</span>
                    <span className={`text-lg font-bold ${
                      parseFloat(paymentForm.totalAmount) - parseFloat(paymentForm.paidAmount) > 0 
                        ? 'text-orange-600' 
                        : parseFloat(paymentForm.totalAmount) - parseFloat(paymentForm.paidAmount) < 0
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      KSh {(parseFloat(paymentForm.totalAmount) - parseFloat(paymentForm.paidAmount)).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Payment Alert */}
              {showCardPaymentAlert && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-yellow-800">Card Payment Integration Coming Soon</p>
                      <p className="text-sm text-yellow-700 mt-1">Reverting to Mpesa payment in 5 seconds...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction ID (only for Mpesa) */}
              {paymentForm.paymentMode === 'Mpesa' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                    placeholder="Enter Mpesa transaction ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={async () => {
                  // Validate form
                  if (!paymentForm.totalAmount) {
                    showModal('error', 'Validation Error', 'Please enter total amount');
                    return;
                  }
                  if (!paymentForm.paidAmount) {
                    showModal('error', 'Validation Error', 'Please enter paid amount');
                    return;
                  }
                  if (paymentForm.paymentMode === 'Mpesa' && !paymentForm.transactionId) {
                    showModal('error', 'Validation Error', 'Please enter Mpesa transaction ID');
                    return;
                  }

                  // Create payment object
                  const payment = {
                    id: generatePaymentId(),
                    amount: parseFloat(paymentForm.paidAmount),
                    paymentMode: paymentForm.paymentMode,
                    paymentId: paymentForm.transactionId || generatePaymentId(),
                    date: new Date().toISOString()
                  };

                  // Update the booking with the new payment
                  const updatedBookings = bookings.map(booking => {
                    if (booking.id === selectedBooking.id) {
                      const existingPayments = booking.payments || [];
                      const updatedPayments = [...existingPayments, payment];
                      
                      // Calculate total paid amount
                      const totalPaid = updatedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                      
                      // Auto-confirm booking if fully paid
                      const isFullyPaid = totalPaid >= booking.totalAmount;
                      const newStatus = isFullyPaid ? 'Confirmed' : booking.status;
                      
                      return {
                        ...booking,
                        payments: updatedPayments,
                        status: newStatus
                      };
                    }
                    return booking;
                  });

                  // Check connection
                  if (!checkConnection()) {
                    showModal('error', 'No Connection', 'Cannot add payment. Please check your internet connection.');
                    return;
                  }

                  try {
                    // Save payment to Supabase
                    const paymentData = {
                      bookingId: selectedBooking.id,
                      customerId: parseInt(selectedBooking.customerId),
                      propertyId: parseInt(selectedBooking.propertyId),
                      paidAmount: parseFloat(paymentForm.paidAmount),
                      paymentMode: paymentForm.paymentMode,
                      transactionId: paymentForm.transactionId || '',
                      date: payment.date,
                      mpesaCode: paymentForm.transactionId || '',
                      notes: ''
                    };
                    const createdPayment = await adminHelpers.addPayment(paymentData);
                    
                    // Update booking in Supabase
                    const bookingToUpdate = updatedBookings.find(b => b.id === selectedBooking.id);
                    if (bookingToUpdate) {
                      const totalPaid = (bookingToUpdate.payments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                      await adminHelpers.modifyBooking(bookingToUpdate.id, {
                        amount_paid: totalPaid,
                        payment_status: totalPaid >= bookingToUpdate.totalAmount ? 'Paid in Full' : 'Partial Payment',
                        booking_status: totalPaid >= bookingToUpdate.totalAmount ? 'Confirmed' : bookingToUpdate.status
                      });
                    }

                    // Update local state
                    setBookings(updatedBookings);
                    setPayments([...payments, createdPayment]);
                  } catch (error) {
                    console.error('Error adding payment:', error);
                    showModal('error', 'Error', 'Failed to add payment. Please try again.');
                    return;
                  }

                  // Reset form
                  setPaymentForm({
                    totalAmount: '',
                    paidAmount: '',
                    paymentMode: 'Cash',
                    transactionId: ''
                  });
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                  
                  // Trigger refresh of payments list
                  setPaymentsRefreshKey(prev => prev + 1);
                  
                  showModal('success', 'Success', 'Payment added successfully!');
                }}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Add Payment
              </Button>
              <Button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                  setPaymentForm({
                    totalAmount: '',
                    paidAmount: '',
                    paymentMode: 'Cash',
                    transactionId: ''
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
                  </>
                )}
          </div>
        </div>
      )}

      {/* Cancel Booking Confirmation Modal */}
      {showCancelConfirm && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowCancelConfirm(false);
                setSelectedBooking(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <X className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Cancel Booking</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">Are you sure you want to cancel this booking?</p>
              <div className="p-4 bg-[#FAF4EC] rounded-lg mb-4">
                <p className="font-semibold text-[#36454F]">{selectedBooking.propertyName}</p>
                <p className="text-sm text-gray-600">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-600">{selectedBooking.checkIn} - {selectedBooking.checkOut}</p>
              </div>
              
              {/* Reason for cancellation */}
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Cancellation *</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancelling this booking..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!cancelReason.trim()) {
                    showModal('error', 'Validation Error', 'Please provide a reason for cancellation');
                    return;
                  }

                  if (!checkConnection()) {
                    showModal('error', 'No Connection', 'Cannot cancel booking. Please check your internet connection.');
                    return;
                  }

                  try {
                    // Update booking status to Cancelled
                    await adminHelpers.modifyBooking(selectedBooking.id, { booking_status: 'Cancelled' });
                    const updatedBookings = bookings.map(b => 
                      b.id === selectedBooking.id 
                        ? { ...b, status: 'Cancelled', cancelReason: cancelReason, cancelledAt: new Date().toISOString() }
                        : b
                    );
                    
                    setBookings(updatedBookings);
                    setShowCancelConfirm(false);
                    setSelectedBooking(null);
                    setCancelReason('');
                    
                    showModal('success', 'Success', 'Booking cancelled successfully!');
                  } catch (error) {
                    console.error('Error cancelling booking:', error);
                    showModal('error', 'Error', 'Failed to cancel booking. Please try again.');
                  }
                }}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Yes, Cancel Booking
              </Button>
              <Button
                onClick={() => {
                  setShowCancelConfirm(false);
                  setSelectedBooking(null);
                  setCancelReason('');
                }}
                variant="outline"
                className="flex-1"
              >
                No, Keep It
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Payments Modal */}
      {showViewPaymentsModal && selectedBooking && (() => {
        const bookingPayments = payments.filter((p: any) => p.bookingId === selectedBooking.id);
        
        return (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8 relative">
              <button
                onClick={() => {
                  setShowViewPaymentsModal(false);
                  setSelectedBooking(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-[#36454F] mb-4">Payment History</h3>
              
              <div className="mb-4 p-4 bg-[#FAF4EC] rounded-lg">
                <p className="text-sm text-gray-600">Booking for:</p>
                <p className="font-semibold text-[#36454F]">{selectedBooking.propertyName}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-600">{selectedBooking.checkIn} - {selectedBooking.checkOut}</p>
                
                <div className="mt-3 pt-3 border-t border-[#6B7F39]/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking Total:</span>
                    <span className="font-medium text-[#36454F]">KSh {(selectedBooking.totalAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="font-medium text-green-600">
                      KSh {bookingPayments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1 font-semibold">
                    <span className="text-gray-700">Outstanding Balance:</span>
                    <span className="text-orange-600">
                      KSh {Math.max(0, (selectedBooking.totalAmount || 0) - bookingPayments.reduce((sum: number, p: any) => sum + (p.paidAmount || 0), 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {bookingPayments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">No payments recorded for this booking yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Payment Method</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Amount Paid</th>
                        <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Balance</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingPayments.map((payment: any, index: number) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              payment.paymentMode === 'Cash' ? 'bg-green-100 text-green-700' :
                              payment.paymentMode === 'Mpesa' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {payment.paymentMode}
                            </span>
                            {payment.transactionId && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({payment.transactionId})
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-sm text-right font-medium text-green-600">
                            KSh {(payment.paidAmount || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-sm text-right font-medium text-orange-600">
                            KSh {(payment.balance || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {new Date(payment.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => {
                    setShowViewPaymentsModal(false);
                    setSelectedBooking(null);
                  }}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Booking Confirmation Modal */}
      {showDeleteConfirm && selectedBooking && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedBooking(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Delete Booking</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Are you sure you want to delete this booking? This action cannot be undone.</p>
              <div className="p-4 bg-[#FAF4EC] rounded-lg">
                <p className="font-semibold text-[#36454F]">{selectedBooking.propertyName}</p>
                <p className="text-sm text-gray-600">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-600">{selectedBooking.checkIn} - {selectedBooking.checkOut}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!checkConnection()) {
                    showModal('error', 'No Connection', 'Cannot delete booking. Please check your internet connection.');
                    return;
                  }

                  try {
                    // Delete booking
                    await adminHelpers.removeBooking(selectedBooking.id);
                    const updatedBookings = bookings.filter(b => b.id !== selectedBooking.id);
                    setBookings(updatedBookings);
                    
                    setShowDeleteConfirm(false);
                    setSelectedBooking(null);
                    
                    showModal('success', 'Success', 'Booking deleted successfully!');
                  } catch (error) {
                    console.error('Error deleting booking:', error);
                    showModal('error', 'Error', 'Failed to delete booking. Please try again.');
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Delete
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedBooking(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowCustomerModal(false);
                setShowCustomerPassword(false);
                setCustomerForm({
                  name: '',
                  phone: '',
                  email: '',
                  address: '',
                  password: ''
                });
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-[#36454F] mb-6">Add New Customer</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter customer address"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showCustomerPassword ? "text" : "password"}
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCustomerPassword(!showCustomerPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCustomerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddCustomer}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Add Customer
              </Button>
              <Button
                onClick={() => {
                  setShowCustomerModal(false);
                  setShowCustomerPassword(false);
                  setCustomerForm({
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    password: ''
                  });
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewCustomerModal && selectedCustomer && (() => {
        // Real-time computed data for this customer
        // Filter by customerId if available, otherwise fallback to customerName for backwards compatibility
        const customerBookings = bookings.filter(b => 
          b.customerId ? String(b.customerId) === String(selectedCustomer.id) : b.customerName === selectedCustomer.name
        );
        const activeBookings = customerBookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending Payment');
        const completedBookings = customerBookings.filter(b => b.status === 'Completed');
        const cancelledBookings = customerBookings.filter(b => b.status === 'Cancelled');
        
        const totalSpent = customerBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalPaid = customerBookings.reduce((sum, b) => {
          if (b.payments && Array.isArray(b.payments)) {
            return sum + b.payments.reduce((pSum: number, p: any) => pSum + (p.amount || 0), 0);
          }
          return sum;
        }, 0);
        const balanceRemaining = totalSpent - totalPaid;
        
        const allPayments = customerBookings
          .filter(b => b.payments && b.payments.length > 0)
          .flatMap(b => b.payments.map((p: any) => ({ ...p, propertyName: b.propertyName })))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 relative">
            <button
              onClick={() => {
                setShowViewCustomerModal(false);
                setSelectedCustomer(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-[#36454F] mb-6">Customer Details</h3>
            
            {/* Customer Information */}
            <div className="bg-[#FAF4EC] rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-[#36454F]">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-[#36454F]">{selectedCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-[#36454F]">{selectedCustomer.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-[#36454F]">{selectedCustomer.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Real-time Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-700">{customerBookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activeBookings.length} Active • {completedBookings.length} Done
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-green-700">KSh {totalSpent.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Lifetime value</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-purple-700">KSh {totalPaid.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{allPayments.length} payments</p>
              </div>
              <div className={`rounded-lg p-4 ${balanceRemaining > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                <p className={`text-xs mb-1 ${balanceRemaining > 0 ? 'text-orange-600' : 'text-gray-600'}`}>Balance</p>
                <p className={`text-2xl font-bold ${balanceRemaining > 0 ? 'text-orange-700' : 'text-gray-700'}`}>
                  KSh {balanceRemaining.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {balanceRemaining === 0 ? 'Fully paid' : 'Outstanding'}
                </p>
              </div>
            </div>

            {/* Current Bookings */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-[#36454F] mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Active Bookings ({activeBookings.length})
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {activeBookings.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No active bookings
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Property</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Check-in</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Check-out</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Total Amount</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Paid</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Payment Status</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Booking Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeBookings.map((booking) => {
                          const bookingPaid = booking.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
                          const bookingBalance = booking.totalAmount - bookingPaid;
                          const paymentStatus = bookingBalance === 0 ? 'Paid in Full' : bookingPaid > 0 ? 'Partial Payment' : 'Not Paid';
                          
                          return (
                            <tr key={booking.id} className="border-t border-gray-100">
                              <td className="py-2 px-3 text-sm text-gray-700">{booking.propertyName}</td>
                              <td className="py-2 px-3 text-sm text-gray-700">{booking.checkIn}</td>
                              <td className="py-2 px-3 text-sm text-gray-700">{booking.checkOut}</td>
                              <td className="py-2 px-3 text-sm text-gray-700">KSh {booking.totalAmount.toLocaleString()}</td>
                              <td className="py-2 px-3 text-sm font-semibold text-green-600">KSh {bookingPaid.toLocaleString()}</td>
                              <td className="py-2 px-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  paymentStatus === 'Paid in Full' 
                                    ? 'bg-green-100 text-green-700' 
                                    : paymentStatus === 'Partial Payment'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {paymentStatus}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  booking.status === 'Confirmed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {booking.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Payment History */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-[#36454F] mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment History ({allPayments.length})
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {allPayments.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No payment history
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Date</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Property</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Amount</th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Payment Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPayments.map((payment: any, idx: number) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="py-2 px-3 text-sm text-gray-700">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700">{payment.propertyName}</td>
                            <td className="py-2 px-3 text-sm font-semibold text-green-600">
                              KSh {payment.amount.toLocaleString()}
                            </td>
                            <td className="py-2 px-3 text-sm text-gray-700">{payment.paymentMode}</td>
                          </tr>
                        ))}
                        {/* Summary Row */}
                        <tr className="border-t-2 border-[#6B7F39] bg-[#FAF4EC]">
                          <td colSpan={2} className="py-3 px-3 text-sm font-bold text-[#36454F]">
                            Total Payments
                          </td>
                          <td className="py-3 px-3 text-sm font-bold text-green-600">
                            KSh {totalPaid.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-sm text-gray-600">
                            Balance: <span className={balanceRemaining > 0 ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>
                              KSh {balanceRemaining.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* All Bookings History */}
            {(completedBookings.length > 0 || cancelledBookings.length > 0) && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-[#36454F] mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking History
                </h4>
                <div className="space-y-2">
                  {completedBookings.length > 0 && (
                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="bg-green-50 px-4 py-3 cursor-pointer hover:bg-green-100 transition font-semibold text-green-700 text-sm">
                        Completed Bookings ({completedBookings.length})
                      </summary>
                      <div className="p-3 space-y-2">
                        {completedBookings.map((booking) => (
                          <div key={booking.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{booking.propertyName}</span>
                            <span className="text-gray-500">{booking.checkIn} to {booking.checkOut}</span>
                            <span className="text-gray-700 font-semibold">KSh {booking.totalAmount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  {cancelledBookings.length > 0 && (
                    <details className="border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="bg-red-50 px-4 py-3 cursor-pointer hover:bg-red-100 transition font-semibold text-red-700 text-sm">
                        Cancelled Bookings ({cancelledBookings.length})
                      </summary>
                      <div className="p-3 space-y-2">
                        {cancelledBookings.map((booking) => (
                          <div key={booking.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <span className="text-gray-700">{booking.propertyName}</span>
                            <span className="text-gray-500">{booking.checkIn} to {booking.checkOut}</span>
                            <span className="text-gray-700 font-semibold">KSh {booking.totalAmount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={() => {
                setShowViewCustomerModal(false);
                setSelectedCustomer(null);
              }}
              className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-white"
            >
              Close
            </Button>
          </div>
        </div>
        );
      })()}

      {/* View Property Details Modal */}
      {showViewPropertyModal && selectedProperty && (() => {
        // Get all bookings for this property
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
        
        const propertyBookings = bookings.filter(b => String(b.propertyId) === String(selectedProperty.id));
        
        // Active bookings = Confirmed or Pending Payment status AND checkout date is in the future
        const activeBookings = propertyBookings.filter(b => {
          if (b.status !== 'Confirmed' && b.status !== 'Pending Payment') return false;
          const checkoutDate = new Date(b.checkOut);
          checkoutDate.setHours(0, 0, 0, 0);
          if (checkoutDate < today) return false;
          
          return true; // Consider as booked if it has any booking
        });
        
        const completedBookings = propertyBookings.filter(b => b.status === 'Completed');
        const cancelledBookings = propertyBookings.filter(b => b.status === 'Cancelled');
        
        const totalRevenue = completedBookings.reduce((sum, b) => {
          if (b.payments && Array.isArray(b.payments)) {
            return sum + b.payments.reduce((pSum: number, p: any) => pSum + (p.amount || 0), 0);
          }
          return sum;
        }, 0);
        
        const pendingRevenue = activeBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        // Check current status
        const isCurrentlyBooked = activeBookings.length > 0;
        let availableFrom = null;
        if (isCurrentlyBooked) {
          const latestCheckout = activeBookings.reduce((latest, booking) => {
            const checkoutDate = new Date(booking.checkOut);
            return checkoutDate > latest ? checkoutDate : latest;
          }, new Date(activeBookings[0].checkOut));
          
          availableFrom = latestCheckout.toLocaleDateString();
        }

        return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl my-8 relative">
            <button
              onClick={() => {
                setShowViewPropertyModal(false);
                setSelectedProperty(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-[#36454F] mb-6">Property Details</h3>
            
            {/* Property Information */}
            <div className="bg-[#FAF4EC] rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Property Name</p>
                  <p className="font-semibold text-[#36454F]">{selectedProperty.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold text-[#36454F]">{selectedProperty.category || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-[#36454F]">{selectedProperty.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price per Day</p>
                  <p className="inline-block text-xs font-semibold bg-[#D4C5B0] text-[#36454F] px-2 py-1 rounded-lg border border-[#B8A586]">KSh {selectedProperty.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Availability Status</p>
                  <p className="font-semibold">
                    <span className={`px-2 py-1 rounded text-xs ${
                      isCurrentlyBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {isCurrentlyBooked ? `Booked, Available from ${availableFrom}` : 'Available for booking'}
                    </span>
                  </p>
                </div>
                {selectedProperty.features && selectedProperty.features.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Features</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProperty.features.map((feature: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Real-time Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-blue-600 mb-1">Total Bookings</p>
                <p className="text-2xl font-bold text-blue-700">{propertyBookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {activeBookings.length} Active
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-green-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">KSh {totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Completed bookings</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-purple-600 mb-1">Pending Revenue</p>
                <p className="text-2xl font-bold text-purple-700">KSh {pendingRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Active bookings</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-xs text-orange-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-orange-700">{completedBookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {cancelledBookings.length} Cancelled
                </p>
              </div>
            </div>

            {/* Bookings Section */}
            <div className="mb-6">
              <h4 className="text-lg font-bold text-[#36454F] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                List of Bookings
              </h4>
              
              {propertyBookings.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">No bookings for this property yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Current/Active Bookings */}
                  {activeBookings.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Current Bookings</h5>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-blue-700">Customer</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-blue-700">Check-in</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-blue-700">Check-out</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-blue-700">Amount</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-blue-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeBookings.map((booking) => {
                                const paymentStatus = getBookingPaymentStatus(booking);
                                return (
                                  <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="py-2 px-3 text-sm text-gray-700">{booking.customerName}</td>
                                    <td className="py-2 px-3 text-sm text-gray-700">{booking.checkIn}</td>
                                    <td className="py-2 px-3 text-sm text-gray-700">{booking.checkOut}</td>
                                    <td className="py-2 px-3 text-sm text-gray-700">KSh {booking.totalAmount.toLocaleString()}</td>
                                    <td className="py-2 px-3">
                                      <div className="flex flex-col gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                          booking.status === 'Confirmed' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                          {booking.status}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                          paymentStatus.status === 'Paid in Full' ? 'bg-green-100 text-green-700' : 
                                          paymentStatus.status === 'Partial Payment' ? 'bg-purple-100 text-purple-700' : 
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {paymentStatus.status}
                                        </span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Past Bookings */}
                  {(completedBookings.length > 0 || cancelledBookings.length > 0) && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Past Bookings</h5>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Customer</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Check-in</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Check-out</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Amount</th>
                                <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...completedBookings, ...cancelledBookings]
                                .sort((a, b) => new Date(b.checkOut).getTime() - new Date(a.checkOut).getTime())
                                .map((booking) => {
                                  const paymentStatus = getBookingPaymentStatus(booking);
                                  return (
                                    <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                                      <td className="py-2 px-3 text-sm text-gray-700">{booking.customerName}</td>
                                      <td className="py-2 px-3 text-sm text-gray-700">{booking.checkIn}</td>
                                      <td className="py-2 px-3 text-sm text-gray-700">{booking.checkOut}</td>
                                      <td className="py-2 px-3 text-sm text-gray-700">KSh {booking.totalAmount.toLocaleString()}</td>
                                      <td className="py-2 px-3">
                                        <div className="flex flex-col gap-1">
                                          <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                            booking.status === 'Completed' 
                                              ? 'bg-green-100 text-green-700' 
                                              : 'bg-red-100 text-red-700'
                                          }`}>
                                            {booking.status}
                                          </span>
                                          {booking.status === 'Completed' && (
                                            <span className={`text-xs px-2 py-1 rounded-full inline-block w-fit ${
                                              paymentStatus.status === 'Paid in Full' ? 'bg-green-100 text-green-700' : 
                                              paymentStatus.status === 'Partial Payment' ? 'bg-purple-100 text-purple-700' : 
                                              'bg-red-100 text-red-700'
                                            }`}>
                                              {paymentStatus.status}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  // Open booking modal with property pre-filled
                  setBookingForm({
                    propertyId: selectedProperty.id.toString(),
                    propertyName: selectedProperty.name,
                    propertyPrice: selectedProperty.price,
                    customerId: '',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    checkIn: '',
                    checkOut: '',
                    numberOfPeople: '1'
                  });
                  setBookingModalSource('property');
                  setShowBookingModal(true);
                }}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-black font-semibold"
              >
                Book Property
              </Button>
              <Button
                onClick={() => {
                  setShowViewPropertyModal(false);
                  setSelectedProperty(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Delete Customer Confirmation Modal */}
      {showDeleteCustomerConfirm && selectedCustomer && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowDeleteCustomerConfirm(false);
                setSelectedCustomer(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Delete Customer</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete customer <span className="font-semibold">{selectedCustomer.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Deleting this customer will not affect existing bookings or payment records.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDeleteCustomer}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Delete
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteCustomerConfirm(false);
                  setSelectedCustomer(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8 relative">
            <button
              onClick={() => {
                setShowBookingModal(false);
                setBookingForm({
                  propertyId: '',
                  propertyName: '',
                  propertyPrice: 0,
                  customerId: '',
                  customerName: '',
                  customerEmail: '',
                  customerPhone: '',
                  checkIn: '',
                  checkOut: '',
                  numberOfPeople: '1'
                });
                setBookingModalSource(null);
                setPropertySearchTerm('');
                setCustomerSearchTerm('');
                setShowPropertyDropdown(false);
                setShowCustomerDropdown(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#6B7F39] p-3 rounded-full">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Add Booking</h3>
            </div>

            <div className="space-y-4">
              {/* Property Selection - Only show if opened from Bookings module */}
              {bookingModalSource === 'booking' && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={propertySearchTerm || bookingForm.propertyName}
                    onChange={(e) => {
                      setPropertySearchTerm(e.target.value);
                      setShowPropertyDropdown(true);
                      if (!e.target.value) {
                        setBookingForm({
                          ...bookingForm,
                          propertyId: '',
                          propertyName: '',
                          propertyPrice: 0
                        });
                      }
                    }}
                    onFocus={() => setShowPropertyDropdown(true)}
                    placeholder="Search property..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                  {showPropertyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {properties
                        .filter(p => p.name.toLowerCase().includes((propertySearchTerm || '').toLowerCase()))
                        .map(property => (
                          <div
                            key={property.id}
                            onClick={() => {
                              setBookingForm({
                                ...bookingForm,
                                propertyId: property.id.toString(),
                                propertyName: property.name,
                                propertyPrice: property.price
                              });
                              setPropertySearchTerm('');
                              setShowPropertyDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-[#FAF4EC] cursor-pointer text-sm"
                          >
                            {property.name} - KSh {property.price.toLocaleString()}/day
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Property Name - Read only if pre-filled */}
              {bookingModalSource === 'property' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property
                  </label>
                  <input
                    type="text"
                    value={bookingForm.propertyName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>
              )}

              {/* Customer Selection */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerSearchTerm || bookingForm.customerName}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                    if (!e.target.value) {
                      setBookingForm({
                        ...bookingForm,
                        customerId: '',
                        customerName: '',
                        customerEmail: '',
                        customerPhone: ''
                      });
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search customer..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {customers
                      .filter(c => 
                        c.name.toLowerCase().includes((customerSearchTerm || '').toLowerCase()) ||
                        (c.email && c.email.toLowerCase().includes((customerSearchTerm || '').toLowerCase()))
                      )
                      .map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => {
                            setBookingForm({
                              ...bookingForm,
                              customerId: customer.id,
                              customerName: customer.name,
                              customerEmail: customer.email || '',
                              customerPhone: customer.phone || ''
                            });
                            setCustomerSearchTerm('');
                            setShowCustomerDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-[#FAF4EC] cursor-pointer text-sm"
                        >
                          {customer.name} {customer.email && `(${customer.email})`}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Check-in and Check-out Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-In Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingForm.checkIn}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-Out Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingForm.checkOut}
                    onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                    min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of People
                </label>
                <input
                  type="number"
                  value={bookingForm.numberOfPeople}
                  onChange={(e) => setBookingForm({ ...bookingForm, numberOfPeople: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              {/* Amount Due - Read Only */}
              {calculatedDays > 0 && bookingForm.propertyPrice > 0 && (
                <div className="bg-[#FAF4EC] p-4 rounded-lg border border-[#6B7F39]/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Number of Days:</span>
                    <span className="font-semibold text-[#36454F]">{calculatedDays} days</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Price per Day:</span>
                    <span className="font-semibold text-[#36454F]">KSh {bookingForm.propertyPrice.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-[#6B7F39]/20">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-700">Amount Due:</span>
                      <span className="text-xl font-bold text-[#6B7F39]">KSh {calculatedAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleAddBooking}
                className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-black font-semibold"
                disabled={!bookingForm.propertyId || !bookingForm.customerId || !bookingForm.checkIn || !bookingForm.checkOut || calculatedDays <= 0}
              >
                Book Now
              </Button>
              <Button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingForm({
                    propertyId: '',
                    propertyName: '',
                    propertyPrice: 0,
                    customerId: '',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    checkIn: '',
                    checkOut: '',
                    numberOfPeople: '1'
                  });
                  setBookingModalSource(null);
                  setPropertySearchTerm('');
                  setCustomerSearchTerm('');
                  setShowPropertyDropdown(false);
                  setShowCustomerDropdown(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {showPaymentDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8 relative">
            <button
              onClick={() => {
                setShowPaymentDetailsModal(false);
                setSelectedPayment(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#6B7F39] p-3 rounded-full">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Payment Details</h3>
            </div>

            <div className="space-y-4">
              {/* Date */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Date:</div>
                <div className="col-span-2 text-sm text-gray-900 font-medium">
                  {new Date(selectedPayment.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Property */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Property:</div>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-[#36454F]">{selectedPayment.propertyName}</div>
                  {(() => {
                    const property = properties.find(p => p.id === selectedPayment.propertyId);
                    if (property) {
                      return (
                        <div className="text-xs text-gray-500 mt-1">
                          <div>{property.location}</div>
                          <div className="mt-1">
                            <span className="inline-block text-xs font-semibold bg-[#D4C5B0] text-[#36454F] px-2 py-1 rounded-lg border border-[#B8A586]">
                              KSh {property.price.toLocaleString()}/day
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Customer:</div>
                <div className="col-span-2">
                  <div className="text-sm font-semibold text-[#36454F]">{selectedPayment.customerName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    <div>{selectedPayment.customerEmail}</div>
                    {selectedPayment.customerPhone && (
                      <div className="mt-0.5">{selectedPayment.customerPhone}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Paid */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Amount Paid:</div>
                <div className="col-span-2">
                  <span className="text-lg font-bold text-green-600">
                    KSh {(selectedPayment.paidAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Payment Mode:</div>
                <div className="col-span-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    selectedPayment.paymentMode === 'Mpesa' ? 'bg-green-100 text-green-700' :
                    selectedPayment.paymentMode === 'Cash' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedPayment.paymentMode}
                  </span>
                  {selectedPayment.transactionId && (
                    <div className="text-xs text-gray-500 mt-2">
                      Transaction ID: <span className="font-mono font-medium">{selectedPayment.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Amount */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Total Amount:</div>
                <div className="col-span-2 text-sm font-semibold text-gray-900">
                  KSh {(selectedPayment.totalAmount || 0).toLocaleString()}
                </div>
              </div>

              {/* Balance */}
              <div className="grid grid-cols-3 gap-4 py-3 border-b">
                <div className="text-sm font-medium text-gray-500">Balance:</div>
                <div className="col-span-2">
                  <span className={`text-sm font-bold ${
                    selectedPayment.balance > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    KSh {Math.abs(selectedPayment.balance || 0).toLocaleString()}
                  </span>
                  {selectedPayment.balance === 0 && (
                    <span className="ml-2 text-xs text-green-600">(Paid in Full)</span>
                  )}
                  {selectedPayment.balance > 0 && (
                    <span className="ml-2 text-xs text-orange-600">(Pending)</span>
                  )}
                </div>
              </div>

              {/* Booking Reference */}
              {selectedPayment.bookingId && (
                <div className="py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const booking = bookings.find(b => b.id === selectedPayment.bookingId);
                      if (booking) {
                        setSelectedBooking(booking);
                        setShowPaymentDetailsModal(false);
                        setSelectedPayment(null);
                        setActiveMenu('bookings');
                      }
                    }}
                    className="text-[#6B7F39] hover:text-[#5a6930] border-[#6B7F39]"
                  >
                    View Related Booking
                  </Button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowPaymentDetailsModal(false);
                  setSelectedPayment(null);
                }}
                className="bg-[#36454F] hover:bg-[#2d3940] text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {showDeletePaymentConfirm && selectedPayment && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-md my-8 relative">
            <button
              onClick={() => {
                setShowDeletePaymentConfirm(false);
                setSelectedPayment(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-[#36454F]">Delete Payment</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this payment? This action cannot be undone and the booking balance will increase.
              </p>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Payment Amount:</span>
                  <span className="text-sm font-bold text-red-600">KSh {(selectedPayment.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Property:</span>
                  <span className="text-sm text-gray-900">{selectedPayment.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Customer:</span>
                  <span className="text-sm text-gray-900">{selectedPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(selectedPayment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={async () => {
                  if (!checkConnection()) {
                    showModal('error', 'No Connection', 'Cannot delete payment. Please check your internet connection.');
                    return;
                  }

                  try {
                    // Remove payment from Supabase
                    await adminHelpers.removePayment(selectedPayment.id);
                    const updatedPayments = payments.filter(p => p.id !== selectedPayment.id);
                    setPayments(updatedPayments);

                    // Remove payment from the booking's payments array and update booking
                    const updatedBookings = bookings.map(booking => {
                      if (booking.id === selectedPayment.bookingId) {
                        const updatedBookingPayments = (booking.payments || []).filter((p: any) => p.id !== selectedPayment.id);
                        const totalPaid = updatedBookingPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                        
                        // Update booking in Supabase
                        adminHelpers.modifyBooking(booking.id, {
                          amount_paid: totalPaid,
                          payment_status: totalPaid >= booking.totalAmount ? 'Paid in Full' : totalPaid > 0 ? 'Partial Payment' : 'Not Paid'
                        }).catch(err => console.error('Error updating booking after payment deletion:', err));
                        
                        return {
                          ...booking,
                          payments: updatedBookingPayments
                        };
                      }
                      return booking;
                    });
                    setBookings(updatedBookings);

                    // Trigger refresh
                    setPaymentsRefreshKey(prev => prev + 1);

                    // Close modal and reset
                    setShowDeletePaymentConfirm(false);
                    setSelectedPayment(null);

                    showModal('success', 'Success', 'Payment deleted successfully! The booking balance has been updated.');
                  } catch (error) {
                    console.error('Error deleting payment:', error);
                    showModal('error', 'Error', 'Failed to delete payment. Please try again.');
                  }
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Payment
              </Button>
              <Button
                onClick={() => {
                  setShowDeletePaymentConfirm(false);
                  setSelectedPayment(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gradient-to-r from-[#6B7F39] to-[#36454F] rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-7 h-7" />
                  Activity Log
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowActivityLog(false)}
                  className="text-white hover:bg-white/20 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
              {activityLogs.length > 0 ? (
                <div className="space-y-3">
                  {activityLogs.slice().reverse().map((log, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gradient-to-r from-[#FAF4EC] to-white rounded-xl border-2 border-gray-200 hover:border-[#6B7F39] transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-[#6B7F39] text-white text-xs font-bold rounded-full">
                              {log.action}
                            </span>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{log.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">No activity logs yet</p>
                  <p className="text-gray-400 text-sm mt-2">Actions performed will appear here</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t-2 border-gray-100 bg-gray-50">
              <Button
                onClick={() => setShowActivityLog(false)}
                className="w-full bg-gradient-to-r from-[#36454F] to-[#6B7F39] hover:from-[#2a3640] hover:to-[#5a6930] text-white font-semibold py-6 rounded-xl shadow-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
            {/* Modal Header with Action Buttons */}
            <div className="bg-[#36454F] text-white p-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-xl font-bold">{receiptType === 'payment' ? 'Payment Receipt' : 'Booking Receipt'}</h3>
              <div className="flex items-center gap-2">
                {/* Print Button */}
                <Button
                  size="sm"
                  onClick={handlePrintReceipt}
                  className="bg-[#6B7F39] hover:bg-[#5a6930] text-white h-8 px-3 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-xs">Print</span>
                </Button>
                {/* Download PDF Button */}
                <Button
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-3 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-xs">PDF</span>
                </Button>
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setReceiptData(null);
                  }}
                  className="text-white hover:text-gray-300 ml-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* A4 Receipt Content */}
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div
                ref={receiptRef}
                className="bg-white mx-auto"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                  boxSizing: 'border-box'
                }}
              >
                {/* Receipt Header */}
                <div className="text-center border-b-4 border-[#6B7F39] pb-6 mb-6">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="bg-[#6B7F39] rounded-lg p-3">
                      <Building2 className="w-12 h-12 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-[#36454F]">Skyway Suites</h1>
                      <p className="text-sm text-gray-600">Kenya's Premier Property Platform</p>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-[#36454F] mt-4">
                    {receiptType === 'payment' ? 'PAYMENT RECEIPT' : 'BOOKING RECEIPT'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-2">
                    Receipt Date: {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Booking Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-[#36454F] mb-4 border-b-2 border-gray-300 pb-2">
                    Booking Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Property:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.propertyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Name:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Email:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.customerEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-In Date:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Check-Out Date:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.checkOut}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Number of Days:</p>
                      <p className="font-semibold text-[#36454F]">{receiptData.booking.days} days</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status:</p>
                      <p className={`font-semibold ${
                        receiptData.booking.status === 'Confirmed' ? 'text-green-600' :
                        receiptData.booking.status === 'Pending Approval' ? 'text-purple-600' :
                        'text-gray-600'
                      }`}>
                        {receiptData.booking.status}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary - Different for Booking vs Payment Receipt */}
                {receiptType === 'booking' ? (
                  // Booking Receipt - Only show total amount, NO payment details
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#36454F] mb-4 border-b-2 border-gray-300 pb-2">
                      Booking Summary
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between pt-3 border-t-2 border-[#6B7F39]">
                        <span className="font-bold text-lg text-gray-700">Total Booking Amount:</span>
                        <span className="font-bold text-xl text-[#36454F]">
                          KSh {receiptData.booking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Payment Receipt - Show booking info + individual payment details
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-[#36454F] mb-4 border-b-2 border-gray-300 pb-2">
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {/* Total Booking Amount */}
                      <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
                        <span className="text-gray-700">Total Booking Amount:</span>
                        <span className="font-bold text-[#36454F]">
                          KSh {receiptData.booking.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Individual Payment Information */}
                      {receiptData.payment && (
                        <>
                          <div className="mb-3 pb-3 border-b border-gray-300">
                            <p className="text-sm font-semibold text-gray-700 mb-3">This Payment Details:</p>
                            <div className="grid grid-cols-2 gap-3 pl-4">
                              <div>
                                <p className="text-sm text-gray-600">Payment Date:</p>
                                <p className="font-semibold text-[#36454F]">
                                  {new Date(receiptData.payment.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Payment Mode:</p>
                                <p className="font-semibold text-[#36454F]">{receiptData.payment.paymentMode}</p>
                              </div>
                              {receiptData.payment.transactionId && (
                                <div>
                                  <p className="text-sm text-gray-600">Transaction ID:</p>
                                  <p className="font-semibold text-[#36454F] font-mono text-xs">{receiptData.payment.transactionId}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Amount Paid */}
                          <div className="flex justify-between mb-3 pb-3 border-b border-gray-300">
                            <span className="text-gray-700 font-semibold">Amount Paid:</span>
                            <span className="font-bold text-green-600 text-lg">
                              KSh {receiptData.payment.paidAmount.toLocaleString()}
                            </span>
                          </div>
                          
                          {/* Remaining Balance */}
                          <div className="flex justify-between pt-3 border-t-2 border-[#6B7F39]">
                            <span className="font-bold text-lg text-gray-700">Remaining Balance:</span>
                            <span className={`font-bold text-xl ${
                              receiptData.payment.balance > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              KSh {Math.abs(receiptData.payment.balance).toLocaleString()}
                              {receiptData.payment.balance === 0 && ' (Paid in Full)'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="border-t-2 border-gray-300 pt-6 mt-12">
                  <p className="text-center text-sm text-gray-600">
                    Thank you for choosing Skyway Suites!
                  </p>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    For inquiries, please contact us at support@skywaysuites.co.ke
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    This is a computer-generated receipt. No signature is required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modal */}
      <CustomModal
        show={modalState.show}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onConfirm={handleModalConfirm}
        onCancel={closeModal}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
      />
      </div>
    </>
  );
}