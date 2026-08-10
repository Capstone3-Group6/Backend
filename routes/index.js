// routes/index.js — one place to collect all routers.
// Lets app.js grab them from here: const { authRouter } = require('./routes')

const authRouter = require('./auth.routes');
const recommendationRouter = require('./recommendationRoutes');

// Add a new resource? Import its router above and add one line here.
module.exports = {
  authRouter,
  recommendationRouter,
};
