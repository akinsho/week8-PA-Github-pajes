BEGIN;

DROP TABLE IF EXISTS users, blogPosts CASCADE;

CREATE TABLE users (
id SERIAL PRIMARY KEY NOT NULL,
username VARCHAR(30) UNIQUE NOT NULL,
github_id INTEGER NOT NULL,
avatar VARCHAR(500) NOT NULL
);

CREATE TABLE blogPosts (
id SERIAL PRIMARY KEY NOT NULL,
title VARCHAR(50) NOT NULL,
body VARCHAR(50000) UNIQUE NOT NULL,
username INTEGER REFERENCES users(id)
);

INSERT INTO users(username, github_id, avatar) VALUES
('Joey', 6252, 'bdajbjsa'),
('akin909', 61427, 'dbhjadv'),
('Samatar', 261836, 'dbjkabd')
RETURNING ID;

INSERT INTO blogPosts(title, body, username) VALUES
('Pigeons are the cutest', 'I really think pigeons have the prettiest toes. They are the best. The end', 1),
('Otters are obviously better', 'Clearly otters are better. They are just so cute and fun to watch', 2),
('Ardvarks are insanely cool', 'You guys are really stupid. Ardvarks are the best animal in the whole entire world. Ever', 3)
RETURNING ID;

COMMIT;
