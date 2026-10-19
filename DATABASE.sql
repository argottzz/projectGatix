CREATE DATABASE db_event_ticketing;
USE db_event_ticketing;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('organizer', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    date DATETIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    banner_url VARCHAR(500) NULL,
    banner_public_id VARCHAR(255) NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quota INT UNSIGNED NOT NULL DEFAULT 0,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_events_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_events_price
        CHECK (price >= 0)
);

CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'approved', 'cancelled')
        NOT NULL DEFAULT 'pending',
    payment_proof_url VARCHAR(500) NULL,
    payment_proof_public_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT fk_registrations_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT uq_registration_user_event
        UNIQUE (event_id, user_id)
);

INSERT INTO users (name, email, password, role)
VALUES
    ('Arga', 'arga@gmail.com', 'password123', 'user'),
    ('Udin', 'udin@gmail.com', 'udin123', 'user'),
    ('Joni', 'joni@gmail.com', 'admin123', 'organizer');

INSERT INTO events (
    title,
    description,
    date,
    location,
    banner_url,
    price,
    quota,
    created_by
)
VALUES
    (
        'Seminar Teknologi',
        'Seminar mengenai perkembangan teknologi dan pemrograman.',
        '2026-12-10 09:00:00',
        'Depok',
        NULL,
        50000.00,
        100,
        3
    ),
    (
        'Workshop Web Development',
        'Workshop pembuatan aplikasi web menggunakan Node.js dan Express.',
        '2026-12-15 10:00:00',
        'Depok',
        NULL,
        75000.00,
        50,
        3
    ),
    (
        'Seminar Karier IT',
        'Seminar persiapan karier bagi pelajar bidang teknologi informasi.',
        '2026-12-20 13:00:00',
        'Depok',
        NULL,
        0.00,
        150,
        3
    );

INSERT INTO registrations (
    event_id,
    user_id,
    status,
    payment_proof_url
)
VALUES
    (1, 1, 'pending', NULL);

SELECT * FROM users;
SELECT * FROM events;
SELECT * FROM registrations;

SELECT
    registrations.id AS registration_id,
    users.name AS nama_peserta,
    events.title AS nama_event,
    events.price AS harga_tiket,
    registrations.status AS status_pendaftaran,
    registrations.payment_proof_url,
    registrations.created_at
FROM registrations
JOIN users
    ON registrations.user_id = users.id
JOIN events
    ON registrations.event_id = events.id;
    
    
drop database db_event_ticketing