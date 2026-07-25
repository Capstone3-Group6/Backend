// db/seed.js — reset the tables and fill them with sample data.  Run: npm run seed
// Gives you (and your teammates) the same predictable rows to build against.

const { db, Task } = require('../models');

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
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await db.close(); // close the connection so the script can exit
    console.log('🌱 Done. Connection closed.');
  }
};

seed();
