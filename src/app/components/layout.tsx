import { ReactNode, useState, useEffect } from 'react';
import { Navbar } from './navbar';
import { AdminSidebar } from './admin-sidebar';
import { getSupabaseClient } from '../lib/supabase';

interface LayoutProps {
  children: ReactNode;
}

const supabase = getSupabaseClient();

export function Layout({ children }: LayoutProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setIsLoggedIn(true);
      const adminEmails = ['admin@skyway.com', 'admin@123.com'];
      setIsAdmin(adminEmails.includes(session.user.email || ''));
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {isLoggedIn && <AdminSidebar />}
        <main className="flex-1">
          {children}
        </main>
      </div>
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Skyway Suites</h3>
              <p className="text-sm opacity-90">
                Your trusted partner for property rentals in Kenya. Find your perfect home today.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/" className="hover:text-accent transition-colors">Home</a></li>
                <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
                <li><a href="/properties" className="hover:text-accent transition-colors">Properties</a></li>
                <li><a href="/contact" className="hover:text-accent transition-colors">Contact Us</a></li>
                <li><a href="/my-bookings" className="hover:text-accent transition-colors">My Bookings</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <p className="text-sm opacity-90">
                Email: info@skywaysuites.co.ke<br />
                Phone: +254 700 000 000<br />
                Location: Westlands, Nairobi
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center text-sm">
            <p>&copy; 2026 Skyway Suites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}