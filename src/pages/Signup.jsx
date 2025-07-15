import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false); // New state for checkbox
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email) errs.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errs.email = "Invalid email";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6)
      errs.password = "Minimum 6 characters";
    if (formData.confirmPassword !== formData.password)
      errs.confirmPassword = "Passwords do not match";
    if (!termsAccepted) errs.terms = "You must agree to the Terms & Conditions"; // New validation

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      // Insert new user into the users table
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email,
            password: formData.password,
            created_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (error) {
        if (error.code === "23505") { // Unique constraint violation (email already exists)
          setErrors({ email: "Email already registered" });
        } else {
          setErrors({ general: "Failed to register. Please try again." });
        }
        setLoading(false);
        return;
      }

      setSuccess("Signing you in...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
      console.error(err);
    } finally {
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
          Create Your Account
        </h2>

        {errors.general && <p className="text-red-500 text-sm mb-4 text-center">{errors.general}</p>}
        {success && <p className="text-green-500 text-sm mb-4 text-center">{success}</p>}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="abc"
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="you@example.com"
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="••••••••"
              className={`w-full border rounded px-4 py-2 focus:outline-none ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={loading}
              />
              <span>I agree with Terms & Conditions</span>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-purple-600 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
