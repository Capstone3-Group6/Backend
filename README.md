# Backend Boilerplate — PERN Capstone

An Express + Node backend that talks to Postgres via Sequelize and exposes a
JSON API for your React app. Ships with one example resource (`Task`) showing
the full CRUD pattern, plus **Auth0** login verification and a `User` table —
copy the example, then delete it.

## Getting started

```bash
npm install
createdb capstone_dev     # once — must match LOCAL_DATABASE_NAME in db/index.js
cp .env.example .env       # then fill in your Auth0 values (see below)
npm run seed               # drop + recreate tables, insert sample tasks
npm run dev                # start with auto-restart (npm start for no restart)
```

Set two Auth0 values in `.env` (from your API in the Auth0 dashboard):

```
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=http://localhost:8080   # must match the frontend's VITE_AUTH0_AUDIENCE
```

You should see:

```
🐘 Database connection established.
🧩 Models synced.
🚀 Server is running on PORT: 8080
```

Quick check: <http://localhost:8080/check> · the API: <http://localhost:8080/api/tasks>

## Structure

```
app.js            entry point: middleware, routes, server start
db/index.js       Postgres connection (Sequelize)
db/seed.js        sample data          (npm run seed)
models/           model definitions + associations (models/index.js)
middleware/auth.js  Auth0 token verification (jwtCheck)
routes/           resource routers, incl. auth.routes.js (routes/index.js)
public/           static info page served at /
```

## Authentication (Auth0)

The frontend logs users in with Auth0 and sends the resulting **access token**
on each request (`Authorization: Bearer <token>`). This backend only *verifies*
that token — it never handles passwords.

- `middleware/auth.js` exports **`jwtCheck`**, which validates the token against
  Auth0's public keys. Add it to protect a route or a whole router:

  ```js
  app.get('/api/thing', jwtCheck, handler)   // one route
  router.use(jwtCheck)                        // every route in a router
  ```

  On success it attaches the decoded token to `req.auth.payload`
  (`req.auth.payload.sub` is the Auth0 user id).

- `models/user.model.js` — the `User` table. Keyed on **`auth0Id`** (the token's
  `sub`), so each Auth0 login maps to exactly one row in our database.

- `routes/auth.routes.js` (mounted at `/auth`, protected):

  | Method | Path         | Does                                              |
  |--------|--------------|---------------------------------------------------|
  | POST   | `/auth/auth0`| `findOrCreate` the user — safe to call on login   |
  | GET    | `/auth/me`   | return the logged-in user's row                   |

- `GET /api/protected` is a throwaway route for confirming the token pipeline works.

> `email` / `name` arrive only if you add a **Post-Login Action** in Auth0 that
> adds them as custom claims under the namespace in `middleware/auth.js`.
> Without it, login still works — those fields are just `null`.

## The example API — `/api/tasks`

| Method | Path             | Does                          |
|--------|------------------|-------------------------------|
| GET    | `/api/tasks`     | list all tasks                |
| GET    | `/api/tasks/:id` | get one task                  |
| POST   | `/api/tasks`     | create a task                 |
| PUT    | `/api/tasks/:id` | replace a task (all fields)   |
| PATCH  | `/api/tasks/:id` | update part of a task         |
| DELETE | `/api/tasks/:id` | delete a task                 |

## Add your own resource

1. **Model** — copy `models/task.model.js`, change the fields, export it from `models/index.js`.
2. **Router** — copy `routes/task.routes.js`, swap `Task` for your model, export it from `routes/index.js`.
3. **Mount it** — in `app.js`: `app.use('/api/posts', postRouter)`.
4. **Associations** — define relationships in `models/index.js`.

## Deploy

- Set `DATABASE_URL` (your host provides it) — `db/index.js` picks it up and enables SSL.
- Set `FRONTEND_URL` to your deployed React URL so CORS allows it.
- Set `PORT` if your host requires a specific one (defaults to 8080).

## Common issues

| Symptom | Fix |
|---|---|
| `ECONNREFUSED ... 5432` | Postgres isn't running, or the db doesn't exist. Start Postgres, run `createdb capstone_dev`. |
| `database "capstone_dev" does not exist` | `createdb capstone_dev` (or change the name in `db/index.js`). |
| Model changes don't appear | Re-run `npm run seed`, or use `db.sync({ alter: true })` in `app.js` while developing. |
| `port 8080 already in use` | Stop the other server, or set `PORT` in `.env`. |
