const axios = require("axios");
const { parse } = require("csv-parse/sync");
const cron = require("node-cron");
const Patient = require("../models/Patient");

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTnsJo1kvnQ46conDKuzx4pGo2RFymXKKBDCg6ZrozrNt3JxDLpHuEhNAACZsTd5wAYk5Qf8PQOiMsf/pub?output=csv";

function mapEnum(field, value) {
  if (!value) return null;
  value = value.replace(/^[A-C]\.\s*/, "").trim(); // Remove A./B./C.

  const enums = {
    bodyBuild: [
      "Thin, difficulty gaining weight",
      "Medium build, muscular",
      "Broad, easily gains weight",
    ],
    skinType: [
      "Dry, rough, cold",
      "Warm, sensitive, prone to redness/acne",
      "Soft, thick, oily",
    ],
    digestion: [
      "Irregular, bloating/gas common",
      "Strong but prone to acidity",
      "Slow, heavy after meals",
    ],
    hungerPattern: [
      "Variable, sometimes forget to eat",
      "Strong and sharp, get irritated if hungry",
      "Mild and stable",
    ],
    sleepPattern: [
      "Light, easily disturbed",
      "Moderate, may wake once",
      "Deep and long",
    ],
    bowelMovements: [
      "Dry, hard, constipated",
      "Loose or frequent",
      "Regular but slow",
    ],
    stressResponse: [
      "Feel anxious or fearful",
      "Become irritable or angry",
      "Withdraw or feel dull",
    ],
    energyLevel: [
      "Fluctuating, comes in bursts",
      "Strong but can burn out",
      "Stable but slow",
    ],
  };

  if (!enums[field] || !enums[field].includes(value)) {
    console.warn(`⚠ Value "${value}" for ${field} not in enum! Using null`);
    return null;
  }

  return value;
}

async function syncPatient() {
  try {
    console.log("🔄 Fetching spreadsheet CSV...");

    const res = await axios.get(SHEET_CSV_URL);

    // Parse using the first row as headers
    const rows = parse(res.data, {
      columns: true,
      skip_empty_lines: true,
    });

    if (!rows.length) return;

    for (const row of rows) {
      const email = row["Email Address"]?.toLowerCase().trim();
      const name = row["Name"]?.trim();

      // Skip if essential fields are missing
      if (!email || !name) continue;

      const updateData = {
        name,
        age: Number(row["Age"]) || 0,
        weight: Number(row["Weight"]) || 0,
        height: Number(row["Height(cm)"] || row["Height"]) || 0,
        contactNo: row["Contact no"]?.trim() || "0000000000",
        bodyBuild: mapEnum("bodyBuild", row["How would you describe your current body build?"]),
        skinType: mapEnum("skinType", row["Your skin is usually:"]),
        digestion: mapEnum("digestion", row["Your digestion feels:"]),
        hungerPattern: mapEnum("hungerPattern", row["Your hunger pattern is:"]),
        sleepPattern: mapEnum("sleepPattern", row["Your sleep is:"]),
        bowelMovements: mapEnum("bowelMovements", row["Bowel movements are:"]),
        stressResponse: mapEnum("stressResponse", row["When stressed, you tend to:"]),
        energyLevel: mapEnum("energyLevel", row["Your energy throughout the day is:"]),
      };

      // Filter out nulls so we don't violate enum constraints
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === null) delete updateData[key];
      });

      await Patient.findOneAndUpdate(
        { email },
        { $set: updateData },
        { upsert: true, new: true }
      );

      console.log(`✅ Synced: ${email}`);
    }

    console.log("✔ Sheet sync completed");
  } catch (err) {
    console.error("❌ Sheet sync failed:", err.message);
  }
}

// Ensure the job runs exactly when the file is required
cron.schedule("* * * * *", syncPatient);

// Export for manual triggering if needed
module.exports = syncPatient;
