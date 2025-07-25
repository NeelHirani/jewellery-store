import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminRoute = ({ children }) => {
  // Check if admin is logged in
  const adminUser = localStorage.getItem('adminUser');
  
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AdminRoute;
