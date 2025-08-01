import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [user, setUser] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching product with id:', id);
        if (!supabase) {
          throw new Error('Supabase client not initialized. Check ../lib/supabase.js');
        }
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, name, price, category, metal, stone, occasion, short_description, detailed_description, created_at, additional_images')
          .eq('id', parseInt(id))
          .single();

        if (productError) throw new Error(`Product not found for ID ${id}: ${productError.message}`);
        if (!productData) throw new Error(`No product found for ID ${id}`);
        console.log('Product data:', productData);
        setProduct(productData);

        const images = [...(productData.additional_images || [])].filter(Boolean);
        setProductImages(images);
        console.log('Product Images:', images);

        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, user_id, rating, comment, created_at, status')
          .eq('product_id', parseInt(id))
          .order('created_at', { ascending: false });
        if (reviewsError) console.error('Error fetching reviews:', reviewsError);
        setReviews(reviewsData || []);

        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load product details.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    const checkUserAuthentication = () => {
      // Check localStorage for user data (same pattern as Profile.jsx and Navbar.jsx)
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('User found in localStorage:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
          setUser(null);
        }
      } else {
        console.log('No user found in localStorage');
        setUser(null);
      }
    };

    fetchProductData();
    checkUserAuthentication();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUserAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const toggleWishlist = (productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((pid) => pid !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = () => {
    if (!product) {
      setError('Product not available.');
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
        image: product.additional_images,
        metal: product.metal || 'N/A',
        stone: product.stone || 'N/A',
        quantity,
      };
      const updatedCart = [...cart, newItem];
      localStorage.setItem('jewelMartCart', JSON.stringify(updatedCart));
      setError(null);
      navigate('/cart');
    } catch (err) {
      setError('Failed to add to cart.');
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      setError('Product not available.');
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
        image: product.additional_images,
        metal: product.metal || 'N/A',
        stone: product.stone || 'N/A',
        quantity,
      };
      const updatedCart = [...cart, newItem];
      localStorage.setItem('jewelMartCart', JSON.stringify(updatedCart));
      setError(null);
      navigate('/checkout');
    } catch (err) {
      setError('Failed to process buy now.');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<i key={i} className="fas fa-star text-yellow-400" aria-hidden="true"></i>);
    if (hasHalfStar) stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400" aria-hidden="true"></i>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300" aria-hidden="true"></i>);
    return stars;
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    // Validation: Check if rating and comment are provided
    if (!newReview.rating || !newReview.comment.trim()) {
      setSubmitStatus('Please provide both a rating and a comment.');
      return;
    }

    // Check if user is authenticated using localStorage (same pattern as Profile.jsx)
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setSubmitStatus('Please log in to submit a review.');
      return;
    }

    let currentUser;
    try {
      currentUser = JSON.parse(storedUser);
      if (!currentUser?.email) {
        setSubmitStatus('Invalid user session. Please log in again.');
        return;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setSubmitStatus('Invalid user session. Please log in again.');
      return;
    }

    try {
      // Get user ID from the users table using email (same pattern as Profile.jsx)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', currentUser.email)
        .single();

      if (userError || !userData) {
        console.error('User lookup error:', userError);
        setSubmitStatus('User not found. Please log in again.');
        return;
      }

      console.log('Found user for review:', userData);

      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: parseInt(id),
          user_id: userData.id, // This should now be an integer ID from your custom users table
          rating: newReview.rating,
          comment: newReview.comment,
          status: 'pending',
        });

      if (error) {
        console.error('Review insert error:', error);
        throw error;
      }

      // Refresh reviews list
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at, status')
        .eq('product_id', parseInt(id))
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      setNewReview({ rating: 0, comment: '' });
      setSubmitStatus('Review submitted successfully! (Pending approval)');
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Review submission error:', err);
      setSubmitStatus(`Failed to submit review: ${err.message}`);
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  const handleRatingChange = (rating) => {
    setNewReview({ ...newReview, rating: rating });
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleCommentChange = (e) => {
    setNewReview({ ...newReview, comment: e.target.value });
  };

  // Star Rating Component
  const StarRating = ({ rating, onRatingChange, onHover, onLeave, interactive = true }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || rating);
          const isHovered = hoverRating > 0 && star <= hoverRating;
          return (
            <button
              key={star}
              type="button"
              className={`text-2xl transition-all duration-200 transform ${
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 rounded' : 'cursor-default'
              } ${
                isFilled
                  ? isHovered
                    ? 'text-yellow-500 drop-shadow-sm'
                    : 'text-yellow-400'
                  : interactive
                    ? 'text-gray-300 hover:text-yellow-200'
                    : 'text-gray-300'
              }`}
              onClick={() => interactive && onRatingChange(star)}
              onMouseEnter={() => interactive && onHover(star)}
              onMouseLeave={() => interactive && onLeave()}
              disabled={!interactive}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <i className="fas fa-star" aria-hidden="true"></i>
            </button>
          );
        })}
        {interactive && (
          <span className="ml-3 text-sm font-medium text-gray-600">
            {(hoverRating || rating) > 0
              ? `${hoverRating || rating} star${(hoverRating || rating) > 1 ? 's' : ''}`
              : 'Click to rate'
            }
          </span>
        )}
      </div>
    );
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                  JwellMart
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/products" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Collections</a>
                  <a href="/products?category=Rings" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Rings</a>
                  <a href="/products?category=Necklaces" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Necklaces</a>
                  <a href="/products?category=Earrings" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Earrings</a>
                  <a href="/products?category=Bracelets" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Bracelets</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                    aria-label="Search jewelry"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true"></i>
                </div>
                <button onClick={() => navigate('/wishlist')} className="text-gray-600 hover:text-red-500 cursor-pointer text-lg" aria-label="View wishlist">
                  <i className="fas fa-heart"></i>
                </button>
                <button onClick={() => navigate('/cart')} className="text-gray-600 hover:text-yellow-600 cursor-pointer text-lg" aria-label="View cart">
                  <i className="fas fa-shopping-bag"></i>
                </button>
                <button onClick={() => navigate('/profile')} className="text-gray-600 hover:text-gray-800 cursor-pointer text-lg" aria-label="View profile">
                  <i className="fas fa-user"></i>
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Product not found.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer !rounded-button"
            aria-label="Return to products page"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Open Sans, sans-serif' }}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                JwellMart
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/products" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Collections</a>
                <a href="/products?category=Rings" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Rings</a>
                <a href="/products?category=Necklaces" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Necklaces</a>
                <a href="/products?category=Earrings" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Earrings</a>
                <a href="/products?category=Bracelets" className="text-gray-700 hover:text-yellow-600 cursor-pointer">Bracelets</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jewelry..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                  aria-label="Search jewelry"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true"></i>
              </div>
              <button
                onClick={() => navigate('/wishlist')}
                className="text-gray-600 hover:text-red-500 cursor-pointer text-lg"
                aria-label={wishlist.includes(product.id) ? 'View wishlist' : 'Add to wishlist'}
              >
                <i className={`fas fa-heart ${wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-600'}`}></i>
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="text-gray-600 hover:text-yellow-600 cursor-pointer text-lg"
                aria-label="View cart"
              >
                <i className="fas fa-shopping-bag"></i>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-800 cursor-pointer text-lg"
                aria-label="View profile"
              >
                <i className="fas fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
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
                  aria-label={`Select image ${index + 1}`}
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

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {renderStars(averageRating)}
                  <span className="text-sm text-gray-600">({reviews.length} reviews)</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-4">
                {product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {product.short_description || 'No short description available.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">Metal:</span>
                <span className="text-sm text-gray-900 ml-2">{product.metal || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Stone:</span>
                <span className="text-sm text-gray-900 ml-2">{product.stone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Category:</span>
                <span className="text-sm text-gray-900 ml-2">{product.category || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Occasion:</span>
                <span className="text-sm text-gray-900 ml-2">{product.occasion || 'N/A'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
                  aria-label="Decrease quantity"
                >
                  <span className="text-lg font-semibold">-</span>
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
                  aria-label="Increase quantity"
                >
                  <span className="text-lg font-semibold">+</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap"
                  aria-label={`Add ${product.name} to cart`}
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap"
                  aria-label={`Buy ${product.name} now`}
                >
                  Buy Now
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer !rounded-button whitespace-nowrap"
                  aria-label={wishlist.includes(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
                >
                  <i className={`fas fa-heart ${wishlist.includes(product.id) ? 'text-red-500' : 'text-gray-600'} text-lg`} aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-truck" aria-hidden="true"></i>
                  <span>Delivers in 5-7 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-undo" aria-hidden="true"></i>
                  <span>Easy returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt" aria-hidden="true"></i>
                  <span>Lifetime warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping & Returns' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-label={`View ${tab.label}`}
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
                  {product.detailed_description || 'No detailed description available.'}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Metal Type</td>
                      <td className="py-2 text-gray-900">{product.metal || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Stone Type</td>
                      <td className="py-2 text-gray-900">{product.stone || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Category</td>
                      <td className="py-2 text-gray-900">{product.category || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Occasion</td>
                      <td className="py-2 text-gray-900">{product.occasion || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Rating</td>
                      <td className="py-2 text-gray-900">{averageRating.toFixed(1) || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Reviews</td>
                      <td className="py-2 text-gray-900">{reviews.length || 'N/A'}</td>
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
                    <div className="flex items-center space-x-1">{renderStars(averageRating)}</div>
                    <span className="text-sm text-gray-600">{averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)</span>
                  </div>
                </div>

                {submitStatus && (
                  <div className={`p-3 rounded-lg text-center ${
                    submitStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {submitStatus}
                  </div>
                )}

                {user?.email ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                      <div className="p-3 border border-gray-200 rounded-lg bg-white">
                        <StarRating
                          rating={newReview.rating}
                          onRatingChange={handleRatingChange}
                          onHover={handleStarHover}
                          onLeave={handleStarLeave}
                          interactive={true}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Your Comment</label>
                      <textarea
                        value={newReview.comment}
                        onChange={handleCommentChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        rows="4"
                        placeholder="Write your review here..."
                        aria-label="Enter review comment"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                      aria-label="Submit review"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600 text-center">
                    Please <a href="/login" className="text-yellow-600 hover:underline">log in</a> to submit a review.
                  </p>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          {review.status && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {review.status}
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews available yet.</p>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Free shipping on orders over $500</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Standard delivery: 5-7 business days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Express delivery: 2-3 business days (additional charges apply)</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Secure packaging with insurance coverage</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Return Policy</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>30-day return policy</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Items must be in original condition</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Free return shipping</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Full refund or exchange available</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <button
            className="w-14 h-14 bg-yellow-600 text-white rounded-full shadow-lg hover:bg-yellow-700 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Open chat support"
          >
            <i className="fas fa-comments text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-900 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Scroll to top"
          >
            <i className="fas fa-arrow-up" aria-hidden="true"></i>
          </button>
        </div>

        <style jsx>{`
          .!rounded-button {
            border-radius: 8px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductDetail;