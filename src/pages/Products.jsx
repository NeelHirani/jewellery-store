import React, { useState } from 'react';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedMetal, setSelectedMetal] = useState([]);
  const [selectedStone, setSelectedStone] = useState([]);
  const [selectedRating, setSelectedRating] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [wishlist, setWishlist] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const categories = [
    { id: 'all', name: 'All Jewelry', icon: 'fas fa-gem' },
    { id: 'bangles', name: 'Bangles', icon: 'fas fa-circle-notch' },
    { id: 'earrings', name: 'Earrings', icon: 'fas fa-circle' },
    { id: 'necklace', name: 'Necklaces', icon: 'fas fa-link' },
    { id: 'rings', name: 'Rings', icon: 'fas fa-ring' },
    { id: 'bracelets', name: 'Bracelets', icon: 'fas fa-chain' },
  ];

  const metalTypes = ['Gold', 'Silver', 'Diamond', 'Platinum'];
  const stoneTypes = ['Ruby', 'Emerald', 'Diamond', 'Sapphire', 'Pearl'];
  const occasions = ['Bridal', 'Casual', 'Partywear', 'Office', 'Festival'];
  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'price-low-high', label: 'Price: Low to High' },
    { id: 'price-high-low', label: 'Price: High to Low' },
    { id: 'rating-high-low', label: 'Rating: High to Low' },
  ];

  const products = [
    {
      id: 1,
      name: 'Royal Diamond Necklace',
      price: 45000,
      rating: 4.8,
      reviews: 124,
      category: 'necklace',
      metal: 'Gold',
      stone: 'Diamond',
      occasion: 'Bridal',
      image:
        'https://readdy.ai/api/search-image?query=elegant%20diamond%20necklace%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=1&orientation=squarish',
    },
    {
      id: 2,
      name: 'Emerald Drop Earrings',
      price: 28000,
      rating: 4.6,
      reviews: 89,
      category: 'earrings',
      metal: 'Gold',
      stone: 'Emerald',
      occasion: 'Partywear',
      image:
        'https://readdy.ai/api/search-image?query=beautiful%20emerald%20drop%20earrings%20gold%20setting%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=2&orientation=squarish',
    },
    {
      id: 3,
      name: 'Classic Gold Bangles Set',
      price: 35000,
      rating: 4.9,
      reviews: 156,
      category: 'bangles',
      metal: 'Gold',
      stone: 'None',
      occasion: 'Bridal',
      image:
        'https://readdy.ai/api/search-image?query=traditional%20gold%20bangles%20set%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=3&orientation=squarish',
    },
    {
      id: 4,
      name: 'Ruby Engagement Ring',
      price: 52000,
      rating: 4.7,
      reviews: 203,
      category: 'rings',
      metal: 'Platinum',
      stone: 'Ruby',
      occasion: 'Bridal',
      image:
        'https://readdy.ai/api/search-image?query=elegant%20ruby%20engagement%20ring%20platinum%20setting%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=4&orientation=squarish',
    },
    {
      id: 5,
      name: 'Pearl Statement Necklace',
      price: 18000,
      rating: 4.5,
      reviews: 67,
      category: 'necklace',
      metal: 'Silver',
      stone: 'Pearl',
      occasion: 'Office',
      image:
        'https://readdy.ai/api/search-image?query=elegant%20pearl%20statement%20necklace%20silver%20setting%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=5&orientation=squarish',
    },
    {
      id: 6,
      name: 'Diamond Tennis Bracelet',
      price: 38000,
      rating: 4.8,
      reviews: 145,
      category: 'bracelets',
      metal: 'Gold',
      stone: 'Diamond',
      occasion: 'Partywear',
      image:
        'https://readdy.ai/api/search-image?query=sparkling%20diamond%20tennis%20bracelet%20gold%20setting%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=6&orientation=squarish',
    },
    {
      id: 7,
      name: 'Sapphire Stud Earrings',
      price: 22000,
      rating: 4.6,
      reviews: 98,
      category: 'earrings',
      metal: 'Gold',
      stone: 'Sapphire',
      occasion: 'Casual',
      image:
        'https://readdy.ai/api/search-image?query=beautiful%20sapphire%20stud%20earrings%20gold%20setting%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=7&orientation=squarish',
    },
    {
      id: 8,
      name: 'Vintage Gold Ring',
      price: 15000,
      rating: 4.4,
      reviews: 76,
      category: 'rings',
      metal: 'Gold',
      stone: 'None',
      occasion: 'Casual',
      image:
        'https://readdy.ai/api/search-image?query=vintage%20style%20gold%20ring%20intricate%20design%20on%20white%20background%20luxury%20jewelry%20photography%20with%20soft%20lighting%20and%20minimal%20shadows%20clean%20product%20shot&width=300&height=300&seq=8&orientation=squarish',
    },
  ];

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product) => {
    alert(`Added ${product.name} to cart!`);
  };

  const handleQuickView = (product) => {
    alert(`Quick view for ${product.name}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300"></i>);
    }

    return stars;
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesMetal = selectedMetal.length === 0 || selectedMetal.includes(product.metal);
      const matchesStone = selectedStone.length === 0 || selectedStone.includes(product.stone);
      const matchesRating =
        selectedRating.length === 0 || selectedRating.some((r) => product.rating >= parseInt(r));
      const matchesOccasion = selectedOccasion.length === 0 || selectedOccasion.includes(product.occasion);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        matchesCategory &&
        matchesPrice &&
        matchesMetal &&
        matchesStone &&
        matchesRating &&
        matchesOccasion &&
        matchesSearch
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'rating-high-low') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Elegance Crafted for Every Occasion
            </h2>
            <p className="text-lg text-gray-600">Discover our exquisite collection of luxury jewelry</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Filters
              </h3>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left cursor-pointer whitespace-nowrap !rounded-button ${
                        selectedCategory === category.id
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <i className={`${category.icon} mr-3 text-sm`}></i>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min Price: ₹{priceRange[0].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max Price: ₹{priceRange[1].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Metal Type</h4>
                <div className="space-y-2">
                  {metalTypes.map((metal) => (
                    <label key={metal} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMetal.includes(metal)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetal([...selectedMetal, metal]);
                          } else {
                            setSelectedMetal(selectedMetal.filter((m) => m !== metal));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{metal}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Stone Type</h4>
                <div className="space-y-2">
                  {stoneTypes.map((stone) => (
                    <label key={stone} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStone.includes(stone)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStone([...selectedStone, stone]);
                          } else {
                            setSelectedStone(selectedStone.filter((s) => s !== stone));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{stone}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Customer Rating</h4>
                <div className="space-y-2">
                  {['4', '3'].map((rating) => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRating.includes(`${rating}+`)}
                        onChange={(e) => {
                          const ratingValue = `${rating}+`;
                          if (e.target.checked) {
                            setSelectedRating([...selectedRating, ratingValue]);
                          } else {
                            setSelectedRating(selectedRating.filter((r) => r !== ratingValue));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        {rating}
                        <i className="fas fa-star text-yellow-400 ml-1 mr-1"></i>
                        & up
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Occasion</h4>
                <div className="space-y-2">
                  {occasions.map((occasion) => (
                    <label key={occasion} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOccasion.includes(occasion)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOccasion([...selectedOccasion, occasion]);
                          } else {
                            setSelectedOccasion(selectedOccasion.filter((o) => o !== occasion));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{occasion}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Luxury Jewelry Collection
                </h2>
                <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer whitespace-nowrap !rounded-button"
                >
                  <span className="text-sm text-gray-700 mr-2">
                    Sort by: {sortOptions.find((opt) => opt.id === sortBy)?.label || 'Newest'}
                  </span>
                  <i className="fas fa-chevron-down text-gray-400"></i>
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setSortBy(option.id);
                          setShowSortDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handleQuickView(product)}
                        className="bg-white text-gray-800 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer whitespace-nowrap !rounded-button"
                      >
                        <i className="fas fa-eye mr-2"></i>
                        Quick View
                      </button>
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <i
                        className={`${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart ${
                          wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-400'
                        }`}
                      ></i>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 mb-2 line-clamp-2"
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-red-800 text-white py-2 px-4 rounded-lg hover:bg-red-900 transition-colors font-medium cursor-pointer whitespace-nowrap !rounded-button"
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <button className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium cursor-pointer whitespace-nowrap !rounded-button">
                Load More Products
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .!rounded-button {
          border-radius: 0.5rem;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;500;600;700&display=swap');
      `}</style>
    </div>
  );
};

export default Products;