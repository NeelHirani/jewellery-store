-- Contact Submissions Table Schema
-- This script creates a table to store contact form submissions from the Contact Us page

-- Step 1: Create the contact_submissions table
CREATE TABLE public.contact_submissions (
  id serial NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NULL,
  subject text NOT NULL DEFAULT 'General Inquiry'::text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'::text,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT contact_submissions_status_check CHECK (
    status = ANY (
      ARRAY[
        'new'::text,
        'in_progress'::text,
        'resolved'::text,
        'closed'::text
      ]
    )
  ),
  CONSTRAINT contact_submissions_subject_check CHECK (
    subject = ANY (
      ARRAY[
        'General Inquiry'::text,
        'Product Question'::text,
        'Custom Order'::text,
        'Support'::text,
        'Complaint'::text,
        'Partnership'::text
      ]
    )
  )
) TABLESPACE pg_default;

-- Step 2: Create indexes for better performance
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX idx_contact_submissions_subject ON public.contact_submissions(subject);

-- Step 3: Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contact_submissions_updated_at 
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Step 4: Add some sample data (optional - uncomment if you want test data)
/*
INSERT INTO public.contact_submissions (name, email, phone, subject, message, status) VALUES
('John Doe', 'john.doe@example.com', '+91 98765 43210', 'Product Question', 'I am interested in your diamond rings collection. Could you please provide more information about the pricing and availability?', 'new'),
('Jane Smith', 'jane.smith@example.com', NULL, 'Custom Order', 'I would like to create a custom engagement ring. Can we schedule a consultation?', 'in_progress'),
('Mike Johnson', 'mike.johnson@example.com', '+91 87654 32109', 'Support', 'I have an issue with my recent order #12345. The delivery was delayed.', 'resolved');
*/

-- Step 5: Grant necessary permissions (if needed)
-- Uncomment if you need to grant permissions to specific roles
-- GRANT ALL ON public.contact_submissions TO authenticated;
-- GRANT ALL ON public.contact_submissions TO anon;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 6: Enable Row Level Security (optional but recommended)
-- ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (uncomment if you enable RLS)
/*
-- Allow anyone to insert contact submissions
CREATE POLICY "Anyone can insert contact submissions" ON public.contact_submissions
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view their own submissions
CREATE POLICY "Users can view their own submissions" ON public.contact_submissions
FOR SELECT USING (auth.email() = email);

-- Allow admin users to view all submissions (you'll need to define admin role)
-- CREATE POLICY "Admins can view all submissions" ON public.contact_submissions
-- FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
*/
