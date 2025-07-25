import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";

const About = () => {
  // Animation variants for staggered effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="bg-ivory text-gray-900 mt-[70px] font-sans">
      {/* Hero Section */}
      <section
        className="relative h-[70vh] w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 md:px-20 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold font-serif mb-4"
          >
            About Jewell Mart
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl"
          >
            Crafting timeless elegance with passion and precision since 2002.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
          
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
<section className="py-16 px-4 sm:px-8 md:px-16 bg-gradient-to-b from-ivory-50 to-ivory-100" aria-labelledby="our-story">
  <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="lg:w-1/2 max-w-5xl"
    >
      <motion.h2
        variants={itemVariants}
        id="our-story"
        className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-8 text-gray-900 tracking-tight text-left"
      >
        Our Story
      </motion.h2>
      <div className="space-y-6 text-gray-700 text-base sm:text-lg leading-relaxed">
        <motion.p variants={itemVariants}>
          Founded in 2002, Jewel Mart began with a simple vision — to make fine jewelry more accessible, personal, and meaningful. From a modest boutique, we’ve grown into one of India’s most trusted names in luxury jewelry, serving thousands across the country and beyond.
        </motion.p>
        <motion.p variants={itemVariants}>
          Our mission is to celebrate life’s cherished moments through timeless pieces that resonate deeply. Whether it’s a wedding ring, a festive gift, or a symbol of personal achievement, every Jewel Mart creation captures emotion and tells a unique story.
        </motion.p>
        <motion.ul variants={itemVariants} className="space-y-4 text-left">
          <li className="flex items-start">
            <span className="text-rose-500 mr-2">•</span>
            <span><strong>Heritage of Craftsmanship</strong>: Over two decades of blending tradition and innovation in jewelry design.</span>
          </li>
          <li className="flex items-start">
            <span className="text-rose-500 mr-2">•</span>
            <span><strong>Customer-Centric Trust</strong>: Certified quality and transparent policies for a confident shopping experience.</span>
          </li>
          <li className="flex items-start">
            <span className="text-rose-500 mr-2">•</span>
            <span><strong>Community-Driven Legacy</strong>: Your stories shape our journey, creating meaningful connections.</span>
          </li>
        </motion.ul>
        <motion.p variants={itemVariants}>
          With over 8,000 unique designs crafted by master artisans and enhanced by modern technology, we blend tradition with innovation. Our in-house design team stays ahead of global trends while preserving the essence of Indian artistry.
        </motion.p>
        <motion.p variants={itemVariants}>
          Our flagship showrooms in major Indian cities offer a world-class experience, treating every visitor like family. Our staff, more than salespeople, are storytellers and guides, helping you find jewelry that reflects your personality, heritage, and dreams.
        </motion.p>
      </div>
    </motion.div>
    <motion.div
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="lg:w-1/2 flex justify-center items-center"
    >
      <img
        src="https://plus.unsplash.com/premium_photo-1681276170423-2c60b95094b4?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt="Jewel Mart artisans crafting fine jewelry"
        className="w-full max-w-md rounded-2xl shadow-lg object-cover"
      />
    </motion.div>
  </div>
</section>
{/* The Jewell Mart Advantage */}
<section className="py-16 px-4 sm:px-8 md:px-16 bg-gradient-to-b from-rose-50 to-gray-50 text-center" aria-labelledby="jewell-mart-advantage">
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="max-w-7xl mx-auto"
  >
    <motion.h2
      variants={itemVariants}
      id="jewell-mart-advantage"
      className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif mb-12 text-gray-900 tracking-tight"
    >
      The Jewell Mart Advantage
    </motion.h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {[
        { title: "Unique Designs", desc: "Choose from over 8,000 exclusive designs.", bg: "bg-white", border: "border-rose-300", gradient: "hover:bg-gradient-to-t hover:from-rose-50 hover:to-white" },
        { title: "Transparency", desc: "What you see is what you get.", bg: "bg-white", border: "border-purple-300", gradient: "hover:bg-gradient-to-t hover:from-purple-50 hover:to-white" },
        { title: "Personalized Service", desc: "Tailored assistance for your unique needs.", bg: "bg-white", border: "border-blue-300", gradient: "hover:bg-gradient-to-t hover:from-blue-50 hover:to-white" },
        { title: "Next Day Delivery", desc: "Swift delivery for last-minute gifting.", bg: "bg-white", border: "border-gray-400", gradient: "hover:bg-gradient-to-t hover:from-gray-100 hover:to-white", span: "sm:col-span-2 lg:col-span-3" },
        { title: "Certified Quality", desc: "Uncompromising purity and authenticity.", bg: "bg-white", border: "border-amber-300", gradient: "hover:bg-gradient-to-t hover:from-amber-50 hover:to-white" },
        { title: "Exclusive Stores", desc: "Visit us in major cities across India.", bg: "bg-white", border: "border-red-300", gradient: "hover:bg-gradient-to-t hover:from-red-50 hover:to-white" },
        { title: "Lifetime Warranty", desc: "Enjoy peace of mind with our lifetime guarantee.", bg: "bg-white", border: "border-teal-300", gradient: "hover:bg-gradient-to-t hover:from-teal-50 hover:to-white" },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          variants={itemVariants}
          className={`p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-rose-400 ${item.bg} border-2 ${item.border} ${item.gradient} ${item.span || ''}`}
          whileHover={{ scale: 1.03 }}
          whileFocus={{ scale: 1.03 }}
          tabIndex={0}
          role="region"
          aria-label={item.title}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 tracking-wide">{item.title}</h3>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  </motion.div>
</section>
{/* Our Craftmanship */}
    <section className="py-20 px-6 md:px-16 bg-white text-black" aria-labelledby="our-craftsmanship">
  <motion.div
    variants={containerVariants}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    className="max-w-6xl mx-auto"
  >
    <motion.h2
      variants={itemVariants}
      id="our-craftsmanship"
      className="text-3xl md:text-4xl font-bold font-serif mb-6 text-center"
    >
      Our Craftsmanship
    </motion.h2>
    <motion.p variants={itemVariants} className="text-lg mb-8 text-center">
      Every piece is a testament to artistry and precision.
    </motion.p>
    <div className="flex justify-center items-center">
      <div className="w-full max-w-md space-y-6">
        {[
          { label: "Diamond Setting", value: 80 },
          { label: "Goldsmithing", value: 70 },
          { label: "Custom Design", value: 85 },
        ].map((item, idx) => (
          <motion.div key={idx} variants={itemVariants} className="text-center">
            <p className="text-sm text-black mb-2">{item.label}</p>
            <div className="relative w-full bg-blue-800 h-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${item.value}%` }}
                transition={{ duration: 1, delay: idx * 0.2 }}
                className="bg-amber-400 h-full rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
</section>
      {/* Core Values */}
      <section className="py-20 px-6 md:px-16 bg-white text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold font-serif mb-10">
            Our Core Values
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity",
                desc: "Honest pricing, rigorous quality checks, and transparent practices build lasting trust.",
              },
              {
                title: "Craftsmanship",
                desc: "Handcrafted by skilled artisans, blending tradition with modern precision.",
              },
              {
                title: "Innovation",
                desc: "Fusing technology with timeless designs for contemporary elegance.",
              },
              {
                title: "Sustainability",
                desc: "Eco-friendly sourcing and practices for a brighter future.",
              },
              {
                title: "Customer Centricity",
                desc: "Personalized service and customization for an exceptional experience.",
              },
              {
                title: "Excellence",
                desc: "Perfection in every detail, from design to delivery.",
              },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-rose-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
              >
                <h3 className="text-xl font-semibold text-rose-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Milestones */}
      <section className="py-20 px-6 md:px-16 bg-ivory text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold font-serif mb-10">
            Milestones & Recognition
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { year: "2002", event: "First retail outlet launched in Jaipur." },
              { year: "2010", event: "Featured in 'Top 10 Jewelers of India' by Indian Vogue." },
              { year: "2016", event: "Expanded internationally with outlets in Dubai and London." },
              { year: "2023", event: "Awarded 'Excellence in Craftsmanship' by Indian Gem Society." },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-rose-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition"
              >
                <h4 className="text-rose-800 font-bold text-lg mb-1">{item.year}</h4>
                <p className="text-gray-700">{item.event}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

     
    </div>
  );
};

export default About;