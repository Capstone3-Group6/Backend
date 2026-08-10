// routes/index.js — one place to collect all routers.
// Lets app.js grab them from here: const { authRouter } = require('./routes')

const authRouter = require("./auth.routes");
const recommendationRouter = require('./recommendationRoutes');
const pinRouter = require("./pins")
const userRouter = require("./user")

module.exports = {
  authRouter,
  pinRouter,
  userRouter,
  recommendationRouter,
};
