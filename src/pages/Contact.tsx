import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPaperPlane
} from "react-icons/fa";
import { supabase } from "../lib/supabase";

const Contact: React.FC = () => {
  // Form state
  interface FormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: ""
  });

  interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }

  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<any>(null); // 'success', 'error', or null
  const [expandedFaq, setExpandedFaq] = useState<any>(null);

  // FAQ data
  const faqData = [
    {
      id: 1,
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all jewelry items in their original condition. Custom orders are non-returnable unless there's a manufacturing defect."
    },
    {
      id: 2,
      question: "Do you offer custom jewelry design?",
      answer: "Yes! We specialize in custom jewelry design. Contact us with your ideas, and our expert craftsmen will work with you to create your perfect piece."
    },
    {
      id: 3,
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days within India. Express shipping is available for 1-2 business days. International shipping takes 7-14 business days."
    },
    {
      id: 4,
      question: "Do you provide certificates for precious stones?",
      answer: "Yes, all our precious stones come with authentic certificates from recognized gemological institutes."
    },
    {
      id: 5,
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, UPI, net banking, and cash on delivery for orders within India."
    }
  ];

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Insert contact form submission into Supabase
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim() || null,
            subject: formData.subject,
            message: formData.message.trim(),
            created_at: new Date().toISOString(),
            status: 'new'
          }
        ]);

      if (error) {
        throw error;
      }

      // Success
      setSubmitStatus('success');
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "General Inquiry",
        message: ""
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);

    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');

      // Hide error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Toggle FAQ expansion
  const toggleFaq = (faqId): void => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-white"
        style={{ backgroundImage: `url('https://t4.ftcdn.net/jpg/03/15/75/73/240_F_315757330_Zkush37QibcEPWsmqZaEed67sO1lNrJm.jpg')` }}
      >
        <div className="bg-black/50 absolute inset-0 z-0"></div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto px-4">
            Jewel Mart is here to provide the perfect solution for all your jewelry needs
          </p>
        </motion.div>
      </div>

      {/* Main Contact Section */}
      <div className="bg-white shadow-lg rounded-xl mx-auto max-w-6xl mt-[-80px] relative z-20 p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Get in Touch</h2>
              <p className="text-gray-600 mb-6">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-[#800000] text-white p-3 rounded-lg">
                  <FaMapMarkerAlt className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Head Office</h4>
                  <p className="text-gray-600">
                    Jewel Tower, Ring Road<br />
                    Nikol, Ahmedabad, Gujarat 382350<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#800000] text-white p-3 rounded-lg">
                  <FaEnvelope className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Email Us</h4>
                  <p className="text-gray-600">
                    <a href="mailto:support@jewelmart.com" className="hover:text-[#800000] transition-colors">
                      support@jewelmart.com
                    </a><br />
                    <a href="mailto:sales@jewelmart.com" className="hover:text-[#800000] transition-colors">
                      sales@jewelmart.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#800000] text-white p-3 rounded-lg">
                  <FaPhone className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Call Us</h4>
                  <p className="text-gray-600">
                    <a href="tel:+919876543210" className="hover:text-[#800000] transition-colors">
                      +91 98765 43210
                    </a><br />
                    <span className="text-sm text-gray-500">Fax: +91 22334 55667</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-[#800000] text-white p-3 rounded-lg">
                  <FaClock className="text-lg" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Business Hours</h4>
                  <p className="text-gray-600">
                    Monday - Saturday: 10:00 AM - 8:00 PM<br />
                    Sunday: 11:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media s */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                {[
                  { icon: FaFacebookF, href: "#", label: "Facebook" },
                  { icon: FaTwitter, href: "#", label: "Twitter" },
                  { icon: FaInstagram, href: "#", label: "Instagram" },
                  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" }
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="bg-gray-100 hover:bg-[#800000] text-gray-600 hover:text-white p-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                    aria-label={label}
                  >
                    <Icon className="text-lg" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gray-50 p-6 rounded-xl"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h2>

            {/* Status Messages */}
            <AnimatePresence>
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                    submitStatus === 'success'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  {submitStatus === 'success' ? (
                    <FaCheckCircle className="text-green-600" />
                  ) : (
                    <FaExclamationTriangle className="text-red-600" />
                  )}
                  <span>
                    {submitStatus === 'success'
                      ? 'Thank you! Your message has been sent successfully. We\'ll get back to you soon.'
                      : 'Sorry, there was an error sending your message. Please try again or contact us directly.'
                    }
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Your full name"
                    disabled={loading}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="your.email@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                    disabled={loading}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject / Inquiry Type
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Product Question">Product Question</option>
                  <option value="Custom Order">Custom Order</option>
                  <option value="Support">Support</option>
                  <option value="Complaint">Complaint</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>

              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all resize-vertical ${
                    errors.message ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your inquiry in detail..."
                  disabled={loading}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] hover:bg-[#660000] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="max-w-4xl mx-auto mt-16 px-4"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">
            Find quick answers to common questions about our jewelry and services.
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq: any) => (
            <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <FaChevronUp className="text-[#800000]" />
                ) : (
                  <FaChevronDown className="text-gray-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Google Map */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Visit Our Store</h2>
          <p className="text-gray-600">
            Come and explore our exquisite collection in person at our showroom.
          </p>
        </div>
        <iframe
          title="Jewel Mart Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.0859842266984!2d72.64968337517822!3d23.09583457912218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e870af09e08d1%3A0xf2b25e38576c4918!2sNikol%2C%20Ahmedabad!5e0!3m2!1sen!2sin!4v1699982344230!5m2!1sen!2sin"
          width="100%"
          height="400"
          allowFullScreen={true}
          loading="lazy"
          className="border-0 w-full rounded-lg shadow-lg"
        ></iframe>
      </motion.div>
    </div>
  );
};

export default Contact;
