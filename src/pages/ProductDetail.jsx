import React from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import sampleProducts from "../pages/ProductData"; // ✅ Correct import

export default function ProductDetail() {
  const { id } = useParams();
  const product = sampleProducts.find((p) => p.id === parseInt(id)); // ✅ Correct usage

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-28 pb-10 px-6 md:px-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-10"
      >
        {/* Product Image */}
        <div className="flex-1 flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-md rounded-xl shadow-xl object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 space-y-5">
          <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-xl text-gray-700">Category: {product.category}</p>
          <p className="text-2xl text-green-600 font-semibold">₹{product.price}</p>
          <p className="text-gray-600">
            This beautiful piece is perfect for any special occasion. Crafted with care and attention to detail.
          </p>

          <button className="mt-4 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition">
            Add to Cart
          </button>

          <Link to="/" className="text-blue-500 text-sm hover:underline block mt-4">
            ← Back to Products
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
