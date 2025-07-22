import { useState, useEffect } from 'react';
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
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
    const fetchCartItems = async () => {
      // Fetch cart items for the current user (replace user_id with actual user ID from auth)
      const { data: cartData, error } = await supabase
        .from('cart')
        .select(`
          *,
          products(name, price, image_url)
        `)
        .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Replace with actual user ID
      if (error) {
        console.error('Error fetching cart items:', error);
        setError('Failed to load cart items.');
        return;
      }
      setCartItems(cartData || []);
    };
    fetchCartItems();
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
    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
      setError('Please fill in all required shipping address fields.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Replace with actual user ID
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          payment_status: 'completed', // Simulate successful payment
          order_status: 'processing'
        })
        .select()
        .single();
      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        price_at_purchase: item.products.price
      }));
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      const { error: cartError } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Replace with actual user ID
      if (cartError) throw cartError;

      setOrderPlaced(true);
      setCartItems([]);
    } catch (err) {
      setError('Failed to place order. Please try again.');
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
            {cartItems.length === 0 ? (
              <>
                <i className="ri-construction-line w-16 h-16 flex items-center justify-center text-amber-600 mx-auto mb-4"></i>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Checkout Coming Soon</h2>
                <p className="text-gray-600 mb-6">
                  Your cart is empty. Add items to proceed with checkout.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Go Back
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
                            src={item.products.image_url}
                            alt={item.products.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.products.name}</p>
                            {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          ₹{(item.products.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Total: ₹{cartItems.reduce((sum, item) => sum + item.products.price * item.quantity, 0).toLocaleString()}
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
 