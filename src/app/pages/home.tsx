import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchProperties, fetchBookings, fetchCategories } from '../../lib/cachedSupabaseData';
import { getHomePageSettings, getGeneralSettings } from '../lib/settingsHelpers';
import { SEOHead } from '../components/seo-head';
import Slider from 'react-slick';
import { 
  Shield, 
  Clock, 
  Heart, 
  TrendingUp, 
  Users,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  Mail,
  MessageCircle,
  Home as HomeIcon,
  Headset
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Header } from '../components/header';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom arrow components
function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition"
    >
      <ChevronRight className="w-6 h-6 text-[#36454F]" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition"
    >
      <ChevronLeft className="w-6 h-6 text-[#36454F]" />
    </button>
  );
}

const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1758193431355-54df41421657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjBhcGFydG1lbnQlMjBidWlsZGluZyUyMGV4dGVyaW9yfGVufDF8fHx8MTc3MjU4NTU3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Find Your Perfect Home in Kenya',
    subtitle: 'Discover premium properties across Nairobi and beyond'
  },
  {
    image: 'https://images.unsplash.com/photo-1758448756350-3d0eec02ba37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wb3JhcnklMjBwZW50aG91c2UlMjBpbnRlcmlvciUyMGxpdmluZyUyMHJvb218ZW58MXx8fHwxNzcyNTIxMzY0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Luxury Living Redefined',
    subtitle: 'Experience modern comfort and style'
  },
  {
    image: 'https://images.unsplash.com/photo-1669333490889-194e8f46a766?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzaWRlbnRpYWwlMjBwcm9wZXJ0eSUyMG5haXJvYml8ZW58MXx8fHwxNzcyNjA4MjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    title: 'Your Dream Home Awaits',
    subtitle: 'Browse verified listings with transparent pricing'
  }
];

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Verified Listings',
    description: 'All properties are verified and inspected by our team for quality assurance'
  },
  {
    icon: TrendingUp,
    title: 'Transparent Pricing',
    description: 'Clear pricing in Kenyan Shillings with no hidden fees or charges'
  },
  {
    icon: Clock,
    title: 'Quick Response',
    description: '24/7 customer support ready to assist you with any inquiries'
  },
  {
    icon: Heart,
    title: 'Trusted Platform',
    description: "Kenya's most trusted property platform with thousands of satisfied customers"
  },
  {
    icon: Users,
    title: 'Expert Guidance',
    description: 'Professional property managers to guide you through every step'
  },
  {
    icon: Headset,
    title: 'Instant Communication',
    description: 'WhatsApp integration for real-time support and quick property inquiries'
  }
];

export function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [homePageSettings, setHomePageSettings] = useState<any>(null);
  const [generalSettings, setGeneralSettings] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Map icon names to icon components
  const iconMap: Record<string, any> = {
    shield: Shield,
    clock: Clock,
    heart: Heart,
    trendingup: TrendingUp,
    users: Users,
    headset: Headset,
    star: Heart, // fallback
    map: MapPin,
    check: Heart // fallback
  };

  const getIcon = (iconNameOrComponent: any) => {
    // If it's already a component (function), return it
    if (typeof iconNameOrComponent === 'function') {
      return iconNameOrComponent;
    }
    // If it's a string, map it to the component
    if (typeof iconNameOrComponent === 'string' && iconNameOrComponent) {
      try {
        const key = String(iconNameOrComponent).toLowerCase().trim();
        return iconMap[key] || Heart;
      } catch (err) {
        console.error('Error converting icon name:', err);
        return Heart;
      }
    }
    // Default fallback
    return Heart;
  };

  // Load homepage settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getHomePageSettings();
        setHomePageSettings(settings);
      } catch (error) {
        console.error('Failed to load homepage settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Load general settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getGeneralSettings();
        setGeneralSettings(settings);
      } catch (error) {
        console.error('Failed to load general settings:', error);
      }
    };
    loadSettings();
  }, []);

  // Load properties and bookings from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [loadedProperties, loadedBookings, loadedCategories] = await Promise.all([
          fetchProperties(),
          fetchBookings(),
          fetchCategories()
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
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Failed to load data:', error);
        setProperties([]);
        setBookings([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 300,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: false,
    cssEase: 'linear',
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SEO Meta Tags */}
      <SEOHead
        title={homePageSettings?.seo?.title || 'Skyway Suites - Premium Property Rentals in Kenya'}
        description={homePageSettings?.seo?.description || 'Discover luxury property rentals in Kenya with Skyway Suites. Browse verified properties in Nairobi and beyond. Book your perfect stay today.'}
        keywords={homePageSettings?.seo?.keywords || 'property rentals kenya, luxury apartments nairobi, vacation rentals kenya, skyway suites'}
        ogImage={homePageSettings?.seo?.ogImage || (homePageSettings?.slides?.[0]?.image || '')}
        ogType="website"
        canonicalUrl={window.location.origin}
      />
      
      {/* Header */}
      <Header />

      {/* Hero Slider */}
      <section className="relative">
        <Slider {...heroSettings}>
          {(homePageSettings?.slides || []).filter((slide: any) => slide.image).map((slide: any, index: number) => (
            <div key={slide.id || index} className="relative">
              <div className="relative h-[350px] md:h-[450px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl mt-16">
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
                        {slide.title}
                      </h2>
                      <p className="text-base md:text-lg text-gray-200">
                        {slide.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-4">
              {homePageSettings?.propertiesTitle || 'Featured Properties'}
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              {homePageSettings?.propertiesSubtitle || 'Handpicked premium properties just for you'}
            </p>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                className={`rounded-full px-6 py-2 transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-[#6B7F39] hover:bg-[#5a6930] text-white'
                    : 'border-[#6B7F39] text-[#6B7F39] hover:bg-[#6B7F39] hover:text-white'
                }`}
                onClick={() => setSelectedCategory('all')}
              >
                All Properties
              </Button>
              {categories
                .filter((category) => {
                  // Only show categories that have at least one property
                  return properties.some((property) => String(property.category) === String(category.category_id));
                })
                .map((category) => (
                  <Button
                    key={category.category_id}
                    variant={selectedCategory === String(category.category_id) ? 'default' : 'outline'}
                    className={`rounded-full px-6 py-2 transition-all duration-300 ${
                      selectedCategory === String(category.category_id)
                        ? 'bg-[#6B7F39] hover:bg-[#5a6930] text-white'
                        : 'border-[#6B7F39] text-[#6B7F39] hover:bg-[#6B7F39] hover:text-white'
                    }`}
                    onClick={() => setSelectedCategory(String(category.category_id))}
                  >
                    {category.category_name}
                  </Button>
                ))
              }
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                .filter((property) => {
                  // Apply category filter
                  if (selectedCategory === 'all') return true;
                  return String(property.category) === selectedCategory;
                })
                .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                .slice(0, 8)
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
                  
                  // Find the latest checkout date
                  let propertyStatusText = 'Available for booking';
                  let availableFrom = null;
                  if (isBooked) {
                    const latestCheckout = activePropertyBookings.reduce((latest: Date, booking: any) => {
                      const checkoutDate = new Date(booking.checkOut);
                      return checkoutDate > latest ? checkoutDate : latest;
                    }, new Date(activePropertyBookings[0].checkOut));
                    
                    availableFrom = latestCheckout.toLocaleDateString();
                    propertyStatusText = `Booked, Available from ${availableFrom}`;
                  }
                  
                  return (
                    <Card key={property.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-[#6B7F39]">
                      <div 
                        className="relative h-56 cursor-pointer bg-gray-200 overflow-hidden" 
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
                      <CardContent className="p-5 space-y-3">
                        {/* Title */}
                        <h3 
                          className="font-bold text-[#36454F] text-lg cursor-pointer group-hover:text-[#6B7F39] transition line-clamp-1"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          {property.name}
                        </h3>
                        
                        {/* Location */}
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-[#6B7F39]" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>

                        {/* Property Info Grid */}
                        <div className="grid grid-cols-3 gap-2 pt-2 pb-3 border-t border-b border-gray-100">
                          <div className="flex flex-col items-center">
                            <Bed className="w-4 h-4 text-[#6B7F39] mb-1" />
                            <span className="text-xs font-semibold text-gray-700">{property.beds} Beds</span>
                          </div>
                          <div className="flex flex-col items-center border-l border-r border-gray-100">
                            <Bath className="w-4 h-4 text-[#6B7F39] mb-1" />
                            <span className="text-xs font-semibold text-gray-700">{property.baths} Baths</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <Maximize className="w-4 h-4 text-[#6B7F39] mb-1" />
                            <span className="text-xs font-semibold text-gray-700">{property.area || 'N/A'} sqft</span>
                          </div>
                        </div>

                        {/* Features */}
                        {property.features && property.features.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {property.features.slice(0, 3).map((feature: string, idx: number) => (
                              <span key={idx} className="text-xs px-2 py-1 bg-[#FAF4EC] rounded-full text-gray-700">
                                {feature}
                              </span>
                            ))}
                            {property.features.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                +{property.features.length - 3} more
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

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" className="border-[#6B7F39] text-[#6B7F39] hover:bg-[#6B7F39] hover:text-white">
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Skyway Suites */}
      <section className="py-16 bg-[#36454F]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {homePageSettings?.whyUsTitle || 'Why Choose Skyway Suites?'}
            </h2>
            <p className="text-gray-300 text-lg">
              {homePageSettings?.whyUsSubtitle || 'Your trusted partner in finding the perfect home'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(homePageSettings?.whyUsItems && homePageSettings.whyUsItems.length > 0 
              ? homePageSettings.whyUsItems 
              : whyChooseUs
            ).map((item: any, index: number) => {
              const Icon = getIcon(item.icon);
              return (
                <Card key={item.id || index} className="bg-white hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6B7F39] rounded-full mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-[#36454F] text-xl mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Get in Touch */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-4">
                {homePageSettings?.getInTouch?.title || 'Get In Touch'}
              </h2>
              <p className="text-gray-600 text-lg">
                {homePageSettings?.getInTouch?.subtitle || "Have questions? We're here to help you find your dream home"}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="space-y-6">
                <Card className="bg-[#FAF4EC]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#6B7F39] rounded-full p-3">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#36454F] mb-1">Phone</h4>
                        <p className="text-gray-600">{generalSettings?.companyPhone || '+254 700 123 456'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#FAF4EC]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#6B7F39] rounded-full p-3">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#36454F] mb-1">Email</h4>
                        <p className="text-gray-600">{generalSettings?.companyEmail || 'info@skywaysuites.co.ke'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#FAF4EC]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#25D366] rounded-full p-3">
                        <MessageCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#36454F] mb-1">WhatsApp</h4>
                        <p className="text-gray-600">Chat with us instantly</p>
                        <Button 
                          variant="link" 
                          className="text-[#25D366] p-0 h-auto font-semibold"
                          onClick={() => {
                            const phone = (generalSettings?.companyPhone || '+254 700 123 456').replace(/\s+/g, '');
                            window.open(`https://wa.me/${phone}`, '_blank');
                          }}
                        >
                          Start Chat →
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div>
                <Card>
                  <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#36454F] mb-2">
                          Full Name
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#36454F] mb-2">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#36454F] mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+254 700 000 000"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#36454F] mb-2">
                          Message
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="How can we help you?"
                          rows={4}
                          required
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-[#6B7F39] hover:bg-[#5a6930]"
                      >
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#36454F] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Skyway Suites</h3>
              <p className="text-gray-300 text-sm mb-4">
                Kenya's premier property listing and management platform. 
                Find your dream home with ease and confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Browse Properties</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">About Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">How It Works</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Contact Us</a></li>
              </ul>
            </div>

            {/* Property Types */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Property Types</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Apartments</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Houses</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Villas</a></li>
                <li><a href="#" className="text-gray-300 hover:text-[#6B7F39] transition">Commercial</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Stay Updated</h4>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to get the latest property listings
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <Button className="bg-[#6B7F39] hover:bg-[#5a6930]">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2026 Skyway Suites. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <a href="#" className="text-gray-400 hover:text-[#6B7F39] transition">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-[#6B7F39] transition">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-[#6B7F39] transition">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}