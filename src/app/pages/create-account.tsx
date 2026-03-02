import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Layout } from '../components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { getSupabaseClient } from '../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabase = getSupabaseClient();

export function CreateAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  // Format Kenyan phone number
  const formatPhoneNumber = (phone: string): string => {
    // Remove all spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    
    // If number starts with +254, return as is
    if (cleaned.startsWith('+254')) {
      return cleaned;
    }
    
    // If number starts with 0, replace with +254
    if (cleaned.startsWith('0')) {
      return '+254' + cleaned.substring(1);
    }
    
    // If number starts with 254 (without +), add +
    if (cleaned.startsWith('254')) {
      return '+' + cleaned;
    }
    
    // Return as is if doesn't match any pattern
    return cleaned;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (createForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Format phone number before submission
    const formattedPhone = formatPhoneNumber(createForm.phone);
    
    // Validate phone number length (should be +254XXXXXXXXX = 13 characters)
    if (formattedPhone.length !== 13 || !formattedPhone.startsWith('+254')) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0700000000 or +254700000000)');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating account with signup route...');
      console.log('Formatted phone:', formattedPhone);
      
      // Create user account using Supabase auth
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: createForm.email,
            password: createForm.password,
            name: createForm.name,
            phone: formattedPhone,
            address: createForm.address,
          }),
        }
      );

      console.log('Signup response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Account created successfully:', result);
        
        toast.success('Account created successfully! You can now login.');
        
        // Reset form
        setCreateForm({
          name: '',
          phone: '',
          email: '',
          address: '',
          password: '',
          confirmPassword: '',
        });

        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Signup error:', errorData);
        toast.error(errorData.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Create account error:', error);
      toast.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Create your account to start booking properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Full Name</Label>
                  <Input
                    id="create-name"
                    type="text"
                    placeholder="John Doe"
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone</Label>
                  <Input
                    id="create-phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="customer@email.com"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-address">Address</Label>
                  <Textarea
                    id="create-address"
                    placeholder="123 Main Street, Nairobi"
                    value={createForm.address}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, address: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-password">Password</Label>
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="Enter your password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-confirm-password">Confirm Password</Label>
                  <Input
                    id="create-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                {loading && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Creating your account...
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="text-accent hover:underline font-semibold">
                      Login
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}