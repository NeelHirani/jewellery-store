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
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error) {
          console.error("Error fetching user from DB:", error);
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
          profileCompletion: data.address && data.city && data.country ? 100 : 75,
        };

        setUser(dbUser);
        localStorage.setItem("user", JSON.stringify(dbUser));
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    // Check for address update from EditAddress page
    const updatedAddress = location.state?.updatedAddress;
    if (updatedAddress && user.email !== "guest@example.com") {
      const updateAddress = async () => {
        try {
          const { error } = await supabase
            .from("users")
            .update({
              address: updatedAddress.address,
              apartment: updatedAddress.apartment,
              city: updatedAddress.city,
              state: updatedAddress.state,
              country: updatedAddress.country,
              zip: updatedAddress.zip,
            })
            .eq("email", user.email);

          if (error) {
            console.error("Error updating address:", error);
            return;
          }

          const updatedUser = {
            ...user,
            ...updatedAddress,
            profileCompletion: updatedAddress.address && updatedAddress.city && updatedAddress.country ? 100 : 75,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Error updating address:", err);
        }
      };
      updateAddress();
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.email) {
          fetchUserFromDB(parsedUser.email);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
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

  const handleChangePassword = () => {
    navigate("/ForgetPassword");
  };

  // Format full address for display
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-black-300">
        {/* Banner */}
        <div className="bg-red-700 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold">Welcome back, {user.name}.</h2>
          </div>
        </div>

        {/* Profile Section */}
        <div className="grid md:grid-cols-3 gap-6 p-8">
          {/* Left Column */}
          <div className="col-span-1 bg-rose-100 rounded-2xl p-6 text-center shadow-inner">
            <div className="relative group mx-auto w-24 h-24 mb-4">
              <div className="w-full h-full bg-yellow-200 text-[#8b001f] text-3xl font-bold rounded-full flex items-center justify-center group-hover:scale-105 transition">
                {avatarLetter}
              </div>
            </div>
            <h3 className="text-lg font-semibold">{user.name}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-500 mt-2">Member since {user.joinDate}</p>

            <div className="mt-6 text-left">
              <p className="text-sm text-gray-700 mb-2">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-[#c4002d] h-2 rounded-full"
                  style={{ width: `${user.profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-xs text-[#c4002d]">{user.profileCompletion}% Complete</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-2 space-y-6">
            {/* Orders */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-[#c4002d]">
                <FaShoppingBag className="mr-2" /> My Orders
              </h4>
              <p className="text-gray-600">You haven't placed any orders yet.</p>
              <Link to="/products" className="text-sm text-[#c4002d] hover:underline mt-2 inline-block">
                Browse Products
              </Link>
            </div>

            {/* Wishlist */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-[#c4002d]">
                <FaHeart className="mr-2" /> My Wishlist
              </h4>
              <p className="text-gray-600">Your wishlist is currently empty.</p>
              <Link to="/products" className="text-sm text-[#c4002d] hover:underline mt-2 inline-block">
                Add Your Favorites
              </Link>
            </div>

            {/* Address */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 flex items-center text-[#c4002d]">
                <FaMapMarkerAlt className="mr-2" /> Saved Addresses
              </h4>
              {fullAddress ? (
                <div className="text-gray-700 space-y-1">
                  <p>{user.address}</p>
                  {user.apartment && <p>{user.apartment}</p>}
                  <p>{[user.city, user.state].filter(Boolean).join(", ")}</p>
                  <p>{[user.country, user.zip].filter(Boolean).join(" ")}</p>
                </div>
              ) : (
                <p className="text-gray-600">No address available.</p>
              )}
              <Link
                to="/EditAddress"
                className="text-sm text-[#c4002d] hover:underline mt-2 inline-block"
              >
                {fullAddress ? "Edit Address" : "Add New Address"}
              </Link>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition">
              <h4 className="text-xl font-semibold mb-3 text-gray-700">Account Settings</h4>
              <div className="space-y-3">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center text-gray-700 hover:text-[#c4002d]"
                >
                  <FaLock className="mr-2" /> Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-[#c4002d] hover:underline"
                >
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