import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  CreditCard,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { getSupabaseClient } from '../lib/supabase';

const supabase = getSupabaseClient();

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const adminEmails = ['admin@skyway.com', 'admin@123.com'];
      const userRole = session.user.user_metadata?.role;
      // Check both email whitelist and role metadata
      setIsAdmin(adminEmails.includes(session.user.email || '') || userRole === 'admin');
    }
  };

  const adminMenuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin',
    },
    {
      label: 'Properties',
      icon: Building2,
      path: '/admin/properties',
    },
    {
      label: 'Customers',
      icon: Users,
      path: '/admin/customers',
    },
    {
      label: 'Bookings',
      icon: Calendar,
      path: '/admin/bookings',
    },
    {
      label: 'User Management',
      icon: UserCog,
      path: '/admin/users',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: '/admin/payments',
    },
    {
      label: 'Reports',
      icon: BarChart3,
      path: '/admin/reports',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const userMenuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/user/dashboard',
    },
    {
      label: 'My Bookings',
      icon: Calendar,
      path: '/my-bookings',
    },
    {
      label: 'My Payments',
      icon: CreditCard,
      path: '/user/payments',
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/user/settings',
    },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-card border-r border-border sticky top-[73px] h-[calc(100vh-73px)] transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-2 border-b border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="hover:bg-accent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Badge */}
        {!collapsed && isAdmin && (
          <div className="p-4 border-t border-border">
            <div className="bg-accent/20 rounded-lg p-3 text-center">
              <p className="text-sm font-semibold text-accent">Admin Panel</p>
              <p className="text-xs text-muted-foreground mt-1">Logged in as Admin</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}