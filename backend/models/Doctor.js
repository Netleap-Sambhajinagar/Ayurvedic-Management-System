const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Doctor = sequelize.define(
  "Doctor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    specialization: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    // NEW: profile photo stored as base64 data-URI string (kept small, <5 MB enforced in route)
    avatar: { type: DataTypes.TEXT("long"), defaultValue: null },
  },
  { timestamps: true },
);

module.exports = Doctor;
