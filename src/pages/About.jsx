import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-white text-gray-800 mt-[70px]"> {/* Start after navbar */}
      {/* Hero Section */}
      <section
        className="relative h-[60vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('./images/Banner.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/10" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-20 max-w-4xl">
          <h1 className="text-5xl font-bold text-black mb-4">About Us</h1>
          <p className="text-xl text-gray-700">
            A journey of timeless beauty, legacy, and craftsmanship.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 md:px-16 bg-gray-50 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4">Our Story</h2>
          <p className="text-lg text-gray-600">
            Established in 1998 in the heart of Jaipur, Jewel Mart has grown from a humble storefront into
            a nationwide hub for fine jewelry. Our roots lie in honoring traditional Indian craftsmanship while
            embracing modern elegance. With over two decades of experience, we take pride in creating jewelry
            that tells stories and celebrates every special moment.
          </p>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 md:px-16 bg-white text-center">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-10">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Integrity",
                desc: "We promise honest pricing, quality assurance, and transparency in every deal.",
              },
              {
                title: "Craftsmanship",
                desc: "Every piece is handcrafted by artisans with generations of skill and passion.",
              },
              {
                title: "Innovation",
                desc: "We fuse tradition with technology to bring modern sophistication to timeless designs.",
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-purple-50 p-6 rounded-xl shadow text-left"
              >
                <h3 className="text-2xl font-semibold text-purple-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Artisans */}
      <section className="py-20 px-6 md:px-16 bg-gray-100 text-center">
        <h2 className="text-4xl font-bold mb-10">Meet Our Artisans</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-10">
          Our jewelry is brought to life by master craftsmen and women who have inherited age-old techniques and a deep love for detail.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            "/images/photo1.jpg",
            "/images/photo2.jpg",
            "/images/photo3.jpg",
          ].map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-xl shadow-lg"
            >
              <img src={img} alt={`artisan-${index + 1}`} className="w-full h-72 object-cover" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Milestones */}
      <section className="bg-white py-20 px-6 md:px-16 text-center">
        <h2 className="text-4xl font-bold mb-10">Milestones & Recognition</h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 text-left">
          {[
            {
              year: "2002",
              event: "First retail outlet launched in Jaipur.",
            },
            {
              year: "2010",
              event: "Featured in 'Top 10 Jewelers of India' by Indian Vogue.",
            },
            {
              year: "2016",
              event: "Expanded internationally with outlets in Dubai and London.",
            },
            {
              year: "2023",
              event: "Awarded 'Excellence in Craftsmanship' by Indian Gem Society.",
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-purple-100 p-6 rounded-xl"
            >
              <h4 className="text-purple-700 font-bold text-lg mb-1">{item.year}</h4>
              <p className="text-gray-700">{item.event}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
