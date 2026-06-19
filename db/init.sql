CREATE TABLE IF NOT EXISTS messages (
    id          SERIAL PRIMARY KEY,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO messages (body) VALUES
    ('Hello '),
    ('World!. Baza je inicajilizovana.'),
    ('Ovo je testna poruka.')
   ;
