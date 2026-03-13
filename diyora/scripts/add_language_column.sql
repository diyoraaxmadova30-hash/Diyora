-- Add language column to users table
ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
