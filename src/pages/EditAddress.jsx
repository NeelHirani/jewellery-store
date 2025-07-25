import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaBuilding, FaCity, FaGlobe, FaMailBulk } from "react-icons/fa";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

export default function EditAddress() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setForm({
          address: user.address || "",
          apartment: user.apartment || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          zip: user.zip || "",
        });
        setEmail(user.email);
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.address.trim()) {
      setError("Address cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update(form)
        .eq("email", email);

      if (updateError) {
        console.error("Supabase error:", updateError);
        setError("Failed to update address.");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Address updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background image */}
      <img
        src="https://plus.unsplash.com/premium_photo-1661645473770-90d750452fa0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Jewelry"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10" />

      {/* Edit Address box */}
      <div className="relative z-20 flex items-center justify-start min-h-screen px-6 md:px-16 mt-12">
        <motion.div
          className="w-full max-w-sm bg-white/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">Edit Your Address</h3>
          <p className="text-sm text-white mb-6">Update your address details</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

          <form onSubmit={handleSave} className="space-y-5" autoComplete="off">
            {/* Address */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="123 Main Street"
                disabled={loading}
              />
            </div>

            {/* Apartment */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaBuilding className="text-gray-400 mr-2" />
              <input
                type="text"
                name="apartment"
                value={form.apartment}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="Apt 1B"
                disabled={loading}
              />
            </div>

            {/* City */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaCity className="text-gray-400 mr-2" />
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="City"
                disabled={loading}
              />
            </div>

            {/* State */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="State or Province"
                disabled={loading}
              />
            </div>

            {/* Country */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaGlobe className="text-gray-400 mr-2" />
              <input
                type="text"
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="Country"
                disabled={loading}
              />
            </div>

            {/* ZIP */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaMailBulk className="text-gray-400 mr-2" />
              <input
                type="text"
                name="zip"
                value={form.zip}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="ZIP Code"
                disabled={loading}
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm font-medium text-gray-800 transition transform hover:scale-105 duration-300 shadow-lg"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className={`px-6 py-2 rounded bg-[#800000] text-white font-semibold hover:bg-[#5a0d15] transition transform hover:scale-105 duration-300 shadow-lg ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}