import React, { useState } from "react";
import { X } from "lucide-react"; // Optional: icon package or use text

const initialCartItem = {
  id: 1,
  name: "Silver Snowflake Pendant With Box Chain",
  price: 2399,
  originalPrice: 3799,
  quantity: 1,
  image: "https://m.media-amazon.com/images/I/81QpkIctqPL._AC_UY218_.jpg",
  delivery: "Free Delivery",
};

export default function CartPage() {
  const [cartItem, setCartItem] = useState(initialCartItem);

  const increment = () => {
    setCartItem((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  };

  const decrement = () => {
    setCartItem((prev) => ({
      ...prev,
      quantity: prev.quantity > 1 ? prev.quantity - 1 : 1,
    }));
  };

  const deleteItem = () => setCartItem(null);

  const subtotal = cartItem ? cartItem.quantity * cartItem.price : 0;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white min-h-screen font-sans">
      <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>

      {cartItem ? (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm relative mb-4">
            {/* Delete Icon */}
            <button
              onClick={deleteItem}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>

            <div className="flex gap-4 items-start">
              {/* Image */}
              <img
                src={cartItem.image}
                alt={cartItem.name}
                className="w-24 h-24 object-cover rounded"
              />

              {/* Content */}
              <div className="flex-1">
                <h2 className="text-lg font-medium mb-1">{cartItem.name}</h2>

                {/* Price Row */}
                <div className="text-base font-semibold text-gray-800 space-x-2 mb-1">
                  <span>₹{cartItem.price}</span>
                  <span className="line-through text-gray-400 text-sm">
                    ₹{cartItem.originalPrice}
                  </span>
                </div>

                {/* Delivery */}
                <p className="text-pink-600 text-sm font-medium mb-2">
                  🚚 {cartItem.delivery}
                </p>

                {/* Quantity Control */}
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={decrement}
                    className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-bold"
                  >
                    −
                  </button>
                  <span className="px-2">{cartItem.quantity}</span>
                  <button
                    onClick={increment}
                    className="w-7 h-7 rounded-full bg-pink-100 text-pink-600 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Warranty & Returns Bar */}
                <div className="flex text-xs text-gray-500 space-x-6 mb-2">
                  <span>6-Month Warranty</span>
                  <span>Lifetime Plating Service</span>
                  <span className="text-pink-600 font-medium">
                    30-Day Easy Returns
                  </span>
                </div>

                {/* Gift wrap */}
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" className="accent-pink-500" />
                  <span>
                    Add a <span className="text-pink-600">gift wrap</span> & message
                    (+ ₹50)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Subtotal */}
          <div className="text-right text-lg font-semibold mt-4">
            Subtotal ({cartItem.quantity} item{cartItem.quantity > 1 ? "s" : ""}): ₹
            {subtotal.toFixed(2)}
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      )}
    </div>
  );
}
