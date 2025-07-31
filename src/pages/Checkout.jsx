import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";
import Header from "../components/Navbar";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Load cart from localStorage
    const loadCartFromStorage = () => {
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
    const loadUserFromStorage = () => {
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

  const handleInputChange = (e, setState) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
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

      // Calculate total amount from localStorage cart
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Order Placed
            </h1>
            <p className="text-gray-600 mb-8">Thank you for your purchase! You'll receive a confirmation soon.</p>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <i className="fas fa-check-circle w-16 h-16 flex items-center justify-center text-green-500 mx-auto mb-4"></i>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Successful</h2>
              <p className="text-gray-600 mb-6">
                Your order has been successfully placed. Check your email for details.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors whitespace-nowrap"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Checkout
          </h1>
          <p className="text-gray-600 mb-8">Complete your purchase</p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {!user || user.email === 'guest@example.com' ? (
              <>
                <i className="ri-user-line w-16 h-16 flex items-center justify-center text-amber-600 mx-auto mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h2>
                <p className="text-gray-600 mb-6">
                  Please log in to complete your purchase.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors whitespace-nowrap"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Go Back
                  </button>
                </div>
              </>
            ) : cartItems.length === 0 ? (
              <>
                <i className="ri-shopping-cart-line w-16 h-16 flex items-center justify-center text-amber-600 mx-auto mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Cart is Empty</h2>
                <p className="text-gray-600 mb-6">
                  Add items to your cart to proceed with checkout.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => window.location.href = '/products'}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors whitespace-nowrap"
                  >
                    Shop Now
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Cart</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={item.image || '/placeholder-image.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.selectedSize && <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>}
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{((item.price || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Total: ₹{cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={shippingAddress.addressLine1}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={shippingAddress.addressLine2}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange(e, setShippingAddress)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={(e) => handleInputChange(e, setPaymentDetails)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={paymentDetails.expiry}
                        onChange={(e) => handleInputChange(e, setPaymentDetails)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CVV</label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={(e) => handleInputChange(e, setPaymentDetails)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-600 text-center mb-4">{error}</p>
                )}

                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className={`bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition-colors whitespace-nowrap ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 
