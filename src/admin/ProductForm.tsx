import React, { useState, useEffect } from 'react';
import { FaSave, FaArrowLeft, FaImage, FaTimes } from 'react-icons/fa';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

interface ProductFormData {
  name: string;
  price: string;
  short_description: string;
  detailed_description: string;
  category: string;
  metal: string;
  stone: string;
  occasion: string;
  additional_images: string[];
}

interface ProductFormProps {
  product?: any;
  onClose: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onClose }) => {
  const isEditing = Boolean(product);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: '',
    short_description: '',
    detailed_description: '',
    category: '',
    metal: '',
    stone: '',
    occasion: '',
    additional_images: ['', '', '', '', '']
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [metalTypes, setMetalTypes] = useState<any[]>([]);
  const [stoneTypes, setStoneTypes] = useState<any[]>([]);
  const [occasions, setOccasions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<any>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    fetchDropdownData();
    if (isEditing) {
      setFormData({
        name: product.name || '',
        price: product.price || '',
        short_description: product.short_description || '',
        detailed_description: product.detailed_description || '',
        category: product.category || '',
        metal: product.metal || '',
        stone: product.stone || '',
        occasion: product.occasion || '',
        additional_images: product.additional_images?.length
          ? [...product.additional_images, ...Array(5 - product.additional_images.length).fill('')]
          : ['', '', '', '', '']
      });
      setImagePreviews(
        product.additional_images?.length
          ? [...product.additional_images, ...Array(5 - product.additional_images.length).fill('')]
          : ['', '', '', '', '']
      );
    }
  }, [product, isEditing]);

  const fetchDropdownData = async () => {
    try {
      const [categoriesRes, metalsRes, stonesRes, occasionsRes] = await Promise.all([
        supabase.from('categories').select('name').order('name'),
        supabase.from('metal_types').select('name').order('name'),
        supabase.from('stone_types').select('name').order('name'),
        supabase.from('occasions').select('name').order('name')
      ]);

      setCategories(categoriesRes.data || []);
      setMetalTypes(metalsRes.data || []);
      setStoneTypes(stonesRes.data || []);
      setOccasions(occasionsRes.data || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setFormData(prev => {
          const newImages = [...prev.additional_images];
          newImages[index] = base64String;
          return { ...prev, additional_images: newImages };
        });
        setImagePreviews(prev => {
          const newPreviews = [...prev];
          newPreviews[index] = base64String;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index): void => {
    setFormData(prev => {
      const newImages = [...prev.additional_images];
      newImages[index] = '';
      return { ...prev, additional_images: newImages };
    });
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index] = '';
      return newPreviews;
    });
  };

  const validateForm = (): boolean => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.metal) newErrors.metal = 'Metal type is required';
    if (!formData.stone) newErrors.stone = 'Stone type is required';
    if (!formData.occasion) newErrors.occasion = 'Occasion is required';
    if (!formData.short_description.trim()) newErrors.short_description = 'Short description is required';
    if (!formData.detailed_description.trim()) newErrors.detailed_description = 'Detailed description is required';
    if (!formData.additional_images.some(img => img && img !== '')) {
      newErrors.additional_images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        short_description: formData.short_description || '',
        detailed_description: formData.detailed_description || '',
        category: formData.category,
        metal: formData.metal,
        stone: formData.stone,
        occasion: formData.occasion,
        additional_images: formData.additional_images.filter(img => img && img !== '') || []
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('Product created successfully!');
      }

      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter product name"
                disabled={loading}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metal Type *
              </label>
              <select
                name="metal"
                value={formData.metal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                disabled={loading}
              >
                <option value="">Select Metal</option>
                {metalTypes.map((metal: any) => (
                  <option key={metal.name} value={metal.name}>
                    {metal.name}
                  </option>
                ))}
              </select>
              {errors.metal && <p className="mt-1 text-sm text-red-600">{errors.metal}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stone Type *
              </label>
              <select
                name="stone"
                value={formData.stone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                disabled={loading}
              >
                <option value="">Select Stone</option>
                {stoneTypes.map((stone: any) => (
                  <option key={stone.name} value={stone.name}>
                    {stone.name}
                  </option>
                ))}
              </select>
              {errors.stone && <p className="mt-1 text-sm text-red-600">{errors.stone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                disabled={loading}
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occasion *
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-8"
                disabled={loading}
              >
                <option value="">Select Occasion</option>
                {occasions.map((occasion: any) => (
                  <option key={occasion.name} value={occasion.name}>
                    {occasion.name}
                  </option>
                ))}
              </select>
              {errors.occasion && <p className="mt-1 text-sm text-red-600">{errors.occasion}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description *
            </label>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.short_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a brief description (max 500 characters)"
              disabled={loading}
            />
            {errors.short_description && <p className="mt-1 text-sm text-red-600">{errors.short_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="detailed_description"
              value={formData.detailed_description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.detailed_description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter a detailed description (max 500 characters)"
              disabled={loading}
            />
            {errors.detailed_description && <p className="mt-1 text-sm text-red-600">{errors.detailed_description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images * (Up to 5)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview: any, index: number) => (
                <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-auto">
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt={`Product preview ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        disabled={loading}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <label className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-gray-900">
                            Upload image {index + 1}
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, index)}
                            disabled={loading}
                          />
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.additional_images && <p className="mt-2 text-sm text-red-600">{errors.additional_images}</p>}
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                isEditing ? 'Update Product' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductForm;