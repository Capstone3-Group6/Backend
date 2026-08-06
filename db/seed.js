// db/seed.js
// Run with: npm run seed

const { db, User, MoodPin } = require("../models");

const seed = async () => {
  try {
    // Reset database
    await db.sync({ force: true });
    console.log("🌱 Database reset.");

    // Create sample users
    const users = await User.bulkCreate([
      {
        
        userName: "alice",
        email: "alice@example.com",
        passwordHash: "password123",
      },
      {
        userName: "bob",
        email: "bob@example.com",
        passwordHash: "password123",
      },
    ]);

    console.log("🌱 Sample users created.");

    // Create sample mood pins
    await MoodPin.bulkCreate([
      {
        mood: "Calm",
        description: "A quiet park with beautiful trees.",
        latitude: 40.7829,
        longitude: -73.9654,
        locationName: "Central Park",
        userId: users[0].id,
      },
      {
        mood: "Creative",
        description: "A cozy coffee shop perfect for drawing.",
        latitude: 40.7306,
        longitude: -73.9866,
        locationName: "Art Cafe",
        userId: users[0].id,
      },
      {
        mood: "Focused",
        description: "The library is silent and great for studying.",
        latitude: 40.7532,
        longitude: -73.9822,
        locationName: "City Library",
        userId: users[1].id,
      },
      {
        mood: "Romantic",
        description: "Beautiful sunset by the river.",
        latitude: 40.7003,
        longitude: -74.0170,
        locationName: "Hudson River Walk",
        userId: users[1].id,
      },
    ]);

    console.log("🌱 Sample mood pins created.");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await db.close();
    console.log("🌱 Done. Connection closed.");
  }
};

seed();