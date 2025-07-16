import React, { useState } from 'react';

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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');

  const products = [
    {
      name: "Diamond Solitaire Necklace",
      price: 1299,
      image: "/7065f415-b5a1-4e6d-b3c4-128338453ba7.jpg",
      description: "A stunning 1-carat diamond pendant on a delicate gold chain.",
      category: "Necklace",
      gender: "Women",
    },
    {
      name: "Rose Gold Floral Necklace",
      price: 1499,
      image: "/7b395770-d3a4-49a7-a824-76a13b3620ba.jpg",
      description: "Rose gold necklace with floral diamond arrangement.",
      category: "Necklace",
      gender: "Women",
    },
    {
      name: "Elegant Drop Earrings",
      price: 899,
      image: "/24a71342-f125-4ac8-8c74-88458f2782e9.jpg",
      description: "Delicate drop earrings set in gold with a modern twist.",
      category: "Earrings",
      gender: "Women",
    },
    {
      name: "Designer Diamond Pendant",
      price: 1099,
      image: "/7b5c9183-5d72-450c-a970-23675c4a8f79.jpg",
      description: "V-shaped diamond-studded pendant with central crystal.",
      category: "Pendant",
      gender: "Unisex",
    },
  ];

  const filteredProducts = products.filter((product) => {
    return (
      (categoryFilter === 'all' || product.category === categoryFilter) &&
      (genderFilter === 'all' || product.gender === genderFilter) &&
      (priceFilter === 'all' ||
        (priceFilter === 'low' && product.price < 1000) ||
        (priceFilter === 'medium' && product.price >= 1000 && product.price <= 1300) ||
        (priceFilter === 'high' && product.price > 1300))
    );
  });

  return (
    <section id="shop" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold text-center mb-12">Products</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <div className="flex flex-col">
            <label htmlFor="category" className="text-gray-700 font-semibold mb-2">Category</label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Necklace">Necklace</option>
              <option value="Earrings">Earrings</option>
              <option value="Pendant">Pendant</option>
              <option value="Bangles">Bangles</option>
              <option value="Rings">Rings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Art Jewellery">Art Jewellery</option>
              <option value="Gold">Gold</option>
              <option value="Maang Tikka">Maang Tikka</option>
              <option value="Anklet">Anklet</option>
              <option value="Kamarbandh">Kamarbandh</option>
              <option value="Pearls">Pearls</option>
              <option value="Polki Jewellery">Polki Jewellery</option>
              <option value="Diamond Jewellery">Diamond Jewellery</option>
              <option value="Estate Jewellery">Estate Jewellery</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-gray-700 font-semibold mb-2">Gender</label>
            <select
              id="gender"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 outline-none"
            >
              <option value="all">All Genders</option>
              <option value="Women">Women</option>
              <option value="Unisex">Man</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="price" className="text-gray-700 font-semibold mb-2">Price Range</label>
            <select
              id="price"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 outline-none"
            >
              <option value="all">All Prices</option>
              <option value="low">Under $1000</option>
              <option value="medium">$1000 - $1300</option>
              <option value="high">Over $1300</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product, index) => (
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
        <h2 className="text-4xl font-serif font-bold text-center mb-12">Collections</h2>
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
      <Collections />
      <Shop />
    </div>
  );
}

export default Products;