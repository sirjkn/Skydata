/**
 * Settings Helper Functions for Skyway Suites
 * Provides easy-to-use functions for managing settings in Supabase
 * Version 1.0 - Cloud Integration
 */

import {
  fetchSettingByKey,
  upsertSetting,
  fetchSettingsByCategory,
  deleteSetting
} from '../../lib/supabaseData';

// ============================================================================
// GENERAL SETTINGS HELPERS
// ============================================================================

export async function getGeneralSettings() {
  try {
    const setting = await fetchSettingByKey('general', 'company_info');
    if (setting && setting.setting_value) {
      return JSON.parse(setting.setting_value);
    }
  } catch (error) {
    console.error('Error fetching general settings:', error);
  }
  
  // Return defaults if not found
  return {
    companyName: 'Skyway Suites',
    companyLogo: '',
    companyPhone: '+254 700 123 456',
    companyEmail: 'info@skywaysuites.co.ke',
    companyWebsite: 'https://skywaysuites.co.ke',
    companyAddress: 'Nairobi, Kenya',
    currency: 'KSh'
  };
}

export async function saveGeneralSettings(settings: any) {
  await upsertSetting('general', 'company_info', JSON.stringify(settings), 'json');
}

// ============================================================================
// HOMEPAGE SETTINGS HELPERS
// ============================================================================

export async function getHomePageSettings() {
  try {
    const setting = await fetchSettingByKey('homepage', 'layout');
    if (setting && setting.setting_value) {
      return JSON.parse(setting.setting_value);
    }
  } catch (error) {
    console.error('Error fetching homepage settings:', error);
  }
  
  // Return defaults if not found
  return {
    slides: [
      { id: '1', title: 'Welcome to Skyway Suites', subtitle: 'Find your perfect stay', image: '', order: 1 },
      { id: '2', title: 'Luxury Properties', subtitle: 'Premium experiences await', image: '', order: 2 },
      { id: '3', title: 'Book Your Stay', subtitle: 'Easy and secure booking', image: '', order: 3 }
    ],
    propertiesTitle: 'Featured Properties',
    propertiesSubtitle: 'Handpicked premium properties just for you',
    propertiesLayout: {
      columns: 3,
      rows: 2,
      maxProperties: 6
    },
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
    getInTouch: {
      title: 'Get In Touch',
      subtitle: 'Have questions? We\'re here to help you find your dream home',
      phone: '+254 700 123 456',
      email: 'info@skywaysuites.co.ke',
      address: 'Nairobi, Kenya',
      whatsapp: '+254 700 123 456'
    },
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
  };
}

export async function saveHomePageSettings(settings: any) {
  await upsertSetting('homepage', 'layout', JSON.stringify(settings), 'json');
}

// ============================================================================
// NOTIFICATION SETTINGS HELPERS (SMS, WhatsApp, Email)
// ============================================================================

export async function getNotificationSettings() {
  try {
    const setting = await fetchSettingByKey('notifications', 'config');
    if (setting && setting.setting_value) {
      return JSON.parse(setting.setting_value);
    }
  } catch (error) {
    console.error('Error fetching notification settings:', error);
  }
  
  // Return defaults if not found
  return {
    sms: {
      provider: 'africastalking',
      africastalking: {
        apiKey: '',
        username: '',
        shortcode: ''
      },
      twilio: {
        accountSid: '',
        authToken: '',
        phoneNumber: ''
      }
    },
    whatsapp: {
      enabled: false,
      apiKey: '',
      apiUrl: 'https://api.wasenderapi.com',
      adminPhone: ''
    },
    email: {
      enabled: false,
      provider: 'smtp',
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: 'Skyway Suites',
      adminEmail: ''
    },
    defaultMessages: {
      bookingMadeAdmin: 'New booking made! Visit system to approve and confirm payment.',
      bookingApprovedCustomer: 'Booking approved! We will call you if more information is needed.',
      customMessage: ''
    }
  };
}

export async function saveNotificationSettings(settings: any) {
  await upsertSetting('notifications', 'config', JSON.stringify(settings), 'json');
}

// Backward compatibility - deprecated
export async function getSmsSettings() {
  const notifSettings = await getNotificationSettings();
  return {
    provider: notifSettings.sms.provider,
    africastalking: notifSettings.sms.africastalking,
    twilio: notifSettings.sms.twilio,
    defaultMessages: notifSettings.defaultMessages
  };
}

export async function saveSmsSettings(settings: any) {
  const notifSettings = await getNotificationSettings();
  notifSettings.sms = {
    provider: settings.provider,
    africastalking: settings.africastalking,
    twilio: settings.twilio
  };
  notifSettings.defaultMessages = settings.defaultMessages;
  await saveNotificationSettings(notifSettings);
}