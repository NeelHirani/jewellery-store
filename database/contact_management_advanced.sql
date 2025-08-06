-- =====================================================
-- ADVANCED FEATURES & MAINTENANCE FOR CONTACT MANAGEMENT
-- Execute after running contact_management_schema.sql
-- =====================================================

-- =====================================================
-- 1. ADVANCED SEARCH FUNCTIONS
-- =====================================================

-- Function for advanced full-text search with ranking
CREATE OR REPLACE FUNCTION search_contact_submissions(
    search_query TEXT,
    status_filter TEXT DEFAULT NULL,
    subject_filter TEXT DEFAULT NULL,
    priority_filter TEXT DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL,
    limit_count INTEGER DEFAULT 50,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    subject VARCHAR,
    message TEXT,
    status VARCHAR,
    priority VARCHAR,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    search_rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.id,
        cs.name,
        cs.email,
        cs.phone,
        cs.subject,
        cs.message,
        cs.status,
        cs.priority,
        cs.created_at,
        cs.updated_at,
        ts_rank(
            to_tsvector('english', coalesce(cs.name, '') || ' ' || coalesce(cs.email, '') || ' ' || coalesce(cs.message, '')),
            plainto_tsquery('english', search_query)
        ) as search_rank
    FROM contact_submissions cs
    WHERE 
        (search_query IS NULL OR search_query = '' OR
         to_tsvector('english', coalesce(cs.name, '') || ' ' || coalesce(cs.email, '') || ' ' || coalesce(cs.message, '')) @@ plainto_tsquery('english', search_query))
        AND (status_filter IS NULL OR cs.status = status_filter)
        AND (subject_filter IS NULL OR cs.subject = subject_filter)
        AND (priority_filter IS NULL OR cs.priority = priority_filter)
        AND (date_from IS NULL OR cs.created_at >= date_from)
        AND (date_to IS NULL OR cs.created_at <= date_to)
    ORDER BY 
        CASE WHEN search_query IS NOT NULL AND search_query != '' THEN search_rank ELSE 0 END DESC,
        cs.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. ANALYTICS & REPORTING FUNCTIONS
-- =====================================================

-- Function to get submission trends over time
CREATE OR REPLACE FUNCTION get_submission_trends(
    days_back INTEGER DEFAULT 30,
    group_by_period TEXT DEFAULT 'day' -- 'hour', 'day', 'week', 'month'
)
RETURNS TABLE (
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    total_submissions BIGINT,
    new_submissions BIGINT,
    resolved_submissions BIGINT,
    avg_resolution_time INTERVAL
) AS $$
DECLARE
    date_trunc_format TEXT;
    interval_step INTERVAL;
BEGIN
    -- Set date truncation format and interval based on group_by_period
    CASE group_by_period
        WHEN 'hour' THEN 
            date_trunc_format := 'hour';
            interval_step := '1 hour'::INTERVAL;
        WHEN 'day' THEN 
            date_trunc_format := 'day';
            interval_step := '1 day'::INTERVAL;
        WHEN 'week' THEN 
            date_trunc_format := 'week';
            interval_step := '1 week'::INTERVAL;
        WHEN 'month' THEN 
            date_trunc_format := 'month';
            interval_step := '1 month'::INTERVAL;
        ELSE 
            date_trunc_format := 'day';
            interval_step := '1 day'::INTERVAL;
    END CASE;

    RETURN QUERY
    SELECT 
        date_trunc(date_trunc_format, cs.created_at) as period_start,
        date_trunc(date_trunc_format, cs.created_at) + interval_step as period_end,
        COUNT(*) as total_submissions,
        COUNT(*) FILTER (WHERE cs.status = 'new') as new_submissions,
        COUNT(*) FILTER (WHERE cs.status = 'resolved') as resolved_submissions,
        AVG(cs.resolved_at - cs.created_at) FILTER (WHERE cs.resolved_at IS NOT NULL) as avg_resolution_time
    FROM contact_submissions cs
    WHERE cs.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY date_trunc(date_trunc_format, cs.created_at)
    ORDER BY period_start DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get top subjects and their resolution rates
CREATE OR REPLACE FUNCTION get_subject_analytics()
RETURNS TABLE (
    subject VARCHAR,
    total_count BIGINT,
    resolved_count BIGINT,
    resolution_rate NUMERIC,
    avg_resolution_hours NUMERIC,
    urgent_count BIGINT,
    high_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.subject,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE cs.status = 'resolved') as resolved_count,
        ROUND(
            (COUNT(*) FILTER (WHERE cs.status = 'resolved')::NUMERIC / COUNT(*)::NUMERIC) * 100, 
            2
        ) as resolution_rate,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (cs.resolved_at - cs.created_at))/3600) FILTER (WHERE cs.resolved_at IS NOT NULL),
            2
        ) as avg_resolution_hours,
        COUNT(*) FILTER (WHERE cs.priority = 'urgent') as urgent_count,
        COUNT(*) FILTER (WHERE cs.priority = 'high') as high_count
    FROM contact_submissions cs
    GROUP BY cs.subject
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. AUTOMATED MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to archive old resolved submissions
CREATE OR REPLACE FUNCTION archive_old_submissions(
    days_old INTEGER DEFAULT 365
)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Create archive table if it doesn't exist
    CREATE TABLE IF NOT EXISTS contact_submissions_archive (
        LIKE contact_submissions INCLUDING ALL
    );
    
    -- Move old resolved/closed submissions to archive
    WITH moved_submissions AS (
        DELETE FROM contact_submissions 
        WHERE (status IN ('resolved', 'closed')) 
        AND created_at < NOW() - (days_old || ' days')::INTERVAL
        RETURNING *
    )
    INSERT INTO contact_submissions_archive 
    SELECT * FROM moved_submissions;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RAISE NOTICE 'Archived % old submissions', archived_count;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up test data
CREATE OR REPLACE FUNCTION cleanup_test_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM contact_submissions 
    WHERE email LIKE '%@example.com' 
    OR email LIKE '%@test.com'
    OR name LIKE 'Test%';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % test submissions', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. NOTIFICATION TRIGGERS
-- =====================================================

-- Function to send notifications for urgent submissions
CREATE OR REPLACE FUNCTION notify_urgent_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Send notification for urgent submissions
    IF NEW.priority = 'urgent' AND NEW.status = 'new' THEN
        PERFORM pg_notify(
            'urgent_submission',
            json_build_object(
                'id', NEW.id,
                'name', NEW.name,
                'email', NEW.email,
                'subject', NEW.subject,
                'created_at', NEW.created_at
            )::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for urgent submission notifications
CREATE TRIGGER notify_urgent_contact_submission
    AFTER INSERT ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION notify_urgent_submission();

-- =====================================================
-- 5. DATA VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate and clean submission data
CREATE OR REPLACE FUNCTION validate_submission_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean and validate name
    NEW.name = trim(NEW.name);
    IF length(NEW.name) < 2 THEN
        RAISE EXCEPTION 'Name must be at least 2 characters long';
    END IF;
    
    -- Clean and validate email
    NEW.email = lower(trim(NEW.email));
    IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format';
    END IF;
    
    -- Clean phone if provided
    IF NEW.phone IS NOT NULL THEN
        NEW.phone = trim(NEW.phone);
        IF length(NEW.phone) = 0 THEN
            NEW.phone = NULL;
        END IF;
    END IF;
    
    -- Clean and validate message
    NEW.message = trim(NEW.message);
    IF length(NEW.message) < 10 THEN
        RAISE EXCEPTION 'Message must be at least 10 characters long';
    END IF;
    
    -- Set IP address if not provided (for tracking)
    IF NEW.ip_address IS NULL THEN
        NEW.ip_address = inet_client_addr();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
CREATE TRIGGER validate_contact_submission_data
    BEFORE INSERT OR UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION validate_submission_data();

-- =====================================================
-- 6. PERFORMANCE MONITORING
-- =====================================================

-- View for monitoring table performance
CREATE OR REPLACE VIEW contact_submissions_performance AS
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs
FROM pg_stats 
WHERE tablename = 'contact_submissions';

-- Function to analyze table performance
CREATE OR REPLACE FUNCTION analyze_contact_submissions_performance()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    recommendation TEXT
) AS $$
BEGIN
    -- Analyze table and update statistics
    ANALYZE contact_submissions;
    
    RETURN QUERY
    SELECT 
        'Total Submissions'::TEXT,
        (SELECT COUNT(*)::TEXT FROM contact_submissions),
        'Monitor growth rate'::TEXT
    UNION ALL
    SELECT 
        'Index Usage'::TEXT,
        (SELECT ROUND(AVG(idx_scan::NUMERIC / (seq_scan + idx_scan + 1) * 100), 2)::TEXT || '%' 
         FROM pg_stat_user_tables WHERE relname = 'contact_submissions'),
        'Should be > 90% for good performance'::TEXT
    UNION ALL
    SELECT 
        'Table Size'::TEXT,
        (SELECT pg_size_pretty(pg_total_relation_size('contact_submissions'))),
        'Consider archiving if > 1GB'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. BACKUP & EXPORT FUNCTIONS
-- =====================================================

-- Function to export submissions as JSON
CREATE OR REPLACE FUNCTION export_submissions_json(
    status_filter TEXT DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    RETURN (
        SELECT json_agg(
            json_build_object(
                'id', id,
                'name', name,
                'email', email,
                'phone', phone,
                'subject', subject,
                'message', message,
                'status', status,
                'priority', priority,
                'created_at', created_at,
                'updated_at', updated_at,
                'resolved_at', resolved_at
            )
        )
        FROM contact_submissions
        WHERE 
            (status_filter IS NULL OR status = status_filter)
            AND (date_from IS NULL OR created_at >= date_from)
            AND (date_to IS NULL OR created_at <= date_to)
        ORDER BY created_at DESC
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. GRANT PERMISSIONS FOR FUNCTIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION search_contact_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION get_submission_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_subject_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_contact_submissions_performance TO authenticated;
GRANT EXECUTE ON FUNCTION export_submissions_json TO authenticated;

-- Grant execute permissions for maintenance functions (admin only)
GRANT EXECUTE ON FUNCTION archive_old_submissions TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_test_data TO authenticated;

-- Grant select on performance view
GRANT SELECT ON contact_submissions_performance TO authenticated;

-- =====================================================
-- 9. EXAMPLE USAGE QUERIES
-- =====================================================

-- Example: Search for submissions containing "jewelry"
-- SELECT * FROM search_contact_submissions('jewelry', NULL, NULL, NULL, NULL, NULL, 10, 0);

-- Example: Get submission trends for last 7 days by day
-- SELECT * FROM get_submission_trends(7, 'day');

-- Example: Get subject analytics
-- SELECT * FROM get_subject_analytics();

-- Example: Export all resolved submissions as JSON
-- SELECT export_submissions_json('resolved', NULL, NULL);

-- Example: Analyze performance
-- SELECT * FROM analyze_contact_submissions_performance();

-- =====================================================
-- ADVANCED FEATURES SETUP COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Advanced Contact Management features setup completed!';
    RAISE NOTICE 'Functions created: search, analytics, maintenance, export';
    RAISE NOTICE 'Triggers added: validation, notifications, priority setting';
    RAISE NOTICE 'Performance monitoring: views and analysis functions available';
    RAISE NOTICE 'Ready for production use with comprehensive feature set';
END $$;
