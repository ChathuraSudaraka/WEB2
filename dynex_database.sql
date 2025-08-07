-- ============================================
-- DYNEX Clothing Brand Database Schema (FIXED)
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS `dynex_clothing`;
USE `dynex_clothing`;

-- ============================================
-- TABLE STRUCTURES (Updated to match Java models)
-- ============================================

-- Users Table (updated to match current Java model)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(50),
    `last_name` VARCHAR(50),
    `phone` VARCHAR(20),
    `address` TEXT,
    `city` VARCHAR(50),
    `postal_code` VARCHAR(10),
    `country` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE,
    `role` VARCHAR(20) DEFAULT 'USER'
);

-- Categories Table (Fashion-focused)
CREATE TABLE IF NOT EXISTS `categories` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `icon` VARCHAR(100),
    `gender` ENUM('MEN', 'WOMEN', 'UNISEX') DEFAULT 'UNISEX',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_active` BOOLEAN DEFAULT TRUE
);

-- Products Table (Clothing-specific)
CREATE TABLE IF NOT EXISTS `products` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `price` DECIMAL(10,2) NOT NULL,
    `discount_price` DECIMAL(10,2),
    `sku` VARCHAR(100) UNIQUE,
    `stock_quantity` INT DEFAULT 0,
    `image_url` VARCHAR(500),
    `category_id` BIGINT,
    `brand` VARCHAR(100) DEFAULT 'DYNEX',
    `weight` DECIMAL(10,2),
    `dimensions` VARCHAR(100),
    `material` VARCHAR(255), -- Cotton, Polyester, Blend, etc.
    `care_instructions` TEXT,
    `season` ENUM('SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON') DEFAULT 'ALL_SEASON',
    `gender` ENUM('MEN', 'WOMEN', 'UNISEX') DEFAULT 'UNISEX',
    `color` VARCHAR(255), -- Multiple colors comma-separated
    `pattern` VARCHAR(100), -- Solid, Striped, Floral, etc.
    `fit_type` VARCHAR(50), -- Slim, Regular, Loose, Oversized
    `is_featured` BOOLEAN DEFAULT FALSE,
    `is_active` BOOLEAN DEFAULT TRUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL
);

-- Product Sizes Table
CREATE TABLE IF NOT EXISTS `product_sizes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL,
    `size` VARCHAR(10) NOT NULL, -- Changed from ENUM to VARCHAR for flexibility
    `stock_quantity` INT DEFAULT 0,
    `additional_price` DECIMAL(10,2) DEFAULT 0.00,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_product_size` (`product_id`, `size`)
);

-- Product Images Table (Multiple images per product)
CREATE TABLE IF NOT EXISTS `product_images` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `alt_text` VARCHAR(255),
    `is_primary` BOOLEAN DEFAULT FALSE,
    `sort_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- Product Reviews Table
CREATE TABLE IF NOT EXISTS `product_reviews` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `product_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,
    `rating` TINYINT CHECK (`rating` >= 1 AND `rating` <= 5),
    `review_text` TEXT,
    `is_verified_purchase` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_product_review` (`user_id`, `product_id`)
);

-- ============================================
-- SHOPPING CART TABLES (NEW STRUCTURE)
-- ============================================

-- Drop old shopping_cart table if it exists
DROP TABLE IF EXISTS `shopping_cart`;

-- Carts Table (One cart per user)
CREATE TABLE IF NOT EXISTS `carts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Cart Items Table (Items in each cart with color, size, and price tracking)
CREATE TABLE IF NOT EXISTS `cart_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `cart_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `size` VARCHAR(20) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_at_time` DECIMAL(10,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_cart_item` (`cart_id`, `product_id`, `color`, `size`)
);

-- ============================================
-- ORDER TABLES
-- ============================================

-- Orders Table
CREATE TABLE IF NOT EXISTS `orders` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `order_number` VARCHAR(50) UNIQUE NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    `total_amount` DECIMAL(10,2) NOT NULL,
    `shipping_amount` DECIMAL(10,2) DEFAULT 0.00,
    `tax_amount` DECIMAL(10,2) DEFAULT 0.00,
    `shipping_address` TEXT,
    `billing_address` TEXT,
    `payment_method` VARCHAR(50),
    `payment_status` ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    `notes` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
);

-- Order Items Table (Updated for color and size)
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `size` VARCHAR(20) NOT NULL,
    `quantity` INT NOT NULL,
    `unit_price` DECIMAL(10,2) NOT NULL,
    `total_price` DECIMAL(10,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS `wishlist` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `product_id` BIGINT NOT NULL,
    `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_user_product_wishlist` (`user_id`, `product_id`)
);

-- ============================================
-- DYNEX CLOTHING SAMPLE DATA
-- ============================================

-- Insert Clothing Categories
INSERT IGNORE INTO `categories` (`name`, `description`, `icon`, `gender`) VALUES
('T-Shirts', 'Premium quality t-shirts for everyday wear', 'fas fa-tshirt', 'UNISEX'),
('Hoodies', 'Comfortable hoodies and sweatshirts', 'fas fa-user-tie', 'UNISEX'),
('Jeans', 'Stylish denim jeans in various fits', 'fas fa-user', 'UNISEX'),
('Dresses', 'Elegant dresses for all occasions', 'fas fa-female', 'WOMEN'),
('Jackets', 'Trendy jackets and outerwear', 'fas fa-jacket', 'UNISEX'),
('Activewear', 'Performance clothing for sports and fitness', 'fas fa-running', 'UNISEX'),
('Accessories', 'Fashion accessories to complete your look', 'fas fa-glasses', 'UNISEX'),
('Shoes', 'Fashionable footwear for every style', 'fas fa-shoe-prints', 'UNISEX');

-- Insert Sample Users
INSERT IGNORE INTO `users` (`username`, `email`, `password`, `first_name`, `last_name`, `phone`, `role`) VALUES
('admin', 'admin@dynexclothing.com', '$2a$10$encrypted_password_hash', 'Admin', 'User', '+1234567890', 'ADMIN'),
('fashionlover', 'sarah@email.com', '$2a$10$encrypted_password_hash', 'Sarah', 'Johnson', '+1234567891', 'USER'),
('stylehunter', 'mike@email.com', '$2a$10$encrypted_password_hash', 'Mike', 'Chen', '+1234567892', 'USER'),
('trendyshopper', 'emma@email.com', '$2a$10$encrypted_password_hash', 'Emma', 'Davis', '+1234567893', 'USER');

-- Insert DYNEX Clothing Products (with multiple colors)
INSERT IGNORE INTO `products` (`name`, `description`, `price`, `discount_price`, `sku`, `stock_quantity`, `image_url`, `category_id`, `material`, `season`, `gender`, `color`, `pattern`, `fit_type`, `is_featured`) VALUES
-- T-Shirts
('DYNEX Classic Logo Tee', 'Premium cotton t-shirt with iconic DYNEX logo. Perfect for casual wear.', 29.99, 24.99, 'DYNEX-TEE-001', 150, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 1, '100% Organic Cotton', 'ALL_SEASON', 'UNISEX', 'Black,White,Gray', 'Logo Print', 'Regular', TRUE),
('DYNEX Future Vision Tee', 'Futuristic design t-shirt representing the future of fashion.', 34.99, NULL, 'DYNEX-TEE-002', 120, 'https://images.unsplash.com/photo-1583743814966-8936f37f4dfd?w=400', 1, '60% Cotton 40% Polyester', 'ALL_SEASON', 'UNISEX', 'White,Navy,Gray', 'Graphic Print', 'Slim', TRUE),
('DYNEX Minimalist Tee', 'Clean, minimalist design for the modern wardrobe.', 27.99, NULL, 'DYNEX-TEE-003', 200, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 1, '100% Organic Cotton', 'ALL_SEASON', 'UNISEX', 'Gray,Black,White', 'Solid', 'Regular', FALSE),

-- Hoodies
('DYNEX Tech Hoodie', 'High-tech hoodie with moisture-wicking fabric and future-inspired design.', 79.99, 69.99, 'DYNEX-HOOD-001', 80, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 2, '80% Cotton 20% Polyester', 'FALL', 'UNISEX', 'Black,White,Gray,Navy,Red,Blue', 'Solid', 'Oversized', TRUE),
('DYNEX Urban Hoodie', 'Street-style hoodie perfect for urban exploration.', 74.99, NULL, 'DYNEX-HOOD-002', 60, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 2, '70% Cotton 30% Polyester', 'WINTER', 'UNISEX', 'Navy,Black,Gray', 'Logo Embroidery', 'Regular', TRUE),

-- Jeans
('DYNEX Future Fit Jeans', 'Revolutionary fit jeans with stretch technology for ultimate comfort.', 89.99, 79.99, 'DYNEX-JEAN-001', 100, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 3, '98% Cotton 2% Elastane', 'ALL_SEASON', 'UNISEX', 'Black,White,Navy,Gray,Olive', 'Solid', 'Slim', TRUE),
('DYNEX Classic Straight Jeans', 'Timeless straight-cut jeans that never go out of style.', 84.99, NULL, 'DYNEX-JEAN-002', 90, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 3, '100% Cotton', 'ALL_SEASON', 'UNISEX', 'Dark Blue,Indigo', 'Solid', 'Regular', FALSE),

-- Dresses
('DYNEX Elegance Dress', 'Sophisticated dress perfect for evening events and special occasions.', 129.99, 109.99, 'DYNEX-DRESS-001', 40, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 4, '95% Polyester 5% Elastane', 'ALL_SEASON', 'WOMEN', 'Black,White,Red,Pink,Blue', 'Solid', 'Fitted', TRUE),
('DYNEX Summer Flow Dress', 'Light and airy dress perfect for summer days.', 94.99, NULL, 'DYNEX-DRESS-002', 60, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 4, '100% Viscose', 'SUMMER', 'WOMEN', 'Floral,White,Pink', 'Floral Print', 'Loose', FALSE),

-- Jackets
('DYNEX Tech Bomber', 'Futuristic bomber jacket with smart fabric technology.', 149.99, 129.99, 'DYNEX-JACK-001', 50, 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400', 5, '100% Nylon', 'FALL', 'UNISEX', 'Black,Navy,Gray', 'Solid', 'Regular', TRUE),

-- Activewear
('DYNEX Performance Leggings', 'High-performance leggings for workout and athleisure.', 59.99, 49.99, 'DYNEX-ACT-001', 120, 'https://images.unsplash.com/photo-1506629905904-7ac545baa798?w=400', 6, '88% Polyester 12% Elastane', 'ALL_SEASON', 'WOMEN', 'Black,White,Purple', 'Solid', 'Fitted', TRUE),

-- Multi-color products
('DYNEX Multi-Color Hoodie', 'Versatile hoodie available in multiple colors for any style preference.', 84.99, 74.99, 'DYNEX-HOOD-MC-001', 90, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 2, '80% Cotton 20% Polyester', 'FALL', 'UNISEX', 'Black,White,Gray,Navy,Red', 'Solid', 'Regular', TRUE),
('DYNEX Rainbow Collection Tee', 'Express yourself with this colorful t-shirt available in 6 vibrant colors.', 32.99, NULL, 'DYNEX-TEE-RAINBOW-001', 200, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 1, '100% Organic Cotton', 'ALL_SEASON', 'UNISEX', 'Red,Blue,Green,Yellow,Purple,Orange', 'Solid', 'Regular', TRUE),
('DYNEX Classic Polo', 'Timeless polo shirt perfect for casual and semi-formal occasions.', 45.99, 39.99, 'DYNEX-POLO-CLASSIC-001', 120, 'https://images.unsplash.com/photo-1583743814966-8936f37f4dfd?w=400', 1, '100% Cotton', 'ALL_SEASON', 'UNISEX', 'White,Navy,Black,Light Blue,Pink', 'Solid', 'Regular', FALSE),
('DYNEX Earth Tone Sweater', 'Cozy sweater in natural earth tones for the environmentally conscious.', 89.99, NULL, 'DYNEX-SWEAT-EARTH-001', 60, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 2, '100% Organic Cotton', 'WINTER', 'UNISEX', 'Brown,Beige,Olive,Cream', 'Solid', 'Oversized', FALSE);

-- Insert Product Sizes
INSERT IGNORE INTO `product_sizes` (`product_id`, `size`, `stock_quantity`) VALUES
-- T-Shirts sizes
(1, 'S', 30), (1, 'M', 40), (1, 'L', 50), (1, 'XL', 30),
(2, 'S', 25), (2, 'M', 35), (2, 'L', 40), (2, 'XL', 20),
(3, 'XS', 20), (3, 'S', 50), (3, 'M', 70), (3, 'L', 40), (3, 'XL', 20),
-- Hoodies sizes
(4, 'S', 15), (4, 'M', 25), (4, 'L', 25), (4, 'XL', 15),
(5, 'S', 12), (5, 'M', 20), (5, 'L', 18), (5, 'XL', 10),
-- Jeans sizes
(6, 'S', 20), (6, 'M', 30), (6, 'L', 35), (6, 'XL', 15),
(7, 'S', 18), (7, 'M', 27), (7, 'L', 30), (7, 'XL', 15),
-- Dresses sizes
(8, 'XS', 8), (8, 'S', 12), (8, 'M', 15), (8, 'L', 5),
(9, 'XS', 12), (9, 'S', 18), (9, 'M', 20), (9, 'L', 10),
-- Jackets sizes
(10, 'S', 10), (10, 'M', 15), (10, 'L', 20), (10, 'XL', 5),
-- Activewear sizes
(11, 'XS', 20), (11, 'S', 30), (11, 'M', 40), (11, 'L', 25), (11, 'XL', 5),
-- Multi-color products sizes
(12, 'S', 20), (12, 'M', 25), (12, 'L', 30), (12, 'XL', 15),
(13, 'XS', 30), (13, 'S', 40), (13, 'M', 60), (13, 'L', 50), (13, 'XL', 20),
(14, 'S', 25), (14, 'M', 35), (14, 'L', 40), (14, 'XL', 20),
(15, 'S', 15), (15, 'M', 20), (15, 'L', 15), (15, 'XL', 10);

-- Insert Product Images
INSERT IGNORE INTO `product_images` (`product_id`, `image_url`, `alt_text`, `is_primary`, `sort_order`) VALUES
(1, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'DYNEX Classic Logo Tee - Front View', TRUE, 1),
(1, 'https://images.unsplash.com/photo-1583743814966-8936f37f4dfd?w=400', 'DYNEX Classic Logo Tee - Back View', FALSE, 2),
(2, 'https://images.unsplash.com/photo-1583743814966-8936f37f4dfd?w=400', 'DYNEX Future Vision Tee - Front View', TRUE, 1),
(3, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400', 'DYNEX Minimalist Tee - Front View', TRUE, 1),
(4, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'DYNEX Tech Hoodie - Front View', TRUE, 1),
(5, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400', 'DYNEX Urban Hoodie - Front View', TRUE, 1);

-- Insert Sample Reviews
INSERT IGNORE INTO `product_reviews` (`product_id`, `user_id`, `rating`, `review_text`) VALUES
(1, 2, 5, 'Amazing quality! The fabric is so soft and the logo design is perfect. Definitely buying more DYNEX pieces.'),
(1, 3, 5, 'Love this t-shirt! Great fit and the material feels premium. DYNEX never disappoints.'),
(2, 2, 4, 'Cool futuristic design. The quality is great and it fits perfectly. Highly recommend!'),
(4, 3, 5, 'Best hoodie I have ever owned! Super comfortable and the design is incredible. Worth every penny.'),
(6, 2, 4, 'These jeans are amazing! The fit is perfect and they are so comfortable. Great quality denim.'),
(8, 4, 5, 'Beautiful dress! Perfect for date nights and special occasions. The fit is flattering and the quality is excellent.');

-- ============================================
-- USEFUL QUERIES FOR CART OPERATIONS
-- ============================================

/*
-- Get user's cart with all items
SELECT 
    ci.id,
    p.name,
    p.price,
    p.discount_price,
    ci.color,
    ci.size,
    ci.quantity,
    ci.price_at_time,
    (ci.quantity * ci.price_at_time) as subtotal
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
JOIN products p ON ci.product_id = p.id
WHERE c.user_id = ?;

-- Add item to cart (first create cart if doesn't exist)
INSERT IGNORE INTO carts (user_id) VALUES (?);
INSERT INTO cart_items (cart_id, product_id, color, size, quantity, price_at_time)
VALUES (
    (SELECT id FROM carts WHERE user_id = ?),
    ?, ?, ?, ?,
    (SELECT COALESCE(discount_price, price) FROM products WHERE id = ?)
)
ON DUPLICATE KEY UPDATE 
    quantity = quantity + VALUES(quantity),
    updated_at = CURRENT_TIMESTAMP;

-- Update cart item quantity
UPDATE cart_items 
SET quantity = ?, updated_at = CURRENT_TIMESTAMP
WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?);

-- Remove item from cart
DELETE FROM cart_items 
WHERE id = ? AND cart_id = (SELECT id FROM carts WHERE user_id = ?);

-- Clear entire cart
DELETE ci FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
WHERE c.user_id = ?;

-- Get cart totals
SELECT 
    COUNT(ci.id) as item_count,
    SUM(ci.quantity) as total_quantity,
    SUM(ci.quantity * ci.price_at_time) as total_amount
FROM cart_items ci
JOIN carts c ON ci.cart_id = c.id
WHERE c.user_id = ?;
*/

-- ============================================
-- USEFUL PRODUCT QUERIES
-- ============================================

/*
-- 1. Get all active clothing products with category and size information
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.discount_price,
    p.image_url,
    p.material,
    p.color,
    p.pattern,
    p.fit_type,
    p.gender,
    p.season,
    c.name AS category_name,
    p.is_featured,
    SUM(ps.stock_quantity) AS total_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_active = TRUE
GROUP BY p.id
ORDER BY p.created_at DESC;

-- 2. Get featured DYNEX products for homepage
SELECT 
    p.id,
    p.name,
    p.price,
    p.discount_price,
    p.image_url,
    p.color,
    p.gender,
    c.name AS category_name,
    ROUND(AVG(pr.rating), 1) AS avg_rating,
    COUNT(pr.id) AS review_count,
    SUM(ps.stock_quantity) AS total_stock
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE p.is_featured = TRUE AND p.is_active = TRUE
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT 8;

-- 3. Get available sizes for a product
SELECT 
    ps.size,
    ps.stock_quantity,
    ps.additional_price
FROM product_sizes ps
WHERE ps.product_id = ? AND ps.stock_quantity > 0
ORDER BY FIELD(ps.size, 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL');

-- 4. Get products by category with multi-color support
SELECT 
    p.id,
    p.name,
    p.price,
    p.discount_price,
    p.image_url,
    p.color,
    p.pattern,
    SUM(ps.stock_quantity) AS total_stock
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_sizes ps ON p.id = ps.product_id
WHERE c.name = ? AND p.gender IN (?, 'UNISEX') AND p.is_active = TRUE
GROUP BY p.id
ORDER BY p.name;
*/

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

SELECT 'DYNEX Database Schema with Cart System Created Successfully!' as Status,
       'Old shopping_cart table removed, new carts and cart_items tables created' as Note,
       'Multi-color support added to products' as Feature;
