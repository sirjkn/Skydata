import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabaseClient } from '../lib/supabase';
import { useRealtimeBookings } from '../hooks/useRealtime';

const supabase = getSupabaseClient();

interface Booking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrice: number;
  checkIn: string;
  checkOut: string;
  guests: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  userId: string;
}

export function MyBookings() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const { data: allBookings, loading } = useRealtimeBookings(accessToken);

  useEffect(() => {
    checkAuthAndSetToken();
  }, []);

  const checkAuthAndSetToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error('Please login to view your bookings');
      navigate('/login');
      return;
    }

    setAccessToken(session.access_token);
    setUserId(session.user.id);
  };

  // Filter bookings for current user
  const bookings = allBookings.filter((booking) => booking.userId === userId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl text-muted-foreground mb-4">
                You don't have any bookings yet
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-accent hover:underline"
              >
                Browse properties to make your first booking
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {booking.propertyTitle}
                      </CardTitle>
                      <p className="text-muted-foreground">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-In</p>
                        <p className="font-medium">{formatDate(booking.checkIn)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-3 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-Out</p>
                        <p className="font-medium">{formatDate(booking.checkOut)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{booking.guests}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Monthly Rate</p>
                        <p className="text-2xl font-bold text-accent">
                          Ksh {booking.propertyPrice.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Booked on</p>
                        <p className="font-medium">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {booking.message && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Your Message:</p>
                      <p className="text-sm">{booking.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}