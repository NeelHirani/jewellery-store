import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUser, 
  FaCalendarAlt, 
  FaEye, 
  FaCheck, 
  FaTimes,
  FaFilter,
  FaSearch,
  FaExclamationCircle
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

const ContactManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch contact submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('contact_submissions')
        .select('*')
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

      const { data, error } = await query;

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load contact submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, subjectFilter, searchQuery]);

  // Update submission status
  const updateStatus = async (id, newStatus) => {
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
        setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority icon based on subject
  const getPriorityIcon = (subject) => {
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
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
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
          <h2 className="text-xl font-semibold text-gray-800">
            Submissions ({submissions.length})
          </h2>
          
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No contact submissions found
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {submissions.map((submission) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedSubmission?.id === submission.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 bg-white'
                  }`}
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(submission.subject)}
                      <h3 className="font-medium text-gray-800">{submission.name}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                      {submission.status.replace('_', ' ')}
                    </span>
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

                {/* Status Update Buttons */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Update Status</label>
                  <div className="flex flex-wrap gap-2">
                    {['new', 'in_progress', 'resolved', 'closed'].map((status) => (
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
    </div>
  );
};

export default ContactManagement;
