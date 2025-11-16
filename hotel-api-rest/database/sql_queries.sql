-- create database
DROP DATABASE IF EXISTS hotel_reservation_system;

CREATE DATABASE hotel_reservation_system;

USE hotel_reservation_system;

CREATE TABLE room (
	id INT PRIMARY KEY AUTO_INCREMENT,
	description TEXT,
	number_of_person INT,
	have_private_bathroom BOOLEAN,
	price REAL
);

CREATE TABLE reservation (
	id INT PRIMARY KEY AUTO_INCREMENT,
	id_room INT NOT NULL REFERENCES room(id),
	check_in_date DATE,
	check_out_date DATE,
	full_name VARCHAR(25),
	email VARCHAR(25),
	phone VARCHAR(20),
	special_request TEXT
);

-- =========================================================
-- Sample Data for Testing
-- =========================================================

-- Insert sample rooms (various types for testing)
INSERT INTO room (description, number_of_person, have_private_bathroom, price) VALUES
('Standard Single Room - Cozy room with city view', 1, TRUE, 75.00),
('Standard Double Room - Comfortable room with queen bed', 2, TRUE, 120.00),
('Deluxe Suite - Spacious suite with king bed and living area', 2, TRUE, 250.00),
('Family Room - Large room with two double beds', 4, TRUE, 180.00),
('Economy Room - Budget-friendly shared bathroom', 2, FALSE, 50.00),
('Executive Suite - Luxury suite with ocean view', 3, TRUE, 350.00),
('Twin Room - Two single beds, perfect for friends', 2, TRUE, 110.00),
('Penthouse Suite - Top floor with panoramic views', 4, TRUE, 500.00),
('Accessible Room - Wheelchair accessible with bathroom aids', 2, TRUE, 130.00),
('Studio Apartment - Extended stay with kitchenette', 2, TRUE, 200.00);

-- Insert sample reservations (mix of upcoming and current bookings)
INSERT INTO reservation (id_room, check_in_date, check_out_date, full_name, email, phone, special_request) VALUES
(1, '2025-10-25', '2025-10-27', 'John Smith', 'john.smith@email.com', '+1-555-0101', 'Late check-in requested'),
(3, '2025-11-01', '2025-11-05', 'Sarah Johnson', 'sarah.j@email.com', '+1-555-0102', 'Anniversary celebration'),
(2, '2025-10-28', '2025-10-30', 'Mike Davis', 'mike.d@email.com', '+1-555-0103', NULL),
(4, '2025-11-15', '2025-11-20', 'Williams Family', 'williams@email.com', '+1-555-0104', 'Traveling with children'),
(6, '2025-12-20', '2025-12-27', 'Robert Chen', 'r.chen@email.com', '+1-555-0105', 'Business trip'),
(7, '2025-10-22', '2025-10-24', 'Emily Brown', 'emily.b@email.com', '+1-555-0106', 'Need extra towels'),
(5, '2025-11-10', '2025-11-12', 'David Miller', 'dmiller@email.com', '+1-555-0107', 'Budget-conscious'),
(8, '2025-12-31', '2026-01-03', 'Lisa Anderson', 'lisa.a@email.com', '+1-555-0108', 'New Years celebration');