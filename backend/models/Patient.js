const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Patient = sequelize.define("Patient", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  contactNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bodyBuild: {
    type: DataTypes.ENUM(
      "Thin, difficulty gaining weight",
      "Medium build, muscular",
      "Broad, easily gains weight"
    ),
    allowNull: false,
  },
  skinType: {
    type: DataTypes.ENUM(
      "Dry, rough, cold",
      "Warm, sensitive, prone to redness/acne",
      "Soft, thick, oily"
    ),
    allowNull: false,
  },
  digestion: {
    type: DataTypes.ENUM(
      "Irregular, bloating/gas common",
      "Strong but prone to acidity",
      "Slow, heavy after meals"
    ),
    allowNull: false,
  },
  hungerPattern: {
    type: DataTypes.ENUM(
      "Variable, sometimes forget to eat",
      "Strong and sharp, get irritated if hungry",
      "Mild and stable"
    ),
    allowNull: false,
  },
  sleepPattern: {
    type: DataTypes.ENUM(
      "Light, easily disturbed",
      "Moderate, may wake once",
      "Deep and long"
    ),
    allowNull: false,
  },
  bowelMovements: {
    type: DataTypes.ENUM(
      "Dry, hard, constipated",
      "Loose or frequent",
      "Regular but slow"
    ),
    allowNull: false,
  },
  stressResponse: {
    type: DataTypes.ENUM(
      "Feel anxious or fearful",
      "Become irritable or angry",
      "Withdraw or feel dull"
    ),
    allowNull: false,
  },
  energyLevel: {
    type: DataTypes.ENUM(
      "Fluctuating, comes in bursts",
      "Strong but can burn out",
      "Stable but slow"
    ),
    allowNull: false,
  },
  vikritiType: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  severity: {
    type: DataTypes.ENUM("Sthula", "Madhyama", "Sukshma"),
    defaultValue: null,
  },
}, {
  timestamps: true,
});

module.exports = Patient;
