import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft,
  Building2,
  Users,
  Database,
  MessageSquare,
  Save,
  Upload,
  Download,
  Copy,
  Trash2,
  Plus,
  Edit,
  Shield,
  UserCog,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  HardDrive,
  Server,
  Send,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Home,
  Image,
  Layout,
  Star,
  Grid3x3,
  Type,
  List,
  Activity,
  Globe,
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  Info,
  CreditCard,
  FileText,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Header } from '../components/header';
import { getCurrentUser } from '../lib/auth';

type SettingsTab = 'general' | 'homepage' | 'users' | 'database' | 'sms';

const APP_VERSION = '2.35'; // Format: Version 235 = 2.35

export function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // Activity Log State
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  // Database Connection States
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'disconnected' | 'connected' | 'testing'>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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
      cancelText
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
  
  // General Settings States
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'Skyway Suites',
    companyLogo: '',
    companyPhone: '+254 700 123 456',
    companyEmail: 'info@skywaysuites.co.ke',
    companyWebsite: 'https://skywaysuites.co.ke',
    companyAddress: 'Nairobi, Kenya',
    currency: 'KSh'
  });

  // Home Page Settings States
  const [homePageSettings, setHomePageSettings] = useState({
    // Slideshow
    slides: [
      { id: '1', title: 'Welcome to Skyway Suites', subtitle: 'Find your perfect stay', image: '', order: 1 },
      { id: '2', title: 'Luxury Properties', subtitle: 'Premium experiences await', image: '', order: 2 },
      { id: '3', title: 'Book Your Stay', subtitle: 'Easy and secure booking', image: '', order: 3 }
    ],
    // Properties Section
    propertiesTitle: 'Featured Properties',
    propertiesSubtitle: 'Handpicked premium properties just for you',
    propertiesLayout: {
      columns: 3,
      rows: 2,
      maxProperties: 6
    },
    // Why Us Section
    whyUsTitle: 'Why Choose Skyway Suites',
    whyUsItems: [
      { id: '1', icon: 'shield', title: 'Verified Properties', description: 'All properties are verified and inspected', order: 1 },
      { id: '2', icon: 'clock', title: '24/7 Support', description: 'Round the clock customer service', order: 2 },
      { id: '3', icon: 'star', title: 'Best Prices', description: 'Competitive pricing guaranteed', order: 3 },
      { id: '4', icon: 'map', title: 'Prime Locations', description: 'Properties in the best areas', order: 4 },
      { id: '5', icon: 'heart', title: 'Quality Service', description: 'Exceptional hospitality standards', order: 5 },
      { id: '6', icon: 'check', title: 'Easy Booking', description: 'Simple and secure reservations', order: 6 }
    ],
    // Footer
    footer: {
      aboutText: 'Skyway Suites is your premier destination for luxury property rentals in Kenya. We offer handpicked, verified properties for your perfect stay.',
      contactEmail: 'info@skywaysuites.co.ke',
      contactPhone: '+254 700 123 456',
      contactAddress: 'Nairobi, Kenya',
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      },
      copyrightText: '© 2026 Skyway Suites. All rights reserved.'
    }
  });

  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingWhyUsItem, setEditingWhyUsItem] = useState<any>(null);
  const [showWhyUsModal, setShowWhyUsModal] = useState(false);

  // Users States
  const [users, setUsers] = useState<any[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showManageRolesModal, setShowManageRolesModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Customer'
  });
  const [editingUser, setEditingUser] = useState<any>(null);

  // Database Settings States
  const [dbSettings, setDbSettings] = useState({
    dbType: 'local',
    remoteProvider: 'supabase',
    supabase: {
      url: '',
      anonKey: '',
      serviceRoleKey: ''
    },
    cpanel: {
      host: '',
      database: '',
      username: '',
      password: '',
      port: '3306'
    },
    autoBackup: true,
    backupInterval: '24'
  });

  // SMS Settings States
  const [smsProvider, setSmsProvider] = useState('africastalking');
  const [africastalkingSettings, setAfricastalkingSettings] = useState({
    apiKey: '',
    username: '',
    shortcode: ''
  });
  const [twilioSettings, setTwilioSettings] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [defaultMessages, setDefaultMessages] = useState({
    bookingMadeAdmin: 'New booking made! Visit system to approve and confirm payment.',
    bookingApprovedCustomer: 'Booking approved! We will call you if more information is needed.',
    customMessage: ''
  });
  const [messageRecipients, setMessageRecipients] = useState('everyone');
  const [customMessage, setCustomMessage] = useState('');

  // Load settings from localStorage
  useEffect(() => {
    const savedGeneralSettings = localStorage.getItem('skyway_general_settings');
    if (savedGeneralSettings) {
      setGeneralSettings(JSON.parse(savedGeneralSettings));
    }

    const savedHomePageSettings = localStorage.getItem('skyway_homepage_settings');
    if (savedHomePageSettings) {
      setHomePageSettings(JSON.parse(savedHomePageSettings));
    }

    const savedUsers = localStorage.getItem('skyway_customers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }

    const savedDbSettings = localStorage.getItem('skyway_db_settings');
    if (savedDbSettings) {
      setDbSettings(JSON.parse(savedDbSettings));
    }

    const savedSmsSettings = localStorage.getItem('skyway_sms_settings');
    if (savedSmsSettings) {
      const settings = JSON.parse(savedSmsSettings);
      setSmsProvider(settings.provider || 'africastalking');
      setAfricastalkingSettings(settings.africastalking || africastalkingSettings);
      setTwilioSettings(settings.twilio || twilioSettings);
      setDefaultMessages(settings.defaultMessages || defaultMessages);
    }

    // Load activity logs
    const savedLogs = localStorage.getItem('skyway_activity_logs');
    if (savedLogs) {
      setActivityLogs(JSON.parse(savedLogs));
    }
  }, []);

  // Log Activity
  const logActivity = (action: string, details: string) => {
    const newLog = {
      id: Date.now().toString(),
      user: currentUser?.name || 'System',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100); // Keep last 100 logs
    setActivityLogs(updatedLogs);
    localStorage.setItem('skyway_activity_logs', JSON.stringify(updatedLogs));
  };

  // Save General Settings
  const handleSaveGeneralSettings = () => {
    localStorage.setItem('skyway_general_settings', JSON.stringify(generalSettings));
    logActivity('Settings Updated', 'General settings saved');
    showModal('success', 'Settings Saved', 'General settings saved successfully!');
  };

  // Test Database Connection
  const handleTestConnection = async () => {
    setDbConnectionStatus('testing');
    setConnectionError(null);
    
    try {
      // Simulate connection test
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Validate credentials are filled
          if (dbSettings.remoteProvider === 'supabase') {
            if (!dbSettings.supabase.url || !dbSettings.supabase.anonKey) {
              reject(new Error('Supabase URL and Anon Key are required'));
              return;
            }
          } else if (dbSettings.remoteProvider === 'cpanel') {
            if (!dbSettings.cpanel.host || !dbSettings.cpanel.database || !dbSettings.cpanel.username) {
              reject(new Error('Host, Database, and Username are required'));
              return;
            }
          }
          
          // Simulate successful connection (in real app, this would make actual API call)
          resolve(true);
        }, 2000);
      });
      
      setDbConnectionStatus('connected');
      logActivity('Database Connected', `Successfully connected to ${dbSettings.remoteProvider}`);
    } catch (error: any) {
      setDbConnectionStatus('disconnected');
      setConnectionError(error.message || 'Failed to connect to database');
      setShowErrorPopup(true);
      logActivity('Database Connection Failed', error.message);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setShowErrorPopup(false);
      }, 5000);
    }
  };

  // Disconnect Database
  const handleDisconnect = () => {
    setDbConnectionStatus('disconnected');
    setConnectionError(null);
    logActivity('Database Disconnected', `Disconnected from ${dbSettings.remoteProvider}`);
  };

  // Save Home Page Settings
  const handleSaveHomePageSettings = () => {
    localStorage.setItem('skyway_homepage_settings', JSON.stringify(homePageSettings));
    logActivity('Settings Updated', 'Home page settings saved');
    showModal('success', 'Settings Saved', 'Home page settings saved successfully!');
  };

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGeneralSettings({
          ...generalSettings,
          companyLogo: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Slide Management
  const handleAddSlide = () => {
    setEditingSlide(null);
    setShowSlideModal(true);
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setShowSlideModal(true);
  };

  const handleSaveSlide = (slideData: any) => {
    if (editingSlide) {
      // Update existing slide
      setHomePageSettings({
        ...homePageSettings,
        slides: homePageSettings.slides.map(s => s.id === editingSlide.id ? { ...s, ...slideData } : s)
      });
    } else {
      // Add new slide
      const newSlide = {
        id: Date.now().toString(),
        ...slideData,
        order: homePageSettings.slides.length + 1
      };
      setHomePageSettings({
        ...homePageSettings,
        slides: [...homePageSettings.slides, newSlide]
      });
    }
    setShowSlideModal(false);
  };

  const handleDeleteSlide = (slideId: string) => {
    const slide = homePageSettings.slides.find(s => s.id === slideId);
    showModal(
      'confirm',
      'Delete Slide',
      `Are you sure you want to delete "${slide?.title || 'this slide'}"?`,
      () => {
        setHomePageSettings({
          ...homePageSettings,
          slides: homePageSettings.slides.filter(s => s.id !== slideId)
        });
        showModal('success', 'Slide Deleted', 'Slide has been deleted successfully!');
      },
      'Delete',
      'Cancel'
    );
  };

  // Why Us Management
  const handleEditWhyUsItem = (item: any) => {
    setEditingWhyUsItem(item);
    setShowWhyUsModal(true);
  };

  const handleSaveWhyUsItem = (itemData: any) => {
    setHomePageSettings({
      ...homePageSettings,
      whyUsItems: homePageSettings.whyUsItems.map(item => 
        item.id === editingWhyUsItem.id ? { ...item, ...itemData } : item
      )
    });
    setShowWhyUsModal(false);
  };

  // Add User
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const user = {
      id: Date.now().toString(),
      ...newUser,
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, user];
    localStorage.setItem('skyway_customers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowAddUserModal(false);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Customer'
    });
    showModal('success', 'User Added', 'User added successfully!');
  };

  // Edit User
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role || 'Customer'
    });
    setShowAddUserModal(true);
  };

  // Update User
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUsers = users.map(u =>
      u.id === editingUser.id
        ? {
            ...u,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            ...(newUser.password ? { password: newUser.password } : {})
          }
        : u
    );
    localStorage.setItem('skyway_customers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setShowAddUserModal(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'Customer'
    });
    showModal('success', 'User Updated', 'User updated successfully!');
  };

  // Update User Role
  const handleUpdateUserRole = (userId: string, newRole: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    localStorage.setItem('skyway_customers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showModal(
      'confirm',
      'Delete User',
      `Are you sure you want to delete ${user?.name || 'this user'}? This action cannot be undone.`,
      () => {
        const updatedUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('skyway_customers', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        showModal('success', 'User Deleted', 'User has been deleted successfully!');
      },
      'Delete',
      'Cancel'
    );
  };

  // Database Settings
  const handleSaveDbSettings = () => {
    localStorage.setItem('skyway_db_settings', JSON.stringify(dbSettings));
    logActivity('Settings Updated', 'Database settings saved');
    showModal('success', 'Settings Saved', 'Database settings saved successfully!');
  };

  // Backup Database
  const handleBackupDatabase = (format: 'json' | 'sql') => {
    const data = {
      properties: JSON.parse(localStorage.getItem('skyway_properties') || '[]'),
      bookings: JSON.parse(localStorage.getItem('skyway_bookings') || '[]'),
      customers: JSON.parse(localStorage.getItem('skyway_customers') || '[]'),
      categories: JSON.parse(localStorage.getItem('skyway_categories') || '[]'),
      features: JSON.parse(localStorage.getItem('skyway_features') || '[]'),
      settings: {
        general: generalSettings,
        homepage: homePageSettings,
        db: dbSettings,
        sms: {
          provider: smsProvider,
          africastalking: africastalkingSettings,
          twilio: twilioSettings,
          defaultMessages: defaultMessages
        }
      },
      timestamp: new Date().toISOString()
    };

    let content: string;
    let filename: string;
    let type: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `skyway-backup-${Date.now()}.json`;
      type = 'application/json';
    } else {
      const sqlStatements = [];
      sqlStatements.push('-- Skyway Suites Database Backup');
      sqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
      sqlStatements.push('');
      
      sqlStatements.push('-- PROPERTIES');
      data.properties.forEach((prop: any) => {
        sqlStatements.push(`INSERT INTO properties VALUES ('${prop.id}', '${prop.name}', '${prop.location}', ${prop.price}, '${prop.category}', '${prop.createdAt}');`);
      });
      
      sqlStatements.push('');
      sqlStatements.push('-- BOOKINGS');
      data.bookings.forEach((booking: any) => {
        sqlStatements.push(`INSERT INTO bookings VALUES ('${booking.id}', '${booking.propertyId}', '${booking.customerName}', '${booking.checkIn}', '${booking.checkOut}', ${booking.totalAmount}, '${booking.status}');`);
      });
      
      content = sqlStatements.join('\n');
      filename = `skyway-backup-${Date.now()}.sql`;
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore Database
  const handleRestoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        showModal(
          'confirm',
          'Restore Database',
          'This will overwrite all current data including properties, bookings, customers, and settings. Are you sure you want to continue?',
          () => {
            localStorage.setItem('skyway_properties', JSON.stringify(data.properties || []));
            localStorage.setItem('skyway_bookings', JSON.stringify(data.bookings || []));
            localStorage.setItem('skyway_customers', JSON.stringify(data.customers || []));
            localStorage.setItem('skyway_categories', JSON.stringify(data.categories || []));
            localStorage.setItem('skyway_features', JSON.stringify(data.features || []));
            
            if (data.settings) {
              if (data.settings.general) {
                localStorage.setItem('skyway_general_settings', JSON.stringify(data.settings.general));
                setGeneralSettings(data.settings.general);
              }
              if (data.settings.homepage) {
                localStorage.setItem('skyway_homepage_settings', JSON.stringify(data.settings.homepage));
                setHomePageSettings(data.settings.homepage);
              }
              if (data.settings.db) {
                localStorage.setItem('skyway_db_settings', JSON.stringify(data.settings.db));
                setDbSettings(data.settings.db);
              }
              if (data.settings.sms) {
                localStorage.setItem('skyway_sms_settings', JSON.stringify(data.settings.sms));
              }
            }
            
            showModal('success', 'Restore Complete', 'Database restored successfully! The page will refresh.', () => {
              window.location.reload();
            });
          },
          'Restore',
          'Cancel'
        );
      } catch (error) {
        showModal('error', 'Restore Failed', 'Error restoring database. Please check the file format.');
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  // Copy Database Query
  const handleCopyDatabaseQuery = () => {
    const data = {
      properties: JSON.parse(localStorage.getItem('skyway_properties') || '[]'),
      bookings: JSON.parse(localStorage.getItem('skyway_bookings') || '[]'),
      customers: JSON.parse(localStorage.getItem('skyway_customers') || '[]')
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    showModal('success', 'Copied', 'Database query copied to clipboard!');
  };

  // Save SMS Settings
  const handleSaveSmsSettings = () => {
    const smsSettings = {
      provider: smsProvider,
      africastalking: africastalkingSettings,
      twilio: twilioSettings,
      defaultMessages: defaultMessages
    };
    localStorage.setItem('skyway_sms_settings', JSON.stringify(smsSettings));
    logActivity('Settings Updated', 'SMS settings saved');
    showModal('success', 'Settings Saved', 'SMS settings saved successfully!');
  };

  // Send Custom Message
  const handleSendCustomMessage = () => {
    if (!customMessage.trim()) {
      showModal('error', 'Message Required', 'Please enter a message');
      return;
    }

    console.log('Sending message to:', messageRecipients);
    console.log('Message:', customMessage);
    
    let recipientCount = 0;
    if (messageRecipients === 'everyone') {
      recipientCount = users.length;
    } else if (messageRecipients === 'customers') {
      recipientCount = users.filter(u => u.role === 'Customer').length;
    } else if (messageRecipients === 'staff') {
      recipientCount = users.filter(u => u.role === 'Admin' || u.role === 'Manager').length;
    }

    showModal('info', 'Message Sent', `Message would be sent to ${recipientCount} recipients via ${smsProvider}`);
    setCustomMessage('');
  };

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Building2, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { id: 'homepage', label: 'Home Page', icon: Home, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { id: 'users', label: 'User Management', icon: Users, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { id: 'database', label: 'Database', icon: Database, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { id: 'sms', label: 'SMS Integration', icon: MessageSquare, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' }
  ];

  const currentTabData = tabs.find(t => t.id === activeTab);

  // Stats calculation
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
    customers: users.filter(u => u.role === 'Customer').length,
    dbType: dbSettings.dbType,
    smsProvider: smsProvider,
    totalSlides: homePageSettings.slides.length
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex">
      {/* Dashboard Sidebar - Import menu structure */}
      <aside className="bg-[#36454F] border-r border-gray-200 w-64">
        <div className="sticky top-0 h-screen flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex items-center gap-3 text-white" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
              <div className="bg-[#6B7F39] rounded-lg p-2">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Skyway Suites</h2>
                <p className="text-xs text-gray-300">Admin Dashboard</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Properties</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-medium">Bookings</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Customers</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Payments</span>
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">Menu Pages</span>
            </button>
            <button
              onClick={() => navigate('/admin/activity-log')}
              className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a3440] transition"
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium">Activity Log</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#6B7F39] text-white transition"
            >
              <SettingsIcon className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </nav>

          {/* Version Info at Bottom */}
          <div className="p-4 border-t border-gray-600">
            <div className="bg-gradient-to-br from-[#2a3640] to-[#1f2a33] rounded-xl p-3 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Info className="w-3 h-3 text-white/70" />
                <p className="text-xs text-white/70 font-medium">Version</p>
              </div>
              <p className="text-xl font-bold text-white">{APP_VERSION}</p>
              <p className="text-xs text-white/50 mt-1">Skyway Suites</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#36454F] text-white shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-xs text-gray-300">Configure your platform</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{currentUser?.name}</p>
                  <p className="text-xs text-gray-300">{currentUser?.email}</p>
                </div>
                <Button
                  onClick={() => navigate('/admin/dashboard')}
                  variant="outline"
                  className="border-white text-black bg-white hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-[#FAF4EC] via-[#f5ede3] to-[#ebe2d5]">

        {/* Creative Page Header - Reduced by 30% */}
        <div className="mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6B7F39]/10 via-[#36454F]/10 to-[#6B7F39]/10 rounded-3xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#6B7F39]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#36454F]/5 rounded-full blur-3xl"></div>
          
          <div className="relative p-6 md:p-7 rounded-3xl border-2 border-[#6B7F39]/20 bg-white/70 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6B7F39] to-[#36454F] flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                <SettingsIcon className="w-7 h-7 text-white animate-spin-slow" style={{ animationDuration: '8s' }} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#36454F] to-[#6B7F39]">
                  Settings Center
                </h1>
                <p className="text-gray-600 text-base">Configure and manage your Skyway Suites platform</p>
              </div>
              
              {/* Quick Stats */}
              <div className="flex gap-3">
                <div className="bg-gradient-to-br from-[#6B7F39] to-[#5a6930] rounded-2xl p-3 text-white shadow-lg">
                  <Users className="w-5 h-5 mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs opacity-80">Total Users</p>
                </div>
                <div className="bg-gradient-to-br from-[#36454F] to-[#2a3640] rounded-2xl p-3 text-white shadow-lg">
                  <CheckCircle2 className="w-5 h-5 mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{dbSettings.dbType === 'local' ? 'Local' : 'Remote'}</p>
                  <p className="text-xs opacity-80">Database</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Creative Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-100 overflow-hidden sticky top-4">
              {/* Sidebar Header */}
              <div className="p-6 bg-gradient-to-br from-[#6B7F39] to-[#36454F] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative">
                  <h3 className="text-white font-bold text-xl mb-1">Navigation</h3>
                  <p className="text-white/70 text-sm">Select a module</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={`w-full group relative overflow-hidden transition-all duration-300 ${
                        isActive ? 'transform scale-105' : ''
                      }`}
                    >
                      <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl font-medium transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : `${tab.bgColor} ${tab.textColor} hover:shadow-md`
                      }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        } transition-all duration-300`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.textColor}`} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                            {tab.label}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>

            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Content Header */}
            <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-r ${currentTabData?.color} text-white shadow-lg`}>
              <div className="flex items-center gap-4">
                {currentTabData && (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <currentTabData.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{currentTabData.label}</h2>
                      <p className="text-white/80 text-sm">
                        {activeTab === 'general' && 'Configure your company information and preferences'}
                        {activeTab === 'homepage' && `Managing ${stats.totalSlides} slides and home page content`}
                        {activeTab === 'users' && `Managing ${stats.totalUsers} users across the platform`}
                        {activeTab === 'database' && `Connected to ${dbSettings.dbType} storage`}
                        {activeTab === 'sms' && `Using ${smsProvider} for SMS communications`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* General Settings Tab */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* Company Details Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900">Company Details</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Company Logo */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-dashed border-gray-300">
                        <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          Company Logo
                        </label>
                        <div className="flex items-center gap-6">
                          {generalSettings.companyLogo ? (
                            <div className="relative group">
                              <img
                                src={generalSettings.companyLogo}
                                alt="Company Logo"
                                className="w-24 h-24 object-contain border-2 border-gray-300 rounded-xl bg-white shadow-md"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Edit className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center bg-white">
                              <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logo-upload"
                            />
                            <label htmlFor="logo-upload">
                              <Button type="button" variant="outline" className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50" asChild>
                                <span className="flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  {generalSettings.companyLogo ? 'Change Logo' : 'Upload Logo'}
                                </span>
                              </Button>
                            </label>
                            <p className="text-xs text-gray-500 mt-2">PNG, JPG or GIF (max. 2MB)</p>
                          </div>
                        </div>
                      </div>

                      {/* Company Info Grid - 2 Columns */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Company Name */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Building2 className="w-4 h-4 text-blue-600" />
                            Company Name
                          </label>
                          <Input
                            value={generalSettings.companyName}
                            onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                            placeholder="Enter company name"
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Phone className="w-4 h-4 text-green-600" />
                            Phone Number
                          </label>
                          <Input
                            value={generalSettings.companyPhone}
                            onChange={(e) => setGeneralSettings({...generalSettings, companyPhone: e.target.value})}
                            placeholder="+254 700 123 456"
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Mail className="w-4 h-4 text-red-600" />
                            Email Address
                          </label>
                          <Input
                            type="email"
                            value={generalSettings.companyEmail}
                            onChange={(e) => setGeneralSettings({...generalSettings, companyEmail: e.target.value})}
                            placeholder="info@skywaysuites.co.ke"
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                          />
                        </div>

                        {/* Website */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Globe className="w-4 h-4 text-indigo-600" />
                            Website
                          </label>
                          <Input
                            type="url"
                            value={generalSettings.companyWebsite}
                            onChange={(e) => setGeneralSettings({...generalSettings, companyWebsite: e.target.value})}
                            placeholder="https://skywaysuites.co.ke"
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                          />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            Address
                          </label>
                          <Input
                            value={generalSettings.companyAddress}
                            onChange={(e) => setGeneralSettings({...generalSettings, companyAddress: e.target.value})}
                            placeholder="Nairobi, Kenya"
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12"
                          />
                        </div>

                        {/* Currency */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <DollarSign className="w-4 h-4 text-yellow-600" />
                            Currency
                          </label>
                          <Select
                            value={generalSettings.currency}
                            onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                          >
                            <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="KSh">KSh (Kenyan Shilling)</SelectItem>
                              <SelectItem value="$">$ (US Dollar)</SelectItem>
                              <SelectItem value="€">€ (Euro)</SelectItem>
                              <SelectItem value="£">£ (British Pound)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t-2 border-gray-100">
                        <Button 
                          onClick={handleSaveGeneralSettings}
                          className="w-full md:w-auto bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Save General Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Home Page Settings Tab */}
              {activeTab === 'homepage' && (
                <div className="space-y-6">
                  {/* Slideshow Management */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-indigo-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                            <Image className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-indigo-900">Slideshow Management</h3>
                            <p className="text-sm text-indigo-700">{homePageSettings.slides.length} active slides</p>
                          </div>
                        </div>
                        <Button
                          onClick={handleAddSlide}
                          className="bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828]"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Slide
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      {homePageSettings.slides.map((slide, index) => (
                        <div
                          key={slide.id}
                          className="group bg-gradient-to-r from-[#FAF4EC] to-[#f5ede3] rounded-2xl p-5 border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-bold text-[#36454F] text-lg">{slide.title}</p>
                                <p className="text-gray-600 text-sm">{slide.subtitle}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSlide(slide)}
                                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteSlide(slide.id)}
                                className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Properties Section Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                          <Layout className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-green-900">Properties Section</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Titles */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Type className="w-4 h-4 text-green-600" />
                            Section Title
                          </label>
                          <Input
                            value={homePageSettings.propertiesTitle}
                            onChange={(e) => setHomePageSettings({...homePageSettings, propertiesTitle: e.target.value})}
                            placeholder="Featured Properties"
                            className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Type className="w-4 h-4 text-blue-600" />
                            Section Subtitle
                          </label>
                          <Input
                            value={homePageSettings.propertiesSubtitle}
                            onChange={(e) => setHomePageSettings({...homePageSettings, propertiesSubtitle: e.target.value})}
                            placeholder="Handpicked premium properties..."
                            className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12"
                          />
                        </div>
                      </div>

                      {/* Layout Settings */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <Grid3x3 className="w-5 h-5" />
                          Layout Configuration
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Columns</label>
                            <Select
                              value={homePageSettings.propertiesLayout.columns.toString()}
                              onValueChange={(value) => setHomePageSettings({
                                ...homePageSettings,
                                propertiesLayout: {...homePageSettings.propertiesLayout, columns: parseInt(value)}
                              })}
                            >
                              <SelectTrigger className="border-2 border-gray-200 rounded-xl h-12 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Column</SelectItem>
                                <SelectItem value="2">2 Columns</SelectItem>
                                <SelectItem value="3">3 Columns</SelectItem>
                                <SelectItem value="4">4 Columns</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Rows</label>
                            <Input
                              type="number"
                              min="1"
                              max="10"
                              value={homePageSettings.propertiesLayout.rows}
                              onChange={(e) => setHomePageSettings({
                                ...homePageSettings,
                                propertiesLayout: {...homePageSettings.propertiesLayout, rows: parseInt(e.target.value) || 1}
                              })}
                              className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700">Max Properties</label>
                            <Input
                              type="number"
                              min="1"
                              max="50"
                              value={homePageSettings.propertiesLayout.maxProperties}
                              onChange={(e) => setHomePageSettings({
                                ...homePageSettings,
                                propertiesLayout: {...homePageSettings.propertiesLayout, maxProperties: parseInt(e.target.value) || 1}
                              })}
                              className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Why Us Section */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-md">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-yellow-900">Why Us Section</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Section Title */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <Type className="w-4 h-4 text-yellow-600" />
                          Section Title
                        </label>
                        <Input
                          value={homePageSettings.whyUsTitle}
                          onChange={(e) => setHomePageSettings({...homePageSettings, whyUsTitle: e.target.value})}
                          placeholder="Why Choose Skyway Suites"
                          className="border-2 border-gray-200 focus:border-yellow-500 rounded-xl h-12"
                        />
                      </div>

                      {/* Why Us Items */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {homePageSettings.whyUsItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-2 border-yellow-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 text-white font-bold flex items-center justify-center shadow-md">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-800">{item.title}</p>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditWhyUsItem(item)}
                                className="text-blue-600 hover:bg-blue-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-gray-700 to-gray-800 border-b-2 border-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-md">
                          <List className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Footer Settings</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* About Text */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">About Text</label>
                        <Textarea
                          value={homePageSettings.footer.aboutText}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, aboutText: e.target.value}
                          })}
                          rows={3}
                          className="border-2 border-gray-200 focus:border-gray-500 rounded-xl"
                        />
                      </div>

                      {/* Contact Info - 2 Columns */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Mail className="w-4 h-4 text-red-600" />
                            Footer Email
                          </label>
                          <Input
                            value={homePageSettings.footer.contactEmail}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {...homePageSettings.footer, contactEmail: e.target.value}
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                            <Phone className="w-4 h-4 text-green-600" />
                            Footer Phone
                          </label>
                          <Input
                            value={homePageSettings.footer.contactPhone}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {...homePageSettings.footer, contactPhone: e.target.value}
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12"
                          />
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          Footer Address
                        </label>
                        <Input
                          value={homePageSettings.footer.contactAddress}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, contactAddress: e.target.value}
                          })}
                          className="border-2 border-gray-200 rounded-xl h-12"
                        />
                      </div>

                      {/* Social Links - 2 Columns */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                        <h4 className="font-bold text-blue-900 mb-4">Social Media Links</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Facebook URL"
                            value={homePageSettings.footer.socialLinks.facebook}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, facebook: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                          />
                          <Input
                            placeholder="Twitter URL"
                            value={homePageSettings.footer.socialLinks.twitter}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, twitter: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                          />
                          <Input
                            placeholder="Instagram URL"
                            value={homePageSettings.footer.socialLinks.instagram}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, instagram: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                          />
                          <Input
                            placeholder="LinkedIn URL"
                            value={homePageSettings.footer.socialLinks.linkedin}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, linkedin: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 rounded-xl h-12 bg-white"
                          />
                        </div>
                      </div>

                      {/* Copyright Text */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Copyright Text</label>
                        <Input
                          value={homePageSettings.footer.copyrightText}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, copyrightText: e.target.value}
                          })}
                          className="border-2 border-gray-200 rounded-xl h-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save All Home Page Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 p-6">
                    <Button 
                      onClick={handleSaveHomePageSettings}
                      className="w-full bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] text-white font-bold py-6 px-8 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg"
                    >
                      <Save className="w-6 h-6 mr-3" />
                      Save All Home Page Settings
                    </Button>
                  </div>
                </div>
              )}

              {/* Users Settings Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-b-2 border-green-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-green-900">User Management</h3>
                            <p className="text-sm text-green-700">{users.length} registered users</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              setEditingUser(null);
                              setNewUser({
                                name: '',
                                email: '',
                                phone: '',
                                password: '',
                                role: 'Customer'
                              });
                              setShowAddUserModal(true);
                            }}
                            className="bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] shadow-md"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add User
                          </Button>
                          <Button
                            onClick={() => setShowManageRolesModal(true)}
                            variant="outline"
                            className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Manage Roles
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Users List */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {users.length > 0 ? (
                          users.map((user, index) => (
                            <div
                              key={user.id}
                              className="group relative bg-gradient-to-r from-[#FAF4EC] to-[#f5ede3] rounded-2xl p-5 border-2 border-gray-200 hover:border-[#6B7F39] hover:shadow-lg transition-all duration-300"
                            >
                              {/* User Number Badge */}
                              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-[#6B7F39] to-[#36454F] text-white text-sm font-bold flex items-center justify-center shadow-md">
                                {index + 1}
                              </div>

                              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                                <div className="flex-1 flex items-start gap-4">
                                  {/* Avatar */}
                                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6B7F39] to-[#36454F] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  
                                  {/* User Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#36454F] text-lg mb-1">{user.name}</p>
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        <span className="truncate">{user.email}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 text-green-500" />
                                        <span>{user.phone}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 flex-wrap">
                                  {/* Role Selector */}
                                  <Select
                                    value={user.role || 'Customer'}
                                    onValueChange={(value) => handleUpdateUserRole(user.id, value)}
                                  >
                                    <SelectTrigger className="w-40 border-2 border-gray-300 rounded-xl h-11">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Admin">
                                        <span className="flex items-center gap-2">
                                          <Shield className="w-4 h-4 text-red-500" />
                                          Admin
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="Manager">
                                        <span className="flex items-center gap-2">
                                          <UserCog className="w-4 h-4 text-blue-500" />
                                          Manager
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="Customer">
                                        <span className="flex items-center gap-2">
                                          <Users className="w-4 h-4 text-green-500" />
                                          Customer
                                        </span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>

                                  {/* Edit Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                    className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl h-11 px-4"
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>

                                  {/* Delete Button */}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl h-11 px-4"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
                              <Users className="w-10 h-10 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-lg font-medium">No users yet</p>
                            <p className="text-gray-400 text-sm mt-2">Click "Add User" to create your first user</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Database Settings Tab - Same as before, keeping it intact */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  {/* Backup and Restore Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-900">Backup & Restore</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Create Backup */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                          <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                            <Download className="w-5 h-5" />
                            Create Backup
                          </h4>
                          <div className="space-y-3">
                            <Button
                              onClick={() => handleBackupDatabase('json')}
                              className="w-full bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] rounded-xl h-12 shadow-md"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download JSON Backup
                            </Button>
                            <Button
                              onClick={() => handleBackupDatabase('sql')}
                              variant="outline"
                              className="w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl h-12"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download SQL Backup
                            </Button>
                          </div>
                          <p className="text-xs text-green-700 mt-4">
                            Export all your data including properties, bookings, and customers
                          </p>
                        </div>

                        {/* Restore Database */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                          <h4 className="font-bold text-orange-900 mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Restore Database
                          </h4>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleRestoreDatabase}
                            className="hidden"
                            id="restore-upload"
                          />
                          <label htmlFor="restore-upload">
                            <Button 
                              variant="outline" 
                              className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl h-12" 
                              asChild
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Upload className="w-4 h-4" />
                                Restore from JSON
                              </span>
                            </Button>
                          </label>
                          <p className="text-xs text-orange-700 mt-4">
                            ⚠️ Warning: This will overwrite all current data
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Database Connection Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-indigo-50 to-indigo-100 border-b-2 border-indigo-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
                          <Server className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-indigo-900">Database Connection</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Database Type */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Database Type
                        </label>
                        <Select
                          value={dbSettings.dbType}
                          onValueChange={(value) => setDbSettings({...dbSettings, dbType: value})}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">
                              <span className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-blue-500" />
                                Local Storage
                              </span>
                            </SelectItem>
                            <SelectItem value="remote">
                              <span className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-green-500" />
                                Remote Database
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remote Database Settings */}
                      {dbSettings.dbType === 'remote' && (
                        <div className="space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Remote Database Provider
                            </label>
                            <Select
                              value={dbSettings.remoteProvider}
                              onValueChange={(value) => setDbSettings({...dbSettings, remoteProvider: value})}
                            >
                              <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl h-12 bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="supabase">
                                  <span className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-green-600" />
                                    Supabase
                                  </span>
                                </SelectItem>
                                <SelectItem value="cpanel">
                                  <span className="flex items-center gap-2">
                                    <Server className="w-4 h-4 text-orange-600" />
                                    cPanel
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Supabase Settings */}
                          {dbSettings.remoteProvider === 'supabase' && (
                            <div className="space-y-4 bg-white rounded-xl p-5 border-2 border-green-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                  <Database className="w-4 h-4 text-green-600" />
                                </div>
                                <h4 className="font-bold text-green-900">Supabase Configuration</h4>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                  <Server className="w-4 h-4 text-green-600" />
                                  Supabase URL
                                </label>
                                <Input
                                  value={dbSettings.supabase.url}
                                  onChange={(e) => setDbSettings({...dbSettings, supabase: {...dbSettings.supabase, url: e.target.value}})}
                                  placeholder="https://your-project.supabase.co"
                                  className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                  <Shield className="w-4 h-4 text-blue-600" />
                                  Anon Key
                                </label>
                                <Input
                                  type="password"
                                  value={dbSettings.supabase.anonKey}
                                  onChange={(e) => setDbSettings({...dbSettings, supabase: {...dbSettings.supabase, anonKey: e.target.value}})}
                                  placeholder="Enter Anon Key"
                                  className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                  <Shield className="w-4 h-4 text-red-600" />
                                  Service Role Key
                                </label>
                                <Input
                                  type="password"
                                  value={dbSettings.supabase.serviceRoleKey}
                                  onChange={(e) => setDbSettings({...dbSettings, supabase: {...dbSettings.supabase, serviceRoleKey: e.target.value}})}
                                  placeholder="Enter Service Role Key"
                                  className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12"
                                />
                              </div>
                            </div>
                          )}

                          {/* cPanel Settings */}
                          {dbSettings.remoteProvider === 'cpanel' && (
                            <div className="space-y-4 bg-white rounded-xl p-5 border-2 border-orange-200">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                  <Server className="w-4 h-4 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-orange-900">cPanel Configuration</h4>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Server className="w-4 h-4 text-orange-600" />
                                    Host
                                  </label>
                                  <Input
                                    value={dbSettings.cpanel.host}
                                    onChange={(e) => setDbSettings({...dbSettings, cpanel: {...dbSettings.cpanel, host: e.target.value}})}
                                    placeholder="localhost"
                                    className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Database className="w-4 h-4 text-purple-600" />
                                    Database
                                  </label>
                                  <Input
                                    value={dbSettings.cpanel.database}
                                    onChange={(e) => setDbSettings({...dbSettings, cpanel: {...dbSettings.cpanel, database: e.target.value}})}
                                    placeholder="database_name"
                                    className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <UserCog className="w-4 h-4 text-blue-600" />
                                    Username
                                  </label>
                                  <Input
                                    value={dbSettings.cpanel.username}
                                    onChange={(e) => setDbSettings({...dbSettings, cpanel: {...dbSettings.cpanel, username: e.target.value}})}
                                    placeholder="db_user"
                                    className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Shield className="w-4 h-4 text-red-600" />
                                    Password
                                  </label>
                                  <Input
                                    type="password"
                                    value={dbSettings.cpanel.password}
                                    onChange={(e) => setDbSettings({...dbSettings, cpanel: {...dbSettings.cpanel, password: e.target.value}})}
                                    placeholder="••••••••"
                                    className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                  <Server className="w-4 h-4 text-indigo-600" />
                                  Port
                                </label>
                                <Input
                                  type="number"
                                  value={dbSettings.cpanel.port}
                                  onChange={(e) => setDbSettings({...dbSettings, cpanel: {...dbSettings.cpanel, port: e.target.value}})}
                                  placeholder="3306"
                                  className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12"
                                />
                              </div>
                            </div>
                          )}

                          {/* Connection Test Section */}
                          {dbSettings.dbType === 'remote' && (
                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-200">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                                    <Wifi className="w-5 h-5 text-gray-600" />
                                    Connection Status
                                  </h4>
                                  <p className="text-sm text-gray-600">Test your remote database connection</p>
                                </div>
                                
                                {/* Status Badge */}
                                <div className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 ${
                                  dbConnectionStatus === 'connected' ? 'bg-green-100 text-green-700 border-2 border-green-300' :
                                  dbConnectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300' :
                                  'bg-red-100 text-red-700 border-2 border-red-300'
                                }`}>
                                  {dbConnectionStatus === 'connected' && <CheckCircle2 className="w-4 h-4" />}
                                  {dbConnectionStatus === 'testing' && <Loader2 className="w-4 h-4 animate-spin" />}
                                  {dbConnectionStatus === 'disconnected' && <WifiOff className="w-4 h-4" />}
                                  {dbConnectionStatus === 'connected' ? 'Connected' : 
                                   dbConnectionStatus === 'testing' ? 'Testing...' : 'Disconnected'}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                {dbConnectionStatus === 'connected' ? (
                                  <Button
                                    onClick={handleDisconnect}
                                    variant="outline"
                                    className="flex-1 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-xl h-12 font-semibold"
                                  >
                                    <WifiOff className="w-4 h-4 mr-2" />
                                    Disconnect
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={handleTestConnection}
                                    disabled={dbConnectionStatus === 'testing'}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-12 font-semibold disabled:opacity-50"
                                  >
                                    {dbConnectionStatus === 'testing' ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Testing Connection...
                                      </>
                                    ) : (
                                      <>
                                        <Wifi className="w-4 h-4 mr-2" />
                                        Test Connection
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Auto Backup Settings */}
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-2 border-yellow-200">
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            id="autoBackup"
                            checked={dbSettings.autoBackup}
                            onChange={(e) => setDbSettings({...dbSettings, autoBackup: e.target.checked})}
                            className="w-5 h-5 text-[#6B7F39] focus:ring-[#6B7F39] rounded border-2 border-gray-300"
                          />
                          <label htmlFor="autoBackup" className="text-sm font-semibold text-gray-700 cursor-pointer">
                            Enable automatic backups
                          </label>
                        </div>

                        {dbSettings.autoBackup && (
                          <div className="space-y-2 pl-8">
                            <label className="block text-sm font-semibold text-gray-700">
                              Backup Interval (hours)
                            </label>
                            <Input
                              type="number"
                              value={dbSettings.backupInterval}
                              onChange={(e) => setDbSettings({...dbSettings, backupInterval: e.target.value})}
                              placeholder="24"
                              className="border-2 border-gray-200 focus:border-yellow-500 rounded-xl h-12 bg-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Save Button */}
                      <div className="pt-4 border-t-2 border-gray-100">
                        <Button 
                          onClick={handleSaveDbSettings}
                          className="w-full md:w-auto bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Save Database Settings
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Database Query Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-cyan-50 to-cyan-100 border-b-2 border-cyan-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-cyan-900">Database Query</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-gray-600 mb-4">
                        Copy the current database data to clipboard in JSON format for inspection or debugging
                      </p>
                      <Button
                        onClick={handleCopyDatabaseQuery}
                        variant="outline"
                        className="border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 rounded-xl h-12"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Database Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Integration Tab - Keeping as before */}
              {activeTab === 'sms' && (
                <div className="space-y-6">
                  {/* SMS Provider Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-b-2 border-orange-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-orange-900">SMS Provider</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Provider Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Select Provider
                        </label>
                        <Select
                          value={smsProvider}
                          onValueChange={setSmsProvider}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-orange-500 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="africastalking">Africa's Talking</SelectItem>
                            <SelectItem value="twilio">Twilio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Africa's Talking Settings */}
                      {smsProvider === 'africastalking' && (
                        <div className="space-y-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-bold text-green-900">Africa's Talking Settings</h4>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Shield className="w-4 h-4 text-green-600" />
                                API Key
                              </label>
                              <Input
                                type="password"
                                value={africastalkingSettings.apiKey}
                                onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, apiKey: e.target.value})}
                                placeholder="Enter Africa's Talking API Key"
                                className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <UserCog className="w-4 h-4 text-blue-600" />
                                Username
                              </label>
                              <Input
                                value={africastalkingSettings.username}
                                onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, username: e.target.value})}
                                placeholder="Enter username"
                                className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Phone className="w-4 h-4 text-purple-600" />
                                Shortcode
                              </label>
                              <Input
                                value={africastalkingSettings.shortcode}
                                onChange={(e) => setAfricastalkingSettings({...africastalkingSettings, shortcode: e.target.value})}
                                placeholder="Enter shortcode"
                                className="border-2 border-gray-200 focus:border-green-500 rounded-xl h-12 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Twilio Settings */}
                      {smsProvider === 'twilio' && (
                        <div className="space-y-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border-2 border-red-200">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-bold text-red-900">Twilio Settings</h4>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Shield className="w-4 h-4 text-red-600" />
                                Account SID
                              </label>
                              <Input
                                value={twilioSettings.accountSid}
                                onChange={(e) => setTwilioSettings({...twilioSettings, accountSid: e.target.value})}
                                placeholder="Enter Twilio Account SID"
                                className="border-2 border-gray-200 focus:border-red-500 rounded-xl h-12 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Shield className="w-4 h-4 text-orange-600" />
                                Auth Token
                              </label>
                              <Input
                                type="password"
                                value={twilioSettings.authToken}
                                onChange={(e) => setTwilioSettings({...twilioSettings, authToken: e.target.value})}
                                placeholder="Enter Auth Token"
                                className="border-2 border-gray-200 focus:border-red-500 rounded-xl h-12 bg-white"
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Phone className="w-4 h-4 text-green-600" />
                                Phone Number
                              </label>
                              <Input
                                value={twilioSettings.phoneNumber}
                                onChange={(e) => setTwilioSettings({...twilioSettings, phoneNumber: e.target.value})}
                                placeholder="+1234567890"
                                className="border-2 border-gray-200 focus:border-red-500 rounded-xl h-12 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Default Messages Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                          <Edit className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-blue-900">Default Messages</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Booking Made Message */}
                      <div className="space-y-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-2 border-red-200">
                        <label className="flex items-center gap-2 text-sm font-semibold text-red-900">
                          <Shield className="w-4 h-4" />
                          Booking Made (Admin Notification)
                        </label>
                        <Textarea
                          value={defaultMessages.bookingMadeAdmin}
                          onChange={(e) => setDefaultMessages({...defaultMessages, bookingMadeAdmin: e.target.value})}
                          rows={3}
                          placeholder="Message sent to admin when a booking is made"
                          className="border-2 border-gray-200 focus:border-red-500 rounded-xl bg-white"
                        />
                        <p className="text-xs text-red-700 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          Sent to: Admin number in Company Details
                        </p>
                      </div>

                      {/* Booking Approved Message */}
                      <div className="space-y-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200">
                        <label className="flex items-center gap-2 text-sm font-semibold text-green-900">
                          <Users className="w-4 h-4" />
                          Booking Approved (Customer Notification)
                        </label>
                        <Textarea
                          value={defaultMessages.bookingApprovedCustomer}
                          onChange={(e) => setDefaultMessages({...defaultMessages, bookingApprovedCustomer: e.target.value})}
                          rows={3}
                          placeholder="Message sent to customer when booking is approved"
                          className="border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white"
                        />
                        <p className="text-xs text-green-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent to: Customer's phone number when admin approves booking
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Message Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-900">Send Custom Message</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Recipients */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Send To
                        </label>
                        <Select
                          value={messageRecipients}
                          onValueChange={setMessageRecipients}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-purple-500 rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-600" />
                                Everyone
                              </span>
                            </SelectItem>
                            <SelectItem value="customers">
                              <span className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-green-600" />
                                Customers Only
                              </span>
                            </SelectItem>
                            <SelectItem value="staff">
                              <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-red-600" />
                                Staff Only (Admin & Manager)
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Message
                        </label>
                        <Textarea
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          rows={5}
                          placeholder="Type your message here..."
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-2 border-gray-100">
                        <Button
                          onClick={handleSendCustomMessage}
                          className="flex-1 bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          onClick={handleSaveSmsSettings}
                          variant="outline"
                          className="flex-1 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold py-6 px-8 rounded-xl"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Save SMS Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Slide Modal */}
      {showSlideModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-200">
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-t-3xl">
              <h3 className="text-2xl font-bold text-white">
                {editingSlide ? 'Edit Slide' : 'Add New Slide'}
              </h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveSlide({
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                image: editingSlide?.image || ''
              });
            }} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Title *</label>
                <Input
                  name="title"
                  defaultValue={editingSlide?.title || ''}
                  required
                  placeholder="Enter slide title"
                  className="border-2 border-gray-200 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Subtitle *</label>
                <Input
                  name="subtitle"
                  defaultValue={editingSlide?.subtitle || ''}
                  required
                  placeholder="Enter slide subtitle"
                  className="border-2 border-gray-200 rounded-xl h-12"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-[#6B7F39] to-[#5a6930] py-6 rounded-xl">
                  Save Slide
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowSlideModal(false)} className="flex-1 py-6 rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Why Us Item Modal */}
      {showWhyUsModal && editingWhyUsItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-200">
            <div className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-3xl">
              <h3 className="text-2xl font-bold text-white">Edit Why Us Item</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleSaveWhyUsItem({
                title: formData.get('title'),
                description: formData.get('description')
              });
            }} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Title *</label>
                <Input
                  name="title"
                  defaultValue={editingWhyUsItem.title}
                  required
                  className="border-2 border-gray-200 rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Description *</label>
                <Textarea
                  name="description"
                  defaultValue={editingWhyUsItem.description}
                  required
                  rows={3}
                  className="border-2 border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-to-r from-[#6B7F39] to-[#5a6930] py-6 rounded-xl">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowWhyUsModal(false)} className="flex-1 py-6 rounded-xl">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gradient-to-r from-[#6B7F39] to-[#36454F] rounded-t-3xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                {editingUser ? (
                  <>
                    <Edit className="w-6 h-6" />
                    Edit User
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    Add New User
                  </>
                )}
              </h3>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <UserCog className="w-4 h-4 text-blue-600" />
                  Full Name *
                </label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="John Doe"
                  required
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Mail className="w-4 h-4 text-red-600" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Phone className="w-4 h-4 text-green-600" />
                  Phone Number *
                </label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="+254 700 000 000"
                  required
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter password"
                  required={!editingUser}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Shield className="w-4 h-4 text-orange-600" />
                  Role *
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-500" />
                        Admin
                      </span>
                    </SelectItem>
                    <SelectItem value="Manager">
                      <span className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-blue-500" />
                        Manager
                      </span>
                    </SelectItem>
                    <SelectItem value="Customer">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        Customer
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#6B7F39] to-[#5a6930] hover:from-[#5a6930] hover:to-[#4a5828] text-white font-semibold py-6 rounded-xl shadow-lg"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                    setNewUser({
                      name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'Customer'
                    });
                  }}
                  className="flex-1 border-2 border-gray-300 font-semibold py-6 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {showManageRolesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-gradient-to-r from-[#36454F] to-[#6B7F39] rounded-t-3xl">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Shield className="w-7 h-7" />
                Manage Roles & Permissions
              </h3>
            </div>

            <div className="p-6 space-y-5">
              {/* Admin Role */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-2 border-red-300 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-red-900">Administrator</h4>
                    <p className="text-sm text-red-700">Full system access and control</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Manage all properties, bookings, and customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Access system settings and configurations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Manage user accounts and permissions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>View all reports and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>Backup and restore database</span>
                  </li>
                </ul>
              </div>

              {/* Manager Role */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-300 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <UserCog className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-blue-900">Manager</h4>
                    <p className="text-sm text-blue-700">Property and booking management</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Manage properties and bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>View and manage customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Approve or decline bookings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>View reports and analytics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Cannot access system settings</span>
                  </li>
                </ul>
              </div>

              {/* Customer Role */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-300 shadow-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-green-900">Customer</h4>
                    <p className="text-sm text-green-700">Basic booking access</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Browse available properties</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Create booking requests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>View own booking history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Update own profile information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Cannot access admin features</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t-2 border-gray-100">
              <Button
                onClick={() => setShowManageRolesModal(false)}
                className="w-full bg-gradient-to-r from-[#36454F] to-[#6B7F39] hover:from-[#2a3640] hover:to-[#5a6930] text-white font-semibold py-6 rounded-xl shadow-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}



      {/* Error Popup - Auto-disappears after 5 seconds */}
      {showErrorPopup && connectionError && (
        <div className="fixed top-4 right-4 z-[60] animate-in slide-in-from-top duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-300 p-6 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  Connection Failed
                </h4>
                <p className="text-sm text-red-700">{connectionError}</p>
                <div className="mt-4 h-1 bg-red-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full animate-[shrink_5s_linear_forwards]" style={{
                    animation: 'shrink 5s linear forwards',
                    width: '100%'
                  }}></div>
                </div>
              </div>
              <button
                onClick={() => setShowErrorPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Modal - Success, Error, Confirm, Info */}
      {modalState.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 ${
            modalState.type === 'success' ? 'border-green-300' :
            modalState.type === 'error' ? 'border-red-300' :
            modalState.type === 'confirm' ? 'border-orange-300' :
            'border-blue-300'
          } animate-in zoom-in-95 duration-300`}>
            {/* Header */}
            <div className={`p-4 bg-gradient-to-r ${
              modalState.type === 'success' ? 'from-green-500 to-green-600' :
              modalState.type === 'error' ? 'from-red-500 to-red-600' :
              modalState.type === 'confirm' ? 'from-orange-500 to-orange-600' :
              'from-blue-500 to-blue-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {modalState.type === 'success' && <CheckCircle2 className="w-6 h-6 text-white" />}
                  {modalState.type === 'error' && <AlertCircle className="w-6 h-6 text-white" />}
                  {modalState.type === 'confirm' && <Info className="w-6 h-6 text-white" />}
                  {modalState.type === 'info' && <Info className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-bold text-white">{modalState.title}</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <p className="text-gray-700 text-sm leading-relaxed">{modalState.message}</p>
            </div>

            {/* Actions */}
            <div className={`p-4 border-t-2 border-gray-100 bg-gray-50 ${
              modalState.type === 'confirm' ? 'flex gap-3' : ''
            }`}>
              {modalState.type === 'confirm' ? (
                <>
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl h-11 font-semibold text-sm"
                  >
                    {modalState.cancelText || 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleModalConfirm}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-11 font-semibold text-sm shadow-lg"
                  >
                    {modalState.confirmText || 'OK'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleModalConfirm}
                  className={`w-full bg-gradient-to-r ${
                    modalState.type === 'success' ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' :
                    modalState.type === 'error' ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                    'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                  } text-white rounded-xl h-11 font-semibold text-sm shadow-lg`}
                >
                  {modalState.confirmText || 'OK'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
