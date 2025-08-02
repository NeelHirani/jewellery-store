import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlus,
  FaList,
  FaEdit,
  FaGem,
  FaEnvelope
} from 'react-icons/fa';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/admin',
      exact: true
    },
    {
      title: 'Products',
      icon: FaBox,
      path: '/admin/products'
    },
    {
      title: 'Orders',
      icon: FaShoppingCart,
      path: '/admin/orders'
    },
    {
      title: 'Users',
      icon: FaUsers,
      path: '/admin/users'
    },
    {
      title: 'Reviews',
      icon: FaList,
      path: '/admin/reviews'
    },
    {
      title: 'Contacts',
      icon: FaEnvelope,
      path: '/admin/contacts'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <FaGem className="text-white text-xl" />
          </div>
          {!isCollapsed && (
            <h2 className="ml-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              JewelMart
            </h2>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.path}>
            <motion.button
              onClick={() => {
                if (item.subItems) return;
                navigate(item.path);
              }}
              className={`w-full flex items-center space-x-3 p-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                isActiveRoute(item.path, item.exact)
                  ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-r-4 border-purple-500 text-purple-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="text-xl" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.title}</span>}
            </motion.button>
            
            {/* Sub-items */}
            {item.subItems && !isCollapsed && isActiveRoute(item.path) && (
              <div className="ml-6 mt-2 space-y-1">
                {item.subItems.map((subItem) => (
                  <motion.button
                    key={subItem.path}
                    onClick={() => navigate(subItem.path)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-all duration-200 hover:bg-gray-50 ${
                      location.pathname === subItem.path
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-r-4 border-purple-500 text-purple-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <subItem.icon className="text-sm" />
                    <span>{subItem.title}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-gray-900 text-sm font-medium">Admin User</p>
              <p className="text-gray-500 text-xs">Administrator</p>
            </div>
          )}
        </div>
        <motion.button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg"
      >
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`hidden lg:block shadow-lg transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isMobileOpen ? 0 : -300 }}
        className="lg:hidden fixed left-0 top-0 h-full bg-white z-50 transition-all duration-300 w-64"
      >
        <SidebarContent />
      </motion.div>
    </>
  );
};

export default Sidebar;