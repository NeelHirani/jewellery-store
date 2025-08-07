import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import ProductForm from './ProductForm';
import AddCategory from './AddCategory';
import EditProduct from './EditProduct';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<any>('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState<boolean>(false);
  const [showEditProductModal, setShowEditProductModal] = useState<any>(null); // Stores product ID for editing
  const [canScrollDown, setCanScrollDown] = useState<boolean>(false);
  const [canScrollUp, setCanScrollUp] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Initialize scroll indicators when products change
  useEffect(() => {
    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      const scrollContainer = document.querySelector('.product-scroll-container');
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        setCanScrollUp(scrollTop > 0);
        setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== productId));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  // Handle scroll events to show/hide scroll indicators
  const handleScroll = (e: any): void => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const DeleteModal = () => (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setProductToDelete(null);
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteProduct(productToDelete.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <div className="flex space-x-4">
          <Link
            to="#"
            onClick={() => setShowAddCategoryModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center whitespace-nowrap"
          >
            <FaPlus className="mr-2" />
            Add Category
          </Link>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center whitespace-nowrap"
          >
            <FaPlus className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing {currentProducts.length} of {filteredProducts.length} products
            {filteredProducts.length > productsPerPage && (
              <span className="ml-2 text-purple-600 font-medium">
                (Scroll table to see all products)
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8 text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map((category: any) => (
              <option key={category.name} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          {/* Scroll Indicators */}
          {canScrollUp && (
            <div className="scroll-indicator absolute top-2 right-2 z-20 bg-purple-500 text-white px-2 py-1 rounded text-xs shadow-lg">
              ↑ Scroll up for more
            </div>
          )}
          {canScrollDown && (
            <div className="scroll-indicator absolute bottom-2 right-2 z-20 bg-purple-500 text-white px-2 py-1 rounded text-xs shadow-lg">
              ↓ Scroll down for more
            </div>
          )}

          <div
            className="product-scroll-container overflow-x-auto overflow-y-auto max-h-96 border border-gray-200 rounded-lg scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onScroll={handleScroll}
          >
            <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.length > 0 ? (
                currentProducts.map((product: any) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <img
                          src={product.additional_images && product.additional_images.length > 0 ? product.additional_images[0] : (product.image_base64 || '/placeholder-image.jpg')}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{product.category}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">${product.price?.toLocaleString()}</td>
                    <td className="py-4 px-4 text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/products/${product.id}`}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEye />
                        </Link>
                        <button
                          onClick={() => setShowEditProductModal(product.id)}
                          className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product);
                            setShowDeleteModal(true);
                          }}
                          className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastProduct, filteredProducts.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredProducts.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: any) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <ProductForm onClose={() => setShowAddProductModal(false)} />
          </div>
        </div>
      )}

      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <AddCategory onClose={() => setShowAddCategoryModal(false)} />
          </div>
        </div>
      )}

      {showEditProductModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" style={{ backdropFilter: 'blur(5px)' }}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditProductModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <EditProduct id={showEditProductModal} onClose={() => setShowEditProductModal(null)} />
          </div>
        </div>
      )}

      {showDeleteModal && <DeleteModal />}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .product-scroll-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .product-scroll-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }

        .product-scroll-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .product-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .product-scroll-container::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }

        /* Firefox scrollbar styling */
        .product-scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        /* Smooth scrolling */
        .product-scroll-container {
          scroll-behavior: smooth;
        }

        /* Scroll indicators animation */
        .scroll-indicator {
          animation: fadeInOut 2s infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ProductList;