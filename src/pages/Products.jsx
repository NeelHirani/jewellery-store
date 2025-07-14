import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const sampleProducts = [
  {
    id: 1,
    name: "Antique Ruby Gold Bangle",
    price: 12999,
    image: "https://www.kushals.com/cdn/shop/files/antique-bangle-ruby-gold-2-4-antique-bangle-164066-36710817923228.jpg?v=1698489280",
    category: "Bangles",
  },
  {
    id: 2,
    name: "Diamond Engagement Ring",
    price: 15999,
    image: "https://www.brilliance.com/cdn-cgi/image/f=webp,width=1440,height=1440,quality=90/sites/default/files/vue/collections/engagement-rings-diamond_og.jpg",
    category: "Rings",
  },
  {
    id: 3,
    name: "Gold Bridal Necklace",
    price: 21999,
    image: "https://i.pinimg.com/474x/fc/aa/dd/fcaaddff819bc90debe0c50714d11083.jpg",
    category: "Necklaces",
  },
  {
    id: 4,
    name: "Traditional Stud Earrings",
    price: 8999,
    image: "https://www.bagadebandhusaraf.com/wp-content/uploads/2016/10/1.jpg",
    category: "Earrings",
  },
  {
    id: 5,
    name: "Kundan Bridal Set",
    price: 28999,
    image: "https://i.pinimg.com/originals/c3/07/62/c30762c4699674970839b202b41e399e.jpg",
    category: "Necklaces",
  },
  {
    id: 6,
    name: "Floral Diamond Earrings",
    price: 11999,
    image: "https://i.pinimg.com/originals/67/32/8f/67328f4d8e49f4a5ae33ae5f7f9dc3e5.jpg",
    category: "Earrings",
  },
  {
    id: 7,
    name: "Elegant Gold Ring",
    price: 7499,
    image: "https://i.pinimg.com/originals/31/b3/c2/31b3c20cc3e1646b98ff7c7bb9d3023d.jpg",
    category: "Rings",
  },
  {
    id: 8,
    name: "Temple Design Bangle",
    price: 13999,
    image: "https://www.kushals.com/cdn/shop/files/antique-bangle-ruby-2-4-gold-bangle-168181-36710930473196.jpg?v=1698489281",
    category: "Bangles",
  },
  {
    id: 9,
    name: "Meenakari Jhumka",
    price: 10999,
    image: "https://i.pinimg.com/originals/f5/e9/fc/f5e9fcdd6711e41ee4ab8a55b920bdfa.jpg",
    category: "Earrings",
  },
  {
    id: 10,
    name: "Classic Solitaire Ring",
    price: 18999,
    image: "https://i.pinimg.com/originals/4b/89/58/4b89584b6a0c6bfbde8f32ed15ffb8fc.jpg",
    category: "Rings",
  },
  {
    id: 11,
    name: "Maharani Necklace",
    price: 29999,
    image: "https://i.pinimg.com/originals/e4/f6/03/e4f603ed1b4a1639a3d580302edc1e94.jpg",
    category: "Necklaces",
  },
  {
    id: 12,
    name: "Pearl Drop Earrings",
    price: 6999,
    image: "https://i.pinimg.com/originals/83/e3/d7/83e3d71cf86e8606cb9cfa8b6f39075c.jpg",
    category: "Earrings",
  },
  {
    id: 13,
    name: "Classic Gold Kada",
    price: 15999,
    image: "https://i.pinimg.com/originals/fc/ed/62/fced62b245ae8f4b3832826d3cf960df.jpg",
    category: "Bangles",
  },
  {
    id: 14,
    name: "Green Emerald Necklace",
    price: 24999,
    image: "https://i.pinimg.com/originals/d4/94/79/d4947983f2560b14cb1ea56dd0acdcf1.jpg",
    category: "Necklaces",
  },
  {
    id: 15,
    name: "Elegant Studded Ring",
    price: 10999,
    image: "https://i.pinimg.com/originals/f7/8d/44/f78d44191cc37653b8edddf2b7cb816e.jpg",
    category: "Rings",
  },
  {
    id: 16,
    name: "Gold Mesh Bangle",
    price: 18999,
    image: "https://i.pinimg.com/originals/80/71/af/8071af857f410dbbb65057f1762b1516.jpg",
    category: "Bangles",
  },
  {
    id: 17,
    name: "Contemporary Necklace",
    price: 26999,
    image: "https://i.pinimg.com/originals/13/7b/5d/137b5df3735b4ae24a66cfa598848a6a.jpg",
    category: "Necklaces",
  },
  {
    id: 18,
    name: "Zircon Diamond Ring",
    price: 9999,
    image: "https://i.pinimg.com/originals/2e/47/7f/2e477f2f20742c0062a9d4737bbda567.jpg",
    category: "Rings",
  },
  {
    id: 19,
    name: "Vintage Bridal Set",
    price: 32999,
    image: "https://i.pinimg.com/originals/89/8f/c2/898fc2fd187ffb234897fa9e9a249adb.jpg",
    category: "Necklaces",
  },
  {
    id: 20,
    name: "Crystal Drop Earrings",
    price: 7999,
    image: "https://i.pinimg.com/originals/f1/55/bb/f155bbbe3e6f2f3469e160b7c9a42241.jpg",
    category: "Earrings",
  },
  {
    id: 21,
    name: "Gold & Ruby Ring",
    price: 13499,
    image: "https://i.pinimg.com/originals/bb/b2/e4/bbb2e4f2ffad4c9a8cc9d5d97e1f7bd3.jpg",
    category: "Rings",
  },
  {
    id: 22,
    name: "Layered Gold Necklace",
    price: 27999,
    image: "https://i.pinimg.com/originals/3f/5d/32/3f5d324ad0c728e2c1a51c6ee169b366.jpg",
    category: "Necklaces",
  },
  {
    id: 23,
    name: "Minimalist Diamond Bangle",
    price: 15999,
    image: "https://i.pinimg.com/originals/2e/27/e4/2e27e4877b252012d7998e2a2aa8dfb1.jpg",
    category: "Bangles",
  },
  {
    id: 24,
    name: "Long Kundan Earrings",
    price: 11499,
    image: "https://i.pinimg.com/originals/9f/90/9b/9f909b70fd8c0f507c0ec14edbfce749.jpg",
    category: "Earrings",
  },
  {
    id: 25,
    name: "Antique Gold Kada",
    price: 19999,
    image: "https://i.pinimg.com/originals/d1/3b/39/d13b395209ec5f12f21db83d68a3f2fc.jpg",
    category: "Bangles",
  },
  {
    id: 26,
    name: "Rose Gold Heart Ring",
    price: 8999,
    image: "https://i.pinimg.com/originals/37/9a/8a/379a8a8d4b7e40bcaf7f4c22d3ed5d73.jpg",
    category: "Rings",
  },
  {
    id: 27,
    name: "Mirror Choker Necklace",
    price: 24999,
    image: "https://i.pinimg.com/originals/f9/f4/84/f9f484274c9df3801df6a04cf12de0e7.jpg",
    category: "Necklaces",
  },
  {
    id: 28,
    name: "Pearl Chain Bracelet",
    price: 6999,
    image: "https://i.pinimg.com/originals/4f/e5/89/4fe589efae82c64fbb7a7ebff0d41a5b.jpg",
    category: "Bracelets",
  },
];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setProducts(sampleProducts);
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const categories = ["All", ...new Set(sampleProducts.map((p) => p.category))];

  return (
    <div className="min-h-screen bg-white pt-28 pb-10 px-6 md:px-14">
      <div className="flex justify-between items-center flex-col md:flex-row gap-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <select
          className="border px-4 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, idx) => (
            <option key={idx} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: product.id * 0.02 }}
              className="bg-white border rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mt-1">₹{product.price}</p>
                  <button className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-xl text-sm hover:bg-gray-800 transition">
                    View Details
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
