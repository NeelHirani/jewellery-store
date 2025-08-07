import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Navbar';
import { supabase } from '../lib/supabase';

const Products: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<any>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, Infinity]);
  const [selectedMetal, setSelectedMetal] = useState<any[]>([]);
  const [selectedStone, setSelectedStone] = useState<any[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<any>('newest');
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [metalTypes, setMetalTypes] = useState<any[]>([]);
  const [stoneTypes, setStoneTypes] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigate = useNavigate();

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'price-low-high', label: 'Price: Low to High' },
    { id: 'price-high-low', label: 'Price: High to Low' },
  ];

  useEffect(() => {
    const fetchData = async (isRefresh: any = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const { data: categoriesData, error: catError } = await supabase
          .from('categories')
          .select('name, icon');
        if (catError) throw catError;
        setCategories(categoriesData || []);

        const { data: metalsData, error: metalError } = await supabase
          .from('metal_types')
          .select('id, name');
        if (metalError) throw metalError;
        setMetalTypes(metalsData || []);

        const { data: stonesData, error: stoneError } = await supabase
          .from('stone_types')
          .select('id, name');
        if (stoneError) throw stoneError;
        setStoneTypes(stonesData || []);

        const { data: occasionsData, error: occError } = await supabase
          .from('occasions')
          .select('id, name');
        if (occError) throw occError;
        setOccasions(occasionsData || []);

        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('id, name, price, additional_images, category, metal, stone, occasion, created_at');
        if (prodError) throw prodError;
        setProducts(productsData || []);
      } catch (err) {
        setError('Failed to load data from Supabase.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    fetchData();

    // Re-fetch data when products change (e.g., after admin adds a product)
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData(true))
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const toggleWishlist = (productId): void => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product): void => {
    if (!product) {
      setError('Product data is unavailable.');
      return;
    }
    try {
      const savedCart = localStorage.getItem('jewelMartCart');
      const cart = savedCart ? JSON.parse(savedCart) : [];
      const newItem = {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.additional_images[0] || '', // Use first image as main image
        metal: product.metal,
        stone: product.stone,
        quantity: 1,
      };
      const updatedCart = [...cart, newItem];
      localStorage.setItem('jewelMartCart', JSON.stringify(updatedCart));
      setError(null);
      navigate('/cart');
    } catch (err) {
      setError('Failed to add to cart.');
      console.error('Add to cart error:', err);
    }
  };

  const handleQuickView = (product: any, e: any): void => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to product detail page for product:', product.id);
    navigate(`/products/${product.id}`);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesMetal = selectedMetal.length === 0 || selectedMetal.includes(product.metal);
      const matchesStone = selectedStone.length === 0 || selectedStone.includes(product.stone);
      const matchesOccasion = selectedOccasion.length === 0 || selectedOccasion.includes(product.occasion);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesMetal && matchesStone && matchesOccasion && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Full-Screen Splash Screen Loading Component
  const SplashScreen = () => (
    <div
      className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center z-50 animate-fadeIn"
      style={{ fontFamily: 'Open Sans, sans-serif' }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 border border-amber-300 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border border-yellow-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 border border-orange-300 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-32 right-10 w-28 h-28 border border-amber-300 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        {/* Logo/Icon */}
        <div className="mb-8 animate-bounceIn">
          <div className="relative mx-auto w-24 h-24 mb-6">
            {/* Jewelry Store Logo - Using FontAwesome gem icon as placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl">
              <i className="fas fa-gem text-white text-4xl animate-sparkle"></i>
            </div>
            {/* Decorative rings around logo */}
            <div className="absolute -inset-2 border-2 border-amber-300 rounded-full animate-spin-slow opacity-60"></div>
            <div className="absolute -inset-4 border border-yellow-300 rounded-full animate-spin-reverse opacity-40"></div>
          </div>
        </div>

        {/* Store Name/Branding */}
        <div className="mb-8 animate-slideUp">
          <h1
            className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 leading-tight"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Elegance Crafted
          </h1>
          <h2
            className="text-2xl md:text-3xl font-light text-amber-700 mb-4"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            for Every Occasion
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-yellow-600 mx-auto rounded-full"></div>
        </div>

        {/* Loading Animation */}
        <div className="mb-6 animate-fadeInDelay">
          {/* Elegant Spinner */}
          <div className="relative mx-auto w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-amber-500 border-r-amber-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-transparent border-t-yellow-400 rounded-full animate-spin-reverse"></div>
          </div>

          {/* Loading Text */}
          <p className="text-gray-600 text-lg font-medium animate-pulse">
            Curating Your Luxury Collection...
          </p>

          {/* Loading Dots */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 animate-fadeInDelay delay-700">
          <div className="w-48 h-1 bg-amber-100 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-gray-500 text-sm italic animate-fadeInDelay delay-500">
          "Where timeless beauty meets modern sophistication"
        </p>
      </div>
    </div>
  );

  // Error State Component
  const ErrorState = () => (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      <Header />
      <div className="bg-gradient-to-r from-yellow-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 mt-19" style={{ fontFamily: 'Playfair Display, serif' }}>
              Elegance Crafted for Every Occasion
            </h2>
            <p className="text-lg text-gray-600">Discover our exquisite collection of luxury jewelry</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 mb-4">
            <i className="fas fa-exclamation-triangle text-6xl"></i>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
            Unable to Load Products
          </h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            We're having trouble loading our jewelry collection. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer whitespace-nowrap !rounded-button"
            aria-label="Retry loading products"
          >
            <i className="fas fa-redo mr-2"></i>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );

  // Empty State Component for when no products are found
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-gray-400 mb-4">
        <i className="fas fa-gem text-6xl"></i>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
        No Products Found
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        We couldn't find any products matching your criteria. Try adjusting your filters or check back later for new arrivals.
      </p>
    </div>
  );

  // Show splash screen on initial load
  if (loading) {
    return <SplashScreen />;
  }

  // Show error state if there's an error and no products loaded
  if (error && products.length === 0) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-white animate-fadeIn" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      <Header />
      <div className="bg-gradient-to-r from-yellow-50 to-red-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-2 mt-19" style={{ fontFamily: 'Playfair Display, serif' }}>
              Elegance Crafted for Every Occasion
            </h2>
            <p className="text-lg text-gray-600">Discover our exquisite collection of luxury jewelry</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {/* Refreshing indicator */}
        {refreshing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600 mr-3"></div>
              <span className="text-amber-800 font-medium">Refreshing products...</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Filters
              </h3>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left cursor-pointer whitespace-nowrap !rounded-button ${
                      selectedCategory === 'all'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    aria-label="Select all categories"
                  >
                    <i className="fas fa-th-large mr-3 text-sm"></i>
                    <span className="text-sm">All Categories</span>
                  </button>
                  {categories.map((category: any) => (
                    <button
                      key={category.name}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-left cursor-pointer whitespace-nowrap !rounded-button ${
                        selectedCategory === category.name
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                      aria-label={`Select category ${category.name}`}
                    >
                      <i className={`${category.icon || 'fas fa-circle'} mr-3 text-sm`}></i>
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Min Price: ${priceRange[0].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                      aria-label="Minimum price"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max Price: {priceRange[1] === Infinity ? 'Unlimited' : `$${priceRange[1].toLocaleString()}`}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1] === Infinity ? 100000 : priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) === 100000 ? Infinity : parseInt(e.target.value)])}
                      className="w-full"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Metal Type</h4>
                <div className="space-y-2">
                  {metalTypes.map((metal: any) => (
                    <label key={metal.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMetal.includes(metal.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetal([...selectedMetal, metal.name]);
                          } else {
                            setSelectedMetal(selectedMetal.filter((m) => m !== metal.name));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        aria-label={`Select metal ${metal.name}`}
                      />
                      <span className="ml-2 text-sm text-gray-700">{metal.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Stone Type</h4>
                <div className="space-y-2">
                  {stoneTypes.map((stone: any) => (
                    <label key={stone.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStone.includes(stone.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStone([...selectedStone, stone.name]);
                          } else {
                            setSelectedStone(selectedStone.filter((s) => s !== stone.name));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        aria-label={`Select stone ${stone.name}`}
                      />
                      <span className="ml-2 text-sm text-gray-700">{stone.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Occasion</h4>
                <div className="space-y-2">
                  {occasions.map((occasion: any) => (
                    <label key={occasion.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedOccasion.includes(occasion.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOccasion([...selectedOccasion, occasion.name]);
                          } else {
                            setSelectedOccasion(selectedOccasion.filter((o) => o !== occasion.name));
                          }
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                        aria-label={`Select occasion ${occasion.name}`}
                      />
                      <span className="ml-2 text-sm text-gray-700">{occasion.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Luxury Jewelry Collection
                </h2>
                <p className="text-gray-600 mt-1">{filteredProducts.length} products found</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const fetchData = async () => {
                      try {
                        setRefreshing(true);
                        setError(null);

                        const { data: categoriesData, error: catError } = await supabase
                          .from('categories')
                          .select('name, icon');
                        if (catError) throw catError;
                        setCategories(categoriesData || []);

                        const { data: metalsData, error: metalError } = await supabase
                          .from('metal_types')
                          .select('id, name');
                        if (metalError) throw metalError;
                        setMetalTypes(metalsData || []);

                        const { data: stonesData, error: stoneError } = await supabase
                          .from('stone_types')
                          .select('id, name');
                        if (stoneError) throw stoneError;
                        setStoneTypes(stonesData || []);

                        const { data: occasionsData, error: occError } = await supabase
                          .from('occasions')
                          .select('id, name');
                        if (occError) throw occError;
                        setOccasions(occasionsData || []);

                        const { data: productsData, error: prodError } = await supabase
                          .from('products')
                          .select('id, name, price, additional_images, category, metal, stone, occasion, created_at');
                        if (prodError) throw prodError;
                        setProducts(productsData || []);
                      } catch (err) {
                        setError('Failed to refresh data.');
                        console.error('Error refreshing data:', err);
                      } finally {
                        setRefreshing(false);
                      }
                    };
                    fetchData();
                  }}
                  disabled={refreshing}
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer whitespace-nowrap !rounded-button disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh products"
                >
                  <i className={`fas fa-sync-alt text-gray-600 ${refreshing ? 'animate-spin' : ''}`}></i>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 cursor-pointer whitespace-nowrap !rounded-button"
                    aria-label="Toggle sort options"
                  >
                    <span className="text-sm text-gray-700 mr-2">
                      Sort by: {sortOptions.find((opt) => opt.id === sortBy)?.label || 'Newest'}
                    </span>
                    <i className="fas fa-chevron-down text-gray-400"></i>
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {sortOptions.map((option: any) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id);
                            setShowSortDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-100"
                          aria-label={`Sort by ${option.label}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <>
              {filteredProducts.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={product.additional_images && product.additional_images.length > 0
                              ? product.additional_images[0]
                              : 'https://via.placeholder.com/300?text=No+Image'}
                            alt={product.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                            <button
                              onClick={(e) => handleQuickView(product, e)}
                              className="bg-white text-gray-800 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer whitespace-nowrap !rounded-button"
                              aria-label={`Quick view ${product.name}`}
                            >
                              <i className="fas fa-eye mr-2"></i>
                              Quick View
                            </button>
                          </div>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <i className={`${wishlist.includes(product.id) ? 'fas' : 'far'} fa-heart ${
                              wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-400'
                            }`} />
                          </button>
                        </div>
                        <div className="p-4">
                          <h3
                            className="font-semibold text-gray-900 mb-2 line-clamp-2"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                          >
                            <Link to={`/products/${product.id}`} onClick={(e) => e.stopPropagation()}>
                              {product.name}
                            </Link>
                          </h3>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                          </div>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer whitespace-nowrap !rounded-button"
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <i className="fas fa-shopping-cart mr-2"></i>
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-12">
                    <button
                      className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer whitespace-nowrap !rounded-button"
                      aria-label="Load more products"
                    >
                      Load More Products
                    </button>
                  </div>
                </>
              )}
            </>
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

        /* Splash Screen Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeInDelay {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.1) rotate(180deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-bounceIn {
          animation: bounceIn 1.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        .animate-fadeInDelay {
          animation: fadeInDelay 0.8s ease-out 0.6s both;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-progress {
          animation: progress 2s ease-out 1s both;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
};

export default Products;