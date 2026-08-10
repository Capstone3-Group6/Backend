const { DataTypes } = require("sequelize");
const db = require("../db");

const MoodPin = db.define("moodPin", {
  mood: {
    type: DataTypes.ENUM(
      "Happy",
      "Calm",
      "Creative",
      "Energetic",
      "Romantic",
      "Focused",
      "Inspiring"
    ),
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT, // TEXT = longer free-form text
    allowNull: true, // optional
  },

  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  locationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = MoodPin;
