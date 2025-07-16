import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) errs.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errs.email = "Invalid email";

    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6) errs.password = "Minimum 6 characters";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, email, created_at")
        .eq("email", formData.email)
        .eq("password", formData.password)
        .single();

      if (error || !user) {
        setErrors({ general: "Invalid email or password" });
        setLoading(false);
        return;
      }

      const joinDate = format(new Date(user.created_at), "MMM yyyy");

      const userData = {
        name: user.name,
        email: user.email,
        joinDate: joinDate,
        profileCompletion: 80,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/profile");
    } catch (err) {
      console.error(err);
      setErrors({ general: "An unexpected error occurred. Please try again." });
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
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Login box on left */}
      <div className="relative z-20 flex items-center justify-start min-h-screen px-6 md:px-16 mt-12">
        <motion.div
          className="w-full max-w-sm bg-white/30 backdrop-blur-md border border-white/30 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">Welcome Back</h3>
          <p className="text-sm text-white mb-6">Sign in to continue</p>

          {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            {/* Email */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-purple-300 transition">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email"
                autoComplete="new-email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                disabled={loading}
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm -mt-3">{errors.email}</p>}

            {/* Password */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-purple-300 transition">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                disabled={loading}
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm -mt-3">{errors.password}</p>}

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/ForgetPassword" className="text-white font-semibold hover:underline">
                Forget Password
              </Link>
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2 text-sm text-white">
              <input type="checkbox" required disabled={loading} />
              <span>I agree with Terms & Conditions</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition transform hover:scale-105 duration-300 shadow-lg ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"} <FaArrowRight />
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-white mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-white underline hover:text-purple-200">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
