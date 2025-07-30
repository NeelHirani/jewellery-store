import React from "react";

const Contact = () => {
  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-[400px] flex items-center justify-center text-white"
        style={{ backgroundImage: `url('https://t4.ftcdn.net/jpg/03/15/75/73/240_F_315757330_Zkush37QibcEPWsmqZaEed67sO1lNrJm.jpg')` }} // Replace with your image path
      >
        <div className="bg-black/50 absolute inset-0 z-0"></div>
        <div className="z-10 text-center">
          <h1 className="text-4xl font-bold mb-2">Contact us</h1>
          <p className="text-lg">Jewel Mart is here to provide the perfect solution for all your jewelry needs</p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white shadow-lg rounded-xl mx-auto max-w-6xl mt-[-80px] relative z-20 grid md:grid-cols-2 gap-6 p-8">
        {/* Left: Get in Touch */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Get in touch</h2>
          <p>Reach out to us through any of the methods below.</p>

          <div>
            <h4 className="font-bold text-black-200">Head Office</h4>
            <p>Jewel Tower, Ring Road, Nikol, Ahmedabad, India</p>
          </div>

          <div>
            <h4 className="font-bold text-black-200">Email Us</h4>
            <p>support@jewelmart.com</p>
            <p>sales@jewelmart.com</p>
          </div>

          <div>
            <h4 className="font-bold text-black-200">Call Us</h4>
            <p>Phone: +91 98765 43210</p>
            <p>Fax: +91 22334 55667</p>
          </div>

         
        </div>

        {/* Right: Contact Form */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-2">Send us a message</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" className="border p-2 rounded-md" />
              <input type="text" placeholder="Company" className="border p-2 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="tel" placeholder="Phone" className="border p-2 rounded-md" />
              <input type="email" placeholder="Email" className="border p-2 rounded-md" />
            </div>
            <input type="text" placeholder="Subject" className="w-full border p-2 rounded-md" />
            <textarea placeholder="Message" rows={4} className="w-full border p-2 rounded-md"></textarea>
            <button className="bg-[#800000] text-white w-full py-2 rounded-md hover:bg-[#660000]">
  Send
</button>
          </form>
        </div>
      </div>

      {/* Google Map */}
      <div className="mt-12">
        <iframe
          title="Google Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3670.0859842266984!2d72.64968337517822!3d23.09583457912218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e870af09e08d1%3A0xf2b25e38576c4918!2sNikol%2C%20Ahmedabad!5e0!3m2!1sen!2sin!4v1699982344230!5m2!1sen!2sin"
          width="100%"
          height="400"
          allowFullScreen=""
          loading="lazy"
          className="border-0 w-full"
        ></iframe>
      </div>


    </div>
  );
};

export default Contact;
