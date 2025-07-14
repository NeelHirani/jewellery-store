import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

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

  const linkClass = `font-medium text-sm md:text-base transition-colors duration-300 ${
    scrolled ? "text-black" : "text-white"
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
        <div className="flex items-center space-x-6">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/products" className={linkClass}>Products</Link>
          <Link to="/about" className={linkClass}>About</Link>
          <Link to="/contact" className={linkClass}>Contact</Link>
          <Link to="/login" className={linkClass}>Login</Link>
          <Link to="/cart" className={`${linkClass} text-xl`}>🛒</Link>
          <Link to="/profile" className={linkClass}>Profile</Link>
        </div>
      </div>
    </nav>
  );
}
