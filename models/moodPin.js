// task.model.js — an EXAMPLE model. A model describes one table.
// Each field below becomes a column. Copy this shape for your own
// models (Post, User, ...), then delete this example.

const { DataTypes } = require("sequelize");
const db = require("../db");

// db.define(tableName, columns)
// Sequelize adds id, createdAt and updatedAt columns for you automatically.
const MoodPin = db.define("moodPin", {
  mood: {
    type: DataTypes.ENUM(
      "Happy",
      "Calm",
      "Creative",
      "Energetic",
      "Romantic",
      "Focused",
      "Inspiring",
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

  //  userId : {
  //       type: DataTypes.INTEGER,
  //       allowNull : false,
  //       validate: { notEmpty: true },
  //       references: {
  //           model: "users",
  //           key: "userId",
  //       },
  //   },
  // completed: {
  //   type: DataTypes.BOOLEAN,
  //   allowNull: false,
  //   defaultValue: false, // a new task starts as "not done"
  // },
});

module.exports = MoodPin;
