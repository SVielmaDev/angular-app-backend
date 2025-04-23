const { pool } = require('../config/db');

const obtenerJuegos  = async () => {
  const query = `
    SELECT 
      g.id, g.title, g.release_year, g.genre, g.game_mode, g.developer, g.cover,
      ARRAY_AGG(p.name) AS plataformas
    FROM games g
    JOIN platforms_games pg ON g.id = pg.game_id
    JOIN platforms p ON pg.platform_id = p.id
    GROUP BY g.id
  `;
  const result = await pool.query(query);
  return result.rows;
};

const agregarJuego = async (game) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      title,
      release_year,
      genre,
      game_mode,
      developer,
      cover,
      platforms
    } = game;

    const gameResult = await client.query(
     `INSERT INTO games (title, release_year, genre, game_mode, developer, cover)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [title, release_year, genre, game_mode, developer, cover]
    );

    const gameId = gameResult.rows[0].id;

    for (const nombrePlataforma of platforms) {
      let resultPlataforma = await client.query(
        `SELECT id FROM platforms WHERE name = $1`,
        [nombrePlataforma]
      );

      let platformId;
      if (resultPlataforma.rows.length === 0) {
        const insertPlatform = await client.query(
          `INSERT INTO platforms (name) VALUES ($1) RETURNING id`,
          [nombrePlataforma]
        );
        platformId = insertPlatform.rows[0].id;
      } else {
        platformId = resultPlataforma.rows[0].id;
      }

      await client.query(
        `INSERT INTO platforms_games (game_id, platform_id) VALUES ($1, $2)`,
        [gameId, platformId]
      );
    }

    await client.query('COMMIT');

    return { id: gameId, ...game };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { obtenerJuegos, agregarJuego };
