# Backend Boilerplate — PERN Capstone

An Express + Node backend that talks to Postgres via Sequelize and exposes a
JSON API for your React app. Ships with one example resource (`Task`) showing
the full CRUD pattern — copy it, then delete it.

## Getting started

```bash
npm install
createdb capstone_dev     # once — must match LOCAL_DATABASE_NAME in db/index.js
cp .env.example .env       # defaults are fine for local dev
npm run seed               # drop + recreate tables, insert sample tasks
npm run dev                # start with auto-restart (npm start for no restart)
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
routes/           resource routers (routes/index.js)
public/           static info page served at /
```

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
