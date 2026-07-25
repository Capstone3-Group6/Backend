// app.js — the front door of the server.
// It creates the app, plugs in middleware, mounts routes, connects to the
// database, then starts listening. Read it top to bottom — that's roughly the
// order a request travels through the app.

require('dotenv').config();
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');

const { db } = require('./models'); // the database connection
const { taskRouter } = require('./routes'); // the example CRUD router

const app = express();
const PORT = process.env.PORT || 8080;

// Deployed apps sit behind a proxy (Render, ...). This tells Express
// to trust it, so rate-limiting sees the real visitor IP and secure cookies work.
app.set('trust proxy', 1);

// Stop any one IP from spamming the server.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max requests per IP in that window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: '🛑 Too many requests, please try again later.' },
});

// ---------- middleware ----------
// Middleware runs IN ORDER on every request, before it reaches your routes.
app.use(helmet()); // sets safe HTTP headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // let your React app call this API
    credentials: true, // allow cookies (needed once you add login/auth)
  }),
);
app.use(morgan('dev')); // logs each request to the terminal (handy for debugging)
app.use(express.json({ limit: '10kb' })); // parse JSON bodies into req.body; cap the size
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public'))); // serve the info page in /public

// ---------- health check ----------
// A tiny endpoint to quickly confirm the server is up.
app.get('/check', (req, res) => {
  res.json({ status: 200, msg: 'Health check is valid!' });
});

// ---------- API routes ----------
// Mount each resource router under /api. Add your own the same way:
//   app.use('/api/posts', postRouter)
app.use('/api/tasks', taskRouter);

// ---------- 404 ----------
// Nothing above matched, so the thing doesn't exist. Send a clear JSON 404.
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- error handler ----------
// Express knows this is the error handler because it takes FOUR arguments.
// Every next(err) from a route ends up here, so all errors funnel to one place.
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// ---------- start the server ----------
// Don't start listening until the database is reachable.
//   authenticate() — a quick "can I connect?" check.
//   sync()         — creates any missing tables from your models.
// Never use sync({ force: true }) here — it DROPS your tables on every boot.
const startServer = async () => {
  try {
    await db.authenticate();
    console.log('🐘 Database connection established.');

    await db.sync();
    console.log('🧩 Models synced.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT: ${PORT}`);
    });

    // Graceful shutdown: hosts send SIGTERM on redeploy. Stop taking new
    // requests, then close the DB connection so nothing is left hanging.
    const shutdown = () => {
      console.log('\n👋 Shutting down...');
      server.close(async () => {
        await db.close();
        process.exit(0);
      });
    };
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('❌ Unable to start server:', err.message);
    process.exit(1); // stop the process so the problem is obvious
  }
};

startServer();
