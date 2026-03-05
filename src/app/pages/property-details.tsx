import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Slider from 'react-slick';
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
import { saveBooking } from '../lib/realtime-data-manager';
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
    const loadedProperties = JSON.parse(localStorage.getItem('skyway_properties') || '[]');
    const loadedBookings = JSON.parse(localStorage.getItem('skyway_bookings') || '[]');
    const loggedInUser = JSON.parse(localStorage.getItem('skyway_auth_user') || 'null');
    const loadedCustomers = JSON.parse(localStorage.getItem('skyway_customers') || '[]');
    
    setProperties(loadedProperties);
    setBookings(loadedBookings);
    setCurrentUser(loggedInUser);
    setCustomers(loadedCustomers);
    
    // Find the specific property by ID
    const foundProperty = loadedProperties.find((p: any) => p.id.toString() === id);
    setProperty(foundProperty);
    
    // Check if property is currently booked
    if (foundProperty) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeBookings = loadedBookings.filter((b: any) => {
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
  }, [id]);

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
    adaptiveHeight: false
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
    
    // Check for double booking - Same logic as Admin Dashboard
    const requestedCheckIn = new Date(bookingForm.checkIn);
    const requestedCheckOut = new Date(bookingForm.checkOut);
    
    const conflictingBooking = bookings.find((b: any) => {
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
    
    if (conflictingBooking) {
      const conflictCheckOut = new Date(conflictingBooking.checkOut).toLocaleDateString();
      const conflictBookingId = conflictingBooking.id;
      showModal(
        'error', 
        'Property Already Booked', 
        `This property is already booked during the selected dates.\n\nBooking ID: ${conflictBookingId}\nProperty: ${bookingForm.propertyName}\nBooked by: ${conflictingBooking.customerName}\nStatus: ${conflictingBooking.status}\n\nThe property will be available after ${conflictCheckOut}.\n\nPlease select different dates.`
      );
      return;
    }
    
    // Create new booking
    const newBooking = {
      id: Date.now(),
      propertyId: bookingForm.propertyId, // Keep as string for consistency
      propertyName: bookingForm.propertyName,
      customerId: bookingForm.customerId,
      customerName: bookingForm.customerName,
      customerEmail: bookingForm.customerEmail,
      customerPhone: bookingForm.customerPhone,
      checkIn: bookingForm.checkIn,
      checkOut: bookingForm.checkOut,
      numberOfPeople: parseInt(bookingForm.numberOfPeople) || 1,
      days: calculatedDays,
      totalAmount: calculatedAmount,
      status: isAdmin(currentUser) ? 'Confirmed' : 'Pending Approval',
      payments: [],
      createdAt: new Date().toISOString()
    };
    
    // Save using realtime data manager (syncs to cloud automatically)
    await saveBooking(newBooking);
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    
    // Log successful booking creation
    console.log('✅ Booking Created Successfully:');
    console.log('- Booking ID:', newBooking.id);
    console.log('- Property ID:', newBooking.propertyId, '| Property Name:', newBooking.propertyName);
    console.log('- Customer ID:', newBooking.customerId, '| Customer Name:', newBooking.customerName);
    console.log('- Status:', newBooking.status);
    console.log('- Check-in:', newBooking.checkIn, '| Check-out:', newBooking.checkOut);
    console.log('- Days:', calculatedDays, '| Total Amount: KSh', calculatedAmount.toLocaleString());
    
    // SMS Notification to Admin
    const smsSettings = JSON.parse(localStorage.getItem('skyway_sms_settings') || '{}');
    const generalSettings = JSON.parse(localStorage.getItem('skyway_general_settings') || '{}');
    const adminMessage = smsSettings?.defaultMessages?.bookingMadeAdmin || 
      'New booking made! Visit system to approve and confirm payment.';
    
    console.log('📱 SMS Notification to Admin:');
    console.log(`Provider: ${smsSettings.provider || 'Not configured'}`);
    console.log(`To: ${generalSettings.companyPhone || 'Admin'}`);
    console.log(`Message: ${adminMessage}`);
    
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
  };

  return (
    <div className="min-h-screen bg-[#FAF4EC] overflow-x-hidden">
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
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Property Details */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-[250px] sm:h-[350px] md:h-[500px]">
                <Slider {...propertyImageSettings}>
                  {propertyImages.length > 0 ? (
                    propertyImages.map((image, index) => (
                      <div key={index}>
                        <img
                          src={image}
                          alt={`${property.name} - Image ${index + 1}`}
                          className="w-full h-[250px] sm:h-[350px] md:h-[500px] object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-[250px] sm:h-[350px] md:h-[500px] bg-gray-300 flex items-center justify-center">
                      <p className="text-gray-500">No images available</p>
                    </div>
                  )}
                </Slider>
              </div>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-4 md:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#36454F] mb-2 break-words">
                      {property.name}
                    </h1>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
                      <span className="text-base md:text-lg break-words">{property.location}</span>
                    </div>
                  </div>
                  <div className="bg-[#D4C5B0] text-[#36454F] px-3 md:px-4 py-2 rounded-lg flex-shrink-0 self-start md:self-auto border border-[#B8A586]">
                    <div className="text-lg md:text-xl font-bold whitespace-nowrap">KSh {property.price.toLocaleString()}</div>
                    <div className="text-xs text-center text-gray-700">per day</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-[#36454F] mb-3 md:mb-4">About this property</h2>
                  <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Amenities */}
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#36454F] mb-3 md:mb-4">Amenities</h2>
                  <div className="flex flex-col gap-2 md:gap-3">
                    {property.features && property.features.length > 0 ? (
                      property.features.map((amenity: string) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div key={amenity} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-[#FAF4EC] rounded-lg">
                            <Icon className="w-4 h-4 md:w-5 md:h-5 text-[#6B7F39] flex-shrink-0" />
                            <span className="text-gray-700 font-medium text-sm md:text-base break-words">{amenity}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm md:text-base">No amenities listed for this property.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold text-[#36454F] mb-4 md:mb-6">Book This Property</h3>
                
                {/* Property Availability Status - Same as Admin Dashboard */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 font-medium">Status:</span>
                    <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${
                      propertyIsBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {propertyIsBooked ? `Booked, Available from ${availableFromDate}` : 'Available for booking'}
                    </span>
                  </div>
                </div>

                {/* Property Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6 py-3 md:py-4 border-t border-b border-gray-200">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1 md:mb-2">
                      <Bed className="w-4 h-4 md:w-5 md:h-5 text-[#6B7F39]" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-[#36454F]">{property.beds || 0}</div>
                    <div className="text-xs text-gray-600">No. of Beds</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1 md:mb-2">
                      <Bath className="w-4 h-4 md:w-5 md:h-5 text-[#6B7F39]" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-[#36454F]">{property.baths || 0}</div>
                    <div className="text-xs text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1 md:mb-2">
                      <Maximize className="w-4 h-4 md:w-5 md:h-5 text-[#6B7F39]" />
                    </div>
                    <div className="text-lg md:text-xl font-bold text-[#36454F]">{property.area || 0}</div>
                    <div className="text-xs text-gray-600">Area in Sqft</div>
                  </div>
                </div>
                
                {/* Show login prompt if user is not logged in */}
                {!currentUser ? (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-gray-600 text-sm md:text-base">
                      Please log in to book this property
                    </p>
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-base md:text-lg py-5 md:py-6 text-black font-semibold"
                    >
                      Log in to Book
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                      className="w-full bg-[#6B7F39] hover:bg-[#5a6930] text-black font-semibold py-5 md:py-6 text-base md:text-lg"
                    >
                      Book Property
                    </Button>
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
                  className="flex-1 bg-[#6B7F39] hover:bg-[#5a6930] text-black font-semibold"
                  disabled={!bookingForm.propertyId || !bookingForm.customerId || !bookingForm.checkIn || !bookingForm.checkOut || calculatedDays <= 0}
                >
                  Book Now
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
