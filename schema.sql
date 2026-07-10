-- Database Schema for Voyage - Travel Tracker

-- 1. Create the Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(50)
);

-- 2. Create the Countries Catalog Table (Seed Catalog)
CREATE TABLE IF NOT EXISTS countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) UNIQUE,
    country_name VARCHAR(100)
);

-- 3. Create the Visited Countries Table
CREATE TABLE IF NOT EXISTS visited_countries (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(country_code, user_id) -- Prevents duplicate entries for the same user
);

-- 4. Seed Initial Users
INSERT INTO users (name, color) VALUES 
('Akash', 'blue'),
('Jack', 'teal')
ON CONFLICT DO NOTHING;
