import React, { useEffect, useState } from 'react';

const heroImages = [
  "/images/hero1.jpg",
  "/images/hero2.jpg",
  "/images/hero3.jpg",
  "/images/hero4.jpg",
];

function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="w-full h-[60vh] bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out mt-17"
      style={{
        backgroundImage: `url('${heroImages[currentIndex]}')`,
      }}
    >
      {/* Auto-scrolling hero background */}
    </section>
  );
}

function ProductCard({ name, price, image, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-semibold font-serif mb-2">{name}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
      <p className="text-amber-600 font-bold mb-4">${price}</p>
      <button className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-900 transition">
        Add to Cart
      </button>
    </div>
  );
}

function Shop() {
  const products = [
    {
      name: "Diamond Solitaire Necklace",
      price: 1299,
      image: "/7065f415-b5a1-4e6d-b3c4-128338453ba7.jpg",
      description: "A stunning 1-carat diamond pendant on a delicate gold chain.",
    },
    {
      name: "Rose Gold Floral Necklace",
      price: 1499,
      image: "/7b395770-d3a4-49a7-a824-76a13b3620ba.jpg",
      description: "Rose gold necklace with floral diamond arrangement.",
    },
    {
      name: "Elegant Drop Earrings",
      price: 899,
      image: "/24a71342-f125-4ac8-8c74-88458f2782e9.jpg",
      description: "Delicate drop earrings set in gold with a modern twist.",
    },
    {
      name: "Designer Diamond Pendant",
      price: 1099,
      image: "/7b5c9183-5d72-450c-a970-23675c4a8f79.jpg",
      description: "V-shaped diamond-studded pendant with central crystal.",
    },
  ];

  return (
    <section id="shop" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">Featured Jewelry</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={index} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ title, description, image }) {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md">
      <img src={image} alt={title} className="w-full h-64 object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white p-4">
        <h3 className="text-2xl font-serif font-semibold mb-2">{title}</h3>
        <p className="text-center mb-4">{description}</p>
        <a href="#shop" className="bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 transition">
          Shop Now
        </a>
      </div>
    </div>
  );
}

function Collections() {
  const collections = [
    {
      title: "Bridal Collection",
      description: "Elegant designs for your special day, crafted with love.",
      image: "/7b395770-d3a4-49a7-a824-76a13b3620ba.jpg",
    },
    {
      title: "Vintage Classics",
      description: "Timeless pieces inspired by classic craftsmanship.",
      image: "/24a71342-f125-4ac8-8c74-88458f2782e9.jpg",
    },
  ];

  return (
    <section id="collections" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">Our Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <CollectionCard key={index} {...collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Products() {
  return (
    <div>
      <Hero />
      <Shop />
      <Collections />
    </div>
  );
}

export default Products;
