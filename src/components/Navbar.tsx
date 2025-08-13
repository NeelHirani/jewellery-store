import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiShoppingCart, FiMenu, FiX, FiUser } from "react-icons/fi";


const Navbar: React.FC = () => {
  const location = useLocation();
  const isHomePage: boolean = location.pathname === "/";
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, [location]);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true); // Always solid on non-home pages
      return;
    }

    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const linkClass: string = `font-medium text-sm md:text-base transition-all duration-300 hover:underline ${
    scrolled ? "text-[#800000]" : "text-white"
  }`;

  const handleSidebarToggle = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-rose-50 shadow-md" : "bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex justify-between items-center px-6 transition-all duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        {/* Logo */}
        <Link to="/">
          <img
            src="/jewellmartb.png"
            alt="Jewel Mart Logo"
            className={`object-contain transition-all duration-300 ${scrolled ? "" : "invert"}`}
            style={{ height: "50px" }}
          />
        </Link>

        {/* Hamburger Menu for Mobile */}
        <button
          className={`md:hidden text-2xl focus:outline-none ${scrolled ? "text-[#800000]" : "text-white"}`}
          onClick={handleSidebarToggle}
        >
          {isSidebarOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-5">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/products" className={linkClass}>Products</Link>
          <Link to="/about" className={linkClass}>About Us</Link>
          <Link to="/contact" className={linkClass}>Contact</Link>
          {!isLoggedIn && <Link to="/login" className={linkClass}>Login</Link>}
          <Link to="/cart" className={`${linkClass} text-xl`}>
            <FiShoppingCart />
          </Link>
          {isLoggedIn && (
            <Link
              to="/profile" className={`${linkClass}`}>
<FiUser />
            </Link>
          )}
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full w-64 bg-rose-50 shadow-lg transform ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 md:hidden`}
        >
          <div className="flex justify-end p-4">
            <button
              className="text-2xl text-[#800000] focus:outline-none"
              onClick={handleSidebarToggle}
            >
              <FiX />
            </button>
          </div>
          <div className="flex flex-col items-center space-y-4 p-3">
            <Link
              to="/"
              className={`${linkClass} text-lg`}
              onClick={handleSidebarToggle}
            >
              Home
            </Link>
            <Link
              to="/products"
              className={`${linkClass} text-lg`}
              onClick={handleSidebarToggle}
            >
              Products
            </Link>
            <Link
              to="/about"
              className={`${linkClass} text-lg`}
              onClick={handleSidebarToggle}
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className={`${linkClass} text-lg`}
              onClick={handleSidebarToggle}
            >
              Contact
            </Link>
            {!isLoggedIn && (
              <Link
                to="/login"
                className={`${linkClass} text-lg`}
                onClick={handleSidebarToggle}
              >
                Login
              </Link>
            )}
            <Link
              to="/cart"
              className={`${linkClass} text-2xl`}
              onClick={handleSidebarToggle}
            >
              <FiShoppingCart />
            </Link>
            {isLoggedIn && (
              <Link
                to="/profile"
                className="w-10 h-10 border-2 border-transparent hover:border-rose-500 rounded-full transition"
                onClick={handleSidebarToggle}
              >
                <img
                  src="/icon.png"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;