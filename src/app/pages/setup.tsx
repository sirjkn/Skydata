import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Building2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { createCustomer, createAuthUser, fetchAuthUsers } from '../../lib/supabaseData';

export function Setup() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'checking' | 'needed' | 'complete' | 'error'>('checking');
  const [message, setMessage] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const users = await fetchAuthUsers();
      
      if (users.length > 0) {
        setStatus('complete');
        setMessage('Database already initialized with users.');
      } else {
        setStatus('needed');
        setMessage('No users found in database. Click below to create default admin account.');
      }
    } catch (error: any) {
      console.error('Error checking setup status:', error);
      setStatus('error');
      setMessage(`Error checking database: ${error.message}`);
    }
  };

  const seedDatabase = async () => {
    setIsSeeding(true);
    try {
      // Create default admin customer
      const adminCustomer = await createCustomer({
        customer_name: 'Skyway Admin',
        phone: '+254712345678',
        email: 'admin@skywaysuites.com',
        address: 'Nairobi, Kenya',
        password: 'admin123',
        id_number: null,
        profile_photo: null,
        notes: 'Default admin account',
        is_active: true
      });

      // Create admin auth user
      await createAuthUser({
        customer_name: 'Skyway Admin',
        email: 'admin@skywaysuites.com',
        phone: '+254712345678',
        password: 'admin123',
        role: 'Admin',
        is_active: true,
        last_login: null
      });

      // Create default customer account
      const demoCustomer = await createCustomer({
        customer_name: 'Demo Customer',
        phone: '+254798765432',
        email: 'customer@demo.com',
        address: 'Mombasa, Kenya',
        password: 'customer123',
        id_number: null,
        profile_photo: null,
        notes: 'Demo customer account',
        is_active: true
      });

      // Create customer auth user
      await createAuthUser({
        customer_name: 'Demo Customer',
        email: 'customer@demo.com',
        phone: '+254798765432',
        password: 'customer123',
        role: 'Customer',
        is_active: true,
        last_login: null
      });

      setStatus('complete');
      setMessage('✅ Database successfully initialized! Default accounts created.');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error seeding database:', error);
      setStatus('error');
      setMessage(`❌ Error initializing database: ${error.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC]">
      {/* Header */}
      <header className="bg-[#36454F] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#6B7F39] rounded-lg p-2">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Skyway Suites</h1>
              <p className="text-xs text-gray-300">Database Setup</p>
            </div>
          </div>
        </div>
      </header>

      {/* Setup Card */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#36454F] text-center">
                Database Setup
              </CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Initialize Skyway Suites with default accounts
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Display */}
              {status === 'checking' && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#6B7F39]" />
                  <span className="text-gray-600">Checking database status...</span>
                </div>
              )}

              {status === 'needed' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">First Time Setup Required</p>
                      <p>{message}</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4">
                    <h3 className="font-bold text-lg text-[#36454F]">Default Accounts to be Created:</h3>
                    
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-semibold text-green-900 mb-2">👤 Admin Account</p>
                        <div className="text-sm text-green-800 space-y-1">
                          <p><strong>Email:</strong> admin@skywaysuites.com</p>
                          <p><strong>Password:</strong> admin123</p>
                          <p><strong>Role:</strong> Administrator (Full Access)</p>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="font-semibold text-blue-900 mb-2">👤 Demo Customer Account</p>
                        <div className="text-sm text-blue-800 space-y-1">
                          <p><strong>Email:</strong> customer@demo.com</p>
                          <p><strong>Password:</strong> customer123</p>
                          <p><strong>Role:</strong> Customer</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={seedDatabase}
                    disabled={isSeeding}
                    className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-white py-3 text-lg"
                  >
                    {isSeeding ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Initializing Database...
                      </>
                    ) : (
                      'Initialize Database'
                    )}
                  </Button>
                </div>
              )}

              {status === 'complete' && (
                <div className="space-y-6">
                  <div className="bg-green-50 border-2 border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Setup Complete!</p>
                      <p>{message}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate('/login')}
                      className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                    >
                      Go to Login
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="flex-1"
                    >
                      Go to Home
                    </Button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-6">
                  <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Error</p>
                      <p>{message}</p>
                    </div>
                  </div>

                  <Button
                    onClick={checkSetupStatus}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                <p className="font-semibold mb-2">ℹ️ Important Notes:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>This setup only needs to be run once</li>
                  <li>Change default passwords after first login</li>
                  <li>You can create additional accounts via the signup page</li>
                  <li>Admins can manage users from the Settings page</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
