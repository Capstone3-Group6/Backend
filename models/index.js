const db = require("../db");
const MoodPin = require("./moodPin");
const SavedPin = require("./savedPin");
const User = require("./user");

User.hasMany(MoodPin); // one user has many MoodPin
MoodPin.belongsTo(User); // each MoodPin belongs to one user (adds a userId column)

User.hasMany(SavedPin, { onDelete: "CASCADE" });
SavedPin.belongsTo(User);

MoodPin.hasMany(SavedPin, { onDelete: "CASCADE" });
SavedPin.belongsTo(MoodPin);

module.exports = {
  db,
  MoodPin,
  SavedPin,
  User,
};
