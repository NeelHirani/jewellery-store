import React from "react";

const About: React.FC = () => {
  return (
    <div className="text-gray-800">
  <section
  className="relative h-[70vh] bg-cover bg-center flex items-center mt-16"
  style={{
    backgroundImage:
      "url('https://www.londonroadjewellery.com/wp-content/uploads/2022/11/all.png')",
  }}
>
  {/* Overlay with lower opacity */}
  <div className="absolute inset-0  bg-opacity-100"></div>

  {/* Content */}
  <div className="relative z-10 max-w-5xl px-6 md:px-16 text-white">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-lg">
      <span className="text-rose-400">About Us</span>
    </h1>
    <p className="text-lg md:text-xl mb-6 max-w-2xl font-medium drop-shadow">
      <span className="text-black">
        Take control of your financial future and achieve the life you've always dreamed of. <br />
        At <span className="font-semibold text-rose-500">Jewel Mart</span>, we blend craftsmanship with elegance to make your moments unforgettable.
      </span>
    </p>
   
  </div>
</section>



      {/* Opportunities Section */}
      <section className="bg-blue-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-10">
          <img
            src="https://t4.ftcdn.net/jpg/04/72/21/89/240_F_472218916_DcYjugjbxmLn73IcG4ctvCM2zHkJkCCK.jpg"
            alt="Building"
            className="rounded-xl w-full h-auto object-cover"
          />
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
               Founded in 2002, <strong>Jewel Mart</strong> began with a simple vision — to make fine jewelry more accessible,
    personal, and meaningful. From a modest boutique, we’ve grown into one of India’s most trusted names in luxury
    jewelry, serving thousands across the country and beyond.
            </p>
            <p className="text-gray-600">
               Our mission is to celebrate life’s cherished moments through timeless pieces that resonate deeply. Whether it’s a
    wedding ring, a festive gift, or a symbol of personal achievement, every Jewel Mart creation captures emotion and
    tells a unique story.
            </p>
             <p className="text-gray-600">
    With over 8,000 unique designs crafted by master artisans and enhanced by modern technology, we blend tradition
    with innovation. Our in-house design team stays ahead of global trends while preserving the essence of Indian
    artistry.
  </p>
          </div>
        </div>

        {/* Logos */}
        <div className="mt-16 flex justify-center gap-8 flex-wrap">
          {Array(6).fill(0).map((_, idx) => (
            <img
              key={idx}
              src="https://cdn.logojoy.com/wp-content/uploads/2018/07/30124039/jewelry2.png"
              alt="Partner Logo"
              className="h-10"
            />
          ))}
        </div>
      </section>

     <section className="bg-slate-50 py-16 px-6 md:px-24 text-gray-800">
  <div className="text-center mb-12">
    <span className="uppercase tracking-widest text-sm text-blue-900 font-semibold bg-blue-100 px-3 py-1 rounded-full">
      Our Services
    </span>
    <h2 className="text-4xl font-bold mt-4">Exquisite Jewelry, Exceptional Services</h2>
    <p className="mt-4 text-lg text-gray-600">
      At Jewel Mart, we go beyond jewelry. Explore our personalized services crafted to make every moment truly special.
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
    {/* Service 1 */}
    <div className="p-6 border rounded-2xl shadow hover:shadow-xl transition duration-300">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRudSgpSvSyhgGS2nhZbiOkiEiS-ajtOsuRdw&s" alt="Custom Design" className="mx-auto w-12 h-12 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Custom Jewelry Design</h3>
      <p className="text-gray-600">
        Work with our expert artisans to bring your dream jewelry to life — unique, personal, and unforgettable.
      </p>
    </div>

    {/* Service 2 */}
    <div className="p-6 border rounded-2xl shadow hover:shadow-xl transition duration-300">
      <img src="https://www.namasyajaipur.com/cdn/shop/articles/2_ff8c0628-98d9-4824-b088-ce891225d374.png?v=1691746774" alt="Jewelry Repair" className="mx-auto w-12 h-12 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Jewelry Repair & Restoration</h3>
      <p className="text-gray-600">
        From resizing to full restoration, our specialists treat your heirlooms with care and craftsmanship.
      </p>
    </div>

    {/* Service 3 */}
    <div className="p-6 border rounded-2xl shadow hover:shadow-xl transition duration-300">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKoa8_7Hjd5ZH-zOdcLsnQrNdXNtB_Q8P_eg&s" alt="Certification" className="mx-auto w-12 h-12 mb-4" />
      <h3 className="text-xl font-semibold mb-2">Certified Jewelry Appraisal</h3>
      <p className="text-gray-600">
        Get accurate valuations from trusted experts. Perfect for insurance, resale, or simply peace of mind.
      </p>
    </div>
  </div>
</section>

    </div>
  );
};

export default About;
