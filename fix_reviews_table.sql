-- Fix Reviews Table Schema
-- This script fixes the foreign key constraint issue in the reviews table
-- by making it reference the custom public.users table instead of auth.users

-- Step 1: Drop the existing reviews table if it exists
DROP TABLE IF EXISTS public.reviews CASCADE;

-- Step 2: Create the corrected reviews table
CREATE TABLE public.reviews (
  id serial NOT NULL,
  product_id integer NULL,
  user_id integer NULL,  -- Changed from uuid to integer to match your custom users table
  rating numeric NULL,
  comment text NULL,
  status text NULL DEFAULT 'pending'::text,
  created_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE,  -- Now references your custom users table
  CONSTRAINT reviews_rating_check CHECK (
    (
      (rating >= (0)::numeric)
      AND (rating <= (5)::numeric)
    )
  ),
  CONSTRAINT reviews_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'pending'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Step 3: Add some sample data (optional)
-- You can uncomment these lines if you want to add some test reviews
/*
INSERT INTO public.reviews (product_id, user_id, rating, comment, status) VALUES
(1, 1, 5, 'Beautiful jewelry! Excellent quality and fast shipping.', 'approved'),
(1, 2, 4, 'Love the design, but wish it came in more colors.', 'approved'),
(2, 1, 5, 'Perfect for special occasions. Highly recommended!', 'approved');
*/

-- Step 4: Grant necessary permissions (if needed)
-- Uncomment if you need to grant permissions to specific roles
-- GRANT ALL ON public.reviews TO authenticated;
-- GRANT ALL ON public.reviews TO anon;
