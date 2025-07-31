-- Fix Orders and Order Items Table Schema
-- This script fixes the foreign key constraint issues in the orders and order_items tables
-- by making them reference the custom public.users table instead of auth.users

-- Step 1: Drop existing tables if they exist (in correct order due to foreign key dependencies)
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Step 2: Create the corrected orders table
CREATE TABLE public.orders (
  id serial NOT NULL,
  user_id integer NOT NULL,  -- Changed from uuid to integer to match your custom users table
  total_amount numeric(10,2) NOT NULL,
  shipping_address jsonb NULL,  -- Store shipping address as JSON for flexibility
  payment_status text NOT NULL DEFAULT 'pending'::text,
  order_status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,  -- Now references your custom users table
  CONSTRAINT orders_payment_status_check CHECK (
    payment_status = ANY (
      ARRAY[
        'pending'::text,
        'processing'::text,
        'completed'::text,
        'failed'::text,
        'refunded'::text
      ]
    )
  ),
  CONSTRAINT orders_order_status_check CHECK (
    order_status = ANY (
      ARRAY[
        'pending'::text,
        'processing'::text,
        'shipped'::text,
        'delivered'::text,
        'cancelled'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- Step 3: Create the order_items table
CREATE TABLE public.order_items (
  id serial NOT NULL,
  order_id integer NOT NULL,
  product_id integer NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  size text NULL,
  price_at_purchase numeric(10,2) NOT NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders (id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products (id) ON DELETE CASCADE,
  CONSTRAINT order_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT order_items_price_check CHECK (price_at_purchase >= 0)
) TABLESPACE pg_default;

-- Step 4: Create indexes for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Step 5: Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Add some sample data (optional - uncomment if you want test data)
/*
-- Sample orders (make sure the user_id exists in your users table)
INSERT INTO public.orders (user_id, total_amount, shipping_address, payment_status, order_status) VALUES
(1, 299.99, '{"fullName": "John Doe", "addressLine1": "123 Main St", "city": "New York", "state": "NY", "postalCode": "10001", "country": "USA"}', 'completed', 'processing'),
(2, 599.99, '{"fullName": "Jane Smith", "addressLine1": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "postalCode": "90210", "country": "USA"}', 'completed', 'shipped');

-- Sample order items (make sure the product_id exists in your products table)
INSERT INTO public.order_items (order_id, product_id, quantity, size, price_at_purchase) VALUES
(1, 1, 1, 'Medium', 299.99),
(2, 2, 2, 'Large', 299.99);
*/

-- Step 7: Grant necessary permissions (if needed)
-- Uncomment if you need to grant permissions to specific roles
-- GRANT ALL ON public.orders TO authenticated;
-- GRANT ALL ON public.orders TO anon;
-- GRANT ALL ON public.order_items TO authenticated;
-- GRANT ALL ON public.order_items TO anon;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
