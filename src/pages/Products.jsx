import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Navbar';
import { supabase } from '../lib/supabase';

export default function Products() {
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
  const [categories, setCategories] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [occasions, setOccasions] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSizes, setProductSizes] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sortOptions = [
    { id: 'newest', label: 'Newest' },
    { id: 'price-low-high', label: 'Price: Low to High' },
    { id: 'price-high-low', label: 'Price: High to Low' },
    { id: 'rating-high-low', label: 'Rating: High to Low' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
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
          .select('id, name, price, image_url, category, metal, stone, occasion, rating, reviews');
        if (prodError) throw prodError;
        setProducts(productsData || []);

        const { data: sizesData, error: sizeError } = await supabase
          .from('product_sizes')
          .select('product_id, size');
        if (sizeError) throw sizeError;
        const sizesMap = sizesData.reduce((acc, { product_id, size }) => {
          acc[product_id] = [...(acc[product_id] || []), size];
          return acc;
        }, {});
        setProductSizes(sizesMap);
      } catch (err) {
        setError('Failed to load data from Supabase.');
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (product) => {
    const selectedSize = selectedSizes[product.id] || null;
    if (!product || (productSizes[product.id]?.length > 0 && !selectedSize)) {
      setError(`Please select a size for ${product.name}.`);
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
        image: product.image_url,
        metal: product.metal,
        stone: product.stone,
        selectedSize,
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

  const handleQuickView = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Navigating to product detail page for product:', product.id); // Debugging
    navigate(`/products/${product.id}`);
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
      const matchesRating = selectedRating.length === 0 || selectedRating.some((r) => product.rating >= parseInt(r));
      const matchesOccasion = selectedOccasion.length === 0 || selectedOccasion.includes(product.occasion);
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesPrice && matchesMetal && matchesStone && matchesRating && matchesOccasion && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low-high') return a.price - b.price;
      if (sortBy === 'price-high-low') return b.price - a.price;
      if (sortBy === 'rating-high-low') return b.rating - a.rating;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      <Header />
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
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
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
                  {categories.map((category) => (
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
                    <label className="text-sm text-gray-600">Max Price: ${priceRange[1].toLocaleString()}</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Metal Type</h4>
                <div className="space-y-2">
                  {metalTypes.map((metal) => (
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
                  {stoneTypes.map((stone) => (
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
                        aria-label={`Select rating ${rating} and up`}
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
                    {sortOptions.map((option) => (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
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
                    <div className="flex items-center mb-2">
                      <div className="flex items-center mr-2">{renderStars(product.rating)}</div>
                      <span className="text-sm text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-bold text-gray-900">${product.price.toLocaleString()}</span>
                    </div>
                    {productSizes[product.id]?.length > 0 && (
                      <div className="mb-4">
                        <select
                          value={selectedSizes[product.id] || ''}
                          onChange={(e) => setSelectedSizes({ ...selectedSizes, [product.id]: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                          aria-label={`Select size for ${product.name}`}
                        >
                          <option value="">Select Size</option>
                          {productSizes[product.id].map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    )}
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
          </div>
        </div>
      </div>

      <style jsx>{`
        .!rounded-button {
          border-radius: 0.5rem;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}