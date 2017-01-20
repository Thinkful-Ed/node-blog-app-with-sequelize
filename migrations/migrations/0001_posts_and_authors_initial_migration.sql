BEGIN;

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    firstName TEXT,
    lastName TEXT,
    userName TEXT NOT NULL
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER REFERENCES authors ON DELETE SET NULL
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    comment TEXT NOT NULL,
    author_id INTEGER REFERENCES authors ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts ON DELETE CASCADE
);

COMMIT;