import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { toast } from 'sonner';
import { getSupabaseClient } from '../../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { Save, Download, Upload, Database, RefreshCw, Settings as SettingsIcon, Building2, MessageCircle, CreditCard, DollarSign } from 'lucide-react';

const supabase = getSupabaseClient();

interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  whatsappNumber: string;
  supportNumber: string;
  currency: string;
  currencySymbol: string;
  enableWhatsApp: boolean;
  paymentMethods: {
    mpesa: boolean;
    card: boolean;
    bank: boolean;
    cash: boolean;
  };
  maintenanceMode: boolean;
}

const defaultSettings: SystemSettings = {
  companyName: 'Skyway Suites',
  companyEmail: 'info@skywaysuites.com',
  companyPhone: '+254 700 000 000',
  companyAddress: 'Nairobi, Kenya',
  whatsappNumber: '+254700000000',
  supportNumber: '+254700000000',
  currency: 'KSH',
  currencySymbol: 'Ksh',
  enableWhatsApp: true,
  paymentMethods: {
    mpesa: true,
    card: false,
    bank: true,
    cash: true,
  },
  maintenanceMode: false,
};

export function AdminSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('Please login to access this page.');
      navigate('/login');
      return;
    }
    
    const adminEmails = ['admin@skyway.com', 'admin@123.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    setAccessToken(session.access_token);
    await loadSettings(session.access_token);
    setLoading(false);
  };

  const loadSettings = async (token: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/settings`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.settings) {
          setSettings(result.settings);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      console.log('Saving settings:', settings);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      console.log('Settings save response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Settings saved successfully:', result);
        toast.success('Settings saved successfully');
      } else {
        const error = await response.text();
        console.error('Failed to save settings:', error);
        toast.error(`Failed to save settings: ${error}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(`Failed to save settings: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      setBackupLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/backup`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skyway-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Backup downloaded successfully');
      } else {
        toast.error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setRestoreLoading(true);
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (response.ok) {
        toast.success('Data restored successfully');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error('Failed to restore data');
      }
    } catch (error) {
      console.error('Error restoring data:', error);
      toast.error('Failed to restore data. Invalid backup file.');
    } finally {
      setRestoreLoading(false);
      event.target.value = '';
    }
  };

  const downloadData = async (dataType: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/export/${dataType}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${dataType}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${dataType} data downloaded`);
      } else {
        toast.error(`Failed to download ${dataType} data`);
      }
    } catch (error) {
      console.error(`Error downloading ${dataType} data:`, error);
      toast.error(`Failed to download ${dataType} data`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading settings...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8 text-accent" />
            <h1 className="text-4xl font-bold">System Settings</h1>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6">
            {/* Company Details */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Company Details</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    placeholder="Skyway Suites"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={settings.companyEmail}
                    onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                    placeholder="info@skywaysuites.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={settings.companyPhone}
                    onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={settings.companyAddress}
                    onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                    placeholder="Nairobi, Kenya"
                  />
                </div>
              </div>
            </Card>

            {/* WhatsApp & Support Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageCircle className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">WhatsApp & Support</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enableWhatsApp">Enable WhatsApp Integration</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to contact via WhatsApp</p>
                  </div>
                  <Switch
                    id="enableWhatsApp"
                    checked={settings.enableWhatsApp}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableWhatsApp: checked })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                    <Input
                      id="whatsappNumber"
                      value={settings.whatsappNumber}
                      onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                      placeholder="+254700000000"
                    />
                    <p className="text-xs text-muted-foreground">Format: +254700000000 (no spaces)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supportNumber">Support Number</Label>
                    <Input
                      id="supportNumber"
                      value={settings.supportNumber}
                      onChange={(e) => setSettings({ ...settings, supportNumber: e.target.value })}
                      placeholder="+254700000000"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Currency Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Currency Settings</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => {
                      const symbols: { [key: string]: string } = {
                        KSH: 'Ksh',
                        USD: '$',
                        EUR: '€',
                        GBP: '£',
                      };
                      setSettings({ 
                        ...settings, 
                        currency: value,
                        currencySymbol: symbols[value] || value
                      });
                    }}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KSH">KSH - Kenyan Shilling</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    placeholder="Ksh"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Payment Methods</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mpesa">M-Pesa</Label>
                    <p className="text-sm text-muted-foreground">Enable M-Pesa mobile payments</p>
                  </div>
                  <Switch
                    id="mpesa"
                    checked={settings.paymentMethods.mpesa}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        paymentMethods: { ...settings.paymentMethods, mpesa: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="card">Credit/Debit Card</Label>
                    <p className="text-sm text-muted-foreground">Enable card payments</p>
                  </div>
                  <Switch
                    id="card"
                    checked={settings.paymentMethods.card}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        paymentMethods: { ...settings.paymentMethods, card: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bank">Bank Transfer</Label>
                    <p className="text-sm text-muted-foreground">Enable bank transfer payments</p>
                  </div>
                  <Switch
                    id="bank"
                    checked={settings.paymentMethods.bank}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        paymentMethods: { ...settings.paymentMethods, bank: checked }
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cash">Cash Payment</Label>
                    <p className="text-sm text-muted-foreground">Enable cash on delivery</p>
                  </div>
                  <Switch
                    id="cash"
                    checked={settings.paymentMethods.cash}
                    onCheckedChange={(checked) => 
                      setSettings({ 
                        ...settings, 
                        paymentMethods: { ...settings.paymentMethods, cash: checked }
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* System Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <SettingsIcon className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">System Settings</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put the system in maintenance mode (users cannot access)
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </Card>

            {saving && (
              <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Saving settings to database...
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving} size="lg">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* DATABASE TAB */}
          <TabsContent value="database" className="space-y-6">
            {/* Database Info */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Database Information</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Database Type</p>
                    <p className="text-lg font-semibold">Supabase PostgreSQL</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Storage Type</p>
                    <p className="text-lg font-semibold">Key-Value Store</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Real-time Sync</p>
                    <p className="text-lg font-semibold text-green-600">Active</p>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Info:</strong> All data is stored in the <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded">kv_store_6a712830</code> table with automatic real-time synchronization.
                  </p>
                </div>
              </div>
            </Card>

            {/* Backup & Restore */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <RefreshCw className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Backup & Restore</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Create Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a complete backup of all system data including properties, bookings, customers, and settings.
                  </p>
                  <Button onClick={handleBackup} disabled={backupLoading}>
                    <Download className="w-4 h-4 mr-2" />
                    {backupLoading ? 'Creating Backup...' : 'Download Backup'}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Restore from Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a backup file to restore system data. <span className="text-red-600 font-semibold">Warning: This will overwrite existing data!</span>
                  </p>
                  <div className="flex items-center space-x-4">
                    <Button variant="destructive" disabled={restoreLoading} asChild>
                      <label htmlFor="restore-file" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {restoreLoading ? 'Restoring...' : 'Upload Backup File'}
                      </label>
                    </Button>
                    <input
                      id="restore-file"
                      type="file"
                      accept=".json"
                      onChange={handleRestore}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Export Data */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Download className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Export Data</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Download specific data types as JSON files for analysis or migration.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => downloadData('properties')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Properties
                  </Button>
                  <Button variant="outline" onClick={() => downloadData('bookings')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Bookings
                  </Button>
                  <Button variant="outline" onClick={() => downloadData('customers')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Customers
                  </Button>
                  <Button variant="outline" onClick={() => downloadData('settings')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
              </div>
            </Card>

            {/* Database Statistics */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold">Database Statistics</h2>
              </div>
              <Separator className="mb-6" />
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  <strong>Note:</strong> Advanced SQL queries and direct database access are managed through the Supabase Dashboard. Visit the project dashboard for advanced database operations.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}