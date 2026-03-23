-- Insert admin user (password: 'admin123', email: 'admin@shop.com')
-- Run this script manually to seed the admin account.
INSERT INTO users (id, email, password_hash, role, name, created_at)
VALUES (
    uuid_generate_v4(),
    'admin@shop.com',
    '$2a$10$FdG3VgsCCMfqZO8PN9VuXeaVCQQAsIpSpeBIuydSVaobQiSV.VwW.', -- bcrypt hash of 'admin123'
    'admin',
    'Admin User',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
