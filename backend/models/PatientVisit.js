const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Patient = require("./Patient");

const PatientVisit = sequelize.define("PatientVisit", {
  id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  patientId:  { type: DataTypes.INTEGER, allowNull: false },
  visitDate:  { type: DataTypes.DATEONLY, allowNull: false },
  visitType:  { type: DataTypes.ENUM("appointment","followup","opd"), allowNull: false },
  status:     { type: DataTypes.ENUM("pending","completed","missed"), defaultValue: "pending" },
  report:     { type: DataTypes.TEXT, defaultValue: null },
  notes:      { type: DataTypes.TEXT, defaultValue: null },
}, { timestamps: true });

Patient.hasMany(PatientVisit, { foreignKey: "patientId", as: "visits" });
PatientVisit.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });

module.exports = PatientVisit;
