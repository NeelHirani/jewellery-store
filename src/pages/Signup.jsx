import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;

    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.email) errs.email = "Email is required";
    else if (!emailRegex.test(formData.email)) errs.email = "Invalid email";
    if (!formData.phone) errs.phone = "Phone number is required";
    else if (!phoneRegex.test(formData.phone)) errs.phone = "Invalid phone number";
    if (!formData.address) errs.address = "Address is required";
    if (!formData.password) errs.password = "Password is required";
    else if (formData.password.length < 6) errs.password = "Minimum 6 characters";
    if (!formData.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (formData.confirmPassword !== formData.password) errs.confirmPassword = "Passwords do not match";
    if (!termsAccepted) errs.terms = "You must agree to the Terms & Conditions";

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
      const { data, error } = await supabase.from("users").insert([
        {
          name: formData.name.trim(),
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        if (error.code === "23505") setErrors({ email: "Email already registered" });
        else setErrors({ general: `Failed to register: ${error.message}` });
        setLoading(false);
        return;
      }

      setSuccess("Signing you in...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setErrors({ general: `Unexpected error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      <img
        src="https://plus.unsplash.com/premium_photo-1661645473770-90d750452fa0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Jewelry"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/30 z-10" />

      <div className="relative z-20 flex items-center justify-start min-h-screen px-6 md:px-16 mt-12">
        <motion.div
          className="w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-2xl font-bold text-white mb-1">Create Account</h3>
          <p className="text-sm text-white mb-6">Fill the details to register</p>

          {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[{
              icon: <FaUser className="text-gray-300 mr-2" />,
              type: "text",
              placeholder: "Full Name",
              key: "name",
            }, {
              icon: <FaEnvelope className="text-gray-300 mr-2" />,
              type: "email",
              placeholder: "Email",
              key: "email",
            }, {
              icon: <FaPhone className="text-gray-300 mr-2" />,
              type: "tel",
              placeholder: "Phone",
              key: "phone",
            }, {
              icon: <FaMapMarkerAlt className="text-gray-300 mr-2" />,
              type: "text",
              placeholder: "Address",
              key: "address",
            }, {
              icon: <FaLock className="text-gray-300 mr-2" />,
              type: "password",
              placeholder: "Password",
              key: "password",
            }, {
              icon: <FaLock className="text-gray-300 mr-2" />,
              type: "password",
              placeholder: "Confirm Password",
              key: "confirmPassword",
            }].map(({ icon, type, placeholder, key }) => (
              <div key={key}>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 ring-[#800000] transition">
                  {icon}
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-300"
                    disabled={loading}
                  />
                </div>
                {errors[key] && <p className="text-red-500 text-sm -mt-2">{errors[key]}</p>}
              </div>
            ))}

            <div className="flex items-center space-x-2 text-sm text-white">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span>I agree with Terms & Conditions</span>
            </div>
            {errors.terms && <p className="text-red-500 text-sm -mt-2">{errors.terms}</p>}

            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-2 bg-[#800000] hover:bg-[#5a0d15] text-white py-2 rounded-lg font-medium transition transform hover:scale-105 duration-300 shadow-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"} <FaArrowRight />
            </button>
          </form>

          <p className="text-center text-sm text-white mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-white underline hover:text-rose-200">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;