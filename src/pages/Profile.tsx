import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHeart,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaLock,
  FaEdit,
  FaCreditCard,
  FaHistory,
  FaHeadset,
  FaCog,
  FaShieldAlt,
  FaPlus,
  FaTrash,
  FaTimes,
  FaSave,
  FaHome,
  FaBriefcase
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
  // const [activeTab, setActiveTab] = useState<any>('overview'); // Unused
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<any>({});

  // Address management state
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<any>({
    id: '',
    label: 'Home',
    fullName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState<any>({});

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

  // Address management functions
  const loadAddresses = (): void => {
    try {
      const savedAddresses = localStorage.getItem(`addresses_${user.email}`);
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      } else {
        // Convert existing user address to new format if it exists
        if (fullAddress) {
          const defaultAddress = {
            id: 'default',
            label: 'Home',
            fullName: user.name || '',
            address: user.address || '',
            apartment: user.apartment || '',
            city: user.city || '',
            state: user.state || '',
            country: user.country || '',
            zip: user.zip || '',
            isDefault: true
          };
          setAddresses([defaultAddress]);
          localStorage.setItem(`addresses_${user.email}`, JSON.stringify([defaultAddress]));
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const openAddressModal = (address?: any): void => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm(address);
    } else {
      setEditingAddressId(null);
      setAddressForm({
        id: '',
        label: 'Home',
        fullName: user.name || '',
        address: '',
        apartment: '',
        city: '',
        state: '',
        country: '',
        zip: '',
        isDefault: addresses.length === 0
      });
    }
    setAddressErrors({});
    setShowAddressModal(true);
  };

  const closeAddressModal = (): void => {
    setShowAddressModal(false);
    setEditingAddressId(null);
    setAddressForm({});
    setAddressErrors({});
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateAddressForm = (): boolean => {
    const errors: any = {};

    if (!addressForm.fullName?.trim()) errors.fullName = 'Full name is required';
    if (!addressForm.address?.trim()) errors.address = 'Address is required';
    if (!addressForm.city?.trim()) errors.city = 'City is required';
    if (!addressForm.state?.trim()) errors.state = 'State/Province is required';
    if (!addressForm.country?.trim()) errors.country = 'Country is required';
    if (!addressForm.zip?.trim()) errors.zip = 'Postal/ZIP code is required';

    if (!addressForm.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(addressForm.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveAddress = async (): Promise<void> => {
    if (!validateAddressForm()) return;

    try {
      const newAddress = {
        ...addressForm,
        id: editingAddressId || `addr_${Date.now()}`
      };

      let updatedAddresses;
      if (editingAddressId) {
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddressId ? newAddress : addr
        );
      } else {
        updatedAddresses = [...addresses, newAddress];
      }

      // If this is set as default, remove default from others
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }

      setAddresses(updatedAddresses);
      localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));

      // Update main user address if this is the default
      if (newAddress.isDefault) {
        const updatedUser = {
          ...user,
          address: newAddress.address,
          apartment: newAddress.apartment,
          city: newAddress.city,
          state: newAddress.state,
          country: newAddress.country,
          zip: newAddress.zip
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      closeAddressModal();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const deleteAddress = (addressId: string): void => {
    const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));
  };

  const setDefaultAddress = (addressId: string): void => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    setAddresses(updatedAddresses);
    localStorage.setItem(`addresses_${user.email}`, JSON.stringify(updatedAddresses));

    // Update main user address
    const defaultAddr = updatedAddresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      const updatedUser = {
        ...user,
        address: defaultAddr.address,
        apartment: defaultAddr.apartment,
        city: defaultAddr.city,
        state: defaultAddr.state,
        country: defaultAddr.country,
        zip: defaultAddr.zip
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Load addresses when user changes
  React.useEffect(() => {
    if (user.email && user.email !== 'guest@example.com') {
      loadAddresses();
    }
  }, [user.email]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white pt-20 pb-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-[#800000] to-[#5a0d15] text-white px-6 py-8 text-center"
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
              <div className="bg-gradient-to-br from-[#800000] to-[#5a0d15] text-white text-3xl font-bold rounded-full w-full h-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-105">
                {avatarLetter}
              </div>
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#800000]">{user.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{user.email}</p>
            <p className="text-xs text-gray-500 mt-2">Joined {user.joinDate}</p>

            <div className="mt-6 text-left">
              <p className="text-sm font-medium text-[#800000] mb-2">Profile Completion</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-[#800000] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.profileCompletion}%` }}
                  transition={{ duration: 1 }}
                ></motion.div>
              </div>
              <p className="text-xs text-[#800000] mt-1 font-medium">
                {user.profileCompletion}% Complete
              </p>
            </div>

            {/* Edit Profile Button */}
            <div className="mt-6">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center justify-center px-4 py-2 bg-[#800000] text-white text-sm font-medium rounded-lg hover:bg-[#5a0d15] transition-colors"
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
                <h4 className="text-lg font-serif font-semibold text-[#800000] flex items-center">
                  <FaShoppingBag className="mr-2 text-[#800000] text-xl" /> My Orders
                </h4>
                {orders.length > 0 && (
                  <span className="bg-rose-100 text-[#800000] text-xs font-medium px-2.5 py-0.5 rounded-full">
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
                            order.order_status === 'shipped' ? 'bg-rose-100 text-[#800000]' :
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
                      className="text-sm text-[#800000] font-medium hover:text-[#5a0d15] transition inline-block"
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
                    className="inline-flex items-center px-4 py-2 bg-[#800000] text-white text-sm font-medium rounded-lg hover:bg-[#5a0d15] transition-colors"
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
              <h4 className="text-lg font-serif font-semibold text-[#800000] flex items-center mb-3">
                <FaHeart className="mr-2 text-rose-500 text-xl" /> My Wishlist
              </h4>
              <p className="text-gray-600 text-sm">Your wishlist is currently empty.</p>
              <button className="text-sm text-[#800000] font-medium hover:text-[#5a0d15] transition mt-3">
                Add Your Favorites
              </button>
            </motion.div>

            {/* Address Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-serif font-semibold text-[#800000] flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-[#800000] text-xl" /> Saved Addresses
                </h4>
                <button
                  onClick={() => openAddressModal()}
                  className="flex items-center px-3 py-2 bg-[#800000] text-white text-sm font-medium rounded-lg hover:bg-[#5a0d15] transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Add New
                </button>
              </div>

              {/* Address Cards */}
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address, index) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        address.isDefault
                          ? 'border-[#800000] bg-rose-50'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="flex items-center text-sm font-medium text-gray-900">
                              {address.label === 'Home' && <FaHome className="mr-1 text-[#800000]" />}
                              {address.label === 'Work' && <FaBriefcase className="mr-1 text-[#800000]" />}
                              {address.label !== 'Home' && address.label !== 'Work' && <FaMapMarkerAlt className="mr-1 text-[#800000]" />}
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-[#800000] text-white text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-gray-700 text-sm space-y-1">
                            <p className="font-medium">{address.fullName}</p>
                            <p>{address.address}</p>
                            {address.apartment && <p>{address.apartment}</p>}
                            <p>{[address.city, address.state].filter(Boolean).join(", ")} {address.zip}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => openAddressModal(address)}
                            className="p-2 text-gray-400 hover:text-[#800000] transition-colors"
                            title="Edit address"
                          >
                            <FaEdit />
                          </button>
                          {!address.isDefault && (
                            <button
                              onClick={() => setDefaultAddress(address.id)}
                              className="p-2 text-gray-400 hover:text-[#800000] transition-colors"
                              title="Set as default"
                            >
                              <FaHome />
                            </button>
                          )}
                          {addresses.length > 1 && (
                            <button
                              onClick={() => deleteAddress(address.id)}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete address"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-600 text-sm mb-4">No addresses saved yet.</p>
                  <button
                    onClick={() => openAddressModal()}
                    className="inline-flex items-center px-4 py-2 bg-[#800000] text-white text-sm font-medium rounded-lg hover:bg-[#5a0d15] transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Add Your First Address
                  </button>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition duration-300 border border-rose-200"
            >
              <h4 className="text-lg font-serif font-semibold text-[#800000] mb-4">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-rose-600">
                  <FaHeart className="text-xl mb-2" />
                  <span className="text-sm font-medium">Wishlist</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-[#800000]">
                  <FaHistory className="text-xl mb-2" />
                  <span className="text-sm font-medium">Order History</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-[#800000]">
                  <FaCreditCard className="text-xl mb-2" />
                  <span className="text-sm font-medium">Payment</span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-rose-200 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 text-rose-600">
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
              <h4 className="text-lg font-serif font-semibold text-[#800000] mb-4">
                Account Settings
              </h4>
              <div className="space-y-3">
                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-[#800000] hover:bg-rose-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center">
                    <FaLock className="mr-3 text-[#800000] text-lg" />
                    <span className="font-medium">Change Password</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-[#800000] hover:bg-rose-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <FaShieldAlt className="mr-3 text-[#800000] text-lg" />
                    <span className="font-medium">Privacy Settings</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="w-full flex items-center justify-between p-3 text-gray-700 hover:text-[#800000] hover:bg-rose-50 rounded-lg transition-all duration-200">
                  <div className="flex items-center">
                    <FaCog className="mr-3 text-[#800000] text-lg" />
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

      {/* Address Management Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif font-semibold text-gray-900">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={closeAddressModal}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <form className="space-y-4">
              {/* Address Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Label</label>
                <select
                  value={addressForm.label || 'Home'}
                  onChange={(e) => setAddressForm({...addressForm, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Billing">Billing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.fullName || ''}
                  onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                    addressErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {addressErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{addressErrors.fullName}</p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressForm.address || ''}
                  onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                    addressErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Street address, P.O. box"
                />
                {addressErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{addressErrors.address}</p>
                )}
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressForm.apartment || ''}
                  onChange={(e) => setAddressForm({...addressForm, apartment: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.city || ''}
                    onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                      addressErrors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="City"
                  />
                  {addressErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.state || ''}
                    onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                      addressErrors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="State"
                  />
                  {addressErrors.state && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Country and ZIP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.country || ''}
                    onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                      addressErrors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Country"
                  />
                  {addressErrors.country && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.country}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal/ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addressForm.zip || ''}
                    onChange={(e) => setAddressForm({...addressForm, zip: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                      addressErrors.zip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ZIP Code"
                  />
                  {addressErrors.zip && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.zip}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={addressForm.phoneNumber || ''}
                    onChange={(e) => setAddressForm({...addressForm, phoneNumber: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent ${
                      addressErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {addressErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Set as Default */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault || false}
                  onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                  className="w-4 h-4 text-[#800000] border-gray-300 rounded focus:ring-[#800000] focus:ring-2"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  Set as default address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeAddressModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAddress}
                  className="flex-1 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#5a0d15] transition-colors flex items-center justify-center"
                >
                  <FaSave className="mr-2" />
                  {editingAddressId ? 'Update' : 'Save'} Address
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