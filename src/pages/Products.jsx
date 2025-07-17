import React, { useState } from 'react';

const categories = [
  "All Categories", "Necklace", "Earrings", "Pendant", "Bangles", "Rings",
  "Bracelets", "Art Jewellery", "Gold", "Maang Tikka", "Anklet", "Kamarbandh",
  "Pearls", "Polki Jewellery", "Diamond Jewellery", "Estate Jewellery",
];

function CategoryDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const handleSelect = (value) => {
    onChange(value === "All Categories" ? "all" : value);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 w-full text-left h-[42px] flex items-center justify-between"
      >
        <span>{selected === "all" ? "All Categories" : selected}</span>
        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
          {categories.map((cat) => (
            <li
              key={cat}
              onClick={() => handleSelect(cat)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {cat}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ProductCard({ name, price, image, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1 flex flex-col justify-between h-full">
      <div>
        <img src={image} alt={name} className="w-full h-48 object-cover rounded-md mb-4" />
        <h3 className="text-xl font-semibold font-serif mb-2">{name}</h3>
        <p className="text-gray-600 mb-2">{description}</p>
        <p className="text-rose-800 font-bold mb-4">₹{price}</p>
      </div>
      <button className="mt-auto bg-rose-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-rose-900 transition">
        Add to Cart
      </button>
    </div>
  );
}

function CollectionCard({ title, description, image }) {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-md group">
      <img
        src={image}
        alt={title}
        className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center text-white p-6">
        <h3 className="text-3xl font-serif font-bold mb-2">{title}</h3>
        <p className="text-center mb-4">{description}</p>
        <a
          href="#shop"
          className="bg-rose-700 hover:bg-rose-800 transition px-6 py-2 rounded-lg font-semibold"
        >
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
      image: "https://images.unsplash.com/photo-1604427967413-3a5fc61192b1?auto=format&fit=crop&w=1170&q=80",
    },
    {
      title: "Vintage Classics",
      description: "Timeless pieces inspired by classic craftsmanship.",
      image: "https://images.unsplash.com/photo-1612439354974-e7fe5a23665b?auto=format&fit=crop&w=1170&q=80",
    },
  ];

  return (
    <section id="collections" className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-serif font-bold text-center mb-12 text-rose-900 mt-7">Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <CollectionCard key={index} {...collection} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Shop() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const sampleProducts = [
    {
      name: "Diamond Necklace",
      price: 1299,
      image: "/7065f415-b5a1-4e6d-b3c4-128338453ba7.jpg",
      description: "Stunning diamond pendant on gold chain.",
      category: "Necklace",
      gender: "Women",
    },
    {
      name: "Rose Gold Necklace",
      price: 1499,
      image: "/7b395770-d3a4-49a7-a824-76a13b3620ba.jpg",
      description: "Floral diamond rose gold necklace.",
      category: "Necklace",
      gender: "Women",
    },
    {
      name: "Drop Earrings",
      price: 899,
      image: "/24a71342-f125-4ac8-8c74-88458f2782e9.jpg",
      description: "Modern drop earrings in gold.",
      category: "Earrings",
      gender: "Women",
    },
    {
      name: "Diamond Pendant",
      price: 1099,
      image: "/7b5c9183-5d72-450c-a970-23675c4a8f79.jpg",
      description: "V-shaped pendant with central crystal.",
      category: "Pendant",
      gender: "Unisex",
    },
  ];

  const allProducts = Array.from({ length: 48 }, (_, i) => {
    const base = sampleProducts[i % sampleProducts.length];
    return {
      ...base,
      name: `${base.name} ${i + 1}`,
    };
  });

  const filteredProducts = allProducts.filter((product) => {
    return (
      (categoryFilter === 'all' || product.category === categoryFilter) &&
      (genderFilter === 'all' || product.gender === genderFilter) &&
      (priceFilter === 'all' ||
        (priceFilter === 'low' && product.price < 1000) ||
        (priceFilter === 'medium' && product.price >= 1000 && product.price <= 1300) ||
        (priceFilter === 'high' && product.price > 1300))
    );
  });

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIdx = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIdx, startIdx + productsPerPage);

  return (
    <>
      {currentPage === 1 && <Collections />}

      <section id="shop" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <h2 className="text-4xl font-serif font-bold text-rose-900">Products</h2>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 w-full lg:w-auto">
              <div className="flex flex-col w-full sm:w-1/3">
                <label className="text-gray-700 font-semibold mb-2">Category</label>
                <CategoryDropdown selected={categoryFilter} onChange={setCategoryFilter} />
              </div>
              <div className="flex flex-col w-full sm:w-auto">
                <label htmlFor="gender" className="text-gray-700 font-semibold mb-2">Gender</label>
                <select
                  id="gender"
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 outline-none h-[42px]"
                >
                  <option value="all">All Genders</option>
                  <option value="Women">Women</option>
                  <option value="Unisex">Man</option>
                </select>
              </div>
              <div className="flex flex-col w-full sm:w-auto">
                <label htmlFor="price" className="text-gray-700 font-semibold mb-2">Price Range</label>
                <select
                  id="price"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="border-2 border-gray-400 rounded-lg p-2 bg-white text-gray-700 outline-none h-[42px]"
                >
                  <option value="all">All Prices</option>
                  <option value="low">Under ₹1000</option>
                  <option value="medium">₹1000 - ₹1300</option>
                  <option value="high">Over ₹1300</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {currentProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>

          <div className="flex justify-center mt-10 space-x-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-rose-200 text-rose-900 font-medium rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-2 bg-white border rounded text-rose-800 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-rose-200 text-rose-900 font-medium rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Products() {
  return <Shop />;
}
