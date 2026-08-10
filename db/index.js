require("dotenv").config();

const { Sequelize } = require("sequelize");

// Production (Render, Neon, Railway, etc.) provides DATABASE_URL.
// Local dev uses individual DB_* vars so you don't need a connection string.
let db;

if (process.env.DATABASE_URL) {
  db = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  });
} else {
  const dbName = process.env.DB_NAME || "capstone_dev";
  const dbUser = process.env.DB_USER || "postgres";
  const dbPassword = process.env.DB_PASSWORD || "";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPort = process.env.DB_PORT || 5432;

  db = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: "postgres",
    logging: false,
  });
}

module.exports = db;