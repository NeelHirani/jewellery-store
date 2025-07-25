import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import ScrollToTop from './components/ScrollToTop';
import Layout from './Layout'; // New layout component

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import ForgetPassword from './pages/ForgetPassword';
import PoliciesFaq from './pages/PoliciesFaq';
import EditAddress from './pages/EditAddress';

// Admin Pages
import AdminLogin from './admin/Login';
import AdminRoute from './admin/AdminRoute';
import Dashboard from './admin/Dashboard';
import ProductList from './admin/ProductList';
import ProductForm from './admin/ProductForm';
import EditProduct from './admin/EditProduct';
import OrderManagement from './admin/OrderManagement';
import UserManagement from './admin/UserManagement';

library.add(fas);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><ProductList /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><ProductForm /></AdminRoute>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />

        {/* Public Routes with layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="policies-faq" element={<PoliciesFaq />} />
          <Route path="ForgetPassword" element={<ForgetPassword />} />
          <Route path="EditAddress" element={<EditAddress />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
