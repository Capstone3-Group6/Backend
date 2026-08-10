const db = require("../db");
const MoodPin = require("./moodPin");
const User = require("./user");

User.hasMany(MoodPin); // one user has many MoodPin
MoodPin.belongsTo(User); // each MoodPin belongs to one user (adds a userId column)

module.exports = {
  db,
  MoodPin,
  User,
};
