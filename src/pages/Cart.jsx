'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Navbar";
import { FaTrashAlt } from 'react-icons/fa';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('jewelMartCart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('jewelMartCart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateSize = (id, newSize) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selectedSize: newSize } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);

  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl font-playfair text-gray-800 mb-4 mt-60">Your Cart is Empty</h2>
          <Link to="/products" className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-playfair text-gray-800 mb-6 mt-13">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-lg shadow-sm" />
                  <div className="flex-1 space-y-1">
                    <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-gray-500 text-sm">Metal: <span className="text-gray-800">{item.metal}</span></p>
                    <p className="text-gray-500 text-sm">Stone: <span className="text-gray-800">{item.stone}</span></p>
                    <p className="text-gray-500 text-sm">Size: <span className="text-gray-800">{item.selectedSize}</span></p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >-</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >+</button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                        title="Remove Item"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-amber-600 whitespace-nowrap">
                    ${(item.price * item.quantity).toLocaleString('en-US')}
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-800 underline mt-4 text-sm"
            >
              Clear Entire Cart
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md h-fit sticky top-28">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Order Summary</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toLocaleString('en-US')}</span>
              </div>
              <hr className="my-3" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-amber-600">${total.toLocaleString('en-US')}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 text-center rounded-lg transition-colors font-medium"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
