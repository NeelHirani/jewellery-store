# Contact Management System - Database Setup Guide

## 📋 Overview

This guide provides step-by-step instructions for setting up the complete Contact Management System database schema in Supabase that perfectly matches the ContactManagement.jsx implementation.

## 🗄️ Files Included

1. **`contact_management_schema.sql`** - Main schema with table, indexes, security, and sample data
2. **`contact_management_advanced.sql`** - Advanced features, analytics, and maintenance functions
3. **`setup_guide.md`** - This setup guide
4. **`verification_queries.sql`** - Queries to verify the setup

## 🚀 Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Log into your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Create a new query

### Step 2: Execute Main Schema

1. Copy the entire contents of `contact_management_schema.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute
4. Verify success message appears

**Expected Output:**
```
Contact Management System schema setup completed successfully!
Table: contact_submissions created with 8 sample records
Indexes: 10 indexes created for optimal performance
RLS Policies: 4 security policies enabled
Real-time: Enabled for live updates
Statistics View: contact_submissions_stats available
```

### Step 3: Execute Advanced Features (Optional)

1. Copy the entire contents of `contact_management_advanced.sql`
2. Paste into a new SQL Editor query
3. Click **Run** to execute
4. Verify advanced features are installed

**Expected Output:**
```
Advanced Contact Management features setup completed!
Functions created: search, analytics, maintenance, export
Triggers added: validation, notifications, priority setting
Performance monitoring: views and analysis functions available
Ready for production use with comprehensive feature set
```

### Step 4: Verify Setup

Run these verification queries to ensure everything is working:

```sql
-- 1. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
ORDER BY ordinal_position;

-- 2. Check sample data
SELECT COUNT(*) as total_records, 
       COUNT(*) FILTER (WHERE status = 'new') as new_count
FROM contact_submissions;

-- 3. Check statistics view
SELECT * FROM contact_submissions_stats;

-- 4. Test search function (if advanced features installed)
SELECT * FROM search_contact_submissions('jewelry', NULL, NULL, NULL, NULL, NULL, 5, 0);
```

## 🔧 Configuration Details

### Table Structure

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Customer name |
| `email` | VARCHAR(255) | NOT NULL, EMAIL | Customer email |
| `phone` | VARCHAR(50) | NULLABLE | Customer phone |
| `subject` | VARCHAR(255) | NOT NULL | Inquiry subject |
| `message` | TEXT | NOT NULL | Customer message |
| `status` | VARCHAR(50) | DEFAULT 'new' | Status tracking |
| `created_at` | TIMESTAMPTZ | AUTO | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | AUTO | Update timestamp |
| `priority` | VARCHAR(20) | DEFAULT 'normal' | Priority level |
| `assigned_to` | UUID | NULLABLE | Assigned admin |
| `resolved_at` | TIMESTAMPTZ | NULLABLE | Resolution timestamp |

### Status Values

- `new` - Newly submitted (default)
- `in_progress` - Being handled by admin
- `resolved` - Issue resolved
- `closed` - Submission closed

### Priority Levels

- `urgent` - Complaints (auto-set)
- `high` - Support, Custom Orders (auto-set)
- `normal` - General inquiries, Product questions
- `low` - General inquiries (auto-set)

### Security Policies

1. **Public Insert** - Anyone can submit contact forms
2. **Admin Read** - Only admins can view submissions
3. **Admin Update** - Only admins can update submissions
4. **Admin Delete** - Only admins can delete submissions

### Performance Features

- **10 Indexes** for fast queries and searches
- **Full-text search** across name, email, and message
- **Composite indexes** for common filter combinations
- **Statistics view** for dashboard metrics

## 🔍 Verification Checklist

After setup, verify these features work:

- [ ] Table created with correct structure
- [ ] Sample data inserted (8 records)
- [ ] Indexes created for performance
- [ ] RLS policies enabled and working
- [ ] Real-time subscriptions enabled
- [ ] Statistics view accessible
- [ ] Triggers working (auto-timestamps, priority setting)
- [ ] Advanced functions available (if installed)

## 🛠️ Troubleshooting

### Common Issues

**Issue: Permission denied**
```sql
-- Solution: Ensure you're logged in as project owner or have sufficient permissions
```

**Issue: Table already exists**
```sql
-- Solution: The schema includes DROP statements, but you can manually drop:
DROP TABLE IF EXISTS contact_submissions CASCADE;
```

**Issue: RLS policies not working**
```sql
-- Solution: Verify your users table has admin role column:
SELECT email, role FROM users WHERE role = 'admin';
```

**Issue: Real-time not working**
```sql
-- Solution: Ensure real-time is enabled:
ALTER PUBLICATION supabase_realtime ADD TABLE contact_submissions;
```

### Testing Queries

```sql
-- Test insert (should work for anyone)
INSERT INTO contact_submissions (name, email, subject, message) 
VALUES ('Test User', 'test@example.com', 'Test Subject', 'Test message content');

-- Test admin access (should work only for admins)
SELECT * FROM contact_submissions LIMIT 5;

-- Test statistics view
SELECT total_submissions, new_submissions FROM contact_submissions_stats;

-- Test search functionality
SELECT name, email, subject FROM contact_submissions 
WHERE to_tsvector('english', name || ' ' || email || ' ' || message) 
@@ plainto_tsquery('english', 'jewelry');
```

## 📊 Dashboard Integration

The schema provides these views for admin dashboard:

### Statistics Available
- Total submissions by status
- Time-based metrics (today, week, month)
- Priority breakdown
- Subject category analysis
- Resolution time metrics
- Performance indicators

### Real-time Features
- New submission notifications
- Status change updates
- Live dashboard updates
- Urgent submission alerts

## 🔄 Maintenance

### Regular Maintenance Tasks

```sql
-- Archive old submissions (run monthly)
SELECT archive_old_submissions(365);

-- Clean test data (run as needed)
SELECT cleanup_test_data();

-- Analyze performance (run weekly)
SELECT * FROM analyze_contact_submissions_performance();

-- Update table statistics (run weekly)
ANALYZE contact_submissions;
```

### Backup Recommendations

```sql
-- Export submissions as JSON backup
SELECT export_submissions_json(NULL, '2024-01-01'::timestamptz, NOW());

-- Create table backup
CREATE TABLE contact_submissions_backup AS SELECT * FROM contact_submissions;
```

## ✅ Success Criteria

Your setup is successful when:

1. ✅ ContactManagement.jsx loads without errors
2. ✅ Pagination works with correct counts
3. ✅ Search and filtering function properly
4. ✅ Real-time updates appear immediately
5. ✅ Status changes save and sync
6. ✅ Delete operations work with confirmation
7. ✅ Bulk actions process multiple items
8. ✅ Statistics display accurate metrics

## 🆘 Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify your user has admin role in the users table
3. Ensure all SQL scripts executed without errors
4. Test with the verification queries provided
5. Check browser console for JavaScript errors

## 🎯 Next Steps

After successful setup:

1. Test the contact form at `/contact`
2. Access admin panel at `/admin/contacts`
3. Submit test submissions and verify they appear
4. Test all admin functions (view, edit, delete, bulk actions)
5. Verify real-time updates work across browser tabs
6. Set up monitoring and backup procedures

Your Contact Management System is now ready for production use! 🚀
