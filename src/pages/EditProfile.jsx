import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Check authentication and fetch user data
  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          console.error("Supabase auth error:", authError?.message || "No authenticated user");
          setErrors({ general: "Please log in to edit your profile" });
          setIsAuthenticated(false);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        setIsAuthenticated(true);
        const userId = authData.user.id;
        const { data, error } = await supabase
          .from("editprofile")
          .select("name, email, phone, address")
          .eq("id", userId)
          .single();

        if (error && error.code !== "PGRST116") { // PGRST116: No rows found
          console.error("Error fetching user data:", error.message);
          setErrors({ general: "Failed to load profile data" });
          return;
        }

        if (data) {
          setFormData({
            name: data.name || "",
            email: data.email || authData.user.email || "",
            phone: data.phone || "",
            address: data.address || "",
          });
        } else {
          setFormData({
            name: "",
            email: authData.user.email || "",
            phone: "",
            address: "",
          });
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setErrors({ general: "An unexpected error occurred" });
        setIsAuthenticated(false);
      }
    };

    checkAuthAndFetchData();
  }, [navigate]);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email) errs.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errs.email = "Invalid email";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.address.trim()) errs.address = "Address is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    if (!isAuthenticated) {
      setErrors({ general: "Please log in to save changes" });
      setTimeout(() => navigate("/login"), 2000);
      setLoading(false);
      return;
    }

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Supabase auth error on submit:", authError?.message || "No authenticated user");
        setErrors({ general: "Please log in to save changes" });
        setTimeout(() => navigate("/login"), 2000);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      const { error } = await supabase
        .from("editprofile")
        .upsert({
          id: userId,
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: ["id"] });

      if (error) {
        if (error.code === "23505") {
          setErrors({ email: "Email already registered" });
        } else {
          console.error("Error updating editprofile:", error.message);
          setErrors({ general: "Failed to update profile. Please try again." });
        }
        setLoading(false);
        return;
      }

      // Update localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: userId,
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone.trim(),
          address: formData.address.trim(),
        })
      );

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        navigate("/Profile");
      }, 1000);
    } catch (err) {
      console.error("Unexpected error in handleSubmit:", err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-purple-50 px-4 pt-16">
      <motion.div
        className="bg-white p-8 shadow-xl rounded-2xl w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">
          Edit Your Profile
        </h2>

        {errors.general && (
          <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>
        )}
        {success && (
          <p className="text-green-500 text-sm mb-4 text-center">{success}</p>
        )}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="abc"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || isAuthenticated === false}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || isAuthenticated === false}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-medium mb-1">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0123456789"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || isAuthenticated === false}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block font-medium mb-1">Address</label>
            <textarea
              id="address"
              name="address"
              required
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="123 Main St, City, Country"
              value={formData.address}
              onChange={handleChange}
              rows="4"
              disabled={loading || isAuthenticated === false}
            />
            {errors.address && (
              <p className="text-red-500 text-sm">{errors.address}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition ${
              loading || isAuthenticated === false ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={loading || isAuthenticated === false}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfile;