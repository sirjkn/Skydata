import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Menu, LogOut, Home, LayoutDashboard, Building2, ExternalLink, X } from 'lucide-react';
import { Button } from './ui/button';
import { getCurrentUser, logout, isAdmin } from '../lib/auth';
import { fetchMenuPages } from '../../lib/supabaseData';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getCurrentUser());
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is on dashboard page
  const isOnDashboard = location.pathname.startsWith('/admin');

  useEffect(() => {
    // Update user state when auth changes
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('storage', handleAuthChange);
    
    // Also listen for custom auth event for same-tab updates
    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  // Load menu items from Supabase
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const pages = await fetchMenuPages();
        // Convert Supabase menu pages to menu items format
        const items = pages.map(page => {
          // Check if this is an internal link or custom page
          const isInternalLink = page.page_slug.startsWith('/');
          
          return {
            id: page.page_id,
            title: page.page_name,
            slug: page.page_slug,
            type: isInternalLink ? 'internal' : 'custom',
            url: isInternalLink ? page.page_slug : undefined,
            showInMenu: true
          };
        });
        setMenuItems(items);
      } catch (error) {
        console.error('Failed to load menu items:', error);
        setMenuItems([]);
      }
    };

    loadMenuItems();

    // Listen for menu updates
    window.addEventListener('menuItemsUpdated', loadMenuItems);

    return () => {
      window.removeEventListener('menuItemsUpdated', loadMenuItems);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  const handleMenuItemClick = (item: any) => {
    setMobileMenuOpen(false);
    
    if (item.type === 'custom') {
      navigate(`/page/${item.slug}`);
    } else if (item.type === 'internal') {
      navigate(item.url);
    } else if (item.type === 'external') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <header className="bg-gradient-to-r from-[#36454F] to-[#6B7F39] text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-[#6B7F39] rounded-lg p-2">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Skyway Suites</h1>
              <p className="text-xs text-gray-300">Kenya's Premier Property Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className="text-white hover:text-[#FAF4EC] transition-colors font-medium flex items-center gap-1"
              >
                {item.title}
                {item.type === 'external' && <ExternalLink className="w-3 h-3" />}
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-[#6B7F39]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {user ? (
              <>
                {/* Show Admin Dashboard link only for admins */}
                {isAdmin(user) && (
                  <Button
                    onClick={() => navigate('/admin/dashboard')}
                    variant="ghost"
                    className="hidden md:flex text-white hover:text-[#6B7F39] hover:bg-white"
                  >
                    Admin Dashboard
                  </Button>
                )}
                
                {/* User info and logout */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-300">{user.email}</p>
                </div>
                
                {/* Mobile: Context-aware button for admins, always show Home for non-admins */}
                {isAdmin(user) ? (
                  isOnDashboard ? (
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="md:hidden border-white text-black bg-white hover:bg-gray-100"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      <span>Home</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/admin/dashboard')}
                      variant="outline"
                      className="md:hidden border-white text-black bg-white hover:bg-gray-100"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      <span>Admin</span>
                    </Button>
                  )
                ) : (
                  <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="md:hidden border-white text-black bg-white hover:bg-gray-100"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    <span>Home</span>
                  </Button>
                )}
                
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="hidden md:flex border-white text-black bg-white hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="hidden md:flex border-white text-black bg-white hover:bg-gray-100"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="hidden md:flex bg-[#6B7F39] hover:bg-[#5a6930]"
                >
                  Create Account
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pt-4 border-t border-gray-600">
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item)}
                  className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
                >
                  {item.title}
                  {item.type === 'external' && <ExternalLink className="w-3 h-3" />}
                </button>
              ))}
              
              {/* Add Login and Create Account as menu items for mobile when not logged in */}
              {!user && (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/signup');
                    }}
                    className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
                  >
                    Create Account
                  </button>
                </>
              )}
              
              {/* Add Logout as menu item for mobile when logged in */}
              {user && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}