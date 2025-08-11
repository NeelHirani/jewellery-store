import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBox, FaShoppingCart, FaDollarSign, FaPlus } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

      // Fetch recent products with additional_images
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, additional_images, category, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Map products to use the first image from additional_images
      const formattedProducts = productsData?.map(product => ({
        ...product,
        image_base64: product.additional_images?.[0] || '/placeholder-image.jpg'
      })) || [];

      setRecentProducts(formattedProducts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  interface StatCardProps {
    icon: React.ComponentType;
    title: string;
    value: number | string;
    color: string;
    link: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color, link }) => (
    <Link to={link} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
            <Icon className="text-white text-xl" />
          </div>
        </div>
      </motion.div>
    </Link>
  );

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FaUsers}
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          color="from-blue-500 to-blue-600"
          link="/admin/users"
        />
        <StatCard
          icon={FaBox}
          title="Total Products"
          value={stats.totalProducts.toLocaleString()}
          color="from-green-500 to-green-600"
          link="/admin/products"
        />
        <StatCard
          icon={FaShoppingCart}
          title="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          color="from-yellow-500 to-yellow-600"
          link="/admin/orders"
        />
        <StatCard
          icon={FaDollarSign}
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          color="from-purple-500 to-purple-600"
          link="/admin/orders"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-[#800000] hover:text-[#5a0d15] text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">#{order.id}</p>
                    <p className="text-sm text-gray-600">{order.users?.name || 'Unknown User'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total_amount.toLocaleString()}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.order_status)}`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </motion.div>

        {/* Recent Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Products</h2>
            <Link to="/admin/products" className="text-[#800000] hover:text-[#5a0d15] text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product: any) => (
                <div key={product.id} className="flex items-center space-x-3 py-3 border-b border-gray-100 last:border-b-0">
                  <img
                    src={product.image_base64}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${product.price.toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent products</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center justify-center p-4 bg-rose-50 border-2 border-dashed border-rose-300 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <FaPlus className="text-[#800000] mr-2" />
            <span className="text-[#800000] font-medium">Add New Product</span>
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