const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME || "postgres", // ✅ Добавили из .env
    password: process.env.DB_PASS,
    port: parseInt(process.env.DB_PORT) || 5432, // ✅ Число + дефолт
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
    try {
        await pool.query(
            "INSERT INTO users (name, score, moves) VALUES ($1, $2, $3)",
            [name, score, moves],
        );
    } catch (error) {}
}

module.exports = { getTopUsers, createUser };
