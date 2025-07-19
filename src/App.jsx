import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
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
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
<<<<<<< HEAD
import EditProfile from '../src/pages/EditProfile';
library.add(fas);
=======
import EditAddress from './pages/EditAddress'
>>>>>>> dae909edd4020ed4f6a7902350c5985e0b88bbd9

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/policies-faq" element={<PoliciesFaq />} />
            <Route path="/ForgetPassword" element={<ForgetPassword />} />
            <Route path="/EditAddress" element={<EditAddress />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
