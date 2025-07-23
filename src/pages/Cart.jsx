'use client';

import { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import Header from "../components/Navbar";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load cart from localStorage on component mount
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

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('jewelMartCart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  // Update quantity of an item
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Update size for an item
  const updateSize = (id, newSize) => {
    setCartItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, selectedSize: newSize }
          : item
      )
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.price || 0) * item.quantity;
  }, 0);

  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
        <h1 className="text-4xl font-playfair text-gray-800 mb-6">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded shadow">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p>Metal: {item.metal}</p>
                    <p>Stone: {item.stone}</p>
                    <p>Size: {item.selectedSize}</p>
                    <div className="flex gap-2 items-center mt-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      <button onClick={() => removeItem(item.id)} className="text-red-600 ml-4">Remove</button>
                    </div>
                  </div>
                  <div>${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-red-600">Clear Cart</button>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <p className="font-bold">Total: ${total.toFixed(2)}</p>
            <Link to="/checkout" className="block mt-4 bg-amber-600 text-white text-center py-2 rounded">
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
