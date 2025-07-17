import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const slideData = [
    {
      image: "/images/hero1.jpg",
      heading: "Up to 50% Off On Gold & Diamond Jewelry",
      description: "Discover Elegance with Every Piece",
    },
    {
      image: "/images/hero2.jpg",
      heading: "Sparkle More, Spend Less",
      description: "Unwrap Luxury at Unbeatable Prices",
    },
    {
      image: "/images/hero4.jpg",
      heading: "Timeless Treasures Await",
      description: "Curated Collections Just for You",
    },
  ];

  const dealsData = [
    { image: "/images/deals/bangles.jpg", title: "Gold Bangles", price: "₹12,499" },
    { image: "/images/deals/earrings.jpg", title: "Diamond Earrings", price: "₹4,999" },
    { image: "/images/deals/pendants.jpg", title: "Classic Pendant", price: "₹8,999" },
  ];

  const categories = [
    { title: "Bangles", image: "/images/categories/bangles.jpg" },
    { title: "Earrings", image: "/images/categories/earrings.jpg" },
    { title: "Necklace", image: "/images/categories/necklace.jpg" },
    { title: "Rings", image: "/images/categories/rings.jpg" },
    { title: "Bracelets", image: "/images/categories/bracelets.jpg" },
    { title: "Pendants", image: "/images/categories/pendants.jpg" },
    { title: "Art Jewelry", image: "/images/categories/art-jewelry.jpg" },
    { title: "Gold", image: "/images/categories/gold.jpg" },
    { title: "Maang Tikka", image: "/images/categories/maang-tikka.jpg" },
    { title: "Anklet", image: "/images/categories/anklet.jpg" },
    { title: "Kamarbandh", image: "/images/categories/kamarbandh.jpg" },
    { title: "Pearls", image: "/images/categories/pearls.jpg" },
    { title: "Polki Jewellery", image: "/images/categories/polki.jpg" },
    { title: "Diamond Jewellery", image: "/images/categories/diamond.jpg" },
    { title: "Estate Jewellery", image: "/images/categories/estate.jpg" },
  ];

  const [current, setCurrent] = useState(0);
  const [dealIndex, setDealIndex] = useState(0);
  const [showPromo, setShowPromo] = useState(true);
  const [activeCatIndex, setActiveCatIndex] = useState(0);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slideData.length);
    }, 3000);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    const dealInterval = setInterval(() => {
      setDealIndex((prev) => (prev + 1) % dealsData.length);
    }, 3000);
    return () => clearInterval(dealInterval);
  }, []);

  useEffect(() => {
    const catInterval = setInterval(() => {
      setActiveCatIndex((prev) => (prev + 1) % categories.length);
    }, 2500);
    return () => clearInterval(catInterval);
  }, [categories.length]);

  return (
    <>
      {/* Video Section */}
      <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden mb-8">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/main.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center" />
      </section>

      {/* Promo Banner */}
      {showPromo && (
        <div className="bg-rose-100 text-rose-900 py-3 px-4 text-center relative">
          <p className="text-sm md:text-base font-medium">
            🎉 Free Shipping on Orders Above ₹5000! Limited time only.
          </p>
          <button
            onClick={() => setShowPromo(false)}
            className="absolute right-4 top-1 text-rose-900 font-bold hover:text-rose-800"
          >
            ✕
          </button>
        </div>
      )}

      {/* Shop By Category */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">
          Shop By Category
        </h2>
        <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto items-center">
          <motion.div
            key={categories[activeCatIndex].title}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2"
          >
            <img
              src={categories[activeCatIndex].image}
              alt={categories[activeCatIndex].title}
              className="rounded-xl shadow-lg object-cover w-full h-[300px] md:h-[400px]"
            />
            <h3 className="mt-4 text-2xl font-semibold text-gray-800">
              {categories[activeCatIndex].title}
            </h3>
          </motion.div>

          <div className="w-full lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                onMouseEnter={() => setActiveCatIndex(i)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={`cursor-pointer group rounded-xl overflow-hidden shadow hover:shadow-xl transition duration-300 ${
                  i === activeCatIndex ? "ring-2 ring-rose-500" : ""
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-32 object-cover"
                />
                <div className="bg-black/50 p-2">
                  <h3 className="text-white text-sm group-hover:text-rose-300">
                    {cat.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero Section (Moved Here) */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden pt-[70px]">
        {slideData.map((slide, index) => (
          <img
            key={index}
            src={slide.image}
            alt={`slide-${index}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40 z-20 flex flex-col justify-center items-center text-center px-4">
          <motion.h1
            key={slideData[current].heading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg"
          >
            {slideData[current].heading}
          </motion.h1>
          <motion.p
            key={slideData[current].description}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-4 text-white text-lg"
          >
            {slideData[current].description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <Link
              to="/products"
              className="mt-6 inline-block bg-rose-800 text-white px-6 py-3 rounded-md hover:bg-rose-900 transition"
            >
              Shop Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((_, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow rounded-xl overflow-hidden relative"
            >
              <img
                src={`/images/hero${index + 1}.jpg`}
                alt="bestseller"
                className="h-56 w-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                NEW
              </span>
              <div className="p-4 space-y-2">
                <h3 className="font-medium text-lg">Elegant Pendant</h3>
                <p className="text-rose-800 font-semibold">₹7,499</p>
                <button className="mt-2 w-full bg-rose-800 text-white py-2 rounded hover:bg-rose-900 transition">
                  View Detail
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deals of the Week */}
      <section className="py-16 px-0 bg-rose-100">
        <div className="w-full relative h-[450px] overflow-hidden">
          {dealsData.map((deal, index) => (
            <img
              key={index}
              src={deal.image}
              alt={deal.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                index === dealIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            />
          ))}
          <div className="absolute inset-0 bg-black/40 z-20 flex flex-col justify-center items-start px-10 md:px-20 text-white">
            <h2 className="text-4xl font-bold mb-2">Deals of the Week</h2>
            <p className="text-lg mb-4">
              {dealsData[dealIndex].title} — {dealsData[dealIndex].price}
            </p>
            <Link
              to="/products"
              className="bg-rose-800 text-white px-5 py-3 rounded hover:bg-rose-900 transition"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 px-6 bg-rose-50 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">About Jewel Mart</h2>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          At Jewel Mart, we curate the finest jewelry from top designers and brands,
          combining elegance, quality, and affordability. Whether it's a wedding, gift,
          or daily wear – we have something that fits your style.
        </p>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-100 py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            "Absolutely stunning collection! I get compliments every time I wear them.",
            "Great service, fast delivery, and the jewelry is so elegant!",
            "Affordable yet luxurious. My go-to place for gifts!",
          ].map((quote, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition duration-300"
            >
              <p className="italic text-gray-700">“{quote}”</p>
              <div className="mt-4 text-sm text-gray-500">&mdash; Happy Customer</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
