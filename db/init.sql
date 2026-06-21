CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    body VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO messages (body) VALUES ('Prva poruka');
INSERT INTO messages (body) VALUES ('Druga poruka');
INSERT INTO messages (body) VALUES ('Treca poruka');