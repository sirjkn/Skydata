import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../../components/layout';
import { Card } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Users, Shield, UserCog, User } from 'lucide-react';
import { getSupabaseClient } from '../../lib/supabase';
import { projectId } from '/utils/supabase/info';

const supabase = getSupabaseClient();

interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'manager' | 'customer';
  createdAt: string;
  lastSignIn?: string;
}

const ROLES = [
  { value: 'admin', label: 'Admin', icon: Shield, color: 'bg-red-500' },
  { value: 'manager', label: 'Manager', icon: UserCog, color: 'bg-blue-500' },
  { value: 'customer', label: 'Customer', icon: User, color: 'bg-green-500' },
];

export function AdminUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔐 Checking auth for users page...');
      
      // First try to refresh the session to get a fresh token
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error || !session?.user) {
        console.log('❌ Session refresh failed, trying getSession:', error);
        // Fallback to getSession if refresh fails
        const { data: { session: fallbackSession } } = await supabase.auth.getSession();
        
        if (!fallbackSession?.user) {
          toast.error('Please login to access this page.');
          navigate('/login');
          return;
        }
        
        const adminEmails = ['admin@skyway.com', 'admin@123.com'];
        const userRole = fallbackSession.user.user_metadata?.role;
        
        console.log('User email:', fallbackSession.user.email);
        console.log('User role:', userRole);
        
        if (!adminEmails.includes(fallbackSession.user.email || '') && userRole !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          navigate('/');
          return;
        }
        
        console.log('✅ Using fallback session token');
        setAccessToken(fallbackSession.access_token);
        await loadUsers(fallbackSession.access_token);
        return;
      }
      
      const adminEmails = ['admin@skyway.com', 'admin@123.com'];
      const userRole = session.user.user_metadata?.role;
      
      console.log('User email:', session.user.email);
      console.log('User role:', userRole);
      
      if (!adminEmails.includes(session.user.email || '') && userRole !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        navigate('/');
        return;
      }
      
      console.log('✅ Using refreshed session token');
      setAccessToken(session.access_token);
      await loadUsers(session.access_token);
    } catch (error) {
      console.error('❌ Auth check exception:', error);
      toast.error('Authentication error');
      navigate('/login');
    }
  };

  const loadUsers = async (token: string) => {
    try {
      setLoading(true);
      console.log('📥 Fetching users...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/users`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setUsers(result.users || []);
        console.log(`✅ Loaded ${result.users?.length || 0} users`);
      } else {
        console.error('❌ Failed to fetch users:', response.status);
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    setUpdating(true);

    try {
      console.log('🔄 Updating user role:', selectedUser.email, 'to', newRole);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/users/${selectedUser.id}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast.success('User role updated successfully!');
        
        // Update local state
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { ...u, role: newRole as any } : u
        ));
        
        setEditDialogOpen(false);
        setSelectedUser(null);
      } else {
        const errorData = await response.json();
        console.error('Update role error:', errorData);
        toast.error(errorData.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = ROLES.find(r => r.value === role);
    if (!roleConfig) return null;

    const Icon = roleConfig.icon;
    
    return (
      <Badge className={`${roleConfig.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {roleConfig.label}
      </Badge>
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading users...</div>
        </div>
      </Layout>
    );
  }

  // Group users by role
  const usersByRole = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    customer: users.filter(u => u.role === 'customer').length,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          
          <Button
            onClick={() => navigate('/admin/customers')}
            variant="outline"
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Customers
          </Button>
        </div>

        {/* Role Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const count = usersByRole[role.value as keyof typeof usersByRole];
            
            return (
              <Card key={role.value} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{role.label}s</p>
                    <p className="text-3xl font-bold">{count}</p>
                  </div>
                  <div className={`${role.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Users Table */}
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">All Users</h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>{formatDate(user.lastSignIn)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRole(user)}
                      >
                        <UserCog className="w-4 h-4 mr-1" />
                        Edit Role
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Role Permissions Info */}
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-bold mb-4">Role Permissions</h3>
          <div className="space-y-4">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const permissions = {
                admin: ['Full system access', 'Manage all users', 'Manage properties', 'View all bookings', 'System settings'],
                manager: ['Manage properties', 'View bookings', 'View customers', 'Limited admin access'],
                customer: ['Browse properties', 'Make bookings', 'View own bookings', 'Update profile'],
              };

              return (
                <div key={role.value} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className={`${role.color} p-2 rounded`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{role.label}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {permissions[role.value as keyof typeof permissions].map((permission, index) => (
                        <li key={index}>• {permission}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name} ({selectedUser?.email})
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Role</label>
                <div>{selectedUser && getRoleBadge(selectedUser.role)}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {role.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {updating && (
                <div className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent"></div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Updating role...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateRole}
                className="flex-1 bg-accent hover:bg-accent/90"
                disabled={updating || newRole === selectedUser?.role}
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}