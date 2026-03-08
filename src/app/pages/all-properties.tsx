import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchProperties, fetchBookings } from '../../lib/cachedSupabaseData';
import { 
  MapPin,
  Bed,
  Bath,
  Maximize,
  Home as HomeIcon,
  ArrowLeft
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Header } from '../components/header';

export function AllProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load properties and bookings from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedProperties, loadedBookings] = await Promise.all([
          fetchProperties(),
          fetchBookings()
        ]);
        
        // Convert Supabase format to app format
        const formattedProperties = loadedProperties.map(p => ({
          id: p.property_id,
          name: p.property_name,
          category: p.category_id,
          location: p.location,
          beds: p.no_of_beds,
          baths: p.bathrooms,
          area: p.area_sqft,
          description: p.description,
          price: p.price_per_month,
          photos: typeof p.photos === 'string' ? JSON.parse(p.photos) : p.photos,
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
          createdAt: p.created_at
        }));

        const formattedBookings = loadedBookings.map(b => ({
          id: b.booking_id,
          propertyId: b.property_id,
          customerId: b.customer_id,
          checkIn: b.check_in_date,
          checkOut: b.check_out_date,
          status: b.booking_status,
          totalAmount: b.total_amount
        }));
        
        setProperties(formattedProperties);
        setBookings(formattedBookings);
      } catch (error) {
        console.error('Failed to load data:', error);
        setProperties([]);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header />

      {/* Page Header */}
      <section className="bg-[#36454F] text-white py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 text-white hover:text-[#6B7F39] hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">All Properties</h1>
          <p className="text-lg text-gray-300">
            Browse all available properties in our collection
          </p>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {isLoading ? (
              <div className="col-span-full text-center py-16 relative">
                <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#6B7F39] border-t-transparent rounded-full animate-spin"></div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Properties</h3>
                  <p className="text-gray-600">Please wait while we fetch available properties...</p>
                </div>
              </div>
            ) : properties.length > 0 ? (
              properties
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .map((property) => {
                  // Get the first available photo from any room category
                  const firstPhoto = property.photos && Object.values(property.photos).flat().find((p: any) => p);
                  
                  // Check if property has a current booking
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const activePropertyBookings = bookings.filter(
                    (b: any) => {
                      if (b.propertyId !== property.id) return false;
                      if (b.status !== 'Confirmed' && b.status !== 'Pending Payment' && b.status !== 'Pending Approval') return false;
                      
                      // Check if booking is current (checkout date is today or in the future)
                      const checkoutDate = new Date(b.checkOut);
                      checkoutDate.setHours(0, 0, 0, 0);
                      
                      // Property is booked if checkout date hasn't passed
                      return checkoutDate >= today;
                    });
                  
                  const isBooked = activePropertyBookings.length > 0;
                  
                  return (
                    <Card key={property.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#6B7F39]">
                      <div className="grid md:grid-cols-5 gap-0">
                        {/* Image Section - 2 columns */}
                        <div 
                          className="md:col-span-2 relative h-64 md:h-auto cursor-pointer bg-gray-200 overflow-hidden" 
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          {firstPhoto ? (
                            <img
                              src={firstPhoto}
                              alt={property.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-300">
                              <HomeIcon className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-lg">
                            KSh {property.price.toLocaleString()}/day
                          </div>
                          {/* Status Badge */}
                          {isBooked && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg">
                              Booked
                            </div>
                          )}
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Content Section - 3 columns */}
                        <CardContent className="md:col-span-3 p-6 space-y-4">
                          {/* Title */}
                          <h3 
                            className="font-bold text-[#36454F] text-2xl cursor-pointer group-hover:text-[#6B7F39] transition line-clamp-1"
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            {property.name}
                          </h3>
                          
                          {/* Location */}
                          <div className="flex items-center text-gray-600 text-base">
                            <MapPin className="w-5 h-5 mr-2 flex-shrink-0 text-[#6B7F39]" />
                            <span className="line-clamp-1">{property.location}</span>
                          </div>

                          {/* Property Info Grid */}
                          <div className="grid grid-cols-3 gap-4 pt-3 pb-3 border-t border-b border-gray-200">
                            <div className="flex flex-col items-center">
                              <Bed className="w-5 h-5 text-[#6B7F39] mb-1.5" />
                              <span className="text-sm font-semibold text-gray-700">{property.beds} Beds</span>
                            </div>
                            <div className="flex flex-col items-center border-l border-r border-gray-200">
                              <Bath className="w-5 h-5 text-[#6B7F39] mb-1.5" />
                              <span className="text-sm font-semibold text-gray-700">{property.baths} Baths</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <Maximize className="w-5 h-5 text-[#6B7F39] mb-1.5" />
                              <span className="text-sm font-semibold text-gray-700">{property.area || 'N/A'} sqft</span>
                            </div>
                          </div>

                          {/* Features */}
                          {property.features && property.features.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {property.features.slice(0, 4).map((feature: string, idx: number) => (
                                <span key={idx} className="text-sm px-3 py-1.5 bg-[#FAF4EC] rounded-full text-gray-700 font-medium">
                                  {feature}
                                </span>
                              ))}
                              {property.features.length > 4 && (
                                <span className="text-sm px-3 py-1.5 bg-gray-100 rounded-full text-gray-600 font-medium">
                                  +{property.features.length - 4} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Button */}
                          <Button 
                            className="w-full bg-[#36454F] hover:bg-[#6B7F39] text-white transition-colors duration-300" 
                            onClick={() => navigate(`/property/${property.id}`)}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </div>
                    </Card>
                  );
                })
            ) : (
              <div className="col-span-full text-center py-16">
                <HomeIcon className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Properties Yet</h3>
                <p className="text-gray-500">Check back soon for amazing properties!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#36454F] text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Skyway Suites. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}