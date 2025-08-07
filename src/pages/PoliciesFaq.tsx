import React from "react";
import { motion } from "framer-motion";

const policies = [
  {
    title: "Return & Exchange Policy",
    content:
      "You may return or exchange items within 7 days of delivery. Products must be unused, in original packaging, and accompanied by a receipt.",
  },
  {
    title: "Shipping Policy",
    content:
      "We offer free standard shipping on orders above $200. All items are dispatched within 2-3 business days and delivered within 5-7 days.",
  },
  {
    title: "Privacy Policy",
    content:
      "We respect your privacy. Personal details are used only to process orders and enhance user experience. We never sell your data.",
  },
  {
    title: "Payment Methods",
    content:
      "We accept all major debit/credit cards, UPI, Netbanking, and Cash on Delivery (COD) in select locations.",
  },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking number via email or SMS to monitor your package in real-time.",
  },
  {
    question: "Can I cancel my order?",
    answer:
      "Yes, you can cancel your order before it is shipped. Once dispatched, cancellation is not possible, but you may request a return.",
  },
  {
    question: "Is my payment secure?",
    answer:
      "Absolutely. We use SSL encryption and trusted payment gateways to ensure your data is safe and secure.",
  },
  {
    question: "Do you provide custom jewelry?",
    answer:
      "Yes! We offer customization services. Contact our support team or visit the 'Contact' page for more info.",
  },
];

const PoliciesFaq: React.FC = () => {
  return (
    <div className="bg-white text-gray-800 px-6 md:px-16 py-20">
      {/* Policies Section */}
      <motion.div
        className="max-w-5xl mx-auto mb-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-rose-900 mb-8 text-center">Store Policies</h2>
        <div className="space-y-8">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-rose-50 border-l-4 border-rose-800 p-5 rounded-lg shadow-sm"
            >
              <h4 className="text-xl font-semibold text-rose-900 mb-2">{policy.title}</h4>
              <p className="text-gray-700">{policy.content}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-rose-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-8">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-5 border border-rose-200 rounded-lg bg-rose-50 shadow-sm"
            >
              <h4 className="text-lg font-semibold text-rose-900 mb-2">{faq.question}</h4>
              <p className="text-gray-700">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PoliciesFaq;
