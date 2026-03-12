const mysql = require("mysql2/promise");
const { MongoClient } = require("mongodb");
require("dotenv").config();

async function migrate() {
  let mongoClient;
  let mysqlConn;

  try {
    console.log(" Starting data migration from MongoDB to MySQL...");

    // 1. Connect to MongoDB
    const mongoUri = "mongodb://127.0.0.1:27017/ayurveda"; // Adjust if needed
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db("ayurveda");
    console.log("✅ Connected to MongoDB.");

    // 2. Connect to MySQL
    mysqlConn = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "ayurveda",
    });
    console.log("✅ Connected to MySQL.");

    // --- Migrate Doctors ---
    console.log("⏳ Migrating Doctors...");
    const doctors = await db.collection("doctors").find({}).toArray();
    for (const doc of doctors) {
      await mysqlConn.execute(
        "INSERT IGNORE INTO Doctors (name, email, specialization, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        [
          doc.name,
          doc.email,
          doc.specialization,
          doc.password,
          doc.createdAt || new Date(),
          doc.updatedAt || new Date(),
        ],
      );
    }
    console.log(`✅ Migrated ${doctors.length} Doctors.`);

    // --- Migrate Patients ---
    console.log("⏳ Migrating Patients...");
    const patients = await db.collection("patients").find({}).toArray();
    for (const p of patients) {
      await mysqlConn.execute(
        "INSERT IGNORE INTO Patients (email, name, age, weight, height, contactNo, bodyBuild, skinType, digestion, hungerPattern, sleepPattern, bowelMovements, stressResponse, energyLevel, vikritiType, severity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          p.email,
          p.name,
          p.age || 0,
          p.weight || 0,
          p.height || 0,
          p.contactNo || "",
          p.bodyBuild || null,
          p.skinType || null,
          p.digestion || null,
          p.hungerPattern || null,
          p.sleepPattern || null,
          p.bowelMovements || null,
          p.stressResponse || null,
          p.energyLevel || null,
          p.vikritiType || null,
          p.severity || null,
          p.createdAt || new Date(),
          p.updatedAt || new Date(),
        ],
      );
    }
    console.log(`✅ Migrated ${patients.length} Patients.`);

    console.log(" Migration finished successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    if (mongoClient) await mongoClient.close();
    if (mysqlConn) await mysqlConn.end();
  }
}

migrate();
