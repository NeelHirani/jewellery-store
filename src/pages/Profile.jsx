import React from "react";

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-600 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Neel!</h2>
            <p className="text-sm text-purple-100">Track your orders, wishlist, and more</p>
          </div>
          <button className="mt-4 md:mt-0 bg-white text-purple-600 px-4 py-2 rounded hover:bg-purple-100 transition">
            Edit Profile
          </button>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 p-8">
          {/* Left Sidebar */}
          <div className="col-span-1 bg-gray-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold bg-purple-200 text-purple-800 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
              N
            </div>
            <h3 className="text-lg font-semibold">Neel Hirani</h3>
            <p className="text-sm text-gray-600">neel@example.com</p>
            <p className="text-sm text-gray-500 mt-2">Member since Jan 2024</p>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-6">
            {/* My Orders */}
            <div>
              <h4 className="text-xl font-semibold mb-3">My Orders</h4>
              <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
                <p className="text-gray-600">You haven't placed any orders yet.</p>
                <button className="text-sm text-purple-600 hover:underline">
                  Browse Products
                </button>
              </div>
            </div>

            {/* Wishlist */}
            <div>
              <h4 className="text-xl font-semibold mb-3">My Wishlist</h4>
              <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
                <p className="text-gray-600">Your wishlist is currently empty.</p>
                <button className="text-sm text-purple-600 hover:underline">
                  Add Your Favorites
                </button>
              </div>
            </div>

            {/* Saved Addresses */}
            <div>
              <h4 className="text-xl font-semibold mb-3">Saved Addresses</h4>
              <div className="border rounded-lg p-4 space-y-2 bg-white shadow-sm">
                <p className="text-gray-600">No address added yet.</p>
                <button className="text-sm text-purple-600 hover:underline">
                  Add New Address
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div>
              <h4 className="text-xl font-semibold mb-3">Account Settings</h4>
              <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm">
                <button className="block text-left w-full text-sm text-gray-700 hover:text-purple-600">
                  Change Password
                </button>
                <button className="block text-left w-full text-sm text-gray-700 hover:text-purple-600">
                  Manage Contact Info
                </button>
                <button className="block text-left w-full text-sm text-red-500 hover:underline">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
