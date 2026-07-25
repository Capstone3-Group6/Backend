// user.model.js — the User table. Auth0 handles login and passwords; this
// table just stores who each user is INSIDE our app, so we can attach our own
// data (tasks, ...) to them. One row per Auth0 user.
const { DataTypes } = require('sequelize');
const db = require('../db');

const User = db.define('user', {
  // The Auth0 user id — the token's "sub", e.g. "auth0|abc123". This is the
  // stable link between Auth0 and our database. We key on this, never on email
  // (emails can change; the sub never does).
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  auth0Id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  // A display name the user picks in OUR app (sent from the frontend).
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { len: [3, 20] }, // must be 3–20 characters
  },
  // Comes from a custom claim on the Auth0 token, so it's only present if the
  // Auth0 Post-Login Action is set up. Optional, so login still works without it.
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: { isEmail: true },
  },
  // The user's full name from Auth0 (also a custom claim). Optional.
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = User;
