import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";

const ForgetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<any>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
    <div className="flex items-center justify-center min-h-screen bg-rose-50 px-4 pt-16">
      <motion.div
        className="bg-white p-8 shadow-xl rounded-2xl w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-center text-[#800000] mb-6">
          Reset Your Password
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#800000] ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={`w-full bg-[#800000] hover:bg-[#5a0d15] text-white py-2 rounded-lg font-semibold transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-[#800000] hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgetPassword;
