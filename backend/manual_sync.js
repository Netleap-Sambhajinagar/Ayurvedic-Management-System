const syncPatient = require("./services/syncPatient");
const sequelize = require("./config/database");

async function manualSync() {
    try {
        console.log("🔄 Starting manual sync from Google Sheets...");
        await sequelize.authenticate();
        await syncPatient();
        console.log("✅ Manual sync finished!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Manual sync failed:", error);
        process.exit(1);
    }
}

manualSync();
