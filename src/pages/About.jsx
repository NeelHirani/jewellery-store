import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="bg-white text-gray-800 mt-[70px]"> {/* Start after navbar */}
      {/* Hero Section */}
       <section
        className="relative h-[60vh] w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('./images/Banner.jpg')", // Same as About page
        }}
      >
        <div className="absolute inset-0 bg-black/80" />
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-20 text-white">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg max-w-xl">
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
            Established in 2002, Jewell Mart is India's leading destination for high quality fine jewellery with strikingly exquisite designs. We aim at revolutionizing the fine jewellery and lifestyle segment in India with a firm focus on craftsmanship, quality and customer experience. </p><br />

          <p className="text-lg text-gray-600">In a short span of time, Jewell Mart has built a large family of loyal consumers in India and abroad.

            We house more than 8000 unique designs for you to choose from. All these designs are crafted to perfection with utmost care giving you the flexibility to customize the product's gold purity and colour or diamond clarity to suit your needs.</p><br />

          <p className="text-lg text-gray-600">Our stores have been instrumental in spreading the shine of Jewell Mart and bringing us closer to you. With world class experience, friendly staff and the dazzling beauty of exquisite jewellery, every store is a sparkling gem.

            With an award-winning design team that pays great attention to detail, each of our products are a symbol of perfection. With cutting edge innovation and latest technology, we make sure the brilliance is well reflected in all our jewellery from the process till it reaches your door.</p><br />

          <p className="text-lg text-gray-600"> We also offer a 30 Day Money Back guarantee, Certified Jewellery from independent establishments like GSI, IGI & SGL offering total grading transparency, as well as Lifetime Exchange policy to align with our ethos of customer centricity. You can even customize your jewellery with us!
          </p>
        </motion.div>
      </section>

      {/* Jewell mart advantage */}
      <section className="py-20 px-6 md:px-16 bg-gray-50 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-4">THE JEWELL MART ADVANTAGE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First row of cards */}
            <div className="bg-pink-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">A WORLD Of Designs</h3>
              <p className="text-gray-600">We have over 8,000 unique designs for you to choose from.</p>
            </div>
            <div className="bg-yellow-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Certified Trustworthy</h3>
              <p className="text-gray-600">High benchmark of purity and authenticity.</p>
            </div>
            {/* Next Day Delivery as a full-width row */}
            <div className="col-span-1 md:col-span-2 bg-gray-300 p-6 rounded-lg">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Next Day Delivery</h2>
              <p className="text-xl text-gray-700">Last minute gifting made easy!</p>
            </div>
            {/* Second row of cards */}
            <div className="bg-purple-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">100% Transparency</h3>
              <p className="text-gray-600">What you see is what you get.</p>
            </div>
            <div className="bg-red-100 p-6 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Exclusive Stores</h3>
              <p className="text-gray-600">Our stores are located in major cities of India.</p>
            </div>
          </div>
        </motion.div>
      </section>

     {/* Our Craftsmanship */}
      <section className="py-20 px-6 md:px-16 bg-blue-500 text-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-6 text-center">Our Craftsmanship</h2>
          <p className="text-lg mb-8 text-center">Every piece we make carries the mark of authenticity and perfection.</p>
          <div className="flex flex-col md:flex-row justify-between items-start">
            {/* Progress Bars */}
            <div className="w-full md:w-1/2 space-y-6 mb-8 md:mb-0">
              <div className="text-center md:text-left">
                <p className="text-sm text-blue-300 mb-2">Diamond Setting</p>
                <div className="w-full bg-blue-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-blue-300 mb-2">Goldsmithing</p>
                <div className="w-full bg-blue-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: "70%" }}></div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <p className="text-sm text-blue-300 mb-2">Custom Design</p>
                <div className="w-full bg-blue-700 h-3 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
            </div>
            {/* Statistics */}
            <div className="w-full md:w-1/2 grid grid-cols-2 md:grid-cols-2 gap-7">
              <div className="text-center">
                <p className="text-2xl font-bold">125+</p>
                <p className="text-sm text-blue-300">Years of Excellence</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">4.9★</p>
                <p className="text-sm text-blue-300">Customer Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">50,000+</p>
                <p className="text-sm text-blue-300">Jewels Sold</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">600+</p>
                <p className="text-sm text-blue-300">Awards Won</p>
              </div>
            </div>
          </div>
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
                desc: "We promise honest pricing, quality assurance, and transparency in every deal. Our commitment is reflected in fair trade practices, rigorous quality checks at every stage, and clear communication with our customers. We uphold the highest ethical standards to build lasting trust."
              },
              {
                title: "Craftsmanship",
                desc: "Every piece is handcrafted by artisans with generations of skill and passion. We blend traditional techniques with modern innovation, ensuring each jewel is a masterpiece of precision and artistry, tailored to reflect your unique style."
              },
              {
                title: "Innovation",
                desc: "We fuse tradition with technology to bring modern sophistication to timeless designs. Our cutting-edge processes and design expertise allow us to create jewelry that meets contemporary trends while honoring heritage craftsmanship."
              },
              {
                title: "Sustainability",
                desc: "We are dedicated to eco-friendly practices, sourcing materials responsibly, and minimizing our environmental impact. Our sustainable approach ensures a brighter future while crafting jewelry that lasts for generations."
              },
              {
                title: "Customer Centricity",
                desc: "Your satisfaction is our priority. We offer personalized services, flexible customization options, and dedicated support to ensure every experience with Jewell Mart is exceptional and tailored to your needs."
              },
              {
                title: "Excellence",
                desc: "We strive for perfection in every detail, from design to delivery. Our team continuously seeks to exceed expectations, leveraging global standards and meticulous care to ensure each piece of jewelry embodies unmatched quality and beauty."
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-rose-50 p-6 rounded-xl shadow text-left"
              >
                <h3 className="text-2xl font-semibold text-rose-800 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.desc}</p>
              </motion.div>
            ))}
          </div>
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
              className="bg-rose-100 p-6 rounded-xl"
            >
              <h4 className="text-rose-800 font-bold text-lg mb-1">{item.year}</h4>
              <p className="text-gray-700">{item.event}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
