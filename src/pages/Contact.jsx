import React from "react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Hero Section (fixed overlap using mt-[80px]) */}
      <section
        className="relative h-[60vh] w-full bg-cover bg-center mt-[70px]"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/2498853/pexels-photo-2498853.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-20 max-w-4xl">
          <h1 className="text-5xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-xl text-gray-800">
            We're here to help and answer any question you might have. We look forward to hearing from you.
          </p>
        </div>
      </section>

      {/* Contact & Form Section */}
      <section className="py-16 px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Contact Info */}
        <div className="text-white space-y-6">
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-gray-300 max-w-md">
            We'd love to hear from you. Whether you have a question about features, pricing,
            or anything else, our team is ready to answer all your questions.
          </p>
          <div className="space-y-3">
            <p>
              <strong>Address:</strong> 123 Elegant Street, Jaipur, Rajasthan, India
            </p>
            <p>
              <strong>Phone:</strong> +91 98765 43210
            </p>
            <p>
              <strong>Email:</strong> jewellmart@elegantjewels.com
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-xl"
        >
          <p className="text-3xl">Send us a message</p>
          <p className="text-gray-300 mb-4">All fields are required.</p>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">First Name</label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="Your Email"
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Message</label>
              <textarea
                rows="5"
                placeholder="Write your message..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 transition-colors duration-300 py-3 rounded-md font-semibold"
            >
              Submit
            </button>
          </form>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#f9fafb] py-20 px-6 md:px-16 text-gray-800">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 text-lg">
            Find quick answers to common questions. If you can't find what you're looking for, don't hesitate
            to contact us directly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            {
              question: "What are your business hours?",
              answer:
                "Our standard business hours are Monday to Friday from 9:00 AM to 7:00 PM, Saturday from 10:00 AM to 5:00 PM, and we're closed on Sundays. Hours may vary by location.",
            },
            {
              question: "How quickly can I expect a response?",
              answer:
                "We strive to respond to all inquiries within 24 hours during business days. For urgent matters, we recommend calling our support line directly.",
            },
            {
              question: "Do you offer international support?",
              answer:
                "Yes, we have offices in India, UK, and Canada, and our support team is trained to assist customers worldwide.",
            },
            {
              question: "How can I request a partnership?",
              answer:
                'For partnership inquiries, please select "Partnership Opportunities" in the contact form or email us directly at partnerships@elegantjewels.com.',
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-md p-6 text-left"
            >
              <h4 className="text-lg font-semibold text-blue-700 mb-2">{faq.question}</h4>
              <p className="text-gray-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Contact;
