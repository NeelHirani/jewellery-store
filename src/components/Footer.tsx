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

const Footer: React.FC = () => {
  return (
    <footer className="bg-blue-900 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-rose-400">Company</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/about" className="hover:underline transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:underline transition-colors">Contact</Link></li>
            <li><Link to="/policies-faq" className="hover:underline transition-colors">Policies & FAQ</Link></li>
          </ul>
        </div>

        {/* Help Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-rose-400">Help</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><a href="#" className="hover:underline transition-colors">Track Order</a></li>
            <li><a href="#" className="hover:underline transition-colors">Shipping Info</a></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-rose-400">Newsletter</h3>
          <p className="text-sm text-slate-300 mb-3">Subscribe for updates & offers</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-l-md bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <button className="bg-rose-600 px-5 py-2 rounded-r-md hover:bg-rose-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Social + Payment + Language */}
        <div className="flex flex-col space-y-6 items-end text-right">
          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-rose-400">Follow Us</h3>
            <div className="flex justify-end space-x-4 text-xl text-slate-300">
              <FaFacebookF className="hover:scale-110 cursor-pointer transition-transform" />
              <FaTwitter className="hover:scale-110 cursor-pointer transition-transform" />
              <FaInstagram className="hover:scale-110 cursor-pointer transition-transform" />
            </div>
          </div>

          {/* Payment Icons */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-rose-400">We Accept</h3>
            <div className="flex justify-end space-x-4 text-2xl text-slate-300">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcPaypal />
            </div>
          </div>

          {/* Language & Currency */}
          <div className="flex items-center space-x-3 justify-end">
            <IoGlobeOutline className="text-xl text-slate-300" />
            <select className="bg-slate-800 px-3 py-1 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400">
              <option>EN / USD</option>
              <option>FR / EUR</option>
              <option>IN / INR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Note */}
      <div className="text-center text-sm text-slate-400 mt-10 border-t border-slate-700 pt-6">
        © {new Date().getFullYear()} Jewel Mart. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
