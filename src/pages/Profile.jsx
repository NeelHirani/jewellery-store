import React from "react";
import { FaHeart, FaShoppingBag, FaMapMarkerAlt, FaUserEdit, FaSignOutAlt, FaLock } from "react-icons/fa";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-purple-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold">Welcome back, Neel!</h2>
            <p className="text-sm text-purple-100">Track your orders, wishlist, and more</p>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-purple-600 px-5 py-2 rounded-full font-medium shadow hover:bg-purple-100 transition">
            <FaUserEdit className="inline mr-2" /> Edit Profile
          </button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 p-8">
          
          {/* Profile Sidebar */}
          <div className="col-span-1 bg-purple-50 rounded-2xl p-6 text-center shadow-inner">
            <div className="relative group mx-auto w-24 h-24 mb-4">
              <div className="w-full h-full bg-purple-200 text-purple-800 text-3xl font-bold rounded-full flex items-center justify-center group-hover:scale-105 transition">
                N
              </div>
            </div>
            <h3 className="text-lg font-semibold">Neel Hirani</h3>
            <p className="text-sm text-gray-600">neel@example.com</p>
            <p className="text-sm text-gray-500 mt-2">Member since Jan 2024</p>
            <div className="mt-6 text-left">
              <p className="text-sm text-gray-700 mb-2">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-purple-500 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-purple-600">75% Complete</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-6">
            
            {/* My Orders */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-green-600">
                <FaShoppingBag className="mr-2" /> My Orders
              </h4>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
              <button className="text-sm text-purple-600 hover:underline mt-2">
                Browse Products
              </button>
            </div>

            {/* Wishlist */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-pink-600">
                <FaHeart className="mr-2" /> My Wishlist
              </h4>
              <p className="text-gray-600">Your wishlist is currently empty.</p>
              <button className="text-sm text-pink-600 hover:underline mt-2">
                Add Your Favorites
              </button>
            </div>

            {/* Saved Addresses */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-blue-600">
                <FaMapMarkerAlt className="mr-2" /> Saved Addresses
              </h4>
              <p className="text-gray-600">No address added yet.</p>
              <button className="text-sm text-blue-600 hover:underline mt-2">
                Add New Address
              </button>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 text-gray-700">Account Settings</h4>
              <div className="space-y-3">
                <button className="flex items-center text-gray-700 hover:text-purple-600">
                  <FaLock className="mr-2" /> Change Password
                </button>
                <button className="flex items-center text-gray-700 hover:text-purple-600">
                  <FaUserEdit className="mr-2" /> Manage Contact Info
                </button>
                <button className="flex items-center text-red-500 hover:underline">
                  <FaSignOutAlt className="mr-2" /> Logout
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
