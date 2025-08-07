import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

interface AddCategoryProps {
  onClose?: () => void;
}

interface CategoryFormData {
  name: string;
  icon: string;
}

const AddCategory: React.FC<AddCategoryProps> = ({ onClose }) => {
  // const navigate = useNavigate(); // Unused
  const [formData, setFormData] = useState<CategoryFormData>({ name: '', icon: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ name: formData.name.trim(), icon: formData.icon || null }]);

      if (error) throw error;

      alert('Category added successfully!');
      onClose?.(); // Close the modal on success
    } catch (error) {
      setError('Failed to add category. Please try again.');
      console.error('Error adding category:', error);
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Category</h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 max-h-[calc(100vh-12rem)] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter category name"
              disabled={loading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon (Optional)
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter Font Awesome icon class (e.g., fas fa-circle)"
              disabled={loading}
            />
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
                'Add Category'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddCategory;