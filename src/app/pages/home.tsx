import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProperties, fetchBookings } from '../../lib/supabaseData';
import { ConnectionStatusBanner } from '../components/connection-status';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  // Load properties and bookings from Supabase
  useEffect(() => {
    const loadData = async () => {
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
      }
    };

    loadData();
  }, []);

  const heroSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
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
      {/* Connection Status Banner */}
      <ConnectionStatusBanner />
      
      {/* Header */}
      <Header />

      {/* Hero Slider */}
      <section className="relative">
        <Slider {...heroSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative">
              <div className="relative h-[350px] md:h-[450px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-3">
                        {slide.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-200 mb-6">
                        {slide.subtitle}
                      </p>
                      <Button size="lg" className="bg-[#6B7F39] hover:bg-[#5a6930] text-lg">
                        Explore Properties
                      </Button>
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
              Featured Properties
            </h2>
            <p className="text-gray-600 text-lg">
              Handpicked premium properties just for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.length > 0 ? (
              properties
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
                    <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div 
                        className="relative h-48 cursor-pointer bg-gray-200" 
                        onClick={() => navigate(`/property/${property.id}`)}
                      >
                        {firstPhoto ? (
                          <img
                            src={firstPhoto}
                            alt={property.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <HomeIcon className="w-16 h-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-[#D4C5B0] text-[#36454F] px-2 py-1 rounded-lg text-xs font-semibold border border-[#B8A586]">
                          KSh {property.price.toLocaleString()}/day
                        </div>
                        {isBooked && (
                          <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                            Booked
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 
                          className="font-bold text-[#36454F] text-lg mb-2 cursor-pointer hover:text-[#6B7F39] transition line-clamp-1"
                          onClick={() => navigate(`/property/${property.id}`)}
                        >
                          {property.name}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                          <span className="text-xs px-2 py-1 bg-[#FAF4EC] rounded-full text-gray-700 text-center">
                            {property.category}
                          </span>
                        </div>
                        <Button className="w-full bg-[#36454F] hover:bg-[#2a3740]" onClick={() => navigate(`/property/${property.id}`)}>
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
      <section className="py-16 bg-[#FAF4EC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#36454F] mb-4">
              Why Choose Skyway Suites?
            </h2>
            <p className="text-gray-600 text-lg">
              Your trusted partner in finding the perfect home
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
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
                Get In Touch
              </h2>
              <p className="text-gray-600 text-lg">
                Have questions? We're here to help you find your dream home
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
                        <p className="text-gray-600">+254 700 123 456</p>
                        <p className="text-gray-600">+254 733 987 654</p>
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
                        <p className="text-gray-600">info@skywaysuites.co.ke</p>
                        <p className="text-gray-600">support@skywaysuites.co.ke</p>
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