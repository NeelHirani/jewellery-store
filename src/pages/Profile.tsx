import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLock,
  FaEdit,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCreditCard,
  FaHistory,
  FaGift,
  FaHeadset,
  FaCog,
  FaShieldAlt
} from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { motion } from "framer-motion";

interface ProfileProps {
  user?: any;
}

const Profile: React.FC<ProfileProps> = ({ user: propUser }) => {
  const defaultUser = {
    name: "Guest",
    email: "guest@example.com",
    address: "",
    apartment: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    joinDate: "Jan 2024",
    profileCompletion: 75,
  };

  const [user, setUser] = useState<any>(propUser || defaultUser);
  const [activeTab, setActiveTab] = useState<any>('overview');
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<any>({});
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserFromDB = async (email: any) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        console.error("DB fetch error:", error);
        return;
      }

      const dbUser = {
        name: data.name || "Guest",
        email: data.email,
        address: data.address || "",
        apartment: data.apartment || "",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
        zip: data.zip || "",
        joinDate: new Date(data.created_at).toLocaleString("default", {
          month: "short",
          year: "numeric",
        }),
        profileCompletion:
          data.address && data.city && data.country ? 100 : 75,
      };

      setUser(dbUser);
      localStorage.setItem("user", JSON.stringify(dbUser));
    };

    const updatedAddress = location.state?.updatedAddress;
    if (updatedAddress && user.email !== "guest@example.com") {
      const updateAddress = async () => {
        const { error } = await supabase
          .from("users")
          .update(updatedAddress)
          .eq("email", user.email);

        if (error) {
          console.error("Update address error:", error);
          return;
        }

        const updatedUser = {
          ...user,
          ...updatedAddress,
          profileCompletion:
            updatedAddress.address &&
            updatedAddress.city &&
            updatedAddress.country
              ? 100
              : 75,
        };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      };
      updateAddress();
    }

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.email) {
          fetchUserFromDB(parsedUser.email);
          fetchUserOrders();
        }
      } catch (error) {
        console.error("Parsing user error:", error);
        setUser(defaultUser);
      }
    } else if (propUser?.email) {
      fetchUserFromDB(propUser.email);
      fetchUserOrders();
    }
  }, [propUser, location.state]);

  const avatarLetter = user.name?.charAt(0).toUpperCase() || "U";

  // Fetch user orders
  const fetchUserOrders = async () => {
    if (!user.email || user.email === 'guest@example.com') return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (userError || !userData) return;

      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(name, additional_images)
          )
        `)
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false });

      if (!ordersError) {
        setOrders(ordersData || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleEditProfile = (): void => {
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      address: user.address,
      apartment: user.apartment,
      city: user.city,
      state: user.state,
      country: user.country,
      zip: user.zip
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update(editForm)
        .eq('email', user.email);

      if (error) throw error;

      const updatedUser = { ...user, ...editForm };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem("user");
    setUser(defaultUser);
    navigate("/login");
  };

  const handleChangePassword = () => navigate("/ForgetPassword");

  const fullAddress = [
    user.address,
    user.apartment,
    user.city,
    user.state,
    user.country,
    user.zip,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-100 to-white pt-20 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-rose-600 to-pink-500 text-white px-6 py-8 text-center"
        >
          <h2 className="text-3xl font-serif font-bold tracking-tight">
            Welcome, <span className="capitalize">{user.name}</span>
          </h2>
        </motion.div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6 p-6">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-rose-50 p-6 rounded-xl text-center shadow-md"
          >
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="bg-gradient-to-br from-rose-400 to-pink-600 text-white text-3xl font-bold rounded-full w-full h-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-105">
                {avatarLetter}
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-rose-900">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            <p className="text-xs text-gray-500 mt-2">Joined {user.joinDate}</p>

            <div className="mt-6 text-left">
              <p className="text-sm font-medium text-rose-900 mb-2">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-rose-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.profileCompletion}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
              <p className="text-xs text-rose-900 mt-1 font-medium">
                {user.profileCompletion}% Complete
              </p>
            </div>

            {/* Edit Profile Button */}
            <div className="mt-6">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center justify-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="md:col-span-2 space-y-6">
            {/* My Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center">
                  <FaShoppingBag className="mr-2 text-rose-600 text-xl" /> My Orders
                </h4>
                {orders.length > 0 && (
                  <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {orders.length} order{orders.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${order.total_amount}</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.order_status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.order_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.order_items?.slice(0, 3).map((item: any, index: number) => (
                          <div key={index} className="w-8 h-8 bg-gray-200 rounded overflow-hidden">
                            {item.products?.additional_images?.[0] && (
                              <img
                                src={item.products.additional_images[0]}
                                alt={item.products.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        ))}
                        {order.order_items?.length > 3 && (
                          <span className="text-xs text-gray-500">+{order.order_items.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.length > 3 && (
                    <Link
                      to="/orders"
                      className="text-sm text-rose-600 font-medium hover:text-rose-800 transition inline-block"
                    >
                      View all {orders.length} orders
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 text-sm mb-3">No orders placed yet.</p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Wishlist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center mb-3">
                <FaHeart className="mr-2 text-rose-600 text-xl" /> My Wishlist
              </h4>
              <p className="text-gray-600 text-sm">Your wishlist is currently empty.</p>
              <button className="text-sm text-rose-600 font-medium hover:text-rose-800 transition mt-3">
                Add Your Favorites
              </button>
            </motion.div>

            {/* Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 flex items-center mb-3">
                <FaMapMarkerAlt className="mr-2 text-rose-600 text-xl" /> Saved Address
              </h4>
              {fullAddress ? (
                <div className="text-gray-700 text-sm space-y-1">
                  {user.address && <p>{user.address}</p>}
                  {user.apartment && <p>{user.apartment}</p>}
                  <p>{[user.city, user.state].filter(Boolean).join(", ")}</p>
                  <p>{[user.country, user.zip].filter(Boolean).join(" ")}</p>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No address added yet.</p>
              )}
              <Link
                to="/EditAddress"
                className="text-sm text-rose-600 font-medium hover:text-rose-800 transition mt-3 inline-block"
              >
                {fullAddress ? "Edit Address" : "Add Address"}
              </Link>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 mb-4">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-rose-600">
                  <FaHeart className="text-xl mb-2" />
                  <span className="text-sm font-medium">Wishlist</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-amber-600">
                  <FaHistory className="text-xl mb-2" />
                  <span className="text-sm font-medium">Order History</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-rose-600">
                  <FaCreditCard className="text-xl mb-2" />
                  <span className="text-sm font-medium">Payment</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-amber-600">
                  <FaHeadset className="text-xl mb-2" />
                  <span className="text-sm font-medium">Support</span>
                </button>
              </div>
            </motion.div>

            {/* Account Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-rose-900 mb-4">
                Account Settings
              </h4>
              <div className="space-y-3">
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <FaLock className="mr-3 text-rose-600 text-lg" />
                    <span className="font-medium">Change Password</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <FaShieldAlt className="mr-3 text-rose-600 text-lg" />
                    <span className="font-medium">Privacy Settings</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <FaCog className="mr-3 text-rose-600 text-lg" />
                    <span className="font-medium">Preferences</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <hr className="my-3" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-3 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <FaSignOutAlt className="mr-3 text-rose-600 text-lg" />
                    <span className="font-medium">Logout</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apartment/Suite</label>
                <input
                  type="text"
                  value={editForm.apartment || ''}
                  onChange={(e) => setEditForm({...editForm, apartment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={editForm.country || ''}
                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={editForm.zip || ''}
                    onChange={(e) => setEditForm({...editForm, zip: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


export default Profile;