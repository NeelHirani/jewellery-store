import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminRoute = ({ children }) => {
  // Check if admin is logged in
  const adminUser = localStorage.getItem('adminUser');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup on unmount or state change
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileOpen]);

  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <div className={`flex-1 ${isMobileOpen ? 'overflow-hidden' : 'overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
};

export default AdminRoute;