import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from "../lib/supabase";
import Navbar from "../components/Navbar";

const Checkout: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  interface ShippingAddress {
    fullName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  }

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  // Address management states
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [addressAutoFilled, setAddressAutoFilled] = useState<boolean>(false);

  // Validation states
  const [addressErrors, setAddressErrors] = useState<any>({});
  const [showValidation, setShowValidation] = useState<boolean>(false);

  // Calculate subtotal, tax, and total (matching Cart.jsx logic)
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.10; // 10% tax rate
  const total = subtotal + tax;

  useEffect(() => {
    // Load cart from localStorage with data validation
    const loadCartFromStorage = (): void => {
      try {
        const savedCart = localStorage.getItem('jewelMartCart');
        if (savedCart) {
          const cartData = JSON.parse(savedCart);

          // Validate and clean cart data
          const cleanedCartItems = cartData.map((item: any) => ({
            ...item,
            // Ensure required fields exist
            id: item.id || item.productId || `item_${Date.now()}_${Math.random()}`,
            name: item.name || 'Unknown Product',
            price: typeof item.price === 'number' ? item.price : 0,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            // Clean up image URL if it's corrupted
            image: item.image && typeof item.image === 'string' ? item.image : '/images/hero1.jpg'
          }));

          setCartItems(cleanedCartItems);

          // Save cleaned data back to localStorage
          localStorage.setItem('jewelMartCart', JSON.stringify(cleanedCartItems));
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart items.');
        // Clear corrupted cart data
        localStorage.removeItem('jewelMartCart');
        setCartItems([]);
      }
    };

    // Enhanced user loading with address management
    const loadUserFromStorage = (): void => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);

          // Load saved addresses
          loadSavedAddresses(userData.email);
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };

    // Load saved addresses for the user
    const loadSavedAddresses = (userEmail: string): void => {
      try {
        const savedAddressesData = localStorage.getItem(`addresses_${userEmail}`);
        if (savedAddressesData) {
          const addresses = JSON.parse(savedAddressesData);
          setSavedAddresses(addresses);

          // Find default address and auto-select it
          const defaultAddress = addresses.find((addr: any) => addr.isDefault) || addresses[0];
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            selectAddress(defaultAddress);
          } else {
            setShowAddressForm(true);
          }
        } else {
          // No saved addresses, check if user has profile address
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          const hasProfileAddress = userData.address || userData.city || userData.state;

          if (hasProfileAddress) {
            // Create a temporary address from profile data
            const profileAddress = {
              id: 'profile-temp',
              label: 'Profile Address',
              fullName: userData.name || '',
              address: userData.address || '',
              apartment: userData.apartment || '',
              city: userData.city || '',
              state: userData.state || '',
              country: userData.country || '',
              zip: userData.zip || '',
              isDefault: true
            };
            setSavedAddresses([profileAddress]);
            setSelectedAddressId(profileAddress.id);
            selectAddress(profileAddress);
          } else {
            // No addresses at all, show form
            setShowAddressForm(true);
          }
        }
      } catch (error) {
        console.error('Error loading saved addresses:', error);
        setShowAddressForm(true);
      }
    };

    loadCartFromStorage();
    loadUserFromStorage();
  }, []);

  // Address selection functions
  const selectAddress = (address: any): void => {
    const selectedAddress = {
      fullName: address.fullName || '',
      addressLine1: address.address || '',
      addressLine2: address.apartment || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.zip || '',
      country: address.country || '',
      phoneNumber: address.phoneNumber || ''
    };

    setShippingAddress(selectedAddress);
    setSelectedAddressId(address.id);
    setAddressAutoFilled(true);
    setShowAddressForm(false);
  };

  const handleAddressSelection = (addressId: string): void => {
    const selectedAddr = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddr) {
      selectAddress(selectedAddr);
    }
  };

  const showNewAddressForm = (): void => {
    setShowAddressForm(true);
    setSelectedAddressId(null);
    setShippingAddress({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phoneNumber: ''
    });
    setAddressAutoFilled(false);
  };

  const cancelAddressForm = (): void => {
    setShowAddressForm(false);
    // If there are saved addresses, select the first one
    if (savedAddresses.length > 0) {
      const firstAddress = savedAddresses[0];
      setSelectedAddressId(firstAddress.id);
      selectAddress(firstAddress);
    }
  };

  // Enhanced validation functions
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateAddressForm = (): boolean => {
    const errors: any = {};

    // Required field validation
    if (!shippingAddress.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!shippingAddress.addressLine1?.trim()) {
      errors.addressLine1 = 'Address is required';
    }

    if (!shippingAddress.city?.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingAddress.state?.trim()) {
      errors.state = 'State/Province is required';
    }

    if (!shippingAddress.postalCode?.trim()) {
      errors.postalCode = 'Postal/ZIP code is required';
    }

    if (!shippingAddress.country?.trim()) {
      errors.country = 'Country is required';
    }

    if (!shippingAddress.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(shippingAddress.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setAddressErrors(errors);
    setShowValidation(true);

    return Object.keys(errors).length === 0;
  };

  const getFieldClassName = (fieldName: keyof ShippingAddress, isRequired: boolean = false): string => {
    const baseClasses = "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#800000] focus:border-transparent text-sm transition-all duration-200";
    const hasValue = shippingAddress[fieldName]?.trim();
    const hasError = showValidation && addressErrors[fieldName];

    if (hasError) {
      return `${baseClasses} border-red-500 bg-red-50/30`;
    } else if (addressAutoFilled && hasValue) {
      return `${baseClasses} border-rose-300 bg-rose-50/30`;
    } else if (isRequired && !hasValue && showValidation) {
      return `${baseClasses} border-red-300 hover:border-red-400`;
    } else {
      return `${baseClasses} border-gray-300`;
    }
  };



  // Image error handling function
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const target = e.target as HTMLImageElement;
    target.src = '/images/hero1.jpg'; // Use existing image as fallback
    console.warn('Image failed to load, using fallback image');
  };

  // Safe image source function
  const getSafeImageSrc = (imageSrc: string | undefined): string => {
    const fallbackImage = '/images/hero1.jpg'; // Use existing image as fallback

    if (!imageSrc) return fallbackImage;

    // Check if it's a valid URL or data URL
    try {
      if (imageSrc.startsWith('data:image/')) {
        // Validate data URL format
        const isValidDataUrl = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(imageSrc);
        if (!isValidDataUrl) {
          console.warn('Invalid data URL format, using fallback image');
          return fallbackImage;
        }

        // Additional check for corrupted base64 data
        const base64Data = imageSrc.split(',')[1];
        if (!base64Data || base64Data.length < 10) {
          console.warn('Corrupted base64 data, using fallback image');
          return fallbackImage;
        }
      } else if (imageSrc.startsWith('http') || imageSrc.startsWith('/')) {
        // Valid HTTP URL or relative path
        return imageSrc;
      } else {
        // Invalid format
        console.warn('Invalid image source format, using fallback image');
        return fallbackImage;
      }
      return imageSrc;
    } catch (error) {
      console.error('Error processing image source, using fallback:', error);
      return fallbackImage;
    }
  };

  const handleInputChange = (e: any, setState: any): void => {
    const { name, value } = e.target;
    setState((prev: any) => ({ ...prev, [name]: value }));

    // Clear validation error for this field when user starts typing
    if (setState === setShippingAddress && addressErrors[name]) {
      setAddressErrors((prev: any) => ({ ...prev, [name]: '' }));
    }

    // If user manually edits address, mark as no longer auto-filled
    if (setState === setShippingAddress && addressAutoFilled) {
      setAddressAutoFilled(false);
    }
  };



  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!user || user.email === 'guest@example.com') {
      setError('Please log in to place an order.');
      return;
    }

    // Validate shipping address
    if (!validateAddressForm()) {
      setError('Please complete all required shipping address fields.');
      return;
    }



    setLoading(true);
    setError(null);

    try {
      // Get user ID from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) {
        throw new Error('User not found. Please log in again.');
      }

      // Use calculated total amount (including tax)
      const totalAmount = total;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userData.id,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_status: 'completed',
          order_status: 'processing'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items from localStorage cart
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        size: item.selectedSize || 'Medium',
        price_at_purchase: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart from localStorage
      localStorage.removeItem('jewelMartCart');
      setOrderPlaced(true);
      setCartItems([]);

    } catch (err) {
      setError((err as Error).message || 'Failed to place order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50 py-12 mt-15">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-white text-3xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-gray-600 mb-2">Thank you for your purchase from Jewell Mart</p>
            <p className="text-gray-500 text-sm mb-8">Order #JM-{Date.now().toString().slice(-6)}</p>
            <div className="space-y-4">
              <p className="text-gray-600">
                A confirmation email has been sent to your email address with order details and tracking information.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-gradient-to-r from-[#800000] to-[#5a0d15] hover:from-[#5a0d15] hover:to-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Continue Shopping
                </button>
                <button
                  className="border-2 border-rose-400 text-rose-600 hover:bg-rose-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap"
                >
                  Track Order
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50 py-8 mt-15">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {!user || user.email === 'guest@example.com' ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center"
                >
                  <i className="ri-user-line text-6xl text-[#800000] mb-4"></i>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                  <p className="text-gray-600 mb-6">
                    Please log in to complete your purchase.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="bg-gradient-to-r from-[#800000] to-[#5a0d15] hover:from-[#5a0d15] hover:to-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="border-2 border-rose-400 text-rose-600 hover:bg-rose-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap"
                    >
                      Go Back
                    </button>
                  </div>
                </motion.div>
              ) : cartItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 text-center"
                >
                  <i className="ri-shopping-cart-line text-6xl text-[#800000] mb-4"></i>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Cart is Empty</h2>
                  <p className="text-gray-600 mb-6">
                    Add items to your cart to proceed with checkout.
                  </p>
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="bg-gradient-to-r from-[#800000] to-[#5a0d15] hover:from-[#5a0d15] hover:to-slate-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    Shop Now
                  </button>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h2>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item: any, index: number) => (
                        <div key={item.id || item.productId || index} className="flex items-center space-x-4">
                          <div className="relative">
                            <img
                              src={getSafeImageSrc(item.image)}
                              alt={item.name || 'Product image'}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={handleImageError}
                            />
                            <div className="absolute -top-2 -right-2 bg-[#800000] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                              {item.quantity}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                            {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">${((item.price || 0) * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${subtotal.toLocaleString('en-US')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (10%)</span>
                        <span>${tax.toLocaleString('en-US')}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                        <span>Total</span>
                        <span>${total.toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
                      {savedAddresses.length > 0 && !showAddressForm && (
                        <button
                          onClick={showNewAddressForm}
                          className="text-sm text-[#800000] hover:text-[#5a0d15] font-medium transition-colors"
                        >
                          + Add New Address
                        </button>
                      )}
                    </div>

                    {/* Address Selection Cards */}
                    {savedAddresses.length > 0 && !showAddressForm ? (
                      <div className="space-y-3 mb-6">
                        {savedAddresses.map((address, index) => (
                          <motion.div
                            key={address.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                              selectedAddressId === address.id
                                ? 'border-[#800000] bg-rose-50 shadow-md'
                                : 'border-gray-200 hover:border-rose-300 hover:bg-gray-50'
                            }`}
                            onClick={() => handleAddressSelection(address.id)}
                          >
                            <div className="flex items-start">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddressId === address.id}
                                onChange={() => handleAddressSelection(address.id)}
                                className="mt-1 w-4 h-4 text-[#800000] border-gray-300 focus:ring-[#800000] focus:ring-2"
                              />
                              <div className="ml-3 flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="text-sm font-medium text-gray-900 flex items-center">
                                    {address.label === 'Home' && <i className="ri-home-line mr-1 text-[#800000]"></i>}
                                    {address.label === 'Work' && <i className="ri-briefcase-line mr-1 text-[#800000]"></i>}
                                    {address.label !== 'Home' && address.label !== 'Work' && <i className="ri-map-pin-line mr-1 text-[#800000]"></i>}
                                    {address.label}
                                  </span>
                                  {address.isDefault && (
                                    <span className="ml-2 px-2 py-1 bg-[#800000] text-white text-xs rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <p className="font-medium text-gray-900">{address.fullName}</p>
                                  <p>{address.address}</p>
                                  {address.apartment && <p>{address.apartment}</p>}
                                  <p>{[address.city, address.state].filter(Boolean).join(', ')} {address.zip}</p>
                                  <p>{address.country}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : savedAddresses.length === 0 && !showAddressForm ? (
                      <div className="text-center py-8 mb-6">
                        <i className="ri-map-pin-line text-4xl text-gray-400 mb-3"></i>
                        <p className="text-gray-600 text-sm mb-4">No saved addresses found.</p>
                        <button
                          onClick={showNewAddressForm}
                          className="inline-flex items-center px-4 py-2 bg-[#800000] text-white text-sm font-medium rounded-lg hover:bg-[#5a0d15] transition-colors"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Add Shipping Address
                        </button>
                      </div>
                    ) : null}

                    {/* Address Auto-fill Status Indicator */}
                    {addressAutoFilled && selectedAddressId && !showAddressForm && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-[#800000] rounded-full"></div>
                          <span className="text-sm text-[#800000] font-medium">
                            Address selected for delivery
                          </span>
                        </div>
                      </motion.div>
                    )}
                    {/* Address Form - Show when no saved addresses or when adding new address */}
                    {(savedAddresses.length === 0 || showAddressForm) && (
                      <>
                        {savedAddresses.length > 0 && showAddressForm && (
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Add New Address</h3>
                            <button
                              onClick={cancelAddressForm}
                              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.fullName && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('fullName', true)}
                          required
                          placeholder="Enter your full name"
                        />
                        {showValidation && addressErrors.fullName && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.fullName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1 <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.addressLine1 && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={shippingAddress.addressLine1}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('addressLine1', true)}
                          required
                          placeholder="Street address, P.O. box"
                        />
                        {showValidation && addressErrors.addressLine1 && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.addressLine1}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 (Optional)
                          {addressAutoFilled && shippingAddress.addressLine2 && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={shippingAddress.addressLine2}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('addressLine2')}
                          placeholder="Apartment, suite, unit, building, floor, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.city && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('city', true)}
                          required
                          placeholder="Enter city"
                        />
                        {showValidation && addressErrors.city && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.state && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('state', true)}
                          required
                          placeholder="State/Province"
                        />
                        {showValidation && addressErrors.state && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal/ZIP Code <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.postalCode && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('postalCode', true)}
                          required
                          placeholder="ZIP/Postal code"
                        />
                        {showValidation && addressErrors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.postalCode}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.country && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={shippingAddress.country}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('country', true)}
                          required
                          placeholder="Country"
                        />
                        {showValidation && addressErrors.country && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.country}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                          {addressAutoFilled && shippingAddress.phoneNumber && (
                            <span className="ml-2 text-xs text-[#800000] font-normal">• Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={shippingAddress.phoneNumber}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className={getFieldClassName('phoneNumber', true)}
                          required
                          placeholder="+1 (555) 123-4567"
                        />
                        {showValidation && addressErrors.phoneNumber && (
                          <p className="text-red-500 text-xs mt-1">{addressErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                      </>
                    )}
                  </motion.div>



                  {error && (
                    <p className="text-red-600 text-center mb-4">{error}</p>
                  )}


                </>
              )}
            </div>
          </div>

          {/* Order Summary (Placeholder - to be styled similarly in future updates) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {cartItems.map((item: any, index: number) => (
                  <div key={item.id || item.productId || index} className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={getSafeImageSrc(item.image)}
                        alt={item.name || 'Product image'}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={handleImageError}
                      />
                      <div className="absolute -top-2 -right-2 bg-[#800000] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                      {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${((item.price || 0) * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium">${tax.toLocaleString('en-US')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-[#800000]">${total.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#800000] to-[#5a0d15] hover:from-[#5a0d15] hover:to-slate-900 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <i className="ri-shopping-bag-line mr-2"></i>
                      Place Order
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.history.back()}
                  className="w-full border-2 border-[#800000] text-[#800000] hover:bg-rose-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Go Back
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <i className="ri-shield-check-line mr-2"></i>
                Secured by 256-bit SSL encryption
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;