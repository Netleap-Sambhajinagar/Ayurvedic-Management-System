const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Build SSL options — load CA cert from file when DB_SSL_CA is set
const sslOptions = (() => {
  if (process.env.DB_SSL !== "true") return false;
  const caPath = process.env.DB_SSL_CA
    ? path.resolve(__dirname, "..", process.env.DB_SSL_CA.replace(/^=/, ""))
    : path.resolve(__dirname, "../ca.pem");
  try {
    return { ca: fs.readFileSync(caPath) };
  } catch {
    console.warn("⚠ ca.pem not found, falling back to rejectUnauthorized:false");
    return { rejectUnauthorized: false };
  }
})();

const sequelize = new Sequelize(
  process.env.DB_NAME || "ayurveda",
  process.env.DB_USER || "avnadmin",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: sslOptions,
    },
  },
);

module.exports = sequelize;
