USE soundnest;

-- 1. Usuario de prueba (el hash corresponde a 'ClaveSegura123' generado con bcrypt)
INSERT INTO `user` (first_name, last_name, email, password_hash, birth_date, is_admin)
VALUES ('Luis', 'Prueba', 'luis.prueba@soundnest.local', '$2b$12$CwTycUXWue0Thq9StjUM0uJ8z3v1m2.6h9k2n5p7q8r9s0t1u2v3w', '2002-05-15', FALSE);

-- 2. Artistas
INSERT INTO `artist` (stage_name, biography, country)
VALUES 
  ('Luna Norte', 'Proyecto indie pop atmosférico.', 'Colombia'),
  ('Satélite', 'Synthwave y electrónica nocturna.', 'México');

-- 3. Álbumes (asumiendo artist_id 1 y 2)
INSERT INTO `album` (artist_id, title, release_date, cover_url)
VALUES 
  (1, 'Horizontes', '2025-03-10', NULL),
  (2, 'Noches eléctricas', '2025-07-22', NULL);

-- 4. Canciones (asumiendo album_id 1 y 2)
INSERT INTO `song` (album_id, title, duration_seconds, genre, audio_url, cover_url)
VALUES 
  (1, 'Luz de madrugada', 213, 'Indie pop', NULL, NULL),
  (1, 'Casa en las nubes', 231, 'Indie pop', NULL, NULL),
  (2, 'Ciudad de neón', 186, 'Electrónica', NULL, NULL),
  (2, 'Vértigo suave', 205, 'Electrónica', NULL, NULL);

-- 5. Playlists iniciales (asumiendo user_id 1)
INSERT INTO `playlist` (user_id, name, description, playlist_type, visibility)
VALUES 
  (1, 'Para concentrarse', 'Sesiones tranquilas para programar y estudiar', 'standard', 'private'),
  (1, 'De camino a casa', 'Sonidos para el trayecto de la tarde', 'standard', 'public');