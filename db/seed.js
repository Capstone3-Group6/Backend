// db/seed.js — reset the tables and fill them with sample data.  Run: npm run seed
// Gives you (and your teammates) the same predictable rows to build against.

const { db, Task, User } = require('../models');

const seed = async () => {
  try {
    // force: true DROPS every table and recreates it empty.
    // Perfect for a seed script — never do this to real user data.
    await db.sync({ force: true });
    console.log('🌱 Database reset.');

    // bulkCreate inserts several rows in one go.
    await Task.bulkCreate([
      { title: 'Set up the project', description: 'Clone the repo and run npm install', completed: true },
      { title: 'Create the database', description: 'Run createdb capstone_dev', completed: true },
      { title: 'Build my first model', description: 'Copy the Task model as a reference', completed: false },
      { title: 'Write my first route', description: 'Add a CRUD router under /api', completed: false },
    ]);
    console.log('🌱 Sample tasks created.');

    // Sample users. In real life these rows come from Auth0 logins (auth0Id is
    // the token's "sub"). Here we fake a couple so the users table isn't empty.
    await User.bulkCreate([
      { auth0Id: 'auth0|seed-ada', username: 'ada', email: 'ada@example.com', name: 'Ada Lovelace' },
      { auth0Id: 'auth0|seed-alan', username: 'alan', email: 'alan@example.com', name: 'Alan Turing' },
    ]);
    console.log('🌱 Sample users created.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await db.close(); // close the connection so the script can exit
    console.log('🌱 Done. Connection closed.');
  }
};

seed();
