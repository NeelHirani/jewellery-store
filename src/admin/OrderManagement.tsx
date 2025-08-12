import React, { useState, useEffect } from 'react';
import { FaEye, FaSearch, FaTrash } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<any>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [ordersPerPage] = useState<number>(10);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<any>(null);

  const orderStatuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          users(name, email, phone),
          order_items(id)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      console.log('Fetched orders:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: any) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products(name, additional_images)
        `)
        .eq('order_id', orderId);

      if (error) {
        console.error('Error fetching order items:', error);
        throw error;
      }

      // Process the data to use the first image from additional_images
      const processedData = data?.map(item => ({
        ...item,
        products: item.products ? {
          ...item.products,
          image_url: item.products.additional_images?.[0] || '/placeholder-image.jpg'
        } : null
      })) || [];

      console.log('Fetched order items:', processedData);
      setOrderItems(processedData);
    } catch (error) {
      console.error('Error fetching order items:', error);
      setOrderItems([]);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, order_status: newStatus }
          : order
      ));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      }

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setShowOrderModal(true);
  };

  const handleDeleteOrder = (order: any): void => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const resequenceOrderIds = async () => {
    try {
      // Get all orders sorted by created_at to maintain chronological order
      const { data: allOrders, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw new Error('Failed to fetch orders for resequencing');
      }

      if (!allOrders || allOrders.length === 0) {
        return; // No orders to resequence
      }

      // Check if resequencing is actually needed
      const needsResequencing = allOrders.some((order, index) => order.id !== index + 1);

      if (!needsResequencing) {
        console.log('Order IDs are already sequential, no resequencing needed');
        return;
      }

      console.log('Starting order ID resequencing...');

      // Create a temporary table approach to handle the resequencing safely
      // We'll use a batch update approach to minimize conflicts

      // Step 1: Create temporary negative IDs to avoid conflicts
      const tempUpdates = [];
      for (let i = 0; i < allOrders.length; i++) {
        const order = allOrders[i];
        const tempId = -(i + 1000); // Use negative numbers to avoid conflicts

        if (order.id !== i + 1) {
          tempUpdates.push({
            oldId: order.id,
            tempId: tempId,
            finalId: i + 1,
            orderData: order
          });
        }
      }

      // Step 2: Update to temporary IDs first
      for (const update of tempUpdates) {
        // Update order_items first
        const { error: updateItemsError } = await supabase
          .from('order_items')
          .update({ order_id: update.tempId })
          .eq('order_id', update.oldId);

        if (updateItemsError) {
          throw new Error(`Failed to update order items to temp ID for order ${update.oldId}`);
        }

        // Update order to temporary ID
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({ id: update.tempId })
          .eq('id', update.oldId);

        if (updateOrderError) {
          throw new Error(`Failed to update order to temp ID from ${update.oldId} to ${update.tempId}`);
        }
      }

      // Step 3: Update from temporary IDs to final sequential IDs
      for (const update of tempUpdates) {
        // Update order_items to final ID
        const { error: updateItemsError } = await supabase
          .from('order_items')
          .update({ order_id: update.finalId })
          .eq('order_id', update.tempId);

        if (updateItemsError) {
          throw new Error(`Failed to update order items to final ID for temp order ${update.tempId}`);
        }

        // Update order to final ID
        const { error: updateOrderError } = await supabase
          .from('orders')
          .update({ id: update.finalId })
          .eq('id', update.tempId);

        if (updateOrderError) {
          throw new Error(`Failed to update order to final ID from ${update.tempId} to ${update.finalId}`);
        }
      }

      console.log(`Successfully resequenced ${tempUpdates.length} orders`);

    } catch (error) {
      console.error('Error resequencing order IDs:', error);

      // Attempt to recover from any partial updates by refreshing the data
      console.log('Attempting to refresh data after resequencing error...');
      try {
        await fetchOrders();
      } catch (refreshError) {
        console.error('Failed to refresh orders after resequencing error:', refreshError);
      }

      throw error;
    }
  };

  /*
  const validateOrderSequence = async () => { // Unused
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error validating order sequence:', error);
        return false;
      }

      // Check if IDs are sequential starting from 1
      const isSequential = orders.every((order, index) => order.id === index + 1);

      if (!isSequential) {
        console.log('Order IDs are not sequential:', orders.map(o => o.id));
      }

      return isSequential;
    } catch (error) {
      console.error('Error validating order sequence:', error);
      return false;
    }
  };
  */

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleteLoading(true);
    try {
      // Store the order ID for success message before deletion
      const deletedOrderId = orderToDelete.id;

      // First, delete all order items associated with this order
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderToDelete.id);

      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        throw new Error('Failed to delete order items');
      }

      // Then delete the order itself
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderToDelete.id);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        throw new Error('Failed to delete order');
      }

      // Resequence order IDs to eliminate gaps
      await resequenceOrderIds();

      // Refresh the orders list to reflect new IDs
      await fetchOrders();

      // Show success message
      setSuccessMessage(`Order #${deletedOrderId} has been successfully deleted and order IDs have been resequenced.`);
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (error) {
      console.error('Error deleting order:', error);
      setError((error as Error).message || 'Failed to delete order. Please try again.');

      // If resequencing failed, refresh the orders to show current state
      try {
        await fetchOrders();
      } catch (refreshError) {
        console.error('Error refreshing orders after failed deletion:', refreshError);
      }
    } finally {
      // Always close the modal and reset state, regardless of success or failure
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const cancelDeleteOrder = (): void => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const OrderModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            onClick={() => setShowOrderModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order ID:</span> #{selectedOrder.id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  <p><span className="font-medium">Total:</span> ${selectedOrder.total_amount}</p>
                  <p><span className="font-medium">Payment Status:</span> {selectedOrder.payment_status}</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Status:</span>
                    <select
                      value={selectedOrder.order_status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {orderStatuses.slice(1).map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <h3 className="font-semibold text-[#800000] mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-[#800000]">Name:</span> <span className="text-gray-700">{selectedOrder.users?.name || 'N/A'}</span></p>
                  <p><span className="font-medium text-[#800000]">Email:</span> <span className="text-gray-700">{selectedOrder.users?.email || 'N/A'}</span></p>
                  <p><span className="font-medium text-[#800000]">Phone:</span> <span className="text-gray-700">{
                    // Try to get phone from shipping address first, then fallback to user phone
                    (selectedOrder.shipping_address && typeof selectedOrder.shipping_address === 'object' && selectedOrder.shipping_address.phoneNumber) ||
                    selectedOrder.users?.phone ||
                    'Not provided'
                  }</span></p>
                </div>
              </div>
            </div>

            {selectedOrder.shipping_address && (
              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <h3 className="font-semibold text-[#800000] mb-3">Shipping Address</h3>
                <div className="text-sm">
                  {typeof selectedOrder.shipping_address === 'string' ? (
                    <p className="text-gray-700">{selectedOrder.shipping_address}</p>
                  ) : (
                    <div className="space-y-2">
                      <p><span className="font-medium text-[#800000]">Name:</span> <span className="text-gray-700">{selectedOrder.shipping_address.fullName || 'N/A'}</span></p>
                      <p><span className="font-medium text-[#800000]">Address:</span> <span className="text-gray-700">{selectedOrder.shipping_address.addressLine1 || 'N/A'}</span></p>
                      {selectedOrder.shipping_address.addressLine2 && (
                        <p><span className="font-medium text-[#800000]">Address Line 2:</span> <span className="text-gray-700">{selectedOrder.shipping_address.addressLine2}</span></p>
                      )}
                      <p><span className="font-medium text-[#800000]">City:</span> <span className="text-gray-700">{selectedOrder.shipping_address.city || 'N/A'}</span></p>
                      <p><span className="font-medium text-[#800000]">State:</span> <span className="text-gray-700">{selectedOrder.shipping_address.state || 'N/A'}</span></p>
                      <p><span className="font-medium text-[#800000]">Postal Code:</span> <span className="text-gray-700">{selectedOrder.shipping_address.postalCode || 'N/A'}</span></p>
                      <p><span className="font-medium text-[#800000]">Country:</span> <span className="text-gray-700">{selectedOrder.shipping_address.country || 'N/A'}</span></p>
                      {selectedOrder.shipping_address.phoneNumber && (
                        <p><span className="font-medium text-[#800000]">Phone:</span> <span className="text-gray-700">{selectedOrder.shipping_address.phoneNumber}</span></p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {orderItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.products?.image_url || '/placeholder-image.jpg'}
                      alt={item.products?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.products?.name || 'Unknown Product'}</h4>
                      <p className="text-sm text-gray-600">Size: {item.size || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.price_at_purchase}</p>
                      <p className="text-sm text-gray-600">
                        Total: ${(item.price_at_purchase * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

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
            <h3 className="text-lg font-semibold text-gray-900">Delete Order</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-700">
            Are you sure you want to delete order <span className="font-semibold">#{orderToDelete?.id}</span>?
          </p>
          <p className="text-sm text-gray-600 mt-2">
            This will permanently remove the order and all associated order items from the database.
          </p>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After deletion, all remaining order IDs will be automatically resequenced to maintain sequential numbering (1, 2, 3...) while preserving chronological order.
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={cancelDeleteOrder}
            disabled={deleteLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteOrder}
            disabled={deleteLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {deleteLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting & Resequencing...
              </>
            ) : (
              <>
                <FaTrash className="mr-2" />
                Delete Order
              </>
            )}
          </button>
        </div>
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="text-sm text-gray-500">
          Total Orders: {orders.length}
        </div>
      </div>

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
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8 text-sm"
          >
            {orderStatuses.map((status: any) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order: any) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">#{order.id}</div>
                      <div className="text-sm text-gray-500">
                        {(() => {
                          const itemCount = order.order_items?.length || 0;
                          return itemCount === 1 ? '1 item' : `${itemCount} items`;
                        })()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {order.users?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">{order.users?.email}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-medium text-gray-900">
                      ${order.total_amount}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="View Order Details"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Order"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    <i className="ri-shopping-cart-line text-4xl mb-4"></i>
                    <p>No orders found matching your criteria</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200">
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
                    Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastOrder, filteredOrders.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredOrders.length}</span> results
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
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => o.order_status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-yellow-600 text-xl"></i>
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
              <p className="text-sm font-medium text-gray-600">Shipped Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.order_status === 'shipped').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="ri-truck-line text-blue-600 text-xl"></i>
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
              <p className="text-sm font-medium text-gray-600">Delivered Orders</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.order_status === 'delivered').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-double-line text-green-600 text-xl"></i>
            </div>
          </div>
        </motion.div>
      </div>

      {showOrderModal && <OrderModal />}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
};

export default OrderManagement;