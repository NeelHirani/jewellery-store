import React, { useState, useEffect } from 'react';
import { motion,  } from 'framer-motion';
import {
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaEye,
  // FaCheck, // Unused
  FaTimes,
  FaSearch,
  FaExclamationCircle,
  FaTrash,
  FaCheckSquare,
  FaSquare,
  FaChevronLeft,
  FaChevronRight,
  FaSync,
  FaReply
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const ContactManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<any>('all');
  const [subjectFilter, setSubjectFilter] = useState<any>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  // const [showBulkActions, setShowBulkActions] = useState<boolean>(false); // Unused
  const [bulkActionLoading, setBulkActionLoading] = useState<boolean>(false);

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Real-time state
  const [realTimeChannel, setRealTimeChannel] = useState<any>(null);

  // Fetch contact submissions with pagination
  const fetchSubmissions = async (page: any = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // Build base query
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (subjectFilter !== 'all') {
        query = query.eq('subject', subjectFilter);
      }
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,message.ilike.%${searchQuery}%`);
      }

      // Apply pagination
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setSubmissions(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    const setupRealTime = (): void => {
      const channel = supabase
        .channel('contact_submissions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'contact_submissions'
          },
          (payload) => {
            console.log('Real-time contact submission change:', payload);

            if (payload.eventType === 'INSERT') {
              // Add new submission to the beginning of the list
              setSubmissions(prev => [payload.new, ...prev.slice(0, itemsPerPage - 1)]);
              setTotalCount(prev => prev + 1);
              setSuccessMessage('New contact submission received!');
              setTimeout(() => setSuccessMessage(null), 5000);
            } else if (payload.eventType === 'UPDATE') {
              // Update existing submission
              setSubmissions(prev =>
                prev.map(sub =>
                  sub.id === payload.new.id ? payload.new : sub
                )
              );
              if (selectedSubmission?.id === payload.new.id) {
                setSelectedSubmission(payload.new);
              }
            } else if (payload.eventType === 'DELETE') {
              // Remove deleted submission
              setSubmissions(prev => prev.filter(sub => sub.id !== payload.old.id));
              setTotalCount(prev => prev - 1);
              if (selectedSubmission?.id === payload.old.id) {
                setSelectedSubmission(null);
              }
            }
          }
        )
        .subscribe();

      setRealTimeChannel(channel);
    };

    setupRealTime();

    return () => {
      if (realTimeChannel) {
        supabase.removeChannel(realTimeChannel);
      }
    };
  }, []);

  useEffect(() => {
    fetchSubmissions(1); // Reset to page 1 when filters change
  }, [statusFilter, subjectFilter, searchQuery]);

  useEffect(() => {
    fetchSubmissions(currentPage);
  }, [currentPage]);

  // Update submission status
  const updateStatus = async (id: string, newStatus: any) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setSubmissions(prev =>
        prev.map(sub =>
          sub.id === id ? { ...sub, status: newStatus } : sub
        )
      );

      // Update selected submission if it's the one being updated
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission((prev: any) => ({ ...prev, status: newStatus }));
      }

      setSuccessMessage(`Status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
      setTimeout(() => setError(null), 5000);
    }
  };

  // Delete submission
  const deleteSubmission = async (id: any) => {
    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccessMessage('Contact submission deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting submission:', err);
      setError('Failed to delete submission');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk actions
  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedItems.length === 0) return;

    try {
      setBulkActionLoading(true);
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedItems);

      if (error) throw error;

      setSuccessMessage(`${selectedItems.length} submissions updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedItems([]);
      // setShowBulkActions(false); // Commented out as variable is unused
    } catch (err) {
      console.error('Error updating bulk status:', err);
      setError('Failed to update submissions');
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    try {
      setBulkActionLoading(true);
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .in('id', selectedItems);

      if (error) throw error;

      setSuccessMessage(`${selectedItems.length} submissions deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setSelectedItems([]);
      // setShowBulkActions(false); // Commented out as variable is unused
    } catch (err) {
      console.error('Error deleting submissions:', err);
      setError('Failed to delete submissions');
      setTimeout(() => setError(null), 5000);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (): void => {
    if (selectedItems.length === submissions.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(submissions.map(sub => sub.id));
    }
  };

  const handleSelectItem = (id: string): void => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Pagination helpers
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalCount);

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority icon based on subject
  const getPriorityIcon = (subject: string): React.ReactElement | null => {
    if (subject === 'Complaint') return <FaExclamationCircle className="text-red-500" />;
    if (subject === 'Support') return <FaExclamationCircle className="text-orange-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Management</h1>
        <p className="text-gray-600">Manage customer inquiries and contact form submissions</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-green-500 hover:text-green-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate('new')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Mark as New
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('in_progress')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
              >
                Mark as In Progress
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('resolved')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Mark as Resolved
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedItems([])}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Product Question">Product Question</option>
            <option value="Custom Order">Custom Order</option>
            <option value="Support">Support</option>
            <option value="Complaint">Complaint</option>
            <option value="Partnership">Partnership</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setStatusFilter('all');
              setSubjectFilter('all');
              setSearchQuery('');
            }}
            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Submissions List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Submissions List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Submissions ({totalCount})
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {selectedItems.length === submissions.length ? <FaCheckSquare /> : <FaSquare />}
                <span>Select All</span>
              </button>
              <button
                onClick={() => fetchSubmissions(currentPage)}
                className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 rounded"
              >
                <FaSync />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contact submissions found
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.map((submission: any) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    selectedSubmission?.id === submission.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectItem(submission.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedItems.includes(submission.id) ? <FaCheckSquare /> : <FaSquare />}
                      </button>
                      {getPriorityIcon(submission.subject)}
                      <h3
                        className="font-medium text-gray-800 cursor-pointer hover:text-purple-600"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        {submission.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete(submission);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete submission"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <FaEnvelope className="text-xs" />
                        <span>{submission.email}</span>
                      </span>
                      {submission.phone && (
                        <span className="flex items-center space-x-1">
                          <FaPhone className="text-xs" />
                          <span>{submission.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Subject:</strong> {submission.subject}
                  </div>
                  
                  <div className="text-sm text-gray-500 truncate mb-2">
                    {submission.message}
                  </div>
                  
                  <div className="text-xs text-gray-400 flex items-center space-x-1">
                    <FaCalendarAlt />
                    <span>{format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {startIndex} to {endIndex} of {totalCount} submissions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft />
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Submission Details */}
        <div>
          {selectedSubmission ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Submission Details</h2>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-800">{selectedSubmission.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-800">
                    <a href={`mailto:${selectedSubmission.email}`} className="text-blue-600 hover:underline">
                      {selectedSubmission.email}
                    </a>
                  </p>
                </div>

                {selectedSubmission.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-800">
                      <a href={`tel:${selectedSubmission.phone}`} className="text-blue-600 hover:underline">
                        {selectedSubmission.phone}
                      </a>
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-800">{selectedSubmission.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedSubmission.message}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <label className="block font-medium">Submitted</label>
                    <p>{format(new Date(selectedSubmission.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <label className="block font-medium">Last Updated</label>
                    <p>{format(new Date(selectedSubmission.updated_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['new', 'in_progress', 'resolved', 'closed'].map((status: any) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedSubmission.id, status)}
                          disabled={selectedSubmission.status === status}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            selectedSubmission.status === status
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Actions</label>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}&body=Dear ${selectedSubmission.name},%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0ABest regards,%0D%0ACustomer Service Team`}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
                      >
                        <FaReply />
                        <span>Reply via Email</span>
                      </a>
                      <button
                        onClick={() => {
                          setItemToDelete(selectedSubmission);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
              <FaEye className="mx-auto text-4xl mb-4" />
              <p>Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Contact Submission</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to permanently delete the contact submission from{' '}
                <span className="font-semibold">{itemToDelete?.name}</span>?
              </p>
              {itemToDelete && (
                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Subject:</strong> {itemToDelete.subject}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Email:</strong> {itemToDelete.email}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Date:</strong> {format(new Date(itemToDelete.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setItemToDelete(null);
                }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteSubmission(itemToDelete.id)}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
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
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
