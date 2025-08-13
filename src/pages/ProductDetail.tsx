import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<any>('description');
  const [product, setProduct] = useState<any>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReview, setNewReview] = useState<{rating: number; comment: string}>({ rating: 0, comment: '' });
  const [user, setUser] = useState<any>(null);
  const [submitStatus, setSubmitStatus] = useState<any>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

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
          .eq('id', parseInt(id!))
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
          .eq('product_id', parseInt(id!))
          .eq('status', 'approved') // Only fetch approved reviews for customers
          .order('created_at', { ascending: false });
        if (reviewsError) console.error('Error fetching reviews:', reviewsError);
        setReviews(reviewsData || []);

        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError((err as Error).message || 'Failed to load product details.');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    const checkUserAuthentication = (): void => {
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
    const handleStorageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      if ((e as any).key === 'user') {
        checkUserAuthentication();
      }
    };

    window.addEventListener('storage', handleStorageChange as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange as any);
    };
  }, [id]);

  // Set up real-time subscription for review changes
  useEffect(() => {
    if (!id) return;

    console.log('Setting up real-time subscription for product reviews:', id);

    const channel = supabase
      .channel(`reviews-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `product_id=eq.${id}`
        },
        (payload) => {
          console.log('Real-time review change detected:', payload);

          if (payload.eventType === 'DELETE') {
            // Remove deleted review from local state
            setReviews(prevReviews => {
              const filtered = prevReviews.filter(review => review.id !== payload.old.id);
              console.log(`Review ${payload.old.id} deleted via real-time. Reviews count: ${prevReviews.length} -> ${filtered.length}`);
              return filtered;
            });
          } else if (payload.eventType === 'INSERT') {
            // Only add new review if it's approved (customers should only see approved reviews)
            const newReview = payload.new;
            if (newReview.status === 'approved') {
              setReviews(prevReviews => {
                const updated = [newReview, ...prevReviews];
                console.log(`Approved review ${newReview.id} added via real-time. Reviews count: ${prevReviews.length} -> ${updated.length}`);
                return updated;
              });
            } else {
              console.log(`Non-approved review ${newReview.id} inserted but not shown to customers (status: ${newReview.status})`);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Handle status changes: add if approved, remove if not approved
            const updatedReview = payload.new;
            setReviews(prevReviews => {
              const existingIndex = prevReviews.findIndex(review => review.id === updatedReview.id);

              if (updatedReview.status === 'approved') {
                // If review is now approved, add it or update it
                if (existingIndex >= 0) {
                  // Update existing approved review
                  const updated = prevReviews.map(review =>
                    review.id === updatedReview.id ? updatedReview : review
                  );
                  console.log(`Review ${updatedReview.id} updated via real-time (still approved)`);
                  return updated;
                } else {
                  // Add newly approved review
                  const updated = [updatedReview, ...prevReviews];
                  console.log(`Review ${updatedReview.id} approved via real-time. Reviews count: ${prevReviews.length} -> ${updated.length}`);
                  return updated;
                }
              } else {
                // If review is no longer approved (rejected or pending), remove it from customer view
                if (existingIndex >= 0) {
                  const filtered = prevReviews.filter(review => review.id !== updatedReview.id);
                  console.log(`Review ${updatedReview.id} status changed to ${updatedReview.status}, removed from customer view. Reviews count: ${prevReviews.length} -> ${filtered.length}`);
                  return filtered;
                } else {
                  // Review wasn't shown to customers anyway
                  console.log(`Review ${updatedReview.id} status changed to ${updatedReview.status} but wasn't visible to customers`);
                  return prevReviews;
                }
              }
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to reviews for product ${id}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to reviews for product ${id}`);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription for reviews');
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Handle page visibility changes to refresh reviews when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      if (!document.hidden && id) {
        console.log('Page became visible, refreshing approved reviews to ensure sync');
        refreshApprovedReviews();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [id]);

  const handleQuantityChange = (change: number): void => {
    setQuantity(Math.max(1, quantity + change));
  };

  // Touch gesture handlers for image swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && selectedImage < productImages.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
    if (isRightSwipe && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const toggleWishlist = (productId: string): void => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((pid) => pid !== productId) : [...prev, productId]
    );
  };

  const handleAddToCart = (): void => {
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

  const handleBuyNow = (): void => {
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

  const renderStars = (rating: number): React.ReactElement => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) stars.push(<i key={i} className="fas fa-star text-rose-400" aria-hidden="true"></i>);
    if (hasHalfStar) stars.push(<i key="half" className="fas fa-star-half-alt text-rose-400" aria-hidden="true"></i>);
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300" aria-hidden="true"></i>);
    return <>{stars}</>;
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
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
          product_id: parseInt(id!),
          user_id: userData.id, // This should now be an integer ID from your custom users table
          rating: newReview.rating,
          comment: newReview.comment,
          status: 'pending',
        });

      if (error) {
        console.error('Review insert error:', error);
        throw error;
      }

      // Refresh reviews list (only approved reviews for customers)
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at, status')
        .eq('product_id', parseInt(id!))
        .eq('status', 'approved') // Only fetch approved reviews for customers
        .order('created_at', { ascending: false });
      setReviews(reviewsData || []);

      setNewReview({ rating: 0, comment: '' });
      setSubmitStatus('Review submitted successfully! (Pending approval)');
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error('Review submission error:', err);
      setSubmitStatus(`Failed to submit review: ${(err as Error).message}`);
      setTimeout(() => setSubmitStatus(null), 3000);
    }
  };

  // Function to refresh approved reviews data (useful for edge cases)
  const refreshApprovedReviews = async () => {
    if (!id) return;

    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at, status')
        .eq('product_id', parseInt(id!))
        .eq('status', 'approved') // Only fetch approved reviews for customers
        .order('created_at', { ascending: false });

      if (reviewsError) {
        console.error('Error refreshing approved reviews:', reviewsError);
        return;
      }

      setReviews(reviewsData || []);
      console.log('Approved reviews refreshed:', reviewsData?.length || 0);
    } catch (error) {
      console.error('Error refreshing approved reviews:', error);
    }
  };

  const handleRatingChange = (rating: any): void => {
    setNewReview({ ...newReview, rating: rating });
  };

  const handleStarHover = (rating: any): void => {
    setHoverRating(rating);
  };

  const handleStarLeave = (): void => {
    setHoverRating(0);
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNewReview({ ...newReview, comment: e.target.value });
  };

  // Star Rating Component
  interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    onHover?: (rating: number) => void;
    onLeave?: () => void;
    interactive?: boolean;
  }

  const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, onHover, onLeave, interactive = true }) => {
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
                interactive ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 rounded' : 'cursor-default'
              } ${
                isFilled
                  ? isHovered
                    ? 'text-rose-500 drop-shadow-sm'
                    : 'text-rose-400'
                  : interactive
                    ? 'text-gray-300 hover:text-rose-300'
                    : 'text-gray-300'
              }`}
              onClick={() => interactive && onRatingChange?.(star)}
              onMouseEnter={() => interactive && onHover?.(star)}
              onMouseLeave={() => interactive && onLeave?.()}
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
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50" style={{ fontFamily: 'Open Sans, sans-serif' }}>
        <header className="bg-white shadow-sm border-b border-rose-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <div className="text-2xl font-bold bg-gradient-to-r from-[#800000] to-rose-600 bg-clip-text text-transparent" style={{ fontFamily: 'Playfair Display, serif' }}>
                  JwellMart
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/products" className="text-[#800000] hover:text-[#5a0d15] cursor-pointer transition-all">Collections</a>
                  <a href="/products?category=Rings" className="text-[#800000] hover:text-[#5a0d15] cursor-pointer transition-all">Rings</a>
                  <a href="/products?category=Necklaces" className="text-[#800000] hover:text-[#5a0d15] cursor-pointer transition-all">Necklaces</a>
                  <a href="/products?category=Earrings" className="text-[#800000] hover:text-[#5a0d15] cursor-pointer transition-all">Earrings</a>
                  <a href="/products?category=Bracelets" className="text-[#800000] hover:text-[#5a0d15] cursor-pointer transition-all">Bracelets</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jewelry..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent text-sm"
                    aria-label="Search jewelry"
                  />
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" aria-hidden="true"></i>
                </div>
                <button onClick={() => navigate('/wishlist')} className="text-[#800000] hover:text-[#5a0d15] cursor-pointer text-lg transition-colors" aria-label="View wishlist">
                  <i className="fas fa-heart"></i>
                </button>
                <button onClick={() => navigate('/cart')} className="text-[#800000] hover:text-[#5a0d15] cursor-pointer text-lg transition-colors" aria-label="View cart">
                  <i className="fas fa-shopping-bag"></i>
                </button>
                <button onClick={() => navigate('/profile')} className="text-[#800000] hover:text-[#5a0d15] cursor-pointer text-lg transition-colors" aria-label="View profile">
                  <i className="fas fa-user"></i>
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-rose-600 text-lg mb-4">{error || 'Product not found.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-[#800000] text-white py-2 px-4 rounded-lg hover:bg-[#5a0d15] transition-colors font-medium cursor-pointer !rounded-button"
            aria-label="Return to products page"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // Calculate average rating based on approved reviews only
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-slate-50" style={{ fontFamily: 'Open Sans, sans-serif' }}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-8">
        {error && <p className="text-rose-600 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="space-y-3 sm:space-y-4">
            {/* Main Product Image */}
            <div
              className="aspect-square overflow-hidden rounded-lg bg-rose-100 relative"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover object-top hover:scale-110 transition-transform duration-300 cursor-zoom-in select-none"
              />

              {/* Mobile Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors lg:hidden"
                    aria-label="Previous image"
                  >
                    <i className="fas fa-chevron-left text-[#800000]"></i>
                  </button>
                  <button
                    onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors lg:hidden"
                    aria-label="Next image"
                  >
                    <i className="fas fa-chevron-right text-[#800000]"></i>
                  </button>
                </>
              )}

              {/* Image Counter for Mobile */}
              {productImages.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full lg:hidden">
                  {selectedImage + 1} / {productImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
              {productImages.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[60px] sm:min-h-[80px] ${
                    selectedImage === index
                      ? 'border-rose-500 ring-2 ring-rose-200'
                      : 'border-gray-200 hover:border-rose-300'
                  }`}
                  aria-label={`Select image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-200"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#800000] to-rose-600 bg-clip-text text-transparent mb-2 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                {product.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4 space-y-2 sm:space-y-0">
                <div className="flex items-center">
                  {renderStars(averageRating)}
                  <span className="text-sm text-[#800000] ml-2">({reviews.length} reviews)</span>
                </div>
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-[#800000] mb-4">
                {product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
              </p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {product.short_description || 'No short description available.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
              <div className="flex justify-between sm:block">
                <span className="text-sm font-medium text-[#800000]">Metal:</span>
                <span className="text-sm text-gray-700 sm:ml-2">{product.metal || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-sm font-medium text-[#800000]">Stone:</span>
                <span className="text-sm text-gray-700 sm:ml-2">{product.stone || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-sm font-medium text-[#800000]">Category:</span>
                <span className="text-sm text-gray-700 sm:ml-2">{product.category || 'N/A'}</span>
              </div>
              <div className="flex justify-between sm:block">
                <span className="text-sm font-medium text-[#800000]">Occasion:</span>
                <span className="text-sm text-gray-700 sm:ml-2">{product.occasion || 'N/A'}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#800000] mb-3">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-rose-50 cursor-pointer !rounded-button whitespace-nowrap transition-colors active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <span className="text-xl font-semibold text-[#800000]">-</span>
                </button>
                <span className="w-16 text-center font-medium text-gray-900 text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-rose-50 cursor-pointer !rounded-button whitespace-nowrap transition-colors active:scale-95"
                  aria-label="Increase quantity"
                >
                  <span className="text-xl font-semibold text-[#800000]">+</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#800000] text-white py-4 px-6 rounded-lg hover:bg-[#5a0d15] transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap active:scale-95 min-h-[48px]"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-[#800000] text-white py-4 px-6 rounded-lg hover:bg-[#5a0d15] transition-colors font-medium cursor-pointer !rounded-button whitespace-nowrap active:scale-95 min-h-[48px]"
                  aria-label={`Buy ${product.name} now`}
                >
                  <i className="fas fa-bolt mr-2"></i>
                  Buy Now
                </button>
              </div>

              {/* Wishlist button - full width on mobile */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className="w-full sm:w-auto sm:self-start border border-gray-300 rounded-lg flex items-center justify-center hover:bg-rose-50 cursor-pointer !rounded-button whitespace-nowrap transition-colors active:scale-95 py-3 px-6 min-h-[48px]"
                aria-label={wishlist.includes(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              >
                <i className={`fas fa-heart ${wishlist.includes(product.id) ? 'text-rose-500' : 'text-[#800000]'} text-lg mr-2`} aria-hidden="true"></i>
                <span className="font-medium text-gray-700">
                  {wishlist.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
            </div>

            <div className="border-t border-rose-200 pt-6">
              <div className="flex items-center space-x-4 text-sm text-[#800000]">
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

        <div className="mt-12 sm:mt-16">
          <div className="border-b border-blue-200">
            <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specs' },
                { id: 'reviews', label: 'Reviews' },
                { id: 'shipping', label: 'Shipping' },
              ].map((tab: any) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-sm cursor-pointer whitespace-nowrap transition-colors min-h-[48px] ${
                    activeTab === tab.id
                      ? 'border-[#800000] text-[#800000]'
                      : 'border-transparent text-gray-600 hover:text-[#800000] hover:border-rose-300'
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
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Metal Type</td>
                      <td className="py-2 text-gray-700">{product.metal || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Stone Type</td>
                      <td className="py-2 text-gray-700">{product.stone || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Category</td>
                      <td className="py-2 text-gray-700">{product.category || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full">
                  <tbody className="space-y-2">
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Occasion</td>
                      <td className="py-2 text-gray-700">{product.occasion || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Rating</td>
                      <td className="py-2 text-gray-700">{averageRating.toFixed(1) || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-rose-200">
                      <td className="py-2 font-medium text-[#800000]">Reviews</td>
                      <td className="py-2 text-gray-700">{reviews.length || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-[#800000]">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">{renderStars(averageRating)}</div>
                    <span className="text-sm text-[#800000]">{averageRating.toFixed(1)} out of 5 ({reviews.length} approved reviews)</span>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-[#800000]">
                    <span className="font-medium">Quality Assurance:</span> All reviews are moderated to ensure authenticity and helpfulness. Only approved reviews are displayed to maintain high quality standards.
                  </p>
                </div>

                {submitStatus && (
                  <div className={`p-3 rounded-lg text-center ${
                    submitStatus.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {submitStatus}
                  </div>
                )}

                {user?.email ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 bg-rose-50 p-4 rounded-lg border border-rose-200">
                    <div>
                      <label className="block text-sm font-medium text-[#800000] mb-2">Your Rating</label>
                      <div className="p-3 border border-rose-200 rounded-lg bg-white">
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
                      <label className="block text-sm font-medium text-[#800000]">Your Comment</label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) => handleCommentChange(e as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                        rows={4}
                        placeholder="Write your review here..."
                        aria-label="Enter review comment"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full px-6 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#5a0d15] transition-colors"
                      aria-label="Submit review"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600 text-center">
                    Please <a href="/login" className="text-[#800000] hover:text-[#5a0d15] hover:underline">log in</a> to submit a review.
                  </p>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-rose-200 pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-[#800000]">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          {review.status && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              review.status === 'approved' ? 'bg-green-100 text-green-800' :
                              review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-rose-100 text-[#800000]'
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
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-3">
                      <i className="fas fa-star text-4xl"></i>
                    </div>
                    <p className="text-[#800000] mb-2">No approved reviews yet.</p>
                    <p className="text-sm text-gray-500">Be the first to share your experience with this product!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-[#800000] mb-4">Shipping Information</h3>
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
                  <h3 className="text-lg font-medium text-[#800000] mb-4">Return Policy</h3>
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
            className="w-14 h-14 bg-[#800000] text-white rounded-full shadow-lg hover:bg-[#5a0d15] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Open chat support"
          >
            <i className="fas fa-comments text-xl" aria-hidden="true"></i>
          </button>
        </div>

        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-[#800000] text-white rounded-full shadow-lg hover:bg-[#5a0d15] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Scroll to top"
          >
            <i className="fas fa-arrow-up" aria-hidden="true"></i>
          </button>
        </div>

        <style>{`
          .!rounded-button {
            border-radius: 8px;
          }

          /* Hide scrollbar for mobile tab navigation */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          /* Ensure touch targets are at least 44px */
          @media (max-width: 768px) {
            button {
              min-height: 44px;
              min-width: 44px;
            }

            /* Prevent zoom on input focus on iOS */
            input, select, textarea {
              font-size: 16px;
            }

            /* Improve touch scrolling */
            .aspect-square {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Optimize for very small screens */
          @media (max-width: 320px) {
            .grid-cols-3 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProductDetail;