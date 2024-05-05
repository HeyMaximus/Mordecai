const { Pool } = require("pg");

async function initializePool(database = "postgres") {
  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: database,
    port: process.env.DB_PORT || "5432",
    max: 30,
  });

  return pool;
}

async function createDatabase() {
  try {
    const pool = await initializePool();
    await pool.query("CREATE DATABASE mordecai;");
    pool.end();
  } catch (error) {
    if (error.code !== "42P04") {
      console.error("Error creating database:", error);
    } else {
      console.log("Database mordecai found.");
    }
  }
}

async function createTable() {
  try {
    const pool = await initializePool("mordecai");
    const query = `
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        mode VARCHAR(10) NOT NULL,
        status VARCHAR(20) NOT NULL,
        solved BOOLEAN,
        difficulty INT NOT NULL,
        answer VARCHAR(10) NOT NULL,
        attempts INT,
        username VARCHAR(30),
        guess VARCHAR(10)
      );
    `;
    await pool.query(query);
    return pool;
  } catch (error) {
    console.error("Error creating table:", error);
  }
}

async function initializeDb() {
  try {
    await createDatabase();
    return await createTable();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
}

module.exports = initializeDb();
