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
  }

  interface PaymentDetails {
    cardNumber: string;
    expiry: string;
    cvv: string;
  }

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  // Calculate subtotal, tax, and total (matching Cart.jsx logic)
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.10; // 10% tax rate
  const total = subtotal + tax;

  useEffect(() => {
    // Load cart from localStorage
    const loadCartFromStorage = (): void => {
      try {
        const savedCart = localStorage.getItem('jewelMartCart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        setError('Failed to load cart items.');
      }
    };

    // Load user from localStorage
    const loadUserFromStorage = (): void => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          // Pre-fill shipping address if user has address data
          if (userData.address) {
            setShippingAddress(prev => ({
              ...prev,
              fullName: userData.name || '',
              addressLine1: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              postalCode: userData.zip || '',
              country: userData.country || ''
            }));
          }
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    };

    loadCartFromStorage();
    loadUserFromStorage();
  }, []);

  const handleInputChange = (e: any, setState: any): void => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  // Add formatting functions
  const formatCardNumber = (value: string): string => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string): string => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatCVV = (value: string): string => {
    // Only allow digits, max 4 characters
    return value.replace(/\D/g, '').substring(0, 4);
  };

  const handlePaymentInputChange = (e: any): void => {
    const { name, value } = e.target;
    let formattedValue = value;

    switch (name) {
      case 'cardNumber':
        formattedValue = formatCardNumber(value);
        break;
      case 'expiry':
        formattedValue = formatExpiry(value);
        break;
      case 'cvv':
        formattedValue = formatCVV(value);
        break;
    }

    setPaymentDetails(prev => ({ ...prev, [name]: formattedValue }));
  };

  const validatePaymentDetails = (): string | null => {
    // Card number validation (remove spaces and check length)
    const cardNumberClean = paymentDetails.cardNumber.replace(/\s/g, '');
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      return 'Please enter a valid card number (13-19 digits).';
    }

    // Expiry validation
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(paymentDetails.expiry)) {
      return 'Please enter expiry date in MM/YY format.';
    }

    // Check if expiry date is not in the past
    const [month, year] = paymentDetails.expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const currentDate = new Date();
    currentDate.setDate(1); // Set to first day of current month
    if (expiryDate < currentDate) {
      return 'Card has expired. Please enter a valid expiry date.';
    }

    // CVV validation
    if (paymentDetails.cvv.length < 3 || paymentDetails.cvv.length > 4) {
      return 'Please enter a valid CVV (3-4 digits).';
    }

    return null; // No errors
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

    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      setError('Please fill in all required shipping address fields.');
      return;
    }

    // Validate payment details
    const paymentError = validatePaymentDetails();
    if (paymentError) {
      setError(paymentError);
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
      setError(err.message || 'Failed to place order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-pink-50 py-12">
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
                  className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Continue Shopping
                </button>
                <button
                  className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap"
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-pink-50 py-8">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors mb-4"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
            Secure Checkout
          </h1>
        </div>

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
                  <i className="ri-user-line text-6xl text-amber-600 mb-4"></i>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                  <p className="text-gray-600 mb-6">
                    Please log in to complete your purchase.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => window.history.back()}
                      className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap"
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
                  <i className="ri-shopping-cart-line text-6xl text-amber-600 mb-4"></i>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Cart is Empty</h2>
                  <p className="text-gray-600 mb-6">
                    Add items to your cart to proceed with checkout.
                  </p>
                  <button
                    onClick={() => window.location.href = '/products'}
                    className="bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 whitespace-nowrap"
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
                              src={item.image || '/placeholder-image.jpg'}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
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
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={shippingAddress.fullName}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={shippingAddress.addressLine1}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={shippingAddress.addressLine2}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingAddress.city}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={shippingAddress.state}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          name="country"
                          value={shippingAddress.country}
                          onChange={(e) => handleInputChange(e, setShippingAddress)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentDetails.cardNumber}
                          onChange={handlePaymentInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          value={paymentDetails.expiry}
                          onChange={handlePaymentInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentDetails.cvv}
                          onChange={handlePaymentInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </motion.div>

                  {error && (
                    <p className="text-red-600 text-center mb-4">{error}</p>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => window.history.back()}
                      className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-semibold py-3 px-6 rounded-xl transition-all duration-200 whitespace-nowrap"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="w-full lg:w-auto bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          <i className="ri-secure-payment-line mr-2"></i>
                          Place Order
                        </>
                      )}
                    </button>
                  </div>
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
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
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
                    <span className="text-lg font-bold text-amber-600">${total.toLocaleString('en-US')}</span>
                  </div>
                </div>
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