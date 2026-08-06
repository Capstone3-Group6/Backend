// models/index.js — one place to collect all models and their relationships.
// Lets the rest of the app grab them from here: const { Task } = require('./models')

const db = require('../db');
const MoodPin = require('./moodPin');
const User = require('./user');

// ---------- associations ----------
// Describe how tables relate here. When you're ready to tie tasks to their
// owner, uncomment these (it adds a userId column to tasks):
  User.hasMany(MoodPin)     // one user has many MoodPin
  MoodPin.belongsTo(User)   // each MoodPin belongs to one user (adds a userId column)

module.exports = {
  db, // exported too so seed.js can sync from one place
  MoodPin,
  User,
};
