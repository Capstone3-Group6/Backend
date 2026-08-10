const { DataTypes } = require('sequelize');
const db = require('../db');

const User = db.define('user', {
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
    },
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },

  bio:{
    type: DataTypes.TEXT,
    allowNull: true,
  },

  profileImage:{
    type:DataTypes.STRING,
    allowNull: true,
  },

  passwordHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  auth0Id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
});

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.passwordHash;
  return values;
};

module.exports = User;
