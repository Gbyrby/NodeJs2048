const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "postgres", //TODO: add this to .end file
    password: "password",
    port: 5432,
});

async function getTopUsers() {
    await pool.query(`
        DELETE FROM users 
        WHERE id NOT IN (
            SELECT id FROM (
                SELECT id FROM users 
                ORDER BY score DESC, moves ASC 
                LIMIT 10
            ) top10
        )
    `);

    const res = await pool.query(`
        SELECT name, score, moves FROM users 
        ORDER BY score DESC, moves ASC 
        LIMIT 10
    `);

    return res.rows;
}

async function createUser(name, score, moves) {
    await pool.query(
        "INSERT INTO users (name, score, moves) VALUES ($1, $2, $3)",
        [name, score, moves],
    );
}

module.exports = { getTopUsers, createUser };
