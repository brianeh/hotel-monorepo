-- Hotel Reservation System - PostgreSQL Schema
-- Converted from MySQL to PostgreSQL
-- Phase 3.5: Database Modernization

/*
-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS hotel_reservation;

-- Create database
CREATE DATABASE hotel_reservation
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Connect to the database
\c hotel_reservation;
*/

-- Create room table
CREATE TABLE room (
    id SERIAL PRIMARY KEY,
    description TEXT,
    number_of_person INTEGER,
    has_private_bathroom BOOLEAN,
    price NUMERIC(10,2)
);

-- Create indexes for room table
CREATE INDEX idx_room_capacity ON room(number_of_person);
CREATE INDEX idx_room_price ON room(price);
CREATE INDEX idx_room_bathroom ON room(has_private_bathroom);

-- Add comments to room table
COMMENT ON TABLE room IS 'Hotel room inventory and details';
COMMENT ON COLUMN room.id IS 'Unique room identifier';
COMMENT ON COLUMN room.description IS 'Room description and amenities';
COMMENT ON COLUMN room.number_of_person IS 'Maximum guest capacity';
COMMENT ON COLUMN room.has_private_bathroom IS 'Whether room has private bathroom';
COMMENT ON COLUMN room.price IS 'Nightly rate in USD';

-- Create reservation table
CREATE TABLE reservation (
    id SERIAL PRIMARY KEY,
    id_room INTEGER NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    full_name VARCHAR(25),
    email VARCHAR(25),
    phone VARCHAR(20),
    special_request TEXT,
    CONSTRAINT fk_reservation_room 
        FOREIGN KEY (id_room) 
        REFERENCES room(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create indexes for reservation table
CREATE INDEX idx_reservation_dates ON reservation(check_in_date, check_out_date);
CREATE INDEX idx_reservation_room ON reservation(id_room);
CREATE INDEX idx_reservation_email ON reservation(email);
CREATE INDEX idx_reservation_checkin ON reservation(check_in_date);

-- Add comments to reservation table
COMMENT ON TABLE reservation IS 'Hotel room reservations';
COMMENT ON COLUMN reservation.id IS 'Unique reservation identifier';
COMMENT ON COLUMN reservation.id_room IS 'Reference to room being reserved';
COMMENT ON COLUMN reservation.check_in_date IS 'Guest check-in date';
COMMENT ON COLUMN reservation.check_out_date IS 'Guest check-out date';
COMMENT ON COLUMN reservation.full_name IS 'Guest full name';
COMMENT ON COLUMN reservation.email IS 'Guest email address';
COMMENT ON COLUMN reservation.phone IS 'Guest phone number';
COMMENT ON COLUMN reservation.special_request IS 'Special requests or notes';

-- Create view for available rooms (example of PostgreSQL feature)
CREATE OR REPLACE VIEW available_rooms_today AS
SELECT 
    r.*
FROM room r
WHERE r.id NOT IN (
    SELECT res.id_room
    FROM reservation res
    WHERE CURRENT_DATE BETWEEN res.check_in_date AND res.check_out_date
);

COMMENT ON VIEW available_rooms_today IS 'Rooms available for booking today';

-- Grant permissions (adjust as needed for production)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

