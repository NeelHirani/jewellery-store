import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGem, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { authService } from '../lib/auth';
import { config } from '../lib/config';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  useEffect(() => {
    // Check if admin is already authenticated
    if (authService.isAuthenticated()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear previous errors and attempts
    setErrors({});
    setRemainingAttempts(null);
    setLoading(true);

    try {
      // Use secure authentication service
      const authResult = await authService.authenticateAdmin(formData.email, formData.password);

      if (authResult.success && authResult.user) {
        // Navigate to admin dashboard on successful authentication
        navigate('/admin');
      } else {
        // Handle authentication failure
        setErrors({ general: authResult.error || 'Authentication failed' });

        // Show remaining attempts if available
        if (typeof authResult.remainingAttempts === 'number') {
          setRemainingAttempts(authResult.remainingAttempts);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ general: 'Authentication service unavailable. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#800000] to-[#5a0d15] rounded-xl flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-white text-2xl" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#800000] to-[#5a0d15] bg-clip-text text-transparent font-playfair">
              Secure Admin Access
            </h2>
            <p className="text-gray-600 mt-2 font-inter">Protected administrative dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center text-red-700"
              >
                <FaShieldAlt className="mr-2" />
                {errors.general}
                {remainingAttempts !== null && remainingAttempts > 0 && (
                  <span className="ml-2 text-sm">({remainingAttempts} attempts remaining)</span>
                )}
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent font-inter"
                  placeholder="Enter admin email"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent font-inter"
                  placeholder="Enter admin password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#800000] to-[#5a0d15] text-white font-medium rounded-lg hover:from-[#5a0d15] hover:to-[#800000] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap font-inter"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gradient-to-r from-[#800000]/10 to-rose-50 rounded-lg border border-[#800000]/20">
            <div className="flex items-center justify-center text-[#800000] mb-2">
              <FaShieldAlt className="mr-2" />
              <p className="text-sm font-medium font-inter">Secure Authentication</p>
            </div>
            <p className="text-xs text-gray-600 text-center font-inter">
              This admin panel is protected with enterprise-grade security.
              Unauthorized access attempts are monitored and logged.
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm font-inter">
              © {new Date().getFullYear()} {config.getAppConfig().name} Admin Panel. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;