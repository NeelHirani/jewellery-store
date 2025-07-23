import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching product with id:', id); // Debug: Log the ID

        // Fetch product details with existing columns
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, name, price, image_url, category, metal, stone, occasion, rating, reviews')
          .eq('id', parseInt(id)) // Ensure id is an integer
          .single();
        
        if (productError) {
          console.error('Product query error:', productError);
          throw new Error(`Product not found for ID ${id}: ${productError.message}`);
        }
        if (!productData) {
          console.warn('No product data returned for ID:', id);
          throw new Error(`No product found for ID ${id}`);
        }
        console.log('Product data fetched:', productData); // Debug: Log product data
        setProduct(productData);

        // Mock product_images (since table doesn't exist)
        setProductImages([
          { image_url: productData.image_url }, // Use main image
          { image_url: productData.image_url + '_alt1' }, // Mock alternate images
          { image_url: productData.image_url + '_alt2' },
        ]);

        // Mock product_sizes (since table doesn't exist)
        setProductSizes(['Small', 'Medium', 'Large']);

        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err.message || 'Failed to load product details.');
        console.error('Fetch product data error:', err);
        setProduct(null); // Ensure product is null on error
      } finally {
        setIsLoading(false); // Always stop loading
      }
    };
    fetchProductData();
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
    if (!product || !selectedSize) {
      setError(`Please select a size for ${product?.name || 'this product'}.`);
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
        metal: product.metal || 'N/A',
        stone: product.stone || 'N/A',
        selectedSize,
        quantity,
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

  const handleBuyNow = () => {
    if (!product || !selectedSize) {
      setError(`Please select a size for ${product?.name || 'this product'}.`);
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
        metal: product.metal || 'N/A',
        stone: product.stone || 'N/A',
        selectedSize,
        quantity,
      };
      const updatedCart = [...cart, newItem];
      localStorage.setItem('jewelMartCart', JSON.stringify(updatedCart));
      setError(null);
      navigate('/checkout');
    } catch (err) {
      setError('Failed to process buy now.');
      console.error('Buy now error:', err);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star text-yellow-400" aria-hidden="true"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400" aria-hidden="true"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-gray-300" aria-hidden="true"></i>);
    }
    return stars;
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading...</div>;
  }

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
                <button
                  onClick={() => navigate('/wishlist')}
                  className="text-gray-600 hover:text-red-500 cursor-pointer text-lg"
                  aria-label="View wishlist"
                >
                  <i className="fas fa-heart"></i>
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
                src={productImages[selectedImage]?.image_url || product.image_url}
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
                    src={image.image_url}
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
                  {renderStars(product.rating)}
                  <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-yellow-600 mb-4">₹{product.price.toLocaleString('en-IN')}</p>
              <p className="text-gray-600 leading-relaxed">
                Exquisite {product.metal?.toLowerCase() || 'metal'} {product.stone?.toLowerCase() || 'stone'} jewelry.
                Perfect for {product.occasion?.toLowerCase() || 'any occasion'} occasions or everyday elegance. Crafted with precision and attention to detail.
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
              <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
              <div className="flex space-x-3">
                {productSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg cursor-pointer whitespace-nowrap !rounded-button ${
                      selectedSize === size
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                    aria-label={`Select size ${size}`}
                  >
                    {size}
                  </button>
                ))}
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
                // { id: 'reviews', label: 'Reviews' }, // Uncomment when reviews table is added
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
                  Exquisite {product.metal?.toLowerCase() || 'metal'} {product.stone?.toLowerCase() || 'stone'} jewelry.
                  Each piece is crafted with a carefully selected {product.stone?.toLowerCase() || 'stone'} set in a classic design.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The {product.metal?.toLowerCase() || 'metal'} setting provides durability and timeless elegance.
                  Suitable for {product.occasion?.toLowerCase() || 'any occasion'} occasions or daily wear.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Comes with a certificate of authenticity and lifetime warranty support.
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
                      <td className="py-2 text-gray-900">{product.rating || 'N/A'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 font-medium text-gray-700">Reviews</td>
                      <td className="py-2 text-gray-900">{product.reviews || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Placeholder for Reviews (uncomment when reviews table is added)
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">{renderStars(product.rating)}</div>
                    <span className="text-sm text-gray-600">{product.rating} out of 5 ({product.reviews} reviews)</span>
                  </div>
                </div>
                <p className="text-gray-600">No reviews available yet.</p>
              </div>
            )}
            */}

            {activeTab === 'shipping' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start space-x-2">
                      <i className="fas fa-check text-green-500 mt-1" aria-hidden="true"></i>
                      <span>Free shipping on orders over ₹50,000</span>
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

        {/* Placeholder for Related Products (uncomment when related_products table is added)
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            You May Also Like
          </h2>
          <p className="text-gray-600">No related products available yet.</p>
        </div>
        */}
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
  );
};

export default ProductDetail;