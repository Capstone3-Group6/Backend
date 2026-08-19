const { DataTypes } = require("sequelize");
const db = require("../db");

const SavedPin = db.define(
  "savedPin",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moodPinId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userId", "moodPinId"],
      },
    ],
  },
);

module.exports = SavedPin;
