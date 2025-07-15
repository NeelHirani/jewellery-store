import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      localStorage.setItem("email", formData.email);
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Left Section with animated gradient */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 animate-pulse flex flex-col justify-center items-center text-white p-10 relative overflow-hidden">
        <div className="backdrop-blur-md bg-black/40 p-8 rounded-xl shadow-2xl text-center z-10">
          <h2 className="text-4xl font-bold mb-3 font-serif tracking-wide">Welcome to <span className="italic">Jewel Mart</span></h2>
          <p className="text-sm text-gray-200">Unlock your elegance. Sign in to shine ✨</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 bg-gradient-to-b from-purple-100 to-white flex items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-sm bg-white/60 backdrop-blur-lg border border-purple-100 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-purple-700 mb-1">Welcome Back</h3>
          <p className="text-sm text-gray-600 mb-6">Sign in to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 transition-all focus-within:ring-2 ring-purple-300">
              <FaUser className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm -mt-3">{errors.email}</p>}

            {/* Password */}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 transition-all focus-within:ring-2 ring-purple-300">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm -mt-3">{errors.password}</p>}

            <div className="text-right">
              <Link to="#" className="text-sm text-purple-600 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <input type="checkbox" required />
              <span>I agree with Terms & Conditions</span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition transform hover:scale-105 duration-300 shadow-lg"
            >
              Login <FaArrowRight />
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-purple-600 font-semibold hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
