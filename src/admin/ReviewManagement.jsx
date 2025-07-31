import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          status,
          created_at,
          product_id,
          user_id,
          products (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const reviewsWithEmails = await Promise.all(data.map(async (review) => {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', review.user_id)
          .single();
        if (userError) console.warn('Error fetching user email:', userError.message);
        return { ...review, users: userData || { email: 'N/A', name: 'N/A' } };
      }));
      setReviews(reviewsWithEmails || []);
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;
      setReviews(prevReviews => 
        Array.isArray(prevReviews) ? prevReviews.map(review => 
          review.id === reviewId ? { ...review, status: newStatus } : review
        ) : []
      );
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating review status:', error.message);
    }
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const filteredReviews = reviews.filter(review => {
    const searchLower = searchTerm.toLowerCase();
    return (
      review.products?.name?.toLowerCase().includes(searchLower) ||
      review.users?.email?.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

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

  const ReviewModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
          <button
            onClick={() => setShowReviewModal(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {selectedReview && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Review Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Product:</span> {selectedReview.products?.name || 'N/A'}</p>
                <p><span className="font-medium">User:</span> {selectedReview.users?.email || 'N/A'}</p>
                <p><span className="font-medium">Rating:</span> <span className="inline-flex">{renderStars(selectedReview.rating)}</span></p>
                <p><span className="font-medium">Comment:</span> {selectedReview.comment || 'N/A'}</p>
                <p><span className="font-medium">Status:</span> <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  selectedReview.status === 'approved' ? 'bg-green-100 text-green-800' :
                  selectedReview.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>{selectedReview.status}</span></p>
                <p><span className="font-medium">Posted:</span> {new Date(selectedReview.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleUpdateStatus(selectedReview.id, 'approved')}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                aria-label="Approve review"
              >
                <FaCheck className="inline mr-2" /> Approve
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReview.id, 'rejected')}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                aria-label="Reject review"
              >
                <FaTimes className="inline mr-2" /> Reject
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <i className="ri-star-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">Error loading reviews: {error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <i className="ri-star-line text-4xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">No reviews available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
        <div className="text-sm text-gray-500">
          Total Reviews: {reviews.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-star-line text-blue-600 text-xl"></i>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">
                {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i className="ri-star-half-line text-purple-600 text-xl"></i>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Reviews</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-green-600 text-xl"></i>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                aria-label="Search reviews"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)]">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Rating</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Comment</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Posted</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentReviews.map((review) => (
                <motion.tr
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{review.products?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-500">ID: {review.product_id}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-medium text-gray-900">{review.users?.email || 'N/A'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex">{renderStars(review.rating)}</div>
                  </td>
                  <td className="py-4 px-4 text-gray-700 max-w-xs truncate">
                    {review.comment || 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {new Date(review.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => handleViewReview(review)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="View review details"
                    >
                      <FaEye className="text-lg" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {currentReviews.length === 0 && (
          <div className="text-center py-8">
            <i className="ri-star-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No reviews found matching your search</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstReview + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastReview, filteredReviews.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredReviews.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                        aria-label={`Go to page ${page}`}
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
      </motion.div>

      {showReviewModal && <ReviewModal />}
    </div>
  );
};

export default ReviewManagement;