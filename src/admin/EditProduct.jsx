import React, { useState, useEffect } from 'react';
import ProductForm from './ProductForm';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const EditProduct = ({ id, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setProduct(data || null);
      } catch (err) {
        setError('Failed to load product details.');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-6">{error}</div>;
  }

  if (!product) {
    return <div className="text-gray-600 text-center p-6">Product not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6"
    >
      <ProductForm product={product} onClose={onClose} />
    </motion.div>
  );
};

export default EditProduct;