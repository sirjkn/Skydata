import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Building2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CustomModal } from '../components/custom-modal';
import { createCustomer, fetchCustomers } from '../../lib/supabaseData';
import { createAuthUser, fetchAuthUserByEmail } from '../../lib/supabaseData';
import { login } from '../lib/auth';

export function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    password: ''
  });

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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!customerForm.name.trim()) {
      showModal('error', 'Name Required', 'Please enter your name');
      return;
    }

    if (!customerForm.email.trim()) {
      showModal('error', 'Email Required', 'Please enter your email');
      return;
    }

    if (!customerForm.password.trim()) {
      showModal('error', 'Password Required', 'Please enter a password');
      return;
    }

    if (customerForm.password.length < 6) {
      showModal('error', 'Password Too Short', 'Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Check if email already exists in auth table
      const existingUser = await fetchAuthUserByEmail(customerForm.email.trim().toLowerCase());

      if (existingUser) {
        showModal('error', 'Email Already Exists', 'An account with this email already exists. Please login instead.');
        setIsLoading(false);
        return;
      }

      // Create customer record
      const customerData = {
        customer_name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || '',
        email: customerForm.email.trim().toLowerCase(),
        address: customerForm.address.trim() || null,
        password: customerForm.password.trim(),
        id_number: null,
        profile_photo: null,
        notes: null,
        is_active: true
      };

      const newCustomer = await createCustomer(customerData);

      // Create auth user record
      const authUserData = {
        customer_name: customerForm.name.trim(),
        email: customerForm.email.trim().toLowerCase(),
        phone: customerForm.phone.trim() || null,
        password: customerForm.password.trim(),
        role: 'Customer' as const,
        is_active: true,
        last_login: null
      };

      await createAuthUser(authUserData);

      // Auto-login the user
      login({
        user_id: newCustomer.customer_id!,
        customer_name: newCustomer.customer_name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        role: 'Customer'
      });

      setIsLoading(false);

      showModal('success', 'Account Created Successfully', 'Welcome to Skyway Suites! You can now start booking properties.', () => {
        navigate('/');
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      setIsLoading(false);
      showModal('error', 'Error Creating Account', error.message || 'An error occurred while creating your account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#36454F] hover:text-[#6B7F39] mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-[#6B7F39] rounded-lg p-3">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#36454F]">Skyway Suites</h1>
            <p className="text-sm text-gray-600">Kenya's Premier Property Platform</p>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-[#36454F] text-center">
              Create Your Account
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Join Skyway Suites and start booking your dream property
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={customerForm.password}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Create a password"
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-white py-2.5"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-[#6B7F39] hover:text-[#5a6930] font-semibold"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
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
  );
}