'use client';

import { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import Header from "../components/Navbar";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock products data
  const products = [
    {
      id: 1,
      name: "Diamond Engagement Ring",
      price: 2499,
      image: "https://readdy.ai/api/search-image?query=elegant%20diamond%20engagement%20ring%20with%20white%20gold%20band%20on%20white%20background%2C%20luxury%20jewelry%20photography%2C%20professional%20lighting%2C%20high-end%20jewelry%20display&width=300&height=300&seq=ring1&orientation=squarish",
      metal: "White Gold",
      stone: "Diamond",
      rating: 4.9,
      reviews: 156,
      sizeOptions: ["5", "6", "7", "8", "9", "10"]
    },
    {
      id: 2,
      name: "Pearl Necklace",
      price: 899,
      image: "https://readdy.ai/api/search-image?query=elegant%20white%20pearl%20necklace%20on%20white%20background%2C%20luxury%20jewelry%20photography%2C%20classic%20pearls%20with%20gold%20clasp%2C%20professional%20lighting&width=300&height=300&seq=necklace1&orientation=squarish",
      metal: "Gold",
      stone: "Pearl",
      rating: 4.8,
      reviews: 89,
      sizeOptions: ["16 inch", "18 inch", "20 inch"]
    },
    {
      id: 3,
      name: "Sapphire Earrings",
      price: 1299,
      image: "https://readdy.ai/api/search-image?query=blue%20sapphire%20drop%20earrings%20with%20silver%20setting%20on%20white%20background%2C%20luxury%20jewelry%20photography%2C%20professional%20lighting%2C%20elegant%20design&width=300&height=300&seq=earrings1&orientation=squarish",
      metal: "Silver",
      stone: "Sapphire",
      rating: 4.7,
      reviews: 67,
      sizeOptions: ["Small", "Medium", "Large"]
    },
    {
      id: 4,
      name: "Rose Gold Bracelet",
      price: 599,
      image: "https://readdy.ai/api/search-image?query=rose%20gold%20chain%20bracelet%20on%20white%20background%2C%20luxury%20jewelry%20photography%2C%20delicate%20chain%20links%2C%20professional%20lighting%2C%20elegant%20design&width=300&height=300&seq=bracelet1&orientation=squarish",
      metal: "Rose Gold",
      stone: "None",
      rating: 4.6,
      reviews: 234,
      sizeOptions: ["6 inch", "7 inch", "8 inch"]
    },
    {
      id: 5,
      name: "Emerald Pendant",
      price: 1599,
      image: "https://readdy.ai/api/search-image?query=emerald%20pendant%20necklace%20with%20gold%20chain%20on%20white%20background%2C%20luxury%20jewelry%20photography%2C%20green%20emerald%20stone%2C%20professional%20lighting&width=300&height=300&seq=pendant1&orientation=squarish",
      metal: "Gold",
      stone: "Emerald",
      rating: 4.8,
      reviews: 92,
      sizeOptions: ["16 inch", "18 inch", "20 inch"]
    }
  ];

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

  // Get product details by ID
  const getProductById = (id) => {
    return products.find(product => product.id === id);
  };

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
    const product = getProductById(item.productId);
    return total + (product?.price || 0) * item.quantity;
  }, 0);

  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Header />
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Header />
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-4">
              <i className="ri-error-warning-line text-red-600 text-2xl"></i>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-rose-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-shopping-cart-line text-amber-600 text-4xl"></i>
            </div>
            <h2 className="text-3xl font-playfair text-gray-800 mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-8">
              Discover our beautiful collection of handcrafted jewelry and find the perfect piece for you.
            </p>
            <Link 
              href="/products"
              className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-shopping-bag-line"></i>
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-playfair text-gray-800">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
          >
            <i className="ri-delete-bin-line"></i>
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  Cart Items ({cartItems.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => {
                  const product = getProductById(item.productId);
                  if (!product) return null;

                  return (
                    <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <Link 
                            href={`/products/${product.id}`}
                            className="font-semibold text-gray-800 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            {product.name}
                          </Link>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>Metal: {product.metal}</span>
                            <span>Stone: {product.stone}</span>
                            {item.selectedSize && (
                              <span>Size: {item.selectedSize}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <i key={i} className={`ri-star-${i < Math.floor(product.rating) ? 'fill' : 'line'} text-xs`}></i>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.reviews} reviews)</span>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-4">
                              {/* Size Selector */}
                              {product.sizeOptions && product.sizeOptions.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-gray-600">Size:</label>
                                  <select
                                    value={item.selectedSize || ''}
                                    onChange={(e) => updateSize(item.id, e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm pr-8"
                                  >
                                    <option value="">Select</option>
                                    {product.sizeOptions.map(size => (
                                      <option key={size} value={size}>{size}</option>
                                    ))}
                                  </select>
                                </div>
                              )}

                              {/* Quantity Controls */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <i className="ri-subtract-line text-sm"></i>
                                </button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                                >
                                  <i className="ri-add-line text-sm"></i>
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-600">
                                  ${product.price.toLocaleString()} × {item.quantity}
                                </div>
                                <div className="font-semibold text-gray-800">
                                  ${(product.price * item.quantity).toLocaleString()}
                                </div>
                              </div>
                              
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 text-red-600 transition-colors"
                              >
                                <i className="ri-delete-bin-line text-sm"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Tax (10%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-amber-600">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 mb-4 whitespace-nowrap"
              >
                <i className="ri-secure-payment-line"></i>
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <i className="ri-shopping-bag-line"></i>
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <i className="ri-secure-payment-line text-green-600"></i>
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <i className="ri-visa-line text-2xl text-blue-600"></i>
                  <i className="ri-mastercard-line text-2xl text-red-600"></i>
                  <i className="ri-paypal-line text-2xl text-blue-500"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;