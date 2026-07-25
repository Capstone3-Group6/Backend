// task.model.js — an EXAMPLE model. A model describes one table.
// Each field below becomes a column. Copy this shape for your own
// models (Post, User, ...), then delete this example.

const { DataTypes } = require('sequelize');
const db = require('../db');

// db.define(tableName, columns)
// Sequelize adds id, createdAt and updatedAt columns for you automatically.
const Task = db.define('task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false, // a task must have a title — the db will reject one without it
    validate: { notEmpty: true }, // also reject an empty string ("")
  },
  description: {
    type: DataTypes.TEXT, // TEXT = longer free-form text
    allowNull: true, // optional
  },
  completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false, // a new task starts as "not done"
  },
});

module.exports = Task;
