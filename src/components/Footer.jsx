import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
} from "react-icons/fa";
import { IoGlobeOutline } from "react-icons/io5";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-8 md:px-16 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-x-16 gap-y-10">
        {/* Company Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/policies" className="hover:underline">Policies</Link></li>
            <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
          </ul>
        </div>

        {/* Help Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Help</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:underline">Track Order</a></li>
            <li><a href="#" className="hover:underline">Shipping Info</a></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
          <p className="text-sm mb-3">Subscribe for updates & offers</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-l-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
            <button className="bg-purple-600 px-5 py-2 rounded-r-md hover:bg-purple-700">
              Subscribe
            </button>
          </div>
        </div>

        {/* Social & Payment */}
        <div className="flex flex-col justify-between h-full space-y-6 items-end text-right">
          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4 text-xl">
              <FaFacebookF className="hover:text-purple-400 cursor-pointer" />
              <FaTwitter className="hover:text-purple-400 cursor-pointer" />
              <FaInstagram className="hover:text-purple-400 cursor-pointer" />
            </div>
          </div>

          {/* Payment Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3">We Accept</h3>
            <div className="flex space-x-4 text-2xl">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcPaypal />
            </div>
          </div>

          {/* Language & Currency */}
          <div className="flex items-center space-x-3">
            <IoGlobeOutline className="text-xl" />
            <select className="bg-gray-800 px-3 py-1 rounded text-white">
              <option>EN / USD</option>
              <option>FR / EUR</option>
              <option>IN / INR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-sm mt-12 border-t border-gray-700 pt-6">
        © {new Date().getFullYear()} Jewel Mart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
