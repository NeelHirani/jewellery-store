import React from "react";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const Contact = () => {
  return (
    <div className="bg-white min-h-screen text-gray-900 pt-[70px]">
      {/* Hero Section */}
      <section
        className="relative h-[60vh] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1617042375877-7b43c0a3e1b0?auto=format&fit=crop&w=1600&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-20 text-white">
          <h1 className="text-5xl font-bold mb-4">Let’s Connect</h1>
          <p className="text-lg max-w-xl">
            Reach out to our team for orders, questions, collaborations, or custom designs. We're happy to help!
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 py-20 px-6 md:px-16 items-start">
        {/* Info Column */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-purple-700">Visit Our Showroom</h2>
          <p className="text-gray-600">
            Our flagship store in Jaipur welcomes walk-ins. Drop by to explore our luxury collections or consult with a designer.
          </p>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="text-purple-600 mt-1" />
              <span>123 Royal Lane, Pink City, Jaipur, Rajasthan, India</span>
            </div>
            <div className="flex items-start space-x-3">
              <FaPhoneAlt className="text-purple-600 mt-1" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-purple-600 mt-1" />
              <span>support@jewellmart.com</span>
            </div>
          </div>

          {/* Embedded Google Map */}
          <div className="mt-6">
            <iframe
              title="Jewel Mart Map"
              className="rounded-xl w-full h-64 border-none"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.8167337082263!2d75.7873!3d26.9124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396db41c7f4ec1f5%3A0x93be5e80c7e5d8!2sJaipur!5e0!3m2!1sen!2sin!4v1683111980911!5m2!1sen!2sin"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 space-y-6"
        >
          <h3 className="text-2xl font-semibold text-purple-700">Send us a Message</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="bg-gray-100 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              className="bg-gray-100 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <textarea
            rows="5"
            placeholder="Your Message"
            className="w-full bg-gray-100 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          ></textarea>
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-md transition duration-300"
          >
            Submit
          </button>
        </motion.form>
      </section>
    </div>
  );
};

export default Contact;
