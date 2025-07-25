import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign, FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch statistics
      const [usersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id, total_amount', { count: 'exact' })
      ]);

      // Calculate total revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount');
      
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalUsers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue
      });

      // Fetch recent orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          order_status,
          created_at,
          users(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(ordersData || []);

      // Fetch recent products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, image_base64, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentProducts(productsData || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, link }) => (
    <Link to={link} className="block">
      <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color} hover:shadow-lg transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <Icon className={`text-3xl ${color.replace('border-l-', 'text-')}`} />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to your jewelry store management panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={FaUsers}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color="border-l-blue-500 text-blue-500"
          link="/admin/users"
        />
        <StatCard
          icon={FaBox}
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          color="border-l-green-500 text-green-500"
          link="/admin/products"
        />
        <StatCard
          icon={FaShoppingCart}
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="border-l-yellow-500 text-yellow-500"
          link="/admin/orders"
        />
        <StatCard
          icon={FaDollarSign}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="border-l-purple-500 text-purple-500"
          link="/admin/orders"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-600">{order.users?.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${order.total_amount}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.order_status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.order_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Products</h2>
            <Link to="/admin/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={product.image_base64 || '/placeholder-image.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent products</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <FaPlus className="text-blue-600 mr-2" />
            <span className="text-blue-600 font-medium">Add New Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center justify-center p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 transition-colors"
          >
            <FaShoppingCart className="text-green-600 mr-2" />
            <span className="text-green-600 font-medium">Manage Orders</span>
          </Link>
          <Link
            to="/admin/users"
            className="flex items-center justify-center p-4 bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <FaUsers className="text-purple-600 mr-2" />
            <span className="text-purple-600 font-medium">View Users</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
