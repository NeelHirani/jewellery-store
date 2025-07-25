import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLock,
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

export default function Profile({ user: propUser }) {
  const defaultUser = {
    name: "Guest",
    email: "guest@example.com",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    joinDate: "Jan 2024",
    profileCompletion: 75,
  };

  const [user, setUser] = useState(propUser || defaultUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserFromDB = async (email) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("DB fetch error:", error);
        return;
      }

      const dbUser = {
        name: data.name || "Guest",
        email: data.email,
        address: data.address || "",
        apartment: data.apartment || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        zip: data.zip || "",
        joinDate: new Date(data.created_at).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        profileCompletion:
          data.address && data.city && data.country ? 100 : 75,
      };

      setUser(dbUser);
      localStorage.setItem("user", JSON.stringify(dbUser));
    };

    const updatedAddress = location.state?.updatedAddress;
    if (updatedAddress && user.email !== "guest@example.com") {
      const updateAddress = async () => {
        const { error } = await supabase
          .from("users")
          .update(updatedAddress)
          .eq("email", user.email);

        if (error) {
          console.error("Update address error:", error);
          return;
        }

        const updatedUser = {
          ...user,
          ...updatedAddress,
          profileCompletion:
            updatedAddress.address &&
            updatedAddress.city &&
            updatedAddress.country
              ? 100
              : 75,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      };
      updateAddress();
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.email) fetchUserFromDB(parsedUser.email);
      } catch (error) {
        console.error("Parsing user error:", error);
        setUser(defaultUser);
      }
    } else if (propUser?.email) {
      fetchUserFromDB(propUser.email);
    }
  }, [propUser, location.state]);

  const avatarLetter = user.name?.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(defaultUser);
    navigate("/login");
  };

  const handleChangePassword = () => navigate("/ForgetPassword");

  const fullAddress = [
    user.address,
    user.apartment,
    user.city,
    user.state,
    user.country,
    user.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white pt-20 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose-600 to-pink-500 text-white px-6 py-8 text-center"
        >
          <h2 className="text-3xl font-serif font-bold tracking-tight">
            Welcome, <span className="capitalize">{user.name}</span>
          </h2>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-rose-50 p-6 rounded-xl text-center shadow-md"
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="bg-gradient-to-br from-rose-400 to-pink-600 text-white text-3xl font-bold rounded-full w-full h-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-105">
                {avatarLetter}
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-rose-900">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            <p className="text-xs text-gray-500 mt-2">Joined {user.joinDate}</p>

            <div className="mt-6 text-left">
              <p className="text-sm font-medium text-rose-900 mb-2">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-rose-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.profileCompletion}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
              <p className="text-xs text-rose-900 mt-1 font-medium">
                {user.profileCompletion}% Complete
              </p>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* My Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center mb-3">
                <FaShoppingBag className="mr-2 text-rose-600 text-xl" /> My Orders
              </h4>
              <p className="text-gray-600 text-sm">No orders placed yet.</p>
              <Link
                to="/products"
                className="text-sm text-rose-600 font-medium hover:text-rose-800 transition mt-3 inline-block"
              >
                Browse Products
              </Link>
            </motion.div>

            {/* Wishlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center mb-3">
                <FaHeart className="mr-2 text-rose-600 text-xl" /> My Wishlist
              </h4>
              <p className="text-gray-600 text-sm">Your wishlist is currently empty.</p>
              <button className="text-sm text-rose-600 font-medium hover:text-rose-800 transition mt-3">
                Add Your Favorites
              </button>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center mb-3">
                <FaMapMarkerAlt className="mr-2 text-rose-600 text-xl" /> Saved Address
              </h4>
              {fullAddress ? (
                <div className="text-gray-700 text-sm space-y-1">
                  {user.address && <p>{user.address}</p>}
                  {user.apartment && <p>{user.apartment}</p>}
                  <p>{[user.city, user.state].filter(Boolean).join(", ")}</p>
                  <p>{[user.country, user.zip].filter(Boolean).join(" ")}</p>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No address added yet.</p>
              )}
              <Link
                to="/EditAddress"
                className="text-sm text-rose-600 font-medium hover:text-rose-800 transition mt-3 inline-block"
              >
                {fullAddress ? "Edit Address" : "Add Address"}
              </Link>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 mb-3">
                Account Settings
              </h4>
              <div className="space-y-3">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center text-gray-700 hover:text-rose-600 transition text-sm font-medium"
                >
                  <FaLock className="mr-2 text-rose-600 text-lg" /> Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-rose-600 hover:text-rose-800 transition text-sm font-medium"
                >
                  <FaSignOutAlt className="mr-2 text-rose-600 text-lg" /> Logout
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
