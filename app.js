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
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');

const { db } = require('./models'); // the database connection
const { authRouter, recommendationRouter } = require('./routes'); // our routers
const { requireAuth } = require('./middleware/auth'); // accepts our JWT or Auth0's
const pinRouter = require('./routes/pins');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Deployed apps sit behind a proxy (Render, ...). This tells Express
// to trust it, so rate-limiting sees the real visitor IP and secure cookies work.
app.set('trust proxy', 1);

// Stop any one IP from spamming the server.
//
// The limit is deliberately loose in development. React's StrictMode runs every
// effect twice, and a single page refresh already costs you /auth/me plus a
// data fetch — so a tight limit means you hit 429 while debugging and think
// your auth broke. Production is where this actually has a job to do.
const isProd = process.env.NODE_ENV === 'production';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: isProd ? 100 : 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: '🛑 Too many requests, please try again later.' },
});

// ---------- middleware ----------
// Middleware runs IN ORDER on every request, before it reaches your routes.
app.use(helmet());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or matching localhost.
      if (
        !origin ||
        origin.startsWith('http://localhost:') ||
        origin === FRONTEND_URL
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);
app.use(express.static(path.join(__dirname, 'public')));

// ---------- health check ----------
// The first thing to hit when something seems broken.
app.get('/check', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ---------- public test route ----------
app.get('/api/public', (req, res) => {
  res.json({ message: '👋🏽 Hi, you found this public route!' });
});

// ---------- protected test route ----------
app.get('/api/protected', requireAuth, (req, res) => {
  res.json({
    message: '🔒 Your token is valid — you reached a protected route!',
    userId: req.user.id,
    username: req.user.userName,
    via: req.user.auth0Id ? 'auth0' : 'password',
  });
});

// ---------- API routes ----------
app.use('/pins', pinRouter);
app.use('/users', userRoutes);
app.use('/api/recommendations', recommendationRouter);

// Auth routes
app.use('/auth', authRouter);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ---------- error handler ----------
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);

  const status = err.status || err.statusCode || 500;

  const message =
    status === 401
      ? 'Invalid or missing token'
      : 'Something went wrong on the server';

  res.status(status).json({ error: message });
});

// ---------- start the server ----------
const startServer = async () => {
  try {
    // 1. Connect to the database
    await db.authenticate();
    console.log('🐘 Database connection established.');

    // 2. Create any missing tables from the Sequelize models.
    // This needs to happen BEFORE describeTable() because the Neon
    // database may be completely new.
    await db.sync();
    console.log('🧩 Models synced.');

    // 3. Run any additional database updates
    const queryInterface = db.getQueryInterface();

    // ---------- moodPins updates ----------
    try {
      const moodPinColumns = await queryInterface.describeTable('moodPins');

      await db.query(
        'ALTER TYPE "enum_moodPins_mood" ADD VALUE IF NOT EXISTS \'Fun\'',
      );

      if (!moodPinColumns.image) {
        await queryInterface.addColumn('moodPins', 'image', {
          type: db.Sequelize.TEXT,
          allowNull: true,
        });

        console.log('Added image column to moodPins.');
      }
    } catch (error) {
      if (error.name !== 'SequelizeDatabaseError') {
        throw error;
      }
    }

    // ---------- users updates ----------
    try {
      const userColumns = await queryInterface.describeTable('users');

      if (userColumns.profileImage?.type !== 'TEXT') {
        await queryInterface.changeColumn('users', 'profileImage', {
          type: db.Sequelize.TEXT,
          allowNull: true,
        });

        console.log('Changed users.profileImage to TEXT.');
      }
    } catch (error) {
      if (error.name !== 'SequelizeDatabaseError') {
        throw error;
      }
    }

    // 4. Start Express
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on PORT: ${PORT}`);
    });

    // ---------- graceful shutdown ----------
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
    console.error('Stack:', err.stack);

    process.exit(1);
  }
};

startServer();