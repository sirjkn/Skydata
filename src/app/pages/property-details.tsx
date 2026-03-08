import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Slider from 'react-slick';
import { fetchProperties, fetchBookings, fetchCustomers, createBooking } from '../../lib/supabaseData';
import { ConnectionStatusBanner } from '../components/connection-status';
import { 
  Building2, 
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Wifi,
  Car,
  Utensils,
  Tv,
  Wind,
  X,
  Calendar
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Header } from '../components/header';
import { CustomModal } from '../components/custom-modal';
import { getCurrentUser, isAdmin } from '../lib/auth';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Custom arrow components
function NextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition"
      aria-label="Next image"
    >
      <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-[#36454F]" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-lg transition"
      aria-label="Previous image"
    >
      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-[#36454F]" />
    </button>
  );
}

export function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [bookings, setBookings] = useState<any[]>([]);
  const [propertyIsBooked, setPropertyIsBooked] = useState(false);
  const [availableFromDate, setAvailableFromDate] = useState<string>('');
  
  // Customer management for admin
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  
  // Booking Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    propertyId: '',
    propertyName: '',
    propertyPrice: 0,
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    checkIn: '',
    checkOut: '',
    numberOfPeople: '1'
  });

  // Modal States
  const [modalState, setModalState] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'confirm' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Show Modal Helper
  const showModal = (
    type: 'success' | 'error' | 'confirm' | 'info',
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = 'OK',
    cancelText = 'Cancel'
  ) => {
    setModalState({
      show: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      onCancel: () => setModalState({ ...modalState, show: false })
    });
  };

  const closeModal = () => {
    setModalState({ ...modalState, show: false });
  };

  const handleModalConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  // Load properties and check user login status
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load properties and bookings first (essential data)
        const [loadedProperties, loadedBookings] = await Promise.all([
          fetchProperties(),
          fetchBookings()
        ]);
        
        const loggedInUser = getCurrentUser();
        
        // Load customers separately (only needed for admin, non-blocking)
        let loadedCustomers: any[] = [];
        if (loggedInUser && isAdmin(loggedInUser)) {
          try {
            loadedCustomers = await fetchCustomers();
          } catch (customerError) {
            console.error('Error fetching customers:', customerError);
            // Don't block page load if customers fail to load
            // Admin can still view property but won't be able to book for others
          }
        }
        
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
          features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
        }));

        const formattedBookings = loadedBookings.map(b => ({
          id: b.booking_id,
          propertyId: b.property_id,
          customerId: b.customer_id,
          customerName: '', // Will be populated from customer data
          checkIn: b.check_in_date,
          checkOut: b.check_out_date,
          status: b.booking_status,
          totalAmount: b.total_amount
        }));

        const formattedCustomers = loadedCustomers.map(c => ({
          id: c.customer_id,
          name: c.customer_name,
          phone: c.phone,
          email: c.email
        }));
        
        setProperties(formattedProperties);
        setBookings(formattedBookings);
        setCurrentUser(loggedInUser);
        setCustomers(formattedCustomers);
        
        // Find the specific property by ID
        const foundProperty = formattedProperties.find((p: any) => p.id.toString() === id);
        setProperty(foundProperty);
        
        // Check if property is currently booked
        if (foundProperty) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const activeBookings = formattedBookings.filter((b: any) => {
            if (b.propertyId !== foundProperty.id) return false;
            if (b.status !== 'Confirmed' && b.status !== 'Pending Payment' && b.status !== 'Pending Approval') return false;
            
            const checkoutDate = new Date(b.checkOut);
            checkoutDate.setHours(0, 0, 0, 0);
            
            return checkoutDate >= today;
          });
          
          if (activeBookings.length > 0) {
            const latestCheckout = activeBookings.reduce((latest: Date, booking: any) => {
              const checkoutDate = new Date(booking.checkOut);
              return checkoutDate > latest ? checkoutDate : latest;
            }, new Date(activeBookings[0].checkOut));
            
            setPropertyIsBooked(true);
            setAvailableFromDate(latestCheckout.toLocaleDateString());
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF4EC] flex items-center justify-center relative">
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30"></div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 border-4 border-[#6B7F39] border-t-transparent rounded-full animate-spin"></div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Loading Property</h1>
          <p className="text-gray-600">Please wait while we load the property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-[#FAF4EC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#36454F] mb-4">Property Not Found</h1>
          <Button onClick={() => navigate('/')} className="bg-[#6B7F39] hover:bg-[#5a6930]">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Get all photos from the property
  const propertyImages = property.photos 
    ? Object.values(property.photos).flat().filter((p: any) => p)
    : [];

  const propertyImageSettings = {
    dots: true,
    infinite: propertyImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: propertyImages.length > 1,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    swipe: true,
    swipeToSlide: true,
    touchThreshold: 10,
    adaptiveHeight: false,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: 'ease-in-out'
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'WiFi': Wifi,
      'Parking': Car,
      'Kitchen': Utensils,
      'TV': Tv,
      'Air Conditioning': Wind
    };
    return iconMap[amenity] || Building2;
  };

  // Calculate number of days and total amount for modal
  const calculateModalBookingDetails = () => {
    if (bookingForm.checkIn && bookingForm.checkOut && bookingForm.propertyPrice > 0) {
      const checkIn = new Date(bookingForm.checkIn);
      const checkOut = new Date(bookingForm.checkOut);
      const diffTime = checkOut.getTime() - checkIn.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        const totalAmount = diffDays * bookingForm.propertyPrice;
        return { days: diffDays, totalAmount };
      }
    }
    return { days: 0, totalAmount: 0 };
  };

  const { days: calculatedDays, totalAmount: calculatedAmount } = calculateModalBookingDetails();

  const handleAddBooking = async () => {
    // Prevent double submission
    if (isSubmittingBooking) return;
    
    // Validate required fields
    if (!bookingForm.propertyId || !bookingForm.customerId || !bookingForm.checkIn || !bookingForm.checkOut) {
      showModal('error', 'Incomplete Information', 'Please fill in all required fields!');
      return;
    }
    
    // Validate dates
    if (bookingForm.checkIn >= bookingForm.checkOut) {
      showModal('error', 'Invalid Dates', 'Check-out date must be after check-in date!');
      return;
    }
    
    // Check for double booking - Enhanced with detailed availability information
    const requestedCheckIn = new Date(bookingForm.checkIn);
    const requestedCheckOut = new Date(bookingForm.checkOut);
    
    const conflictingBookings = bookings.filter((b: any) => {
      // Only check bookings for this specific property using property ID
      if (String(b.propertyId) !== String(bookingForm.propertyId)) return false;
      
      // Check all active booking statuses to prevent double booking
      if (b.status !== 'Confirmed' && b.status !== 'Pending Payment' && b.status !== 'Pending Approval') return false;
      
      const existingCheckIn = new Date(b.checkIn);
      const existingCheckOut = new Date(b.checkOut);
      
      // Check for any date overlap - comprehensive validation
      return (
        // New booking starts during existing booking
        (requestedCheckIn >= existingCheckIn && requestedCheckIn < existingCheckOut) ||
        // New booking ends during existing booking
        (requestedCheckOut > existingCheckIn && requestedCheckOut <= existingCheckOut) ||
        // New booking completely encompasses existing booking
        (requestedCheckIn <= existingCheckIn && requestedCheckOut >= existingCheckOut)
      );
    });
    
    if (conflictingBookings.length > 0) {
      // Find the latest checkout date from all conflicting bookings
      const latestCheckout = conflictingBookings.reduce((latest: Date, booking: any) => {
        const checkoutDate = new Date(booking.checkOut);
        return checkoutDate > latest ? checkoutDate : latest;
      }, new Date(conflictingBookings[0].checkOut));
      
      const availableAfterDate = latestCheckout.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
      
      showModal(
        'error', 
        'Property Already Booked', 
        `This property is already booked during the selected dates. The property will be available after ${availableAfterDate}.`,
        () => {
          // Close the booking modal when user clicks OK
          setShowBookingModal(false);
          setBookingForm({
            propertyId: '',
            propertyName: '',
            propertyPrice: 0,
            customerId: '',
            customerName: '',
            customerEmail: '',
            customerPhone: '',
            checkIn: '',
            checkOut: '',
            numberOfPeople: '1'
          });
          setCustomerSearchTerm('');
          setShowCustomerDropdown(false);
        },
        'OK'
      );
      return;
    }
    
    // Create new booking using Supabase
    const newBookingData = {
      customer_id: parseInt(bookingForm.customerId),
      property_id: parseInt(bookingForm.propertyId),
      check_in_date: bookingForm.checkIn,
      check_out_date: bookingForm.checkOut,
      total_amount: calculatedAmount,
      amount_paid: 0,
      payment_status: 'Not Paid' as const,
      booking_status: (isAdmin(currentUser) ? 'Confirmed' : 'Pending') as const,
      payment_method: null,
      payment_reference: null,
      notes: `Number of people: ${bookingForm.numberOfPeople}`,
      created_by: currentUser ? parseInt(currentUser.id) : null
    };
    
    // Set loading state
    setIsSubmittingBooking(true);
    
    try {
      const createdBooking = await createBooking(newBookingData);
      
      // Refresh bookings list
      const updatedBookings = await fetchBookings();
      const formattedBookings = updatedBookings.map(b => ({
        id: b.booking_id,
        propertyId: b.property_id,
        customerId: b.customer_id,
        customerName: bookingForm.customerName,
        checkIn: b.check_in_date,
        checkOut: b.check_out_date,
        status: b.booking_status,
        totalAmount: b.total_amount
      }));
      setBookings(formattedBookings);
      
      // Log successful booking creation
      console.log('✅ Booking Created Successfully (Supabase):');
      console.log('- Booking ID:', createdBooking.booking_id);
      console.log('- Property ID:', createdBooking.property_id, '| Property Name:', bookingForm.propertyName);
      console.log('- Customer ID:', createdBooking.customer_id, '| Customer Name:', bookingForm.customerName);
      console.log('- Status:', createdBooking.booking_status);
      console.log('- Check-in:', createdBooking.check_in_date, '| Check-out:', createdBooking.check_out_date);
      console.log('- Days:', calculatedDays, '| Total Amount: KSh', calculatedAmount.toLocaleString());
      
      // Show success modal with booking details
      showModal(
      'success', 
      isAdmin(currentUser) ? 'Booking Created' : 'Booking Submitted Successfully!', 
      `${isAdmin(currentUser) ? 'Booking created successfully!' : 'Your booking request has been submitted and is waiting for approval.'}\n\nProperty: ${bookingForm.propertyName}\nCustomer: ${bookingForm.customerName}\nCheck-in: ${new Date(bookingForm.checkIn).toLocaleDateString()}\nCheck-out: ${new Date(bookingForm.checkOut).toLocaleDateString()}\nDays: ${calculatedDays}\nTotal Amount: KSh ${calculatedAmount.toLocaleString()}\n\n${isAdmin(currentUser) ? '' : '📱 Admin notification sent!'}`,
      () => {
        // Reset form and close modal
        setBookingForm({
          propertyId: '',
          propertyName: '',
          propertyPrice: 0,
          customerId: '',
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          checkIn: '',
          checkOut: '',
          numberOfPeople: '1'
        });
        setCustomerSearchTerm('');
        setShowCustomerDropdown(false);
        setShowBookingModal(false);
        // Navigate to home
        navigate('/');
      },
      'Go to Home'
      );
    } catch (error: any) {
      console.error('Failed to create booking:', error);
      showModal(
        'error',
        'Booking Failed',
        error.message === 'NO_CONNECTION' 
          ? 'No internet connection. Please check your connection and try again.'
          : 'Failed to create booking. Please try again.'
      );
    } finally {
      // Reset loading state
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] overflow-x-hidden">
      {/* Connection Status Banner */}
      <ConnectionStatusBanner />
      
      {/* Header */}
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[#36454F] hover:text-[#6B7F39]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Properties
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image Gallery */}
            <Card className="overflow-hidden shadow-xl">
              <div className="relative h-[300px] sm:h-[400px] md:h-[450px] w-full">
                <div className="absolute inset-0">
                  <Slider {...propertyImageSettings}>
                    {propertyImages.length > 0 ? (
                      propertyImages.map((image, index) => (
                        <div key={index} className="h-[300px] sm:h-[400px] md:h-[450px]">
                          <img
                            src={image}
                            alt={`${property.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-full h-[300px] sm:h-[400px] md:h-[450px] bg-gray-300 flex items-center justify-center">
                        <p className="text-gray-500">No images available</p>
                      </div>
                    )}
                  </Slider>
                </div>
                {/* Floating Price Badge */}
                <div className="absolute bottom-4 right-4 bg-red-600 text-white px-4 py-2.5 rounded-lg shadow-lg border-2 border-red-700">
                  <div className="text-2xl font-bold">KSh {property.price.toLocaleString()}</div>
                  <div className="text-xs text-center font-medium">per day</div>
                </div>
                {/* Status Badge */}
                {propertyIsBooked && (
                  <div className="absolute top-4 left-4 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg font-semibold">
                    Booked - Available {availableFromDate}
                  </div>
                )}
              </div>
            </Card>

            {/* Property Header & Quick Stats */}
            <Card className="shadow-lg">
              <CardContent className="p-5 md:p-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#36454F] mb-3">
                  {property.name}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-[#6B7F39]" />
                  <span className="text-lg">{property.location}</span>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-[#FAF4EC] to-[#f5ede3] rounded-xl border border-gray-200">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <Bed className="w-6 h-6 mx-auto mb-2 text-[#6B7F39]" />
                    <div className="text-2xl font-bold text-[#36454F]">{property.beds || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <Bath className="w-6 h-6 mx-auto mb-2 text-[#6B7F39]" />
                    <div className="text-2xl font-bold text-[#36454F]">{property.baths || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">Bathrooms</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <Maximize className="w-6 h-6 mx-auto mb-2 text-[#6B7F39]" />
                    <div className="text-2xl font-bold text-[#36454F]">{property.area || 0}</div>
                    <div className="text-xs text-gray-600 font-medium">Sqft</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description & Amenities Combined */}
            <Card className="shadow-lg">
              <CardContent className="p-5 md:p-6 space-y-5">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-[#36454F] mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#6B7F39]" />
                    About this property
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div className="pt-4 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-[#36454F] mb-3 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-[#6B7F39]" />
                    Amenities & Features
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {property.features && property.features.length > 0 ? (
                      property.features.map((amenity: string) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div key={amenity} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF4EC] rounded-full border border-gray-200 hover:border-[#6B7F39] hover:shadow-md transition-all">
                            <Icon className="w-4 h-4 text-[#6B7F39] flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-700">{amenity}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 w-full text-center py-4">No amenities listed for this property.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24 shadow-xl border-2 border-gray-200">
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="text-center pb-4 border-b border-gray-200">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-[#6B7F39]" />
                  <h3 className="text-xl font-bold text-[#36454F]">Book This Property</h3>
                </div>
                
                {/* Property Availability Status */}
                <div className={`p-3 rounded-lg text-center font-semibold ${
                  propertyIsBooked ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {propertyIsBooked ? `Booked until ${availableFromDate}` : '✓ Available Now'}
                </div>

                {/* Pricing Display */}
                <div className="bg-gradient-to-br from-[#FAF4EC] to-[#f5ede3] p-4 rounded-xl text-center border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Daily Rate</p>
                  <p className="text-3xl font-bold text-[#36454F]">KSh {property.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">per day</p>
                </div>
                
                {/* Show login prompt if user is not logged in */}
                {!currentUser ? (
                  <div className="text-center py-4 space-y-3">
                    <p className="text-gray-600 text-sm">
                      Please log in to book this property
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-lg py-6 text-black font-semibold shadow-lg"
                    >
                      Log in to Book
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={() => {
                        // Open booking modal with property pre-filled
                        setBookingForm({
                          propertyId: property.id.toString(),
                          propertyName: property.name,
                          propertyPrice: property.price,
                          customerId: isAdmin(currentUser) ? '' : currentUser.id,
                          customerName: isAdmin(currentUser) ? '' : currentUser.name,
                          customerEmail: isAdmin(currentUser) ? '' : currentUser.email,
                          customerPhone: isAdmin(currentUser) ? '' : (currentUser.phone || ''),
                          checkIn: '',
                          checkOut: '',
                          numberOfPeople: '1'
                        });
                        setShowBookingModal(true);
                      }}
                      className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      Book Now
                    </Button>
                    
                    {/* Contact Options */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-200">
                      <a
                        href={`tel:+254700000000`}
                        className="flex items-center justify-center gap-2 p-3 bg-[#FAF4EC] hover:bg-[#f5ede3] rounded-lg transition-colors border border-gray-200"
                      >
                        <Phone className="w-4 h-4 text-[#6B7F39]" />
                        <span className="text-xs font-semibold text-gray-700">Call</span>
                      </a>
                      <a
                        href={`https://wa.me/254700000000`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                      >
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700">WhatsApp</span>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8 relative">
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setBookingForm({
                    propertyId: '',
                    propertyName: '',
                    propertyPrice: 0,
                    customerId: '',
                    customerName: '',
                    customerEmail: '',
                    customerPhone: '',
                    checkIn: '',
                    checkOut: '',
                    numberOfPeople: '1'
                  });
                  setCustomerSearchTerm('');
                  setShowCustomerDropdown(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#6B7F39] p-3 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#36454F]">Book Property</h3>
              </div>

              <div className="space-y-4">
                {/* Property Name - Read only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property
                  </label>
                  <input
                    type="text"
                    value={bookingForm.propertyName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                </div>

                {/* Customer Selection - Only for Admin */}
                {isAdmin(currentUser) && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerSearchTerm || bookingForm.customerName}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerDropdown(true);
                        if (!e.target.value) {
                          setBookingForm({
                            ...bookingForm,
                            customerId: '',
                            customerName: '',
                            customerEmail: '',
                            customerPhone: ''
                          });
                        }
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      placeholder="Search customer..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {customers
                          .filter(c => 
                            c.name.toLowerCase().includes((customerSearchTerm || '').toLowerCase()) ||
                            (c.email && c.email.toLowerCase().includes((customerSearchTerm || '').toLowerCase()))
                          )
                          .map(customer => (
                            <div
                              key={customer.id}
                              onClick={() => {
                                setBookingForm({
                                  ...bookingForm,
                                  customerId: customer.id,
                                  customerName: customer.name,
                                  customerEmail: customer.email || '',
                                  customerPhone: customer.phone || ''
                                });
                                setCustomerSearchTerm('');
                                setShowCustomerDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-[#FAF4EC] cursor-pointer text-sm"
                            >
                              {customer.name} {customer.email && `(${customer.email})`}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Name - Read only for non-admin */}
                {!isAdmin(currentUser) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer
                    </label>
                    <input
                      type="text"
                      value={bookingForm.customerName}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                  </div>
                )}

                {/* Check-in and Check-out Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-In Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Check-Out Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                    />
                  </div>
                </div>

                {/* Number of People */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of People
                  </label>
                  <input
                    type="number"
                    value={bookingForm.numberOfPeople}
                    onChange={(e) => setBookingForm({ ...bookingForm, numberOfPeople: e.target.value })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B7F39]"
                  />
                </div>

                {/* Amount Due - Read Only */}
                {calculatedDays > 0 && bookingForm.propertyPrice > 0 && (
                  <div className="bg-[#FAF4EC] p-4 rounded-lg border border-[#6B7F39]/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Number of Days:</span>
                      <span className="font-semibold text-[#36454F]">{calculatedDays} days</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Price per Day:</span>
                      <span className="font-semibold text-[#36454F]">KSh {bookingForm.propertyPrice.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-[#6B7F39]/20">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-700">Amount Due:</span>
                        <span className="text-xl font-bold text-[#6B7F39]">KSh {calculatedAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleAddBooking}
                  className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-black font-semibold flex items-center justify-center gap-2"
                  disabled={!bookingForm.propertyId || !bookingForm.customerId || !bookingForm.checkIn || !bookingForm.checkOut || calculatedDays <= 0 || isSubmittingBooking}
                >
                  {isSubmittingBooking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding Booking...</span>
                    </>
                  ) : (
                    'Book Now'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowBookingModal(false);
                    setBookingForm({
                      propertyId: '',
                      propertyName: '',
                      propertyPrice: 0,
                      customerId: '',
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      checkIn: '',
                      checkOut: '',
                      numberOfPeople: '1'
                    });
                    setCustomerSearchTerm('');
                    setShowCustomerDropdown(false);
                  }}
                  className="px-6 bg-gray-200 hover:bg-gray-300 text-[#36454F] font-semibold"
                  disabled={isSubmittingBooking}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {modalState.show && (
        <CustomModal
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
          onConfirm={modalState.onConfirm}
          onCancel={() => {
            if (modalState.onCancel) {
              modalState.onCancel();
            }
            setModalState({ ...modalState, show: false });
          }}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
        />
      )}
    </div>
  );
}