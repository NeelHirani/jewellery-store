import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiShoppingCart } from "react-icons/fi"; // Changed icon
// import { HiOutlineShoppingBag } from "react-icons/hi"; // Removed old icon

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, [location]);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const linkClass = `font-medium text-sm md:text-base transition-colors duration-300 hover:text-rose-600 ${
    scrolled ? "text-gray-900" : "text-white"
  }`;

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex justify-between items-center px-6 transition-all duration-300 ${
          scrolled ? "py-2" : "py-4"
        }`}
      >
        {/* Logo */}
        <Link to="/">
          <img
            src={scrolled ? "/jewellmartb.png" : "/jewellmartw.png"}
            alt="Jewel Mart Logo"
            className="object-contain transition-all duration-300"
            style={{ height: scrolled ? "50px" : "70px" }}
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-5">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/products" className={linkClass}>Products</Link>
          <Link to="/about" className={linkClass}>About</Link>
          <Link to="/contact" className={linkClass}>Contact</Link>
          <Link to="/policies-faq" className={linkClass}>Policies & FAQ</Link>
          {!isLoggedIn && (
            <Link to="/login" className={linkClass}>Login</Link>
          )}
          <Link to="/cart" className={`${linkClass} text-xl`}>
            <FiShoppingCart />
          </Link>

          {/* Profile icon (only if logged in) */}
          {isLoggedIn && (
            <Link to="/profile" className="w-8 h-8 border-2 border-transparent hover:border-rose-700 rounded-full transition">
              <img
                src="/icon.png"
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
