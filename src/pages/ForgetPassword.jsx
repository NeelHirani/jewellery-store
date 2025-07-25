import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { email, password, confirmPassword } = formData;

    // Validation
    if (!email || !password || !confirmPassword) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single();

      if (fetchError || !user) {
        setError("No account found with this email.");
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ password })
        .eq("email", email);

      if (updateError) {
        setError("Failed to reset password. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Password reset successfully! Redirecting...");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
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

      {/* Reset Password box */}
      <div className="relative z-20 flex items-center justify-start min-h-screen px-6 md:px-16 mt-12">
        <motion.div
          className="w-full max-w-sm bg-white/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">Reset Your Password</h3>
          <p className="text-sm text-white mb-6">Enter your email and new password</p>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="Email"
                disabled={loading}
              />
            </div>

            {/* New Password */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="New Password"
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                placeholder="Confirm Password"
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5a0d15] text-white py-2 rounded-lg font-medium transition transform hover:scale-105 duration-300 shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <p className="text-center text-sm text-white mt-6">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-white underline hover:text-rose-200"
            >
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgetPassword;