import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaSearch, FaTrash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [reviewsPerPage] = useState<number>(10);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<any>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

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
      console.error('Error fetching reviews:', (error as Error).message);
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    setStatusUpdateLoading(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: newStatus })
        .eq('id', reviewId);

      if (error) throw error;

      // Update the reviews list
      setReviews(prevReviews =>
        Array.isArray(prevReviews) ? prevReviews.map(review =>
          review.id === reviewId ? { ...review, status: newStatus } : review
        ) : []
      );

      // Update the selected review if it's the one being updated
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, status: newStatus });
      }

      // Show success message
      const statusText = newStatus === 'approved' ? 'approved' : 'rejected';
      setSuccessMessage(`Review has been successfully ${statusText}.`);
      setTimeout(() => setSuccessMessage(null), 3000);

      // Automatically close the modal after successful status update
      setShowReviewModal(false);
      setSelectedReview(null);

      console.log(`Review ${reviewId} status successfully updated to ${newStatus}`);

    } catch (error) {
      console.error('Error updating review status:', (error as Error).message);
      // Show error message and keep modal open so admin can try again
      setError(`Failed to update review status: ${(error as Error).message}`);
      setTimeout(() => setError(null), 5000);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleViewReview = (review: any): void => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const handleDeleteReview = (review: any): void => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };



  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    setDeleteLoading(true);
    try {
      // Always perform permanent deletion regardless of review status
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewToDelete.id);

      if (error) {
        console.error('Error deleting review:', error);
        throw new Error('Failed to delete review');
      }

      // Update the local state to remove the deleted review
      setReviews(reviews.filter(review => review.id !== reviewToDelete.id));

      setSuccessMessage(`Review has been permanently deleted.`);
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Error deleting review:', error);
      setError((error as Error).message || 'Failed to delete review. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setReviewToDelete(null);
    }
  };

  const cancelDeleteReview = (): void => {
    setShowDeleteModal(false);
    setReviewToDelete(null);
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg max-w-md w-full p-6 border border-gray-200"
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <FaTrash className="text-red-600 text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Review</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to permanently delete the review from <span className="font-semibold">{reviewToDelete?.users?.email || 'this user'}</span>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This will permanently remove the review from the database and it cannot be recovered.
          </p>
          {reviewToDelete && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Product:</strong> {reviewToDelete.products?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Rating:</strong> {reviewToDelete.rating}/5 stars
              </p>
              <p className="text-sm text-gray-700">
                <strong>Status:</strong> {reviewToDelete.status}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Comment:</strong> {reviewToDelete.comment ? `"${reviewToDelete.comment.substring(0, 100)}${reviewToDelete.comment.length > 100 ? '...' : ''}"` : 'No comment'}
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={cancelDeleteReview}
            disabled={deleteLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteReview}
            disabled={deleteLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {deleteLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );



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

  const renderStars = (rating: number): React.ReactElement => {
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
    return <>{stars}</>;
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
                disabled={statusUpdateLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Approve review"
              >
                {statusUpdateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCheck className="inline mr-2" /> Approve
                  </>
                )}
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedReview.id, 'rejected')}
                disabled={statusUpdateLoading}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reject review"
              >
                {statusUpdateLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaTimes className="inline mr-2" /> Reject
                  </>
                )}
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

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-green-400 hover:text-green-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

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
              {currentReviews.map((review: any) => (
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
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewReview(review)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Review Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete Review Permanently"
                      >
                        <FaTrash />
                      </button>
                    </div>
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
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: any) => (
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
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default ReviewManagement;