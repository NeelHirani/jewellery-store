-- =====================================================
-- COMPREHENSIVE CONTACT MANAGEMENT SYSTEM SCHEMA
-- For Supabase Database - Execute in SQL Editor
-- =====================================================

-- Drop existing table and dependencies if they exist (for clean setup)
DROP TRIGGER IF EXISTS update_contact_submissions_updated_at ON contact_submissions;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP VIEW IF EXISTS contact_submissions_stats;
DROP TABLE IF EXISTS contact_submissions CASCADE;

-- =====================================================
-- 1. MAIN TABLE STRUCTURE
-- =====================================================

-- Create the contact_submissions table with UUID primary key
CREATE TABLE contact_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
    email VARCHAR(255) NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(50) CHECK (phone IS NULL OR length(trim(phone)) > 0),
    subject VARCHAR(255) NOT NULL CHECK (length(trim(subject)) > 0),
    message TEXT NOT NULL CHECK (length(trim(message)) > 0),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Additional metadata for enhanced functionality
    ip_address INET,
    user_agent TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    notes TEXT
);

-- Add table comments for documentation
COMMENT ON TABLE contact_submissions IS 'Stores customer contact form submissions with status tracking';
COMMENT ON COLUMN contact_submissions.id IS 'Unique identifier for each submission';
COMMENT ON COLUMN contact_submissions.status IS 'Current status: new, in_progress, resolved, closed';
COMMENT ON COLUMN contact_submissions.priority IS 'Priority level based on subject type';
COMMENT ON COLUMN contact_submissions.assigned_to IS 'Admin user assigned to handle this submission';

-- =====================================================
-- 2. PERFORMANCE OPTIMIZATION - INDEXES
-- =====================================================

-- Primary indexes for frequent queries
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_updated_at ON contact_submissions(updated_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_subject ON contact_submissions(subject);
CREATE INDEX idx_contact_submissions_priority ON contact_submissions(priority);

-- Composite indexes for common filter combinations
CREATE INDEX idx_contact_submissions_status_created ON contact_submissions(status, created_at DESC);
CREATE INDEX idx_contact_submissions_subject_status ON contact_submissions(subject, status);

-- Full-text search indexes for search functionality
CREATE INDEX idx_contact_submissions_name_search ON contact_submissions USING gin(to_tsvector('english', name));
CREATE INDEX idx_contact_submissions_email_search ON contact_submissions USING gin(to_tsvector('english', email));
CREATE INDEX idx_contact_submissions_message_search ON contact_submissions USING gin(to_tsvector('english', message));

-- Combined full-text search index for global search
CREATE INDEX idx_contact_submissions_full_search ON contact_submissions 
USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(message, '')));

-- =====================================================
-- 3. AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Automatically set resolved_at when status changes to resolved
    IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
        NEW.resolved_at = NOW();
    END IF;
    
    -- Clear resolved_at if status changes from resolved to something else
    IF NEW.status != 'resolved' AND OLD.status = 'resolved' THEN
        NEW.resolved_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update timestamps
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. SECURITY - ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anyone to insert contact submissions (public contact form)
CREATE POLICY "Anyone can submit contact forms" ON contact_submissions
    FOR INSERT 
    WITH CHECK (true);

-- Policy 2: Admin users can view all contact submissions
CREATE POLICY "Admin users can view all contact submissions" ON contact_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = (auth.jwt() ->> 'email')
            AND users.role = 'admin'
        )
    );

-- Policy 3: Admin users can update contact submissions
CREATE POLICY "Admin users can update contact submissions" ON contact_submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = (auth.jwt() ->> 'email')
            AND users.role = 'admin'
        )
    );

-- Policy 4: Admin users can delete contact submissions
CREATE POLICY "Admin users can delete contact submissions" ON contact_submissions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.email = (auth.jwt() ->> 'email')
            AND users.role = 'admin'
        )
    );

-- =====================================================
-- 5. STATISTICS VIEW FOR DASHBOARD
-- =====================================================

-- Create a comprehensive statistics view for admin dashboard
CREATE OR REPLACE VIEW contact_submissions_stats AS
SELECT 
    -- Total counts
    COUNT(*) as total_submissions,
    COUNT(*) FILTER (WHERE status = 'new') as new_submissions,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_submissions,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_submissions,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_submissions,
    
    -- Time-based counts
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '1 day') as yesterday_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_submissions,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '365 days') as year_submissions,
    
    -- Priority counts
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_submissions,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_submissions,
    COUNT(*) FILTER (WHERE priority = 'normal') as normal_priority_submissions,
    COUNT(*) FILTER (WHERE priority = 'low') as low_priority_submissions,
    
    -- Subject breakdown
    COUNT(*) FILTER (WHERE subject = 'General Inquiry') as general_inquiries,
    COUNT(*) FILTER (WHERE subject = 'Product Question') as product_questions,
    COUNT(*) FILTER (WHERE subject = 'Custom Order') as custom_orders,
    COUNT(*) FILTER (WHERE subject = 'Support') as support_requests,
    COUNT(*) FILTER (WHERE subject = 'Complaint') as complaints,
    COUNT(*) FILTER (WHERE subject = 'Partnership') as partnership_requests,
    
    -- Performance metrics
    AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) FILTER (WHERE resolved_at IS NOT NULL) as avg_resolution_hours,
    COUNT(*) FILTER (WHERE resolved_at IS NOT NULL AND resolved_at - created_at <= INTERVAL '24 hours') as resolved_within_24h,
    COUNT(*) FILTER (WHERE status = 'new' AND created_at < CURRENT_DATE - INTERVAL '7 days') as overdue_submissions
FROM contact_submissions;

-- Grant access to the stats view
GRANT SELECT ON contact_submissions_stats TO authenticated;
GRANT SELECT ON contact_submissions_stats TO anon;

-- =====================================================
-- 6. REAL-TIME SUBSCRIPTIONS
-- =====================================================

-- Enable real-time subscriptions for the table
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users (admins)
GRANT SELECT, INSERT, UPDATE, DELETE ON contact_submissions TO authenticated;

-- Grant insert permission to anonymous users (public contact form)
GRANT INSERT ON contact_submissions TO anon;

-- Grant select permission on stats view
GRANT SELECT ON contact_submissions_stats TO authenticated;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to automatically set priority based on subject
CREATE OR REPLACE FUNCTION set_submission_priority()
RETURNS TRIGGER AS $$
BEGIN
    -- Set priority based on subject type
    CASE NEW.subject
        WHEN 'Complaint' THEN NEW.priority = 'urgent';
        WHEN 'Support' THEN NEW.priority = 'high';
        WHEN 'Custom Order' THEN NEW.priority = 'high';
        WHEN 'Partnership' THEN NEW.priority = 'normal';
        WHEN 'Product Question' THEN NEW.priority = 'normal';
        WHEN 'General Inquiry' THEN NEW.priority = 'low';
        ELSE NEW.priority = 'normal';
    END CASE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically set priority
CREATE TRIGGER set_contact_submission_priority
    BEFORE INSERT ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION set_submission_priority();

-- =====================================================
-- 9. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert comprehensive sample data for testing
INSERT INTO contact_submissions (name, email, phone, subject, message, status, priority, ip_address, user_agent) VALUES
('John Doe', 'john.doe@example.com', '+1-555-0123', 'General Inquiry', 'I am interested in your custom jewelry services. Could you please provide more information about the process, timeline, and pricing for custom engagement rings?', 'new', 'low', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),

('Jane Smith', 'jane.smith@example.com', '+1-555-0124', 'Product Question', 'I saw a beautiful diamond necklace on your website (Product ID: #DN-2024-001) but I need to know if it comes in different chain lengths. Also, do you offer matching earrings?', 'in_progress', 'normal', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),

('Mike Johnson', 'mike.johnson@example.com', NULL, 'Support', 'I placed an order last week (Order #ORD-2024-001) but haven''t received any tracking information. The payment was processed but I''m concerned about the delivery status.', 'new', 'high', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'),

('Sarah Wilson', 'sarah.wilson@example.com', '+1-555-0125', 'Custom Order', 'I would like to commission a custom engagement ring with a 2-carat diamond, platinum setting, and vintage-inspired design. Could we schedule a consultation to discuss the details and see some design options?', 'resolved', 'high', '192.168.1.103', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),

('David Brown', 'david.brown@example.com', '+1-555-0126', 'Complaint', 'I received my order yesterday but the item was damaged during shipping. The jewelry box was crushed and the necklace clasp is broken. I need immediate assistance with a replacement or full refund.', 'new', 'urgent', '192.168.1.104', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),

('Emily Davis', 'emily.davis@example.com', '+1-555-0127', 'Partnership', 'I represent a luxury boutique hotel chain and we''re interested in featuring your jewelry in our gift shops. Could we discuss a potential wholesale partnership and exclusive designs?', 'in_progress', 'normal', '192.168.1.105', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),

('Robert Taylor', 'robert.taylor@example.com', '+1-555-0128', 'General Inquiry', 'Do you offer jewelry cleaning and maintenance services? I have several pieces purchased from your store over the years that could use professional cleaning and inspection.', 'closed', 'low', '192.168.1.106', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),

('Lisa Anderson', 'lisa.anderson@example.com', NULL, 'Product Question', 'I''m looking for hypoallergenic jewelry options. Do you have pieces made with surgical steel or titanium? I have sensitive skin and need nickel-free options.', 'resolved', 'normal', '192.168.1.107', 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15');

-- Update some resolved submissions with resolved_at timestamps
UPDATE contact_submissions 
SET resolved_at = created_at + INTERVAL '2 days' 
WHERE status = 'resolved';

UPDATE contact_submissions 
SET resolved_at = created_at + INTERVAL '5 days' 
WHERE status = 'closed';

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- Verify indexes
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'contact_submissions';

-- Verify sample data
SELECT 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'new') as new_count,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
    COUNT(*) FILTER (WHERE status = 'closed') as closed_count
FROM contact_submissions;

-- Test the statistics view
SELECT * FROM contact_submissions_stats;

-- =====================================================
-- SCHEMA SETUP COMPLETE
-- =====================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Contact Management System schema setup completed successfully!';
    RAISE NOTICE 'Table: contact_submissions created with % sample records', (SELECT COUNT(*) FROM contact_submissions);
    RAISE NOTICE 'Indexes: % indexes created for optimal performance', (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'contact_submissions');
    RAISE NOTICE 'RLS Policies: 4 security policies enabled';
    RAISE NOTICE 'Real-time: Enabled for live updates';
    RAISE NOTICE 'Statistics View: contact_submissions_stats available';
END $$;
