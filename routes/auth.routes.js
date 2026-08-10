const express = require('express');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { rateLimit } = require('express-rate-limit');

const { User } = require('../models');

const {
  jwtCheck,
  requireAuth,
  identityFromToken,
  sendTokenCookie,
  clearTokenCookie,
} = require('../middleware/auth');

const router = express.Router();

const SALT_ROUNDS = 12;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: '🛑 Too many attempts, please try again later.',
  },
});

const handleDbError = (err, res, next) => {
  if (
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError'
  ) {
    return res.status(400).json({
      error: err.errors?.[0]?.message || 'Invalid user data',
    });
  }

  return next(err);
};

const uniqueUsername = async (preferred) => {
  const cleaned = (preferred || '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 16);

  const base = cleaned.length >= 3 ? cleaned : 'user';

  let candidate = base;
  let suffix = 1;

  while (await User.findOne({ where: { userName: candidate } })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
};

// POST /auth/signup
router.post('/signup', authLimiter, async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are all required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters',
      });
    }

    const existing = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { userName: username },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({
        error:
          existing.email === email
            ? 'An account with that email already exists'
            : 'That username is taken',
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      SALT_ROUNDS
    );

    const user = await User.create({
      userName: username,
      email,
      passwordHash,
    });

    sendTokenCookie(res, user);

    res.status(201).json(user);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

// POST /auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const {
      identifier,
      email,
      username,
      password,
    } = req.body;

    const login = identifier || email || username;

    if (!login || !password) {
      return res.status(400).json({
        error: 'Email/username and password are required',
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { userName: login },
        ],
      },
    });

    const invalid = () =>
      res.status(401).json({
        error: 'Invalid email/username or password',
      });

    if (!user) {
      return invalid();
    }

    if (!user.passwordHash) {
      return res.status(400).json({
        error:
          'This account uses social login — sign in with Auth0 instead.',
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return invalid();
    }

    sendTokenCookie(res, user);

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  clearTokenCookie(res);

  res.json({
    message: 'Logged out',
  });
});

// POST /auth/auth0
router.post('/auth0', jwtCheck, async (req, res, next) => {
  try {
    const {
      auth0Id,
      email,
      name,
    } = identityFromToken(req);

    const existing = await User.findOne({
      where: { auth0Id },
    });

    if (existing) {
      return res.json(existing);
    }

    const username = await uniqueUsername(
      req.body.username ||
      name ||
      email?.split('@')[0]
    );

    const user = await User.create({
      auth0Id,
      userName: username,
      email,
    });

    res.status(201).json(user);
  } catch (err) {
    handleDbError(err, res, next);
  }
});

// GET /auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

module.exports = router;

