-- Insert admin user (password: 'admin123', email: 'admin@shop.com')
-- Run this script manually to seed the admin account.
INSERT INTO users (id, email, password_hash, role, name, created_at)
VALUES (
    uuid_generate_v4(),
    'admin@shop.com',
    '$2a$10$wN24L4oP1yQJc0T1o6.gL.Q4O1p/S1X7vQ4lqJ0/Y9tP2W8a8P2a', -- bcrypt hash of 'admin123'
    'admin',
    'Admin User',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;
