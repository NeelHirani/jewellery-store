-- Contact Submissions Table Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_subject ON contact_submissions(subject);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to read all contact submissions
CREATE POLICY "Admin users can view all contact submissions" ON contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Policy for admin users to update contact submissions
CREATE POLICY "Admin users can update contact submissions" ON contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Policy for admin users to delete contact submissions
CREATE POLICY "Admin users can delete contact submissions" ON contact_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = auth.jwt() ->> 'email' 
            AND users.role = 'admin'
        )
    );

-- Policy to allow anyone to insert contact submissions (public contact form)
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_submissions TO authenticated;
GRANT SELECT, INSERT ON contact_submissions TO anon;

-- Create a view for admin dashboard statistics
CREATE OR REPLACE VIEW contact_submissions_stats AS
SELECT 
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'new') as new_submissions,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_submissions,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_submissions,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_submissions
FROM contact_submissions;

-- Grant access to the stats view
GRANT SELECT ON contact_submissions_stats TO authenticated;

-- Insert some sample data for testing (optional)
INSERT INTO contact_submissions (name, email, phone, subject, message, status) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0123', 'General Inquiry', 'I am interested in your custom jewelry services. Could you please provide more information about the process and pricing?', 'new'),
('Jane Smith', 'jane.smith@example.com', '+1-555-0124', 'Product Question', 'I saw a beautiful necklace on your website but I need to know if it comes in different sizes. The product ID is #12345.', 'in_progress'),
('Mike Johnson', 'mike.johnson@example.com', NULL, 'Support', 'I placed an order last week but haven''t received any tracking information. My order number is #ORD-2024-001.', 'new'),
('Sarah Wilson', 'sarah.wilson@example.com', '+1-555-0125', 'Custom Order', 'I would like to commission a custom engagement ring. I have specific requirements for the design and would like to discuss the details.', 'resolved'),
('David Brown', 'david.brown@example.com', '+1-555-0126', 'Complaint', 'I received my order yesterday but the item was damaged during shipping. I need assistance with a replacement or refund.', 'new');

-- Enable real-time subscriptions for the table
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;
