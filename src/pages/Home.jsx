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
<section className="relative w-full h-[80vh] md:h-[90vh] overflow-hidden mb-16 rounded-xl shadow-lg">
  {/* Background Video */}
  <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute top-0 left-0 w-full h-full object-cover"
  >
    <source src="/videos/main.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>

  {/* Gradient overlay at bottom */}
  <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-black/70 to-transparent" />

  {/* Text + Button */}
  <div className="absolute bottom-5 w-full text-center px-4">
    <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
      Celebrate Raksha Bandhan with Timeless Elegance 🎁
    </h2>
    <p className="text-white text-base md:text-lg mt-2 drop-shadow">
      Discover our exclusive collection of rakhis, rings & more—crafted with love for every sibling bond.
    </p>
    <a
      href="/products"
      className="inline-block mt-4 bg-white text-pink-600 font-semibold px-6 py-3 rounded-full shadow-md hover:bg-pink-100 transition duration-300"
    >
      Shop Now
    </a>
  </div>
</section>


     {/* Promo Banner */}
<div className="mb-6">
  {showPromo && (
    <div className="bg-rose-100 text-rose-900 py-3 px-4 text-center relative rounded shadow">
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
</div>    
{/* Shop By Category */}
<section className="py-20 px-6 bg-gradient-to-b from-white via-rose-50 to-white text-center">
  <h2 className="text-4xl font-bold text-gray-800 mb-12 tracking-tight">
    Shop By Category
  </h2>
  <div className="flex flex-col lg:flex-row gap-12 max-w-7xl mx-auto items-center justify-center">
    
    {/* Large Featured Category Image */}
    <motion.div
      key={categories[activeCatIndex].title}
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full lg:w-1/2"
    >
      <div className="relative overflow-hidden rounded-2xl shadow-2xl group">
        <img
          src={categories[activeCatIndex].image}
          alt={categories[activeCatIndex].title}
          className="w-full h-[300px] md:h-[400px] object-cover transform group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition duration-300 flex items-end">
          <h3 className="text-white text-2xl font-semibold p-4">
            {categories[activeCatIndex].title}
          </h3>
        </div>
      </div>
    </motion.div>

    {/* Thumbnail Categories */}
    <div className="w-full lg:w-1/2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {categories.map((cat, i) => (
        <motion.div
          key={i}
          onMouseEnter={() => setActiveCatIndex(i)}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.3 }}
          className={`cursor-pointer group rounded-xl overflow-hidden shadow-lg relative ring-offset-2 ${
            i === activeCatIndex
              ? "ring-2 ring-rose-400 ring-offset-rose-100"
              : "ring-1 ring-transparent hover:ring-rose-300"
          }`}
        >
          <img
            src={cat.image}
            alt={cat.title}
            className="w-full h-28 object-cover transform transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
            <h3 className="text-white text-sm font-medium">{cat.title}</h3>
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

      
      {/* Customer Testimonials */}
<section className="bg-pink-50 py-16 px-4">
  <h2 className="text-center text-4xl font-serif text-blue-900 mb-12">
   Our Special Customer Testimonials
  </h2>
  <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
    {/* Testimonial Card 1 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[-3deg]">
      <img src="https://www.weddingsutra.com/images/wedding-images/wedding_on_location/wsol_jan_2019/akansha_wsol_jan_2019_05.jpg" alt="Akanksha Khanna" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Akanksha Khanna, 27</h3>
      <p className="text-sm text-gray-700">
        Delighted with my engagement ring from Jewel Mart! It's my dream ring, fits perfectly and is stunning to look at.
      </p>
    </div>

    {/* Testimonial Card 2 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[2deg]">
      <img src="https://zariin.com/cdn/shop/articles/divya-bhatt-mishra-for-zariin-real-women.jpg?v=1674100355&width=1100" alt="Nutan Mishra" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Nutan Mishra, 33</h3>
      <p className="text-sm text-gray-700">
        I got a Nazariya for my baby boy. It's so cute and gives a sense of comfort knowing it’s on his wrist.
      </p>
    </div>

    {/* Testimonial Card 3 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[-2deg]">
      <img src="https://as2.ftcdn.net/jpg/01/95/43/59/1000_F_195435986_5Zymzu1CfIL0kEMlKa2RUIaBin8QK5JF.jpg" alt="Divya Mishra" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Divya Mishra, 26</h3>
      <p className="text-sm text-gray-700">
        On Valentine’s Day, I received a necklace I just can't take off. Everyone asks where I got it from!
      </p>
    </div>

    {/* Testimonial Card 4 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[1.5deg]">
      <img src="https://www.shutterstock.com/image-photo/photo-girl-wear-white-shirt-600nw-2471646043.jpg" alt="Raj Patel" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Rajvi Patel, 30</h3>
      <p className="text-sm text-gray-700">
        Gifted my sister a bracelet for Raksha Bandhan. She loved the packaging and craftsmanship. Great experience!
      </p>
    </div>

    {/* Testimonial Card 5 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[-1deg]">
      <img src="https://images.pexels.com/photos/21898588/pexels-photo-21898588.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200" alt="Sneha Desai" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Sneha Desai, 24</h3>
      <p className="text-sm text-gray-700">
        Jewel Mart made my first online jewelry purchase so easy. The ring fit like a dream. I'm definitely coming back!
      </p>
    </div>

    {/* Testimonial Card 6 */}
    <div className="bg-white rounded-2xl p-4 shadow-lg transform rotate-[3deg]">
      <img src="https://i.pinimg.com/736x/89/28/e0/8928e02b4aa74b8342c65ff69d004441.jpg" alt="Karan Verma" className="rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-blue-900">Karan Verma, 29</h3>
      <p className="text-sm text-gray-700">
        I bought a gold chain for my dad’s birthday. He was thrilled. Delivery was quick and secure. Impressed!
      </p>
    </div>
  </div>
</section>
  

      {/* Strokes of Genius Section */}
<section className="py-12 px-6 bg-white flex flex-col md:flex-row items-center justify-center gap-8 max-w-7xl mx-auto">
  <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    >
      <source src="/videos/new2v.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  </div>
  <div className="w-full md:w-1/2 flex items-center justify-center">
    <h2 className="text-4xl md:text-6xl font-serif font-semibold text-rose-900 whitespace-nowrap">
      #YourShine with US
    </h2>
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
    </>
  );
}
