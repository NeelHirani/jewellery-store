import React, { useState } from 'react';

const ProductDetail = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState('Medium');

  const productImages = [
    'https://readdy.ai/api/search-image?query=luxury%2018k%20gold%20diamond%20stud%20earrings%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed%20close%20up%20shot&width=600&height=600&seq=main001&orientation=squarish',
    'https://readdy.ai/api/search-image?query=luxury%2018k%20gold%20diamond%20stud%20earrings%20side%20view%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=600&height=600&seq=side002&orientation=squarish',
    'https://readdy.ai/api/search-image?query=luxury%2018k%20gold%20diamond%20stud%20earrings%20back%20view%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=600&height=600&seq=back003&orientation=squarish',
    'https://readdy.ai/api/search-image?query=luxury%2018k%20gold%20diamond%20stud%20earrings%20worn%20on%20model%20ear%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality&width=600&height=600&seq=worn004&orientation=squarish'
  ];

  const relatedProducts = [
    {
      id: 1,
      name: '18K Gold Diamond Necklace',
      price: '₹85,000',
      rating: 4.8,
      image: 'https://readdy.ai/api/search-image?query=luxury%2018k%20gold%20diamond%20necklace%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=300&height=300&seq=rel001&orientation=squarish'
    },
    {
      id: 2,
      name: 'Diamond Tennis Bracelet',
      price: '₹125,000',
      rating: 4.9,
      image: 'https://readdy.ai/api/search-image?query=luxury%20diamond%20tennis%20bracelet%20on%20elegant%20white% SMALL%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=300&height=300&seq=rel002&orientation=squarish'
    },
    {
      id: 3,
      name: 'Gold Diamond Ring',
      price: '₹65,000',
      rating: 4.7,
      image: 'https://readdy.ai/api/search-image?query=luxury%20gold%20diamond%20engagement%20ring%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=300&height=300&seq=rel003&orientation=squarish'
    },
    {
      id: 4,
      name: 'Pearl Drop Earrings',
      price: '₹45,000',
      rating: 4.6,
      image: 'https://readdy.ai/api/search-image?query=luxury%20pearl%20drop%20earrings%20on%20elegant%20white%20marble%20background%20with%20soft%20lighting%20professional%20jewelry%20photography%20high%20quality%20detailed&width=300&height=300&seq=rel004&orientation=squarish'
    }
  ];

  const reviews = [
    {
      id: 1,
      name: 'Sarah Johnson',
      rating: 5,
      date: 'March 15, 2024',
      comment: 'Absolutely stunning earrings! The diamonds sparkle beautifully and the craftsmanship is exceptional. Worth every penny.'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      rating: 5,
      date: 'March 10, 2024',
      comment: 'Perfect for special occasions. The quality is outstanding and they arrived exactly as described. Highly recommend!'
    },
    {
      id: 3,
      name: 'Emily Chen',
      rating: 4,
      date: 'March 5, 2024',
      comment: 'Beautiful earrings with excellent shine. Delivery was prompt and packaging was luxurious.'
    }
  ];

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                JwellMart
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Collections</a>
                <a href="#" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Rings</a>
                <a href="#" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Necklaces</a>
                <a href="#" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Earrings</a>
                <a href="#" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Bracelets</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>
              <i className="fas fa-heart text-gray-600 hover:text-red-500 cursor-pointer text-lg"></i>
              <i className="fas fa-shopping-bag text-gray-600 hover:text-yellow-600 cursor-pointer text-lg"></i>
              <i className="fas fa-user text-gray-600 hover:text-gray-800 cursor-pointer text-lg"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={productImages[selectedImage]}
                alt="Product"
                className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300 cursor-zoom-in"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer ${
                    selectedImage === index ? 'border-yellow-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                18K Gold Diamond Stud Earrings
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(5)}
                  <span className="text-sm text-gray-600 ml-2">(127 reviews)</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-4">₹95,000</p>
              <p className="text-gray-600 leading-relaxed">
                Exquisite 18K gold diamond stud earrings featuring brilliant cut diamonds. 
                Perfect for special occasions or everyday elegance. Crafted with precision and attention to detail.
              </p>
            </div>

            {/* Product Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Metal:</span>
                <span className="text-sm text-gray-900 ml-2">18K Gold</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Stone:</span>
                <span className="text-sm text-gray-900 ml-2">Diamond</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Weight:</span>
                <span className="text-sm text-gray-900 ml-2">2.5 grams</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Purity:</span>
                <span className="text-sm text-gray-900 ml-2">18K (75%)</span>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex space-x-3">
                {['Small', 'Medium', 'Large'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg cursor-pointer whitespace-nowrap !rounded-button ${
                      selectedSize === size
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
                >
                  <i className="fas fa-minus text-sm"></i>
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
                >
                  <i className="fas fa-plus text-sm"></i>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button className="flex-1 bg-red-800 text-white py-3 px-6 rounded-lg hover:bg-red-900 transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap">
                  Add to Cart
                </button>
                <button className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap">
                  Buy Now
                </button>
                <button className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap">
                  <i className="fas fa-heart text-gray-600"></i>
                </button>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-truck"></i>
                  <span>Delivers in 5-7 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-undo"></i>
                  <span>Easy returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt"></i>
                  <span>Lifetime warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping & Returns' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  These exquisite 18K gold diamond stud earrings represent the pinnacle of fine jewelry craftsmanship. 
                  Each earring features a brilliant cut diamond carefully selected for its exceptional clarity and fire, 
                  set in a classic four-prong setting that maximizes light reflection and brilliance.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The 18K gold setting provides the perfect backdrop for the diamonds, offering both durability and 
                  timeless elegance. These earrings are versatile enough for everyday wear yet sophisticated enough 
                  for the most special occasions.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Each pair comes with a certificate of authenticity and is backed by our lifetime warranty, 
                  ensuring your investment in luxury jewelry is protected for years to come.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Metal Type</td>
                      <td className="py-2 text-gray-900">18K Gold</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Purity</td>
                      <td className="py-2 text-gray-900">75% (18K)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Stone Type</td>
                      <td className="py-2 text-gray-900">Natural Diamond</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Cut</td>
                      <td className="py-2 text-gray-900">Brilliant Round</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Clarity</td>
                      <td className="py-2 text-gray-900">VS1-VS2</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Color Grade</td>
                      <td className="py-2 text-gray-900">G-H</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Total Weight</td>
                      <td className="py-2 text-gray-900">2.5 grams</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Setting Style</td>
                      <td className="py-2 text-gray-900">Four Prong</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Occasion</td>
                      <td className="py-2 text-gray-900">Daily Wear, Special Events</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Warranty</td>
                      <td className="py-2 text-gray-900">Lifetime</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(5)}
                    </div>
                    <span className="text-sm text-gray-600">4.9 out of 5 (127 reviews)</span>
                  </div>
                </div>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600"></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.name}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Free shipping on orders over ₹50,000</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Standard delivery: 5-7 business days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Express delivery: 2-3 business days (additional charges apply)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Secure packaging with insurance coverage</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Return Policy</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>30-day return policy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Items must be in original condition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Free return shipping</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span>Full refund or exchange available</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            You May Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <button className="bg-white text-gray-900 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer !rounded-button whitespace-nowrap">
                      Quick View
                    </button>
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.floor(product.rating))}
                  </div>
                  <span className="text-sm text-gray-600">({product.rating})</span>
                </div>
                <p className="text-lg font-bold text-yellow-600">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Chat Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-yellow-600 text-white rounded-full shadow-lg hover:bg-yellow-700 transition-colors flex items-center justify-center cursor-pointer">
          <i className="fas fa-comments text-xl"></i>
        </button>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center cursor-pointer">
          <i className="fas fa-arrow-up"></i>
        </button>
      </div>

      <style>{`
        .!rounded-button {
          border-radius: 8px;
        }
        
        body {
          font-family: 'Open Sans', sans-serif;
        }
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;