import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft,
  Building2,
  Users,
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
  AlertCircle,
  Info,
  CreditCard,
  FileText,
  Calendar,
  Database,
  Server,
  Wifi,
  WifiOff,
  Loader2,
  HardDrive
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Header } from '../components/header';
import { getCurrentUser } from '../lib/auth';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '/src/lib/supabase';
import { checkConnection } from '../../lib/connectionStatus';
import { ConnectionStatusBanner } from '../components/connection-status';
import {
  fetchCustomers,
  fetchActivityLogs,
  deleteActivityLogs,
  createActivityLog
} from '../../lib/supabaseData';
import * as settingsHelpers from '../lib/settingsHelpers';

type SettingsTab = 'general' | 'homepage' | 'users' | 'database' | 'sms';

const APP_VERSION = '3.0'; // Format: Version 3.0

export function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Check URL parameter for tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab') as SettingsTab | null;
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || 'general');
  
  // Activity Log State
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

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

  // Database Settings States - Initialize with hard-coded credentials
  const [dbSettings, setDbSettings] = useState({
    supabaseUrl: DEFAULT_SUPABASE_URL,
    supabaseAnonKey: DEFAULT_SUPABASE_ANON_KEY,
    supabaseServiceKey: '',
    connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'connecting' | 'error'
  });
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

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
  const [isOnline, setIsOnline] = useState(checkConnection());

  // Load settings from Supabase
  useEffect(() => {
    const loadAllSettings = async () => {
      if (!checkConnection()) {
        console.warn('No internet connection. Settings cannot be loaded.');
        return;
      }

      try {
        // Load general settings
        const generalSettingsData = await settingsHelpers.getGeneralSettings();
        setGeneralSettings(generalSettingsData);

        // Load homepage settings
        const homepageSettingsData = await settingsHelpers.getHomePageSettings();
        setHomePageSettings(homepageSettingsData);

        // Load customers (users)
        const customersData = await fetchCustomers();
        const formattedUsers = customersData.map((c: any) => ({
          id: c.customer_id,
          name: c.customer_name,
          email: c.email,
          phone: c.phone,
          password: c.password || '',
          role: 'Customer'
        }));
        setUsers(formattedUsers);

        // Load SMS settings
        const smsSettingsData = await settingsHelpers.getSmsSettings();
        setSmsProvider(smsSettingsData.provider || 'africastalking');
        setAfricastalkingSettings(smsSettingsData.africastalking || africastalkingSettings);
        setTwilioSettings(smsSettingsData.twilio || twilioSettings);
        setDefaultMessages(smsSettingsData.defaultMessages || defaultMessages);

        // Load activity logs
        const logsData = await fetchActivityLogs(100);
        const formattedLogs = logsData.map((log: any) => ({
          id: log.activity_id,
          timestamp: log.created_at,
          user: log.user_name || 'System',
          action: log.activity,
          details: log.activity_type
        }));
        setActivityLogs(formattedLogs);
      } catch (error) {
        console.error('Error loading settings from Supabase:', error);
      }
    };

    loadAllSettings();

    // Monitor connection status
    const intervalId = setInterval(() => {
      setIsOnline(checkConnection());
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Log Activity
  const logActivity = async (action: string, details: string) => {
    if (!checkConnection()) {
      console.warn('Cannot log activity - no internet connection');
      return;
    }

    try {
      await createActivityLog({
        user_id: currentUser?.id || null,
        user_name: currentUser?.name || 'System',
        user_role: currentUser?.role || 'System',
        activity: action,
        activity_type: details,
        entity_type: 'settings',
        entity_id: null
      });

      // Reload activity logs
      const logsData = await fetchActivityLogs(100);
      const formattedLogs = logsData.map((log: any) => ({
        id: log.activity_id,
        timestamp: log.created_at,
        user: log.user_name || 'System',
        action: log.activity,
        details: log.activity_type
      }));
      setActivityLogs(formattedLogs);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Save General Settings
  const handleSaveGeneralSettings = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot save settings while offline. Please check your internet connection.');
      return;
    }

    try {
      await settingsHelpers.saveGeneralSettings(generalSettings);
      await logActivity('Settings Updated', 'General settings saved');
      showModal('success', 'Settings Saved', 'General settings saved successfully!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      showModal('error', 'Error', 'Failed to save general settings. Please try again.');
    }
  };

  // Save Home Page Settings
  const handleSaveHomePageSettings = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot save settings while offline. Please check your internet connection.');
      return;
    }

    try {
      await settingsHelpers.saveHomePageSettings(homePageSettings);
      await logActivity('Settings Updated', 'Home page settings saved');
      showModal('success', 'Settings Saved', 'Home page settings saved successfully!');
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      showModal('error', 'Error', 'Failed to save homepage settings. Please try again.');
    }
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

  // Add User to Supabase
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot add user while offline. Please check your internet connection.');
      return;
    }

    try {
      const { createCustomer } = await import('../../lib/supabaseData');
      
      const newCustomerData = {
        customer_name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        password: newUser.password || '',
        address: '',
        id_number: '',
        profile_photo: null,
        notes: null,
        is_active: true
      };

      const createdCustomer = await createCustomer(newCustomerData);
      
      const formattedUser = {
        id: createdCustomer.customer_id?.toString() || '',
        name: createdCustomer.customer_name,
        email: createdCustomer.email,
        phone: createdCustomer.phone,
        password: createdCustomer.password || '',
        role: 'Customer'
      };

      setUsers([...users, formattedUser]);
      setShowAddUserModal(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'Customer'
      });
      
      await logActivity('User Added', `Added new user: ${newUser.name}`);
      showModal('success', 'User Added', 'User added successfully to the cloud!');
    } catch (error) {
      console.error('Error adding user:', error);
      showModal('error', 'Error', 'Failed to add user. Please try again.');
    }
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

  // Update User in Supabase
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot update user while offline. Please check your internet connection.');
      return;
    }

    try {
      const { updateCustomer } = await import('../../lib/supabaseData');
      
      const updates: any = {
        customer_name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      };

      if (newUser.password) {
        updates.password = newUser.password;
      }

      await updateCustomer(parseInt(editingUser.id), updates);
      
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
      
      await logActivity('User Updated', `Updated user: ${newUser.name}`);
      showModal('success', 'User Updated', 'User updated successfully in the cloud!');
    } catch (error) {
      console.error('Error updating user:', error);
      showModal('error', 'Error', 'Failed to update user. Please try again.');
    }
  };

  // Update User Role (Note: Role is not stored in Supabase customer table, only locally tracked)
  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    // Since role is not part of the customer table in Supabase, we just update locally
    // In a real implementation, you'd have a separate users/roles table
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    );
    setUsers(updatedUsers);
    
    await logActivity('User Role Updated', `Updated role for user ID: ${userId} to ${newRole}`);
  };

  // Delete User from Supabase
  const handleDeleteUser = (userId: string) => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot delete user while offline. Please check your internet connection.');
      return;
    }

    const user = users.find(u => u.id === userId);
    showModal(
      'confirm',
      'Delete User',
      `Are you sure you want to delete ${user?.name || 'this user'} from the cloud database? This action cannot be undone.`,
      async () => {
        try {
          const { deleteCustomer } = await import('../../lib/supabaseData');
          await deleteCustomer(parseInt(userId));
          
          const updatedUsers = users.filter(u => u.id !== userId);
          setUsers(updatedUsers);
          
          await logActivity('User Deleted', `Deleted user: ${user?.name || userId}`);
          showModal('success', 'User Deleted', 'User has been deleted successfully from the cloud!');
        } catch (error) {
          console.error('Error deleting user:', error);
          showModal('error', 'Error', 'Failed to delete user. Please try again.');
        }
      },
      'Delete',
      'Cancel'
    );
  };

  // Test Supabase Connection
  const handleTestConnection = async () => {
    if (!dbSettings.supabaseUrl || !dbSettings.supabaseAnonKey) {
      setConnectionError('Please provide Supabase URL and Anon Key');
      setDbConnectionStatus('error');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
      return;
    }

    setDbConnectionStatus('connecting');
    setConnectionError('');
    setShowErrorPopup(false);

    try {
      const { getSupabaseClient } = await import('/src/lib/supabase');
      const supabase = getSupabaseClient(dbSettings.supabaseUrl, dbSettings.supabaseAnonKey);
      
      if (!supabase) {
        throw new Error('Failed to create Supabase client');
      }
      
      // Test connection by querying settings table
      const { data, error } = await supabase
        .from('skyway_settings')
        .select('setting_id')
        .limit(1);

      if (error) throw error;

      // Initialize connection monitoring with these credentials
      const { initializeConnectionMonitoring } = await import('/src/lib/connectionStatus');
      initializeConnectionMonitoring(dbSettings.supabaseUrl, dbSettings.supabaseAnonKey);

      setDbConnectionStatus('connected');
      showModal('success', 'Connection Successful', 'Successfully connected to Supabase database!');
      logActivity('Database Connected', 'Supabase connection established');
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionError(error.message || 'Connection failed');
      setDbConnectionStatus('error');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 5000);
      showModal('error', 'Connection Failed', `Failed to connect to Supabase: ${error.message}`);
    }
  };

  // Save Database Settings to Supabase
  const handleSaveDbSettings = async () => {
    try {
      // Save to Supabase settings table (only service key, URL and anon key are hard-coded)
      const { getSupabaseClient } = await import('/src/lib/supabase');
      
      if (!dbSettings.supabaseUrl || !dbSettings.supabaseAnonKey) {
        showModal('error', 'Missing Credentials', 'Database credentials are missing. They should be hard-coded in the app.');
        return;
      }

      const supabase = getSupabaseClient(dbSettings.supabaseUrl, dbSettings.supabaseAnonKey);
      
      if (!supabase) {
        throw new Error('Failed to create Supabase client');
      }
      
      // Only save service key to Supabase (URL and anon key are hard-coded)
      if (dbSettings.supabaseServiceKey) {
        const { error } = await supabase
          .from('skyway_settings')
          .upsert({
            setting_category: 'database',
            setting_key: 'supabase_service_key',
            setting_value: dbSettings.supabaseServiceKey,
            setting_type: 'text',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_category,setting_key'
          });

        if (error) {
          console.error('Error saving service key:', error);
          throw error;
        }
      }

      // No localStorage usage - credentials are hard-coded
      
      // Re-initialize connection monitoring (though it's already using the same hard-coded credentials)
      const { initializeConnectionMonitoring } = await import('/src/lib/connectionStatus');
      initializeConnectionMonitoring(dbSettings.supabaseUrl, dbSettings.supabaseAnonKey);
      
      logActivity('Settings Updated', 'Database service key saved to cloud');
      showModal('success', 'Settings Saved', 'Database settings saved successfully! Connection is permanent with hard-coded credentials.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showModal('error', 'Save Error', `Failed to save settings: ${error.message}`);
    }
  };

  // Load database settings from Supabase using hard-coded credentials
  useEffect(() => {
    const loadDbSettings = async () => {
      try {
        // Use hard-coded credentials - no localStorage needed
        const { getSupabaseClient } = await import('/src/lib/supabase');
        
        // The dbSettings state is already initialized with hard-coded credentials
        // Try to load any additional settings from Supabase (like service key)
        const supabase = getSupabaseClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

        if (supabase) {
          const { data, error } = await supabase
            .from('skyway_settings')
            .select('*')
            .eq('setting_category', 'database');

          if (!error && data && data.length > 0) {
            // Only override service key if saved in cloud
            const serviceKey = data.find(s => s.setting_key === 'supabase_service_key')?.setting_value;
            if (serviceKey) {
              setDbSettings(prev => ({
                ...prev,
                supabaseServiceKey: serviceKey
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error loading database settings:', error);
        // Settings will remain at hard-coded defaults, which is fine
      }
    };

    loadDbSettings();
  }, []);

  // Auto-test connection when database tab is opened
  useEffect(() => {
    if (activeTab === 'database' && dbConnectionStatus === 'disconnected') {
      // Automatically test connection with hard-coded credentials
      handleTestConnection();
    }
  }, [activeTab]);

  // Backup Database
  const handleBackupDatabase = async (format: 'json' | 'sql') => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot backup database while offline. Please check your internet connection.');
      return;
    }

    try {
      const {
        fetchProperties,
        fetchBookings,
        fetchCustomers,
        fetchCategories,
        fetchFeatures
      } = await import('../../lib/supabaseData');

      showModal('info', 'Backing Up', 'Fetching data from cloud database...');

      const [properties, bookings, customers, categories, features] = await Promise.all([
        fetchProperties(),
        fetchBookings(),
        fetchCustomers(),
        fetchCategories(),
        fetchFeatures()
      ]);

    const data = {
      properties,
      bookings,
      customers,
      categories,
      features,
      settings: {
        general: generalSettings,
        homepage: homePageSettings,
        sms: {
          provider: smsProvider,
          africastalking: africastalkingSettings,
          twilio: twilioSettings,
          defaultMessages: defaultMessages
        }
      },
      timestamp: new Date().toISOString(),
      source: 'Supabase Cloud Database'
    };

    let content: string;
    let filename: string;
    let type: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `skyway-cloud-backup-${Date.now()}.json`;
      type = 'application/json';
    } else {
      const sqlStatements = [];
      sqlStatements.push('-- Skyway Suites Cloud Database Backup');
      sqlStatements.push(`-- Generated: ${new Date().toISOString()}`);
      sqlStatements.push(`-- Total Records: ${properties.length} properties, ${bookings.length} bookings, ${customers.length} customers`);
      sqlStatements.push('');
      
      sqlStatements.push('-- Note: This is a simplified SQL export. Import via JSON format for full restore.');
      
      content = sqlStatements.join('\n');
      filename = `skyway-cloud-backup-${Date.now()}.sql`;
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    closeModal();
    await logActivity('Database Backup', `Created ${format.toUpperCase()} backup from cloud`);
    showModal('success', 'Backup Complete', `Database backed up successfully! Downloaded as ${filename}`);
    } catch (error) {
      console.error('Error backing up database:', error);
      showModal('error', 'Backup Error', 'Failed to backup database. Please try again.');
    }
  };

  // Restore Database to Supabase
  const handleRestoreDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot restore database while offline. Please check your internet connection.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        showModal(
          'confirm',
          'Restore Database',
          'This will overwrite all current data including properties, bookings, customers, categories, features, and settings in the cloud. Are you sure you want to continue?',
          async () => {
            try {
              showModal('info', 'Restoring Database', 'Uploading data to cloud database... This may take a moment.');

              // Import Supabase functions
              const {
                createProperty,
                createBooking,
                createCustomer,
                createCategory,
                createFeature,
                deleteProperty,
                deleteBooking,
                deleteCustomer,
                deleteCategory,
                deleteFeature,
                fetchProperties,
                fetchBookings,
                fetchCustomers,
                fetchCategories,
                fetchFeatures
              } = await import('../../lib/supabaseData');

              // Step 1: Delete all existing data
              const [existingProperties, existingBookings, existingCustomers, existingCategories, existingFeatures] = await Promise.all([
                fetchProperties(),
                fetchBookings(),
                fetchCustomers(),
                fetchCategories(),
                fetchFeatures()
              ]);

              // Delete in reverse dependency order
              await Promise.all(existingBookings.map(b => deleteBooking(b.booking_id!)));
              await Promise.all(existingProperties.map(p => deleteProperty(p.property_id!)));
              await Promise.all(existingCustomers.map(c => deleteCustomer(c.customer_id!)));
              await Promise.all(existingFeatures.map(f => deleteFeature(f.feature_id!)));
              await Promise.all(existingCategories.map(c => deleteCategory(c.category_id!)));

              // Step 2: Restore Categories first (needed for properties)
              if (data.categories && data.categories.length > 0) {
                for (const category of data.categories) {
                  await createCategory({
                    category_name: category.category_name,
                    description: category.description,
                    icon: category.icon
                  });
                }
              }

              // Step 3: Restore Features
              if (data.features && data.features.length > 0) {
                for (const feature of data.features) {
                  await createFeature({
                    feature_name: feature.feature_name,
                    description: feature.description,
                    icon: feature.icon
                  });
                }
              }

              // Step 4: Restore Customers (needed for bookings)
              if (data.customers && data.customers.length > 0) {
                for (const customer of data.customers) {
                  await createCustomer({
                    customer_name: customer.customer_name,
                    phone: customer.phone,
                    email: customer.email,
                    address: customer.address,
                    password: customer.password,
                    id_number: customer.id_number,
                    profile_photo: customer.profile_photo,
                    notes: customer.notes,
                    is_active: customer.is_active !== false
                  });
                }
              }

              // Step 5: Restore Properties (needed for bookings)
              if (data.properties && data.properties.length > 0) {
                for (const property of data.properties) {
                  await createProperty({
                    property_name: property.property_name,
                    category_id: property.category_id,
                    location: property.location,
                    no_of_beds: property.no_of_beds,
                    bathrooms: property.bathrooms,
                    area_sqft: property.area_sqft,
                    description: property.description,
                    price_per_month: property.price_per_month,
                    security_deposit: property.security_deposit,
                    photos: typeof property.photos === 'string' ? property.photos : JSON.stringify(property.photos),
                    features: typeof property.features === 'string' ? property.features : JSON.stringify(property.features),
                    is_available: property.is_available !== false,
                    is_featured: property.is_featured || false
                  });
                }
              }

              // Step 6: Restore Bookings
              if (data.bookings && data.bookings.length > 0) {
                for (const booking of data.bookings) {
                  await createBooking({
                    customer_id: booking.customer_id,
                    property_id: booking.property_id,
                    check_in_date: booking.check_in_date,
                    check_out_date: booking.check_out_date,
                    total_amount: booking.total_amount,
                    amount_paid: booking.amount_paid,
                    payment_status: booking.payment_status,
                    booking_status: booking.booking_status,
                    payment_method: booking.payment_method,
                    payment_reference: booking.payment_reference,
                    notes: booking.notes,
                    created_by: booking.created_by
                  });
                }
              }

              // Step 7: Restore Settings
              if (data.settings) {
                if (data.settings.general) {
                  await settingsHelpers.saveGeneralSettings(data.settings.general);
                  setGeneralSettings(data.settings.general);
                }
                if (data.settings.homepage) {
                  await settingsHelpers.saveHomePageSettings(data.settings.homepage);
                  setHomePageSettings(data.settings.homepage);
                }
                if (data.settings.sms) {
                  await settingsHelpers.saveSmsSettings(data.settings.sms);
                  if (data.settings.sms.provider) {
                    setSmsProvider(data.settings.sms.provider);
                  }
                  if (data.settings.sms.africastalking) {
                    setAfricastalkingSettings(data.settings.sms.africastalking);
                  }
                  if (data.settings.sms.twilio) {
                    setTwilioSettings(data.settings.sms.twilio);
                  }
                  if (data.settings.sms.defaultMessages) {
                    setDefaultMessages(data.settings.sms.defaultMessages);
                  }
                }
              }

              await logActivity('Database Restored', 'Full database restore from backup file to cloud');
              
              showModal('success', 'Restore Complete', 'Database restored successfully to cloud! The page will refresh.', () => {
                window.location.reload();
              });
            } catch (error) {
              console.error('Error restoring database to cloud:', error);
              showModal('error', 'Restore Failed', `Failed to restore database: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          },
          'Restore',
          'Cancel'
        );
      } catch (error) {
        showModal('error', 'Restore Failed', 'Error reading backup file. Please check the file format.');
        console.error('Error parsing backup file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Copy Database Query from Supabase
  const handleCopyDatabaseQuery = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot copy database while offline. Please check your internet connection.');
      return;
    }

    try {
      showModal('info', 'Copying', 'Fetching data from cloud database...');

      const {
        fetchProperties,
        fetchBookings,
        fetchCustomers,
        fetchCategories,
        fetchFeatures
      } = await import('../../lib/supabaseData');

      const [properties, bookings, customers, categories, features] = await Promise.all([
        fetchProperties(),
        fetchBookings(),
        fetchCustomers(),
        fetchCategories(),
        fetchFeatures()
      ]);

      const data = {
        properties,
        bookings,
        customers,
        categories,
        features,
        settings: {
          general: generalSettings,
          homepage: homePageSettings,
          sms: {
            provider: smsProvider,
            africastalking: africastalkingSettings,
            twilio: twilioSettings,
            defaultMessages: defaultMessages
          }
        },
        timestamp: new Date().toISOString(),
        source: 'Supabase Cloud Database'
      };
      
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      closeModal();
      await logActivity('Database Query Copied', 'Cloud database data copied to clipboard');
      showModal('success', 'Copied', 'Cloud database query copied to clipboard!');
    } catch (error) {
      console.error('Error copying database query from cloud:', error);
      showModal('error', 'Copy Failed', 'Failed to copy database query. Please try again.');
    }
  };

  // Save SMS Settings to Supabase
  const handleSaveSmsSettings = async () => {
    if (!checkConnection()) {
      showModal('error', 'No Connection', 'Cannot save SMS settings while offline. Please check your internet connection.');
      return;
    }

    try {
      const smsSettings = {
        provider: smsProvider,
        africastalking: africastalkingSettings,
        twilio: twilioSettings,
        defaultMessages: defaultMessages
      };
      
      await settingsHelpers.saveSmsSettings(smsSettings);
      await logActivity('Settings Updated', 'SMS settings saved to cloud');
      showModal('success', 'Settings Saved', 'SMS settings saved successfully to the cloud!');
    } catch (error) {
      console.error('Error saving SMS settings:', error);
      showModal('error', 'Error', 'Failed to save SMS settings. Please try again.');
    }
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
    { id: 'database', label: 'Database Settings', icon: Database, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { id: 'sms', label: 'SMS Integration', icon: MessageSquare, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' }
  ];

  const currentTabData = tabs.find(t => t.id === activeTab);

  // Stats calculation
  const stats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    managers: users.filter(u => u.role === 'Manager').length,
    customers: users.filter(u => u.role === 'Customer').length,
    smsProvider: smsProvider,
    totalSlides: homePageSettings.slides.length,
    dbStatus: dbConnectionStatus
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
                  <Home className="w-5 h-5 mb-1 opacity-80" />
                  <p className="text-2xl font-bold">{stats.totalSlides}</p>
                  <p className="text-xs opacity-80">Slides</p>
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
              <nav className="p-2 space-y-1">
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
                      <div className={`relative flex items-center gap-2 px-2 py-1.5 rounded-lg font-medium transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : `${tab.bgColor} ${tab.textColor} hover:shadow-md`
                      }`}>
                        <div className={`w-4 h-4 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-white/20' : 'bg-white'
                        } transition-all duration-300`}>
                          <Icon className={`w-2.5 h-2.5 ${isActive ? 'text-white' : tab.textColor}`} />
                        </div>
                        <div className="text-left flex-1">
                          <p className={`font-semibold text-xs ${isActive ? 'text-white' : ''}`}>
                            {tab.label}
                          </p>
                        </div>
                        {isActive && (
                          <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>
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
                        {activeTab === 'database' && `Database: ${dbConnectionStatus === 'connected' ? 'Connected ✓' : 'Disconnected'}`}
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

              {/* Database Settings Tab */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  {/* Connection Status Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Database className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-purple-900">Supabase Connection Status</h3>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
                          dbConnectionStatus === 'connected' 
                            ? 'bg-green-100 text-green-700' 
                            : dbConnectionStatus === 'connecting'
                            ? 'bg-yellow-100 text-yellow-700'
                            : dbConnectionStatus === 'error'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {dbConnectionStatus === 'connected' && <Wifi className="w-4 h-4" />}
                          {dbConnectionStatus === 'connecting' && <Loader2 className="w-4 h-4 animate-spin" />}
                          {dbConnectionStatus === 'error' && <WifiOff className="w-4 h-4" />}
                          {dbConnectionStatus === 'disconnected' && <WifiOff className="w-4 h-4" />}
                          {dbConnectionStatus === 'connected' ? 'Connected' : dbConnectionStatus === 'connecting' ? 'Connecting...' : dbConnectionStatus === 'error' ? 'Error' : 'Disconnected'}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      {connectionError && (
                        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                          <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <p className="font-medium">{connectionError}</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-purple-800">
                            <p className="font-semibold mb-2">Important: Strictly Cloud-Based Application</p>
                            <p className="mb-2">Skyway Suites Version 3.0 operates entirely on Supabase cloud infrastructure. All data is stored online and requires an active internet connection.</p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                              <li>No offline mode available</li>
                              <li>Database settings saved to cloud (accessible from any device)</li>
                              <li>Real-time synchronization across all devices</li>
                              <li>Automatic backups and data security</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supabase Configuration Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                          <Server className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-900">Supabase Configuration</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Supabase URL */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Supabase Project URL *
                        </label>
                        <Input
                          type="text"
                          placeholder="https://xxxxx.supabase.co"
                          value={dbSettings.supabaseUrl}
                          onChange={(e) => setDbSettings({ ...dbSettings, supabaseUrl: e.target.value })}
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl h-12"
                        />
                        <p className="text-xs text-gray-500">Find this in your Supabase project settings</p>
                      </div>

                      {/* Supabase Anon Key */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Supabase Anon/Public Key *
                        </label>
                        <Input
                          type="password"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={dbSettings.supabaseAnonKey}
                          onChange={(e) => setDbSettings({ ...dbSettings, supabaseAnonKey: e.target.value })}
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl h-12"
                        />
                        <p className="text-xs text-gray-500">Public/anon key (safe to use in frontend)</p>
                      </div>

                      {/* Supabase Service Role Key */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Supabase Service Role Key (Optional)
                        </label>
                        <Input
                          type="password"
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          value={dbSettings.supabaseServiceKey}
                          onChange={(e) => setDbSettings({ ...dbSettings, supabaseServiceKey: e.target.value })}
                          className="border-2 border-gray-200 focus:border-purple-500 rounded-xl h-12"
                        />
                        <p className="text-xs text-gray-500">For admin operations (keep secure, backend only)</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleTestConnection}
                          disabled={dbConnectionStatus === 'connecting'}
                          className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                        >
                          {dbConnectionStatus === 'connecting' ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Testing Connection...
                            </>
                          ) : (
                            <>
                              <Wifi className="w-5 h-5 mr-2" />
                              Test Connection
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleSaveDbSettings}
                          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                        >
                          <Save className="w-5 h-5 mr-2" />
                          Save Settings
                        </Button>
                      </div>
                      
                      {/* Permanent Connection Note */}
                      <div className="mt-4 bg-green-50 border-2 border-green-200 rounded-xl p-3">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-green-800">
                            <span className="font-semibold">Permanent Connection:</span> Database credentials are hard-coded. The app automatically connects to Supabase on every launch - even after closing the browser. No reconnection needed!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Instructions Card */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                          <HardDrive className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-purple-900">Setup Instructions</h3>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">1</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Create Supabase Project</h4>
                            <p className="text-sm text-gray-600">Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">supabase.com</a> and create a new project</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">2</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Run Database Schema</h4>
                            <p className="text-sm text-gray-600">Execute the SQL schema file (<code className="bg-gray-100 px-1 rounded">/database/skyway_suites_schema.sql</code>) in your Supabase SQL Editor</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">3</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Get API Keys</h4>
                            <p className="text-sm text-gray-600">Copy your Project URL and API keys from Settings → API section</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">4</div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Configure & Test</h4>
                            <p className="text-sm text-gray-600">Enter your credentials above and click "Test Connection"</p>
                          </div>
                        </div>
                      </div>
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
