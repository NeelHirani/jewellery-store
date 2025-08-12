import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from "../components/Navbar";
import { FaTrashAlt } from 'react-icons/fa';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

const Cart: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  const updateQuantity = (id: any, newQuantity: any): void => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string): void => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  /*
  const updateSize = (id: any, newSize: any): void => { // Unused
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, selectedSize: newSize } : item
      )
    );
  };
  */



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
          <Link to="/products" className="bg-[#800000] text-white px-8 py-3 rounded-lg hover:bg-[#5a0d15] transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-playfair text-gray-800 mb-6 mt-13">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item: any) => (
              <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={item.image || '/images/hero1.jpg'}
                    alt={item.name || 'Product image'}
                    className="w-28 h-28 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/hero1.jpg';
                    }}
                  />
                  <div className="flex-1 space-y-1">
                    {/* Product Name */}
                    <h2 className="text-xl font-semibold text-gray-800">{item.name}</h2>
                    <p className="text-gray-500 text-sm">Metal: <span className="text-gray-800">{item.metal}</span></p>
                    <p className="text-gray-500 text-sm">Stone: <span className="text-gray-800">{item.stone}</span></p>
                    <div className="flex items-center mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Decrease quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <div className="w-12 h-10 flex items-center justify-center border-x border-gray-300 bg-gray-50">
                          <span className="text-sm font-medium text-gray-800">{item.quantity}</span>
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          aria-label="Increase quantity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Price and Delete Button Column */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-lg font-semibold text-[#800000] whitespace-nowrap">
                      ${(item.price * item.quantity).toLocaleString('en-US')}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="px-3 py-1.5 bg-white text-[#800000] border-2 border-[#800000] rounded-lg hover:bg-[#800000] hover:text-white transition-all duration-200 font-medium text-sm flex items-center"
                      title="Remove Item"
                    >
                      <FaTrashAlt className="w-3 h-3 mr-1.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                <span className="text-[#800000]">${total.toLocaleString('en-US')}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block mt-6 bg-[#800000] hover:bg-[#5a0d15] text-white py-3 px-4 text-center rounded-lg transition-colors font-medium"
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
