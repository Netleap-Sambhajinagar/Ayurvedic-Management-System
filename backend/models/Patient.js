const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    height: {
      type: Number,
      required: true,
      min: 0,
    },

    contactNo: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, "Contact number must be 10 digits"],
    },

    bodyBuild: {
      type: String,
      required: true,
      enum: [
        "Thin, difficulty gaining weight",
        "Medium build, muscular",
        "Broad, easily gains weight",
      ],
    },

    skinType: {
      type: String,
      required: true,
      enum: [
        "Dry, rough, cold",
        "Warm, sensitive, prone to redness/acne",
        "Soft, thick, oily",
      ],
    },

    digestion: {
      type: String,
      required: true,
      enum: [
        "Irregular, bloating/gas common",
        "Strong but prone to acidity",
        "Slow, heavy after meals",
      ],
    },

    hungerPattern: {
      type: String,
      required: true,
      enum: [
        "Variable, sometimes forget to eat",
        "Strong and sharp, get irritated if hungry",
        "Mild and stable",
      ],
    },

    sleepPattern: {
      type: String,
      required: true,
      enum: [
        "Light, easily disturbed",
        "Moderate, may wake once",
        "Deep and long",
      ],
    },

    bowelMovements: {
      type: String,
      required: true,
      enum: ["Dry, hard, constipated", "Loose or frequent", "Regular but slow"],
    },

    stressResponse: {
      type: String,
      required: true,
      enum: [
        "Feel anxious or fearful",
        "Become irritable or angry",
        "Withdraw or feel dull",
      ],
    },

    energyLevel: {
      type: String,
      required: true,
      enum: [
        "Fluctuating, comes in bursts",
        "Strong but can burn out",
        "Stable but slow",
      ],
    },

    // ── Vikriti Analysis (populated by Python backend.py) ──────────────────
    vikritiType: {
      type: String,
      default: null,
    },

    severity: {
      type: String,
      enum: ["Sthula", "Madhyama", "Sukshma", null],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Patient", patientSchema);
