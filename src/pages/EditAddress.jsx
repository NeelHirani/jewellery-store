import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function EditAddress() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    zip: "",
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setForm({
          address: user.address || "",
          apartment: user.apartment || "",
          city: user.city || "",
          state: user.state || "",
          country: user.country || "",
          zip: user.zip || "",
        });
        setEmail(user.email);
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.address.trim()) {
      setError("Address cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase
        .from("users")
        .update(form)
        .eq("email", email);

      if (updateError) {
        console.error("Supabase error:", updateError);
        setError("Failed to update address.");
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = { ...storedUser, ...form };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccess("Address updated successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center px-4 pt-20">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-[#800000] mb-6">
          Edit Your Address
        </h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4 text-center">{success}</p>}

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block font-medium mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Apartment, suite, etc.</label>
            <input
              type="text"
              name="apartment"
              value={form.apartment}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Apt 1B"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">State/province</label>
            <input
              type="text"
              name="state"
              value={form.state}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="State or Province"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={form.country}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="Country"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">ZIP/postal code</label>
            <input
              type="text"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="ZIP Code"
            />
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm font-medium"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`px-6 py-2 rounded bg-[#800000] text-white font-semibold hover:bg-[#5a0d15] transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
