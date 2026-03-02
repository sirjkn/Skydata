import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Layout } from '../components/layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { MapPin, Bed, Bath, Square, MessageCircle, ArrowLeft, Calendar, Maximize } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { getSupabaseClient } from '../lib/supabase';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

const supabase = getSupabaseClient();

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  amenities: string[];
  images: string[];
  available: boolean;
}

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
    message: '',
  });

  useEffect(() => {
    checkUser();
    if (id) {
      fetchProperty();
    }
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  const fetchProperty = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/properties/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProperty(data.property);
      } else {
        toast.error('Property not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book a property');
      navigate('/login');
      return;
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-6a712830/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            propertyId: property?.id,
            propertyTitle: property?.title,
            propertyPrice: property?.price,
            ...bookingForm,
          }),
        }
      );

      if (response.ok) {
        toast.success('Booking request submitted successfully!');
        setBookingForm({
          checkIn: '',
          checkOut: '',
          guests: '1',
          message: '',
        });
        navigate('/my-bookings');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit booking');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to submit booking');
    }
  };

  const handleWhatsAppInquiry = () => {
    const message = `Hi, I'm interested in ${property?.title} at ${property?.location}. Price: Ksh ${property?.price?.toLocaleString()}/month`;
    const whatsappUrl = `https://wa.me/254700000000?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-muted rounded-lg" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-1/3" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-xl">Property not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            <div className="rounded-lg overflow-hidden">
              {property.images && property.images.length > 0 ? (
                <ImageWithFallback
                  src={property.images[selectedImage]}
                  alt={property.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className="w-full h-96 bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {property.images && property.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="text-lg">{property.location}</span>
                    </div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground text-lg px-4 py-2">
                    {property.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-3xl font-bold text-accent">
                  Ksh {property.price.toLocaleString()}/month
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center">
                    <Bed className="w-6 h-6 mr-2 text-accent" />
                    <span className="text-lg">{property.bedrooms} Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="w-6 h-6 mr-2 text-accent" />
                    <span className="text-lg">{property.bathrooms} Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <Maximize className="w-6 h-6 mr-2 text-accent" />
                    <span className="text-lg">{property.area} m²</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book This Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-In Date
                  </Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={bookingForm.checkIn}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, checkIn: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkOut">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Check-Out Date
                  </Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={bookingForm.checkOut}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, checkOut: e.target.value })
                    }
                    min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    value={bookingForm.guests}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, guests: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Any special requests or questions?"
                    value={bookingForm.message}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, message: e.target.value })
                    }
                    rows={3}
                  />
                </div>

                <Button
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={handleBooking}
                >
                  Submit Booking Request
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleWhatsAppInquiry}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Inquire via WhatsApp
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your booking request will be reviewed by our team. You'll receive confirmation within 24 hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}