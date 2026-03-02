import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useRealtimeCustomers } from '../../hooks/useRealtime';

const supabase = getSupabaseClient();

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export function AdminCustomers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  
  // Use realtime hook - pass empty string initially, hook will wait for valid token
  const { data: customers, loading: customersLoading, refresh } = useRealtimeCustomers(accessToken);

  useEffect(() => {
    checkAuth();
  }, []);

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

  const checkAuth = async () => {
    try {
      // First try to refresh the session to get a fresh token
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session) {
        console.log('❌ Session refresh failed, trying getSession:', error);
        // Fallback to getSession if refresh fails
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        
        if (!fallbackSession?.user) {
          toast.error('Please login to view customers');
          navigate('/login');
          return;
        }
        
        // Check admin privileges
        const adminEmails = ['admin@skyway.com', 'admin@123.com'];
        if (!adminEmails.includes(fallbackSession.user.email || '')) {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
        
        console.log('✅ Using fallback session token for customers');
        setAccessToken(fallbackSession.access_token);
        setLoading(false);
        return;
      }
      
      // Check admin privileges
      const adminEmails = ['admin@skyway.com', 'admin@123.com'];
      if (!adminEmails.includes(session.user.email || '')) {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }
      
      console.log('✅ Using refreshed session token for customers');
      setAccessToken(session.access_token);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      toast.error('Authentication error');
      navigate('/login');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    if (newCustomer.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newCustomer.password !== newCustomer.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Format phone number before submission
    const formattedPhone = formatPhoneNumber(newCustomer.phone);
    
    // Validate phone number length (should be +254XXXXXXXXX = 13 characters)
    if (formattedPhone.length !== 13 || !formattedPhone.startsWith('+254')) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0700000000 or +254700000000)');
      return;
    }

    setSaving(true);

    try {
      console.log('Adding customer via signup route...');
      console.log('Formatted phone:', formattedPhone);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: newCustomer.email,
            password: newCustomer.password,
            name: newCustomer.name,
            phone: formattedPhone,
            address: newCustomer.address,
          }),
        }
      );

      console.log('Add customer response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Customer added successfully:', result);
        
        toast.success('Customer added successfully!');
        
        // Reset form
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          address: '',
          password: '',
          confirmPassword: '',
        });

        // Close dialog
        setAddDialogOpen(false);

        // Refresh customers list
        await refresh();
      } else {
        const errorData = await response.json();
        console.error('Add customer error:', errorData);
        toast.error(errorData.error || 'Failed to add customer');
      }
    } catch (error) {
      console.error('Add customer error:', error);
      toast.error('Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading || customersLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading customers...</div>
        </div>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Customers</h1>
          
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
                <DialogDescription>
                  Create a new customer account with login credentials
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCustomer} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Full Name</Label>
                  <Input
                    id="add-name"
                    type="text"
                    placeholder="John Doe"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input
                    id="add-phone"
                    type="tel"
                    placeholder="+254 712 345 678"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="customer@email.com"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-address">Address</Label>
                  <Textarea
                    id="add-address"
                    placeholder="123 Main Street, Nairobi"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, address: e.target.value })
                    }
                    required
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-password">Password</Label>
                  <Input
                    id="add-password"
                    type="password"
                    placeholder="Enter password"
                    value={newCustomer.password}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="add-confirm-password">Confirm Password</Label>
                  <Input
                    id="add-confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={newCustomer.confirmPassword}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, confirmPassword: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                {saving && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Adding customer...
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Customer'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {customers.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">No customers yet</p>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Customer
                </Button>
              </DialogTrigger>
            </Dialog>
          </Card>
        ) : (
          <>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.address || '-'}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="mt-8">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-2">Total Customers</h3>
                <p className="text-4xl font-bold text-accent">{customers.length}</p>
              </Card>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}