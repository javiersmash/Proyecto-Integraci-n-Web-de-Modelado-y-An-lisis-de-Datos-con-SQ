
const db = require('../services/mysql.service');

// Obtener todas las canciones
async function getSongs(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                s.song_id AS id,
                s.title AS title,
                ar.stage_name AS artist,
                al.title AS album,
                COALESCE(s.genre, '') AS genre,
                s.duration_seconds AS duration,
                s.audio_url AS audioUrl,
                s.cover_url AS coverUrl
            FROM Song s
            INNER JOIN Album al ON al.album_id = s.album_id
            INNER JOIN Artist ar ON ar.artist_id = al.artist_id
            ORDER BY s.created_at DESC, s.song_id DESC
        `);

        console.log(`[SoundNest] Songs retrieved: ${rows.length} record(s).`);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('[SoundNest] Error retrieving songs:', error.message);
        return res.status(500).json({
            message: 'Error retrieving songs.'
        });
    }
}

// Obtener todos los álbumes
async function getAlbums(req, res) {
    try {
        const [rows] = await db.query(`
            SELECT
                al.album_id AS id,
                al.title AS title,
                ar.stage_name AS artist,
                al.release_date AS releaseDate,
                al.cover_url AS coverUrl
            FROM Album al
            INNER JOIN Artist ar ON ar.artist_id = al.artist_id
            ORDER BY al.album_id DESC
        `);

        console.log(`[SoundNest] Albums retrieved: ${rows.length} record(s).`);
        return res.status(200).json(rows);
    } catch (error) {
        console.error('[SoundNest] Error retrieving albums:', error.message);
        return res.status(500).json({
            message: 'Error retrieving albums.'
        });
    }
}

// Crear una canción
async function createSong(req, res) {
    // Evita errores si la solicitud no contiene un cuerpo JSON.
    const body = req.body || {};

    const title = body.title;
    const artist = body.artist;
    const album = body.album;
    const genre = body.genre || null;
    const duration = Number(body.duration);
    const audioUrl = body.audioUrl || null;
    const coverUrl = body.coverUrl || null;

    // Validar los campos obligatorios
    if (
        typeof title !== 'string' ||
        !title.trim() ||
        typeof artist !== 'string' ||
        !artist.trim() ||
        typeof album !== 'string' ||
        !album.trim() ||
        !Number.isInteger(duration) ||
        duration <= 0
    ) {
        return res.status(400).json({
            message: 'Invalid data. Title, artist, album and a positive integer duration are required.'
        });
    }

    // Validar longitudes
    if (
        title.trim().length > 200 ||
        artist.trim().length > 150 ||
        album.trim().length > 200 ||
        (genre && (typeof genre !== 'string' || genre.length > 80)) ||
        (audioUrl && (typeof audioUrl !== 'string' || audioUrl.length > 500)) ||
        (coverUrl && (typeof coverUrl !== 'string' || coverUrl.length > 500))
    ) {
        return res.status(400).json({
            message: 'One or more fields exceed the allowed length or have an invalid type.'
        });
    }

    let connection;

    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Buscar al artista y crearlo si no existe.
        const [artists] = await connection.query(
            'SELECT artist_id FROM Artist WHERE stage_name = ? LIMIT 1',
            [artist.trim()]
        );

        let artistId;

        if (artists.length > 0) {
            artistId = artists[0].artist_id;
        } else {
            const [artistResult] = await connection.query(
                'INSERT INTO Artist (stage_name) VALUES (?)',
                [artist.trim()]
            );

            artistId = artistResult.insertId;
        }

        // Buscar el álbum asociado al artista y crearlo si no existe.
        const [albums] = await connection.query(
            'SELECT album_id FROM Album WHERE artist_id = ? AND title = ? LIMIT 1',
            [artistId, album.trim()]
        );

        let albumId;

        if (albums.length > 0) {
            albumId = albums[0].album_id;
        } else {
            const [albumResult] = await connection.query(
                'INSERT INTO Album (artist_id, title, cover_url) VALUES (?, ?, ?)',
                [artistId, album.trim(), coverUrl]
            );

            albumId = albumResult.insertId;
        }

        // Registrar la canción
        const [songResult] = await connection.query(
            `INSERT INTO Song
                (album_id, title, duration_seconds, genre, audio_url, cover_url)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                albumId,
                title.trim(),
                duration,
                genre ? genre.trim() : null,
                audioUrl,
                coverUrl
            ]
        );

        await connection.commit();

        console.log(`[SoundNest] Song created with ID ${songResult.insertId}.`);

        return res.status(201).json({
            message: 'Song created successfully.',
            id: songResult.insertId
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error('[SoundNest] Error creating song:', error.message);

        return res.status(500).json({
            message: 'Error creating song.'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

module.exports = {
    getSongs,
    getAlbums,
    createSong
};
