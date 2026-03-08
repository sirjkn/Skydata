import { Menu, X, Building2, Home, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { getCurrentUser, logout, isAdmin } from '../lib/auth';

export function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
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
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-[#FAF4EC] transition-colors font-medium flex items-center gap-1"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/all-properties')}
              className="text-white hover:text-[#FAF4EC] transition-colors font-medium flex items-center gap-1"
            >
              Properties
            </button>
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
                
                {/* Desktop: Logout Button */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="hidden lg:flex border-white text-black bg-white hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                {/* Desktop: Login and Create Account Buttons */}
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="hidden lg:flex border-white text-black bg-white hover:bg-gray-100"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/signup')}
                  className="hidden lg:flex bg-[#6B7F39] hover:bg-[#5a6930]"
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
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/all-properties'); setMobileMenuOpen(false); }}
                className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
              >
                Properties
              </button>
              
              {/* Divider */}
              <div className="border-t border-gray-600 my-2"></div>
              
              {user ? (
                <>
                  {/* Show Admin Dashboard for admins */}
                  {isAdmin(user) && (
                    <button
                      onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }}
                      className="text-white hover:text-[#FAF4EC] transition-colors font-medium text-left flex items-center gap-2 py-2"
                    >
                      Admin Dashboard
                    </button>
                  )}
                  
                  {/* User Info */}
                  <div className="px-2 py-3 bg-white/10 rounded-lg">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-300">{user.email}</p>
                  </div>
                  
                  {/* Logout Button */}
                  <Button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    variant="outline"
                    className="w-full border-white text-black bg-white hover:bg-gray-100 mt-2"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <Button
                    onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                    variant="outline"
                    className="w-full border-white text-black bg-white hover:bg-gray-100"
                  >
                    Login
                  </Button>
                  
                  {/* Create Account Button */}
                  <Button
                    onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }}
                    className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-white"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}