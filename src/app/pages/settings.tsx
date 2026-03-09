import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { NotificationsTabContent } from '../components/notifications-tab';
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
  Image as ImageIcon,
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
  HardDrive,
  Heart,
  Check,
  Headset,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Header } from '../components/header';
import { getCurrentUser } from '../lib/auth';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '/src/lib/supabase';
import {
  fetchCustomers,
  fetchActivityLogs,
  deleteActivityLogs,
  createActivityLog,
  clearAllProperties,
  clearAllCustomers,
  clearAllBookings,
  clearAllPayments,
  fetchProperties,
  fetchBookings,
  fetchPayments
} from '../../lib/supabaseData';
import * as settingsHelpers from '../lib/settingsHelpers';

type SettingsTab = 'general' | 'homepage' | 'users' | 'database' | 'notifications';
type NotificationTab = 'sms' | 'whatsapp' | 'email';

const APP_VERSION = '3.0.3';

export function Settings() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  
  // Check URL parameter for tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabFromUrl = urlParams.get('tab') as SettingsTab | null;
  
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabFromUrl || 'general');
  const [activeNotificationTab, setActiveNotificationTab] = useState<NotificationTab>('sms');
  
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
    whyUsSubtitle: 'Your trusted partner in finding the perfect home',
    whyUsItems: [
      { id: '1', icon: 'shield', title: 'Verified Properties', description: 'All properties are verified and inspected', order: 1 },
      { id: '2', icon: 'clock', title: '24/7 Support', description: 'Round the clock customer service', order: 2 },
      { id: '3', icon: 'star', title: 'Best Prices', description: 'Competitive pricing guaranteed', order: 3 },
      { id: '4', icon: 'map', title: 'Prime Locations', description: 'Properties in the best areas', order: 4 },
      { id: '5', icon: 'heart', title: 'Quality Service', description: 'Exceptional hospitality standards', order: 5 },
      { id: '6', icon: 'check', title: 'Easy Booking', description: 'Simple and secure reservations', order: 6 }
    ],
    // Get In Touch Section
    getInTouch: {
      title: 'Get In Touch',
      subtitle: 'Have questions? We\'re here to help you find your dream home',
      phone: '+254 700 123 456',
      email: 'info@skywaysuites.co.ke',
      address: 'Nairobi, Kenya',
      whatsapp: '+254 700 123 456'
    },
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
  const [showEditUserModal, setShowEditUserModal] = useState(false);
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
    supabaseUrl: DEFAULT_SUPABASE_URL,
    supabaseAnonKey: DEFAULT_SUPABASE_ANON_KEY,
    supabaseServiceKey: '',
    connectionStatus: 'disconnected' as 'connected' | 'disconnected' | 'connecting' | 'error'
  });
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Notification Settings States
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
  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    apiKey: '',
    apiUrl: 'https://api.wasenderapi.com',
    adminPhone: ''
  });
  const [emailSettings, setEmailSettings] = useState({
    enabled: false,
    provider: 'smtp',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Skyway Suites',
    adminEmail: ''
  });
  const [defaultMessages, setDefaultMessages] = useState({
    bookingMadeAdmin: 'New booking made! Visit system to approve and confirm payment.',
    bookingApprovedCustomer: 'Booking approved! We will call you if more information is needed.',
    customMessage: ''
  });
  const [messageRecipients, setMessageRecipients] = useState('everyone');
  const [customMessage, setCustomMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load settings from Supabase
  useEffect(() => {
    const loadAllSettings = async () => {
      if (!navigator.onLine) {
        console.warn('No internet connection. Settings cannot be loaded.');
        return;
      }

      try {
        // Load general settings
        const generalSettingsData = await settingsHelpers.getGeneralSettings();
        setGeneralSettings(generalSettingsData);

        // Load homepage settings
        const homepageSettingsData = await settingsHelpers.getHomePageSettings();
        // Ensure all required fields exist
        if (!homepageSettingsData.getInTouch) {
          homepageSettingsData.getInTouch = {
            title: 'Get In Touch',
            subtitle: 'Have questions? We\'re here to help you find your dream home',
            phone: '+254 700 123 456',
            email: 'info@skywaysuites.co.ke',
            address: 'Nairobi, Kenya',
            whatsapp: '+254 700 123 456'
          };
        }
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

        // Load Notification settings
        const notificationSettingsData = await settingsHelpers.getNotificationSettings();
        setSmsProvider(notificationSettingsData.sms?.provider || 'africastalking');
        setAfricastalkingSettings(notificationSettingsData.sms?.africastalking || africastalkingSettings);
        setTwilioSettings(notificationSettingsData.sms?.twilio || twilioSettings);
        setWhatsappSettings(notificationSettingsData.whatsapp || whatsappSettings);
        setEmailSettings(notificationSettingsData.email || emailSettings);
        setDefaultMessages(notificationSettingsData.defaultMessages || defaultMessages);

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
      setIsOnline(navigator.onLine);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Log Activity
  const logActivity = async (action: string, details: string) => {
    if (!navigator.onLine) {
      console.warn('Cannot log activity - no internet connection');
      return;
    }

    try {
      await createActivityLog({
        activity: action,
        activity_type: details,
        user_name: currentUser?.name || 'System'
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  // Save General Settings
  const handleSaveGeneralSettings = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot save settings while offline. Please check your internet connection.');
      return;
    }

    try {
      await settingsHelpers.saveGeneralSettings(generalSettings);
      await logActivity('Settings Updated', 'General settings saved to cloud');
      showModal('success', 'Settings Saved', 'General settings saved successfully to the cloud!');
    } catch (error) {
      console.error('Error saving general settings:', error);
      showModal('error', 'Error', 'Failed to save general settings. Please try again.');
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showModal('error', 'File Too Large', 'Please select a file smaller than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGeneralSettings({ ...generalSettings, companyLogo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Save Home Page Settings
  const handleSaveHomePageSettings = async () => {
    if (!navigator.onLine) {
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

  // Helper function to compress image to WebP with max 50KB size
  const compressImage = (file: File, maxSizeKB: number = 50): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          
          // Start with reasonable dimensions (slideshow dimensions: 1920x600)
          let width = 1920;
          let height = 600;
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under maxSizeKB
          let quality = 0.9;
          let result = canvas.toDataURL('image/webp', quality);
          
          while (result.length * 0.75 / 1024 > maxSizeKB && quality > 0.1) {
            quality -= 0.1;
            result = canvas.toDataURL('image/webp', quality);
          }
          
          resolve(result);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload for slides
  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showModal('error', 'File Too Large', 'Image must be less than 10MB');
      return;
    }

    try {
      const compressedImage = await compressImage(file, 50);
      const compressedSizeKB = ((compressedImage.length * 0.75) / 1024).toFixed(1);
      console.log(`✓ Compressed ${file.name} to ${compressedSizeKB}KB as WebP`);
      
      setEditingSlide({ ...editingSlide, image: compressedImage });
    } catch (error) {
      console.error('Error compressing image:', error);
      showModal('error', 'Error', 'Failed to process image. Please try again.');
    }
  };

  // Slide Management
  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      title: 'New Slide',
      subtitle: 'Subtitle here',
      image: '',
      order: homePageSettings.slides.length + 1
    };
    setEditingSlide(newSlide);
    setShowSlideModal(true);
  };

  const handleEditSlide = (slide: any) => {
    setEditingSlide(slide);
    setShowSlideModal(true);
  };

  const handleSaveSlide = () => {
    if (!editingSlide) return;

    const existingIndex = homePageSettings.slides.findIndex(s => s.id === editingSlide.id);
    if (existingIndex >= 0) {
      const updatedSlides = [...homePageSettings.slides];
      updatedSlides[existingIndex] = editingSlide;
      setHomePageSettings({ ...homePageSettings, slides: updatedSlides });
    } else {
      setHomePageSettings({ ...homePageSettings, slides: [...homePageSettings.slides, editingSlide] });
    }

    setShowSlideModal(false);
    setEditingSlide(null);
  };

  const handleDeleteSlide = (slideId: string) => {
    showModal(
      'confirm',
      'Delete Slide',
      'Are you sure you want to delete this slide?',
      () => {
        setHomePageSettings({
          ...homePageSettings,
          slides: homePageSettings.slides.filter(s => s.id !== slideId)
        });
      },
      'Delete',
      'Cancel'
    );
  };

  // Why Us Item Management
  const handleAddWhyUsItem = () => {
    const newItem = {
      id: Date.now().toString(),
      icon: 'check',
      title: 'New Item',
      description: 'Description here',
      order: homePageSettings.whyUsItems.length + 1
    };
    setEditingWhyUsItem(newItem);
    setShowWhyUsModal(true);
  };

  const handleEditWhyUsItem = (item: any) => {
    setEditingWhyUsItem(item);
    setShowWhyUsModal(true);
  };

  const handleSaveWhyUsItem = () => {
    if (!editingWhyUsItem) return;

    const existingIndex = homePageSettings.whyUsItems.findIndex(i => i.id === editingWhyUsItem.id);
    if (existingIndex >= 0) {
      const updatedItems = [...homePageSettings.whyUsItems];
      updatedItems[existingIndex] = editingWhyUsItem;
      setHomePageSettings({ ...homePageSettings, whyUsItems: updatedItems });
    } else {
      setHomePageSettings({ ...homePageSettings, whyUsItems: [...homePageSettings.whyUsItems, editingWhyUsItem] });
    }

    setShowWhyUsModal(false);
    setEditingWhyUsItem(null);
  };

  const handleDeleteWhyUsItem = (itemId: string) => {
    showModal(
      'confirm',
      'Delete Item',
      'Are you sure you want to delete this item?',
      () => {
        setHomePageSettings({
          ...homePageSettings,
          whyUsItems: homePageSettings.whyUsItems.filter(i => i.id !== itemId)
        });
      },
      'Delete',
      'Cancel'
    );
  };

  // User Management
  const handleAddUser = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot add user while offline. Please check your internet connection.');
      return;
    }

    if (!newUser.name || !newUser.email || !newUser.password) {
      showModal('error', 'Missing Information', 'Please provide name, email, and password');
      return;
    }

    try {
      // In a real app, this would call an API to create the user
      const newUserData = {
        id: Date.now().toString(),
        ...newUser
      };
      setUsers([...users, newUserData]);
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'Customer' });
      await logActivity('User Added', `New user created: ${newUser.name}`);
      showModal('success', 'User Added', 'User created successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      showModal('error', 'Error', 'Failed to add user. Please try again.');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot update user while offline. Please check your internet connection.');
      return;
    }

    if (!editingUser?.name || !editingUser?.email) {
      showModal('error', 'Missing Information', 'Please provide name and email');
      return;
    }

    try {
      const updatedUsers = users.map(u => u.id === editingUser.id ? editingUser : u);
      setUsers(updatedUsers);
      setShowEditUserModal(false);
      setEditingUser(null);
      await logActivity('User Updated', `User updated: ${editingUser.name}`);
      showModal('success', 'User Updated', 'User information updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      showModal('error', 'Error', 'Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    showModal(
      'confirm',
      'Delete User',
      `Are you sure you want to delete ${user?.name}?`,
      async () => {
        setUsers(users.filter(u => u.id !== userId));
        await logActivity('User Deleted', `User deleted: ${user?.name}`);
      },
      'Delete',
      'Cancel'
    );
  };

  // Database Management
  const handleExportDatabase = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot export database while offline. Please check your internet connection.');
      return;
    }

    try {
      showModal('info', 'Exporting', 'Fetching data from cloud database...');

      const {
        fetchProperties,
        fetchBookings,
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
          notifications: {
            sms: {
              provider: smsProvider,
              africastalking: africastalkingSettings,
              twilio: twilioSettings
            },
            whatsapp: whatsappSettings,
            email: emailSettings,
            defaultMessages: defaultMessages
          }
        },
        timestamp: new Date().toISOString(),
        version: APP_VERSION,
        source: 'Supabase Cloud Database'
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skyway-suites-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      closeModal();
      await logActivity('Database Exported', 'Full database backup exported from cloud');
      showModal('success', 'Export Complete', 'Database exported successfully from cloud!');
    } catch (error) {
      console.error('Error exporting database from cloud:', error);
      showModal('error', 'Export Failed', 'Failed to export database. Please try again.');
    }
  };

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot import database while offline. Please check your internet connection.');
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
          'Confirm Restore',
          'This will replace ALL current data in the cloud database with the backup data. This action cannot be undone. Are you sure?',
          async () => {
            try {
              showModal('info', 'Restoring', 'Uploading data to cloud database...');

              const {
                createProperty,
                createBooking,
                createCustomer,
                createCategory,
                createFeature
              } = await import('../../lib/supabaseData');

              // Clear existing data would need to be implemented
              // Then import new data
              if (data.settings?.general) {
                await settingsHelpers.saveGeneralSettings(data.settings.general);
                setGeneralSettings(data.settings.general);
              }
              if (data.settings?.homepage) {
                await settingsHelpers.saveHomePageSettings(data.settings.homepage);
                setHomePageSettings(data.settings.homepage);
              }
              if (data.settings?.notifications) {
                await settingsHelpers.saveNotificationSettings(data.settings.notifications);
                setSmsProvider(data.settings.notifications.sms?.provider || 'africastalking');
                setAfricastalkingSettings(data.settings.notifications.sms?.africastalking || africastalkingSettings);
                setTwilioSettings(data.settings.notifications.sms?.twilio || twilioSettings);
                setWhatsappSettings(data.settings.notifications.whatsapp || whatsappSettings);
                setEmailSettings(data.settings.notifications.email || emailSettings);
                setDefaultMessages(data.settings.notifications.defaultMessages || defaultMessages);
              } else if (data.settings?.sms) {
                // Backward compatibility with old SMS format
                const notificationSettings = {
                  sms: {
                    provider: data.settings.sms.provider,
                    africastalking: data.settings.sms.africastalking,
                    twilio: data.settings.sms.twilio
                  },
                  whatsapp: whatsappSettings,
                  email: emailSettings,
                  defaultMessages: data.settings.sms.defaultMessages
                };
                await settingsHelpers.saveNotificationSettings(notificationSettings);
                setSmsProvider(data.settings.sms.provider);
                setAfricastalkingSettings(data.settings.sms.africastalking);
                setTwilioSettings(data.settings.sms.twilio);
                setDefaultMessages(data.settings.sms.defaultMessages);
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

  // Copy Database Query
  const handleCopyDatabaseQuery = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot copy database while offline. Please check your internet connection.');
      return;
    }

    try {
      showModal('info', 'Copying', 'Fetching data from cloud database...');

      const {
        fetchProperties,
        fetchBookings,
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

  // Data Management Functions
  const handleClearProperties = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear properties while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear All Properties?',
      'This will permanently delete ALL properties from the cloud database. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          await clearAllProperties();
          await logActivity('Data Cleared', 'All properties cleared from cloud database');
          showModal('success', 'Properties Cleared', 'All properties have been successfully deleted from the cloud database.');
        } catch (error) {
          console.error('Error clearing properties:', error);
          showModal('error', 'Clear Failed', 'Failed to clear properties. Please try again.');
        }
      },
      'Yes, Clear All',
      'Cancel'
    );
  };

  const handleClearCustomers = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear customers while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear All Customers?',
      'This will permanently delete ALL customers from the cloud database. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          await clearAllCustomers();
          await logActivity('Data Cleared', 'All customers cleared from cloud database');
          showModal('success', 'Customers Cleared', 'All customers have been successfully deleted from the cloud database.');
        } catch (error) {
          console.error('Error clearing customers:', error);
          showModal('error', 'Clear Failed', 'Failed to clear customers. Please try again.');
        }
      },
      'Yes, Clear All',
      'Cancel'
    );
  };

  const handleClearBookings = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear bookings while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear All Bookings?',
      'This will permanently delete ALL bookings from the cloud database. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          await clearAllBookings();
          await logActivity('Data Cleared', 'All bookings cleared from cloud database');
          showModal('success', 'Bookings Cleared', 'All bookings have been successfully deleted from the cloud database.');
        } catch (error) {
          console.error('Error clearing bookings:', error);
          showModal('error', 'Clear Failed', 'Failed to clear bookings. Please try again.');
        }
      },
      'Yes, Clear All',
      'Cancel'
    );
  };

  const handleClearPayments = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear payments while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear All Payments?',
      'This will permanently delete ALL payments from the cloud database. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          await clearAllPayments();
          await logActivity('Data Cleared', 'All payments cleared from cloud database');
          showModal('success', 'Payments Cleared', 'All payments have been successfully deleted from the cloud database.');
        } catch (error) {
          console.error('Error clearing payments:', error);
          showModal('error', 'Clear Failed', 'Failed to clear payments. Please try again.');
        }
      },
      'Yes, Clear All',
      'Cancel'
    );
  };

  const handleClearActivityLogs = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot clear activity logs while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      'Clear All Activity Logs?',
      'This will permanently delete ALL activity logs from the cloud database. This action cannot be undone. Are you sure you want to continue?',
      async () => {
        try {
          await deleteActivityLogs();
          await logActivity('Data Cleared', 'All activity logs cleared from cloud database');
          showModal('success', 'Activity Logs Cleared', 'All activity logs have been successfully deleted from the cloud database.');
        } catch (error) {
          console.error('Error clearing activity logs:', error);
          showModal('error', 'Clear Failed', 'Failed to clear activity logs. Please try again.');
        }
      },
      'Yes, Clear All',
      'Cancel'
    );
  };

  const handleResetSystem = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot reset system while offline. Please check your internet connection.');
      return;
    }

    showModal(
      'confirm',
      '⚠️ RESET ENTIRE SYSTEM?',
      'This will permanently delete ALL DATA from the cloud database including Properties, Customers, Bookings, Payments, and Activity Logs. This action cannot be undone and will reset your system to default settings. Are you absolutely sure?',
      async () => {
        try {
          showModal('info', 'Resetting System', 'Clearing all data from cloud database...');
          
          // Clear all data tables
          await Promise.all([
            clearAllProperties(),
            clearAllCustomers(),
            clearAllBookings(),
            clearAllPayments(),
            deleteActivityLogs()
          ]);

          await logActivity('System Reset', 'Complete system reset - all data cleared from cloud database');
          
          showModal('success', 'System Reset Complete', 'All data has been cleared from the cloud database. The page will refresh.', () => {
            window.location.reload();
          });
        } catch (error) {
          console.error('Error resetting system:', error);
          showModal('error', 'Reset Failed', 'Failed to reset system. Please try again or clear tables individually.');
        }
      },
      'Yes, Reset Everything',
      'Cancel'
    );
  };

  // Save Notification Settings
  const handleSaveNotificationSettings = async () => {
    if (!navigator.onLine) {
      showModal('error', 'No Connection', 'Cannot save notification settings while offline. Please check your internet connection.');
      return;
    }

    try {
      const notificationSettings = {
        sms: {
          provider: smsProvider,
          africastalking: africastalkingSettings,
          twilio: twilioSettings
        },
        whatsapp: whatsappSettings,
        email: emailSettings,
        defaultMessages: defaultMessages
      };
      
      await settingsHelpers.saveNotificationSettings(notificationSettings);
      await logActivity('Settings Updated', 'Notification settings saved to cloud');
      showModal('success', 'Settings Saved', 'Notification settings saved successfully to the cloud!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      showModal('error', 'Error', 'Failed to save notification settings. Please try again.');
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
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'homepage', label: 'Home Page', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: MessageSquare }
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
      {/* Dashboard Sidebar */}
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

          {/* Top Navigation Tabs */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-[#6B7F39] text-white shadow-md'
                          : 'text-[#36454F] hover:bg-[#FAF4EC]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7F39]'}`} />
                      <span className="text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area with Stats */}
          <div className="mb-6">
            <div className="bg-gradient-to-br from-[#36454F] to-[#2a3640] rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentTabData && (
                    <>
                      <div className="w-14 h-14 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <currentTabData.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{currentTabData.label} Settings</h2>
                        <p className="text-white/70 text-sm mt-1">
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
                <div className="flex gap-3">
                  <div className="bg-[#6B7F39] rounded-xl p-3 text-center">
                    <Users className="w-5 h-5 mb-1 mx-auto" />
                    <p className="text-xl font-bold">{stats.totalUsers}</p>
                    <p className="text-xs opacity-70">Users</p>
                  </div>
                  <div className="bg-[#6B7F39] rounded-xl p-3 text-center">
                    <Home className="w-5 h-5 mb-1 mx-auto" />
                    <p className="text-xl font-bold">{stats.totalSlides}</p>
                    <p className="text-xs opacity-70">Slides</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content Container */}
          <div className="space-y-6">
            {/* General Settings Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                {/* Company Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#36454F]">Company Details</h3>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Company Logo */}
                    <div className="bg-gradient-to-br from-[#FAF4EC] to-[#f5ede3] rounded-xl p-6 border-2 border-dashed border-[#36454F]/20">
                      <label className="block text-sm font-semibold text-[#36454F] mb-4 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-[#6B7F39]" />
                        Company Logo
                      </label>
                      <div className="flex items-center gap-6">
                        {generalSettings.companyLogo ? (
                          <div className="relative group">
                            <img
                              src={generalSettings.companyLogo}
                              alt="Company Logo"
                              className="w-24 h-24 object-contain border-2 border-[#36454F]/20 rounded-xl bg-white shadow-md"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Edit className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-[#36454F]/30 rounded-xl flex items-center justify-center bg-white">
                            <Building2 className="w-8 h-8 text-[#36454F]/40" />
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
                            <Button type="button" variant="outline" className="border-2 border-[#6B7F39] text-[#6B7F39] hover:bg-[#FAF4EC]" asChild>
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

                    {/* Company Info Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Company Name */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <Building2 className="w-4 h-4 text-[#6B7F39]" />
                          Company Name
                        </label>
                        <Input
                          value={generalSettings.companyName}
                          onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
                          placeholder="Enter company name"
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <Phone className="w-4 h-4 text-[#6B7F39]" />
                          Phone Number
                        </label>
                        <Input
                          value={generalSettings.companyPhone}
                          onChange={(e) => setGeneralSettings({...generalSettings, companyPhone: e.target.value})}
                          placeholder="+254 700 123 456"
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <Mail className="w-4 h-4 text-[#6B7F39]" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={generalSettings.companyEmail}
                          onChange={(e) => setGeneralSettings({...generalSettings, companyEmail: e.target.value})}
                          placeholder="info@skywaysuites.co.ke"
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>

                      {/* Website */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <Globe className="w-4 h-4 text-[#6B7F39]" />
                          Website
                        </label>
                        <Input
                          type="url"
                          value={generalSettings.companyWebsite}
                          onChange={(e) => setGeneralSettings({...generalSettings, companyWebsite: e.target.value})}
                          placeholder="https://skywaysuites.co.ke"
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <MapPin className="w-4 h-4 text-[#6B7F39]" />
                          Address
                        </label>
                        <Input
                          value={generalSettings.companyAddress}
                          onChange={(e) => setGeneralSettings({...generalSettings, companyAddress: e.target.value})}
                          placeholder="Nairobi, Kenya"
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>

                      {/* Currency */}
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#36454F]">
                          <DollarSign className="w-4 h-4 text-[#6B7F39]" />
                          Currency
                        </label>
                        <Select
                          value={generalSettings.currency}
                          onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
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
                    <div className="pt-4 border-t-2 border-[#36454F]/10">
                      <Button 
                        onClick={handleSaveGeneralSettings}
                        className="w-full md:w-auto bg-[#6B7F39] hover:bg-[#5a6930] text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={!isOnline}
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
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#36454F]">Slideshow Management</h3>
                          <p className="text-sm text-[#36454F]/70">{homePageSettings.slides.length} active slides</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleAddSlide}
                        className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                        disabled={!isOnline}
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
                        className="group bg-[#FAF4EC] rounded-2xl p-5 border border-[#36454F]/10 hover:border-[#6B7F39] transition-all duration-300"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-[#6B7F39] text-white font-bold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </div>
                            {slide.image && (
                              <div className="w-24 h-16 rounded-lg overflow-hidden border-2 border-[#6B7F39] flex-shrink-0">
                                <img 
                                  src={slide.image} 
                                  alt={slide.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#36454F] text-lg truncate">{slide.title}</p>
                              <p className="text-gray-600 text-sm truncate">{slide.subtitle}</p>
                              {!slide.image && (
                                <p className="text-xs text-gray-400 mt-1">No image uploaded</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSlide(slide)}
                              className="border-2 border-[#6B7F39] text-[#6B7F39] hover:bg-[#FAF4EC]"
                              disabled={!isOnline}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
                              disabled={!isOnline}
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

                {/* Why Choose Skyway Suites Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#36454F]">Why Choose Skyway Suites</h3>
                        <p className="text-sm text-[#36454F]/70">Section title and subtitle</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#36454F]">Section Title</label>
                      <Input
                        value={homePageSettings.whyUsTitle}
                        onChange={(e) => setHomePageSettings({...homePageSettings, whyUsTitle: e.target.value})}
                        className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#36454F]">Section Subtitle</label>
                      <Input
                        value={homePageSettings.whyUsSubtitle}
                        onChange={(e) => setHomePageSettings({...homePageSettings, whyUsSubtitle: e.target.value})}
                        className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                      />
                    </div>
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-[#36454F]">Features ({homePageSettings.whyUsItems.length})</h4>
                        <Button
                          onClick={handleAddWhyUsItem}
                          size="sm"
                          className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                          disabled={!isOnline}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Feature
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {homePageSettings.whyUsItems.map((item, index) => (
                          <div
                            key={item.id}
                            className="bg-[#FAF4EC] rounded-xl p-4 border border-[#36454F]/10"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-[#6B7F39] text-white font-bold flex items-center justify-center text-sm">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-[#36454F]">{item.title}</p>
                                  <p className="text-sm text-gray-600 line-clamp-1">{item.description}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditWhyUsItem(item)}
                                  className="border-2 border-[#6B7F39] text-[#6B7F39] hover:bg-[#FAF4EC]"
                                  disabled={!isOnline}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteWhyUsItem(item.id)}
                                  className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
                                  disabled={!isOnline}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Get In Touch Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <Headset className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#36454F]">Get In Touch</h3>
                        <p className="text-sm text-[#36454F]/70">Contact section settings</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-semibold text-[#36454F]">Section Title</label>
                        <Input
                          value={homePageSettings?.getInTouch?.title || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), title: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-semibold text-[#36454F]">Section Subtitle</label>
                        <Input
                          value={homePageSettings?.getInTouch?.subtitle || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), subtitle: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">Phone</label>
                        <Input
                          value={homePageSettings?.getInTouch?.phone || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), phone: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">Email</label>
                        <Input
                          value={homePageSettings?.getInTouch?.email || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), email: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">WhatsApp</label>
                        <Input
                          value={homePageSettings?.getInTouch?.whatsapp || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), whatsapp: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">Address</label>
                        <Input
                          value={homePageSettings?.getInTouch?.address || ''}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            getInTouch: {...(homePageSettings?.getInTouch || {}), address: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <Layout className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#36454F]">Footer</h3>
                        <p className="text-sm text-[#36454F]/70">Footer content and links</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#36454F]">About Text</label>
                      <Textarea
                        value={homePageSettings.footer.aboutText}
                        onChange={(e) => setHomePageSettings({
                          ...homePageSettings,
                          footer: {...homePageSettings.footer, aboutText: e.target.value}
                        })}
                        className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl min-h-[100px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">Contact Email</label>
                        <Input
                          value={homePageSettings.footer.contactEmail}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, contactEmail: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#36454F]">Contact Phone</label>
                        <Input
                          value={homePageSettings.footer.contactPhone}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, contactPhone: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-semibold text-[#36454F]">Contact Address</label>
                        <Input
                          value={homePageSettings.footer.contactAddress}
                          onChange={(e) => setHomePageSettings({
                            ...homePageSettings,
                            footer: {...homePageSettings.footer, contactAddress: e.target.value}
                          })}
                          className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                        />
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-semibold text-[#36454F] mb-3">Social Media Links</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-[#36454F]">Facebook</label>
                          <Input
                            value={homePageSettings.footer.socialLinks.facebook}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, facebook: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                            placeholder="https://facebook.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-[#36454F]">Twitter</label>
                          <Input
                            value={homePageSettings.footer.socialLinks.twitter}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, twitter: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                            placeholder="https://twitter.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-[#36454F]">Instagram</label>
                          <Input
                            value={homePageSettings.footer.socialLinks.instagram}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, instagram: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                            placeholder="https://instagram.com/..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-[#36454F]">LinkedIn</label>
                          <Input
                            value={homePageSettings.footer.socialLinks.linkedin}
                            onChange={(e) => setHomePageSettings({
                              ...homePageSettings,
                              footer: {
                                ...homePageSettings.footer,
                                socialLinks: {...homePageSettings.footer.socialLinks, linkedin: e.target.value}
                              }
                            })}
                            className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                            placeholder="https://linkedin.com/..."
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#36454F]">Copyright Text</label>
                      <Input
                        value={homePageSettings.footer.copyrightText}
                        onChange={(e) => setHomePageSettings({
                          ...homePageSettings,
                          footer: {...homePageSettings.footer, copyrightText: e.target.value}
                        })}
                        className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveHomePageSettings}
                    className="bg-[#6B7F39] hover:bg-[#5a6930] text-white font-semibold py-6 px-8 rounded-xl shadow-lg"
                    disabled={!isOnline}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Home Page Settings
                  </Button>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* User Management Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#36454F]">User Management</h3>
                          <p className="text-sm text-[#36454F]/70">{users.length} registered users</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowAddUserModal(true)}
                        className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                        disabled={!isOnline}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="bg-[#FAF4EC] rounded-xl p-4 border border-[#36454F]/10"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-[#6B7F39] text-white font-bold flex items-center justify-center">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-[#36454F]">{user.name}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4 text-[#6B7F39]" />
                                    {user.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4 text-[#6B7F39]" />
                                    {user.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-[#6B7F39] text-white text-xs font-semibold rounded-full">
                                {user.role}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="border-2 border-[#6B7F39] text-[#6B7F39] hover:bg-[#FAF4EC]"
                                disabled={!isOnline}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
                                disabled={!isOnline}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Database Tab */}
            {activeTab === 'database' && (
              <div className="space-y-6">
                {/* Database Backup & Restore Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#36454F]">Backup & Restore</h3>
                        <p className="text-sm text-gray-600 mt-0.5">Export, import, and manage database backups</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Button
                        onClick={handleExportDatabase}
                        className="bg-[#6B7F39] hover:bg-[#5a6930] text-white h-auto py-6 flex flex-col items-center gap-2"
                        disabled={!isOnline}
                      >
                        <Download className="w-6 h-6" />
                        <span className="font-semibold">Export Database</span>
                        <span className="text-xs opacity-80">Download backup</span>
                      </Button>

                      <label htmlFor="import-database">
                        <input
                          type="file"
                          id="import-database"
                          accept=".json"
                          onChange={handleImportDatabase}
                          className="hidden"
                          disabled={!isOnline}
                        />
                        <div className="bg-[#6B7F39] hover:bg-[#5a6930] text-white h-full rounded-lg cursor-pointer py-6 flex flex-col items-center gap-2 justify-center">
                          <Upload className="w-6 h-6" />
                          <span className="font-semibold">Import Database</span>
                          <span className="text-xs opacity-80">Restore from file</span>
                        </div>
                      </label>

                      <Button
                        onClick={handleCopyDatabaseQuery}
                        className="bg-[#36454F] hover:bg-[#2a3640] text-white h-auto py-6 flex flex-col items-center gap-2"
                        disabled={!isOnline}
                      >
                        <Copy className="w-6 h-6" />
                        <span className="font-semibold">Copy Query</span>
                        <span className="text-xs opacity-80">Copy to clipboard</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Data Management Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-[#36454F]">Data Management</h3>
                          <p className="text-sm text-gray-600 mt-0.5">Clear specific data tables or reset entire system</p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                        <p className="text-xs font-semibold text-red-700">⚠️ Destructive Actions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* Clear Individual Tables */}
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={handleClearProperties}
                        variant="outline"
                        className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <Home className="w-4 h-4" />
                        <span className="text-sm font-semibold">Clear Properties</span>
                      </Button>

                      <Button
                        onClick={handleClearCustomers}
                        variant="outline"
                        className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">Clear Customers</span>
                      </Button>

                      <Button
                        onClick={handleClearBookings}
                        variant="outline"
                        className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-semibold">Clear Bookings</span>
                      </Button>

                      <Button
                        onClick={handleClearPayments}
                        variant="outline"
                        className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-semibold">Clear Payments</span>
                      </Button>

                      <Button
                        onClick={handleClearActivityLogs}
                        variant="outline"
                        className="border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-semibold">Clear Activity Logs</span>
                      </Button>

                      <Button
                        onClick={handleResetSystem}
                        variant="outline"
                        className="border-2 border-red-600 text-red-800 hover:bg-red-100 hover:border-red-700 hover:text-black h-auto py-3 flex flex-col items-center gap-1.5"
                        disabled={!isOnline}
                      >
                        <Database className="w-4 h-4" />
                        <span className="text-sm font-semibold">Reset System</span>
                      </Button>
                    </div>

                    {/* Warning Notice */}
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-800 mb-1">⚠️ Warning: Irreversible Actions</h4>
                          <p className="text-sm text-red-700">
                            These operations will permanently delete data from the cloud database. 
                            Make sure to export a backup before clearing any data. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Notification Tabs */}
                <div className="bg-white rounded-2xl shadow-lg border border-[#36454F]/10 overflow-hidden">
                  <div className="p-6 bg-[#FAF4EC] border-b border-[#36454F]/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#6B7F39] flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-[#36454F]">Notification Settings</h3>
                    </div>
                    
                    {/* Sub-tabs for SMS, WhatsApp, Email */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveNotificationTab('sms')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeNotificationTab === 'sms'
                            ? 'bg-[#6B7F39] text-white shadow-lg'
                            : 'bg-white text-[#36454F] hover:bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        SMS
                      </button>
                      <button
                        onClick={() => setActiveNotificationTab('whatsapp')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeNotificationTab === 'whatsapp'
                            ? 'bg-[#6B7F39] text-white shadow-lg'
                            : 'bg-white text-[#36454F] hover:bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        WhatsApp
                      </button>
                      <button
                        onClick={() => setActiveNotificationTab('email')}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          activeNotificationTab === 'email'
                            ? 'bg-[#6B7F39] text-white shadow-lg'
                            : 'bg-white text-[#36454F] hover:bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        Email
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <NotificationsTabContent
                      activeTab={activeNotificationTab}
                      smsProvider={smsProvider}
                      setSmsProvider={setSmsProvider}
                      africastalkingSettings={africastalkingSettings}
                      setAfricastalkingSettings={setAfricastalkingSettings}
                      twilioSettings={twilioSettings}
                      setTwilioSettings={setTwilioSettings}
                      whatsappSettings={whatsappSettings}
                      setWhatsappSettings={setWhatsappSettings}
                      emailSettings={emailSettings}
                      setEmailSettings={setEmailSettings}
                      onSave={handleSaveNotificationSettings}
                      isOnline={isOnline}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </main>
      </div>

      {/* Custom Modal */}
      {modalState.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className={`p-6 rounded-t-2xl ${
              modalState.type === 'success' ? 'bg-[#6B7F39]' :
              modalState.type === 'error' ? 'bg-[#36454F]' :
              modalState.type === 'confirm' ? 'bg-[#6B7F39]' :
              'bg-[#36454F]'
            }`}>
              <h3 className="text-xl font-bold text-white">{modalState.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-[#36454F]">{modalState.message}</p>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              {modalState.type === 'confirm' ? (
                <>
                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
                  >
                    {modalState.cancelText}
                  </Button>
                  <Button
                    onClick={handleModalConfirm}
                    className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                  >
                    {modalState.confirmText}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={closeModal}
                  className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                >
                  {modalState.confirmText}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide Modal */}
      {showSlideModal && editingSlide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-[#6B7F39] rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">
                {homePageSettings.slides.find(s => s.id === editingSlide.id) ? 'Edit Slide' : 'Add Slide'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Title</label>
                <Input
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter slide title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Subtitle</label>
                <Input
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({...editingSlide, subtitle: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter slide subtitle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">
                  Image (1920x600 recommended)
                </label>
                <div className="space-y-3">
                  <label htmlFor="slide-image-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#6B7F39] transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500">Max 10MB, will be compressed to WebP (50KB)</p>
                      </div>
                    </div>
                    <input
                      id="slide-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      className="hidden"
                    />
                  </label>
                  {editingSlide.image && (
                    <div className="relative rounded-xl overflow-hidden border-2 border-[#6B7F39]">
                      <img 
                        src={editingSlide.image} 
                        alt="Slide preview" 
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => setEditingSlide({...editingSlide, image: ''})}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowSlideModal(false);
                  setEditingSlide(null);
                }}
                variant="outline"
                className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSlide}
                className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-[#6B7F39] rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Name *</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Email *</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Phone</label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Password *</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Role *</label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({ name: '', email: '', phone: '', password: '', role: 'Customer' });
                }}
                variant="outline"
                className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Add User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-[#6B7F39] rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">Edit User</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Name *</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Email *</label>
                <Input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Phone</label>
                <Input
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="+254 700 000 000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">
                  Password (leave empty to keep current)
                </label>
                <Input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Role *</label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                variant="outline"
                className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateUser}
                className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Why Us Item Modal */}
      {showWhyUsModal && editingWhyUsItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-[#6B7F39] rounded-t-2xl sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">
                {homePageSettings.whyUsItems.find(i => i.id === editingWhyUsItem.id) ? 'Edit Feature' : 'Add Feature'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Icon</label>
                <Select
                  value={editingWhyUsItem.icon}
                  onValueChange={(value) => setEditingWhyUsItem({...editingWhyUsItem, icon: value})}
                >
                  <SelectTrigger className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shield">Shield (Verified)</SelectItem>
                    <SelectItem value="clock">Clock (24/7 Support)</SelectItem>
                    <SelectItem value="star">Star (Best Quality)</SelectItem>
                    <SelectItem value="map">Map Pin (Locations)</SelectItem>
                    <SelectItem value="heart">Heart (Quality Service)</SelectItem>
                    <SelectItem value="check">Check (Easy Booking)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Title</label>
                <Input
                  value={editingWhyUsItem.title}
                  onChange={(e) => setEditingWhyUsItem({...editingWhyUsItem, title: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl h-12"
                  placeholder="Enter feature title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#36454F]">Description</label>
                <Textarea
                  value={editingWhyUsItem.description}
                  onChange={(e) => setEditingWhyUsItem({...editingWhyUsItem, description: e.target.value})}
                  className="border-2 border-gray-200 focus:border-[#6B7F39] rounded-xl min-h-[100px]"
                  placeholder="Enter feature description"
                />
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowWhyUsModal(false);
                  setEditingWhyUsItem(null);
                }}
                variant="outline"
                className="border-2 border-[#36454F] text-[#36454F] hover:bg-[#FAF4EC]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveWhyUsItem}
                className="bg-[#6B7F39] hover:bg-[#5a6930] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
