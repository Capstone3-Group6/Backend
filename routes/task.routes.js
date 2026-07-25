/**
 * task.routes.js — an EXAMPLE router. It owns all the endpoints for "tasks".
 * app.js mounts it at /api/tasks, so `.get('/')` here answers GET /api/tasks.
 * Copy this shape for your own resources, then delete this example.

 * CRUD = the five things you do with data:
 *   Create  ->  POST    /api/tasks
 *   Read    ->  GET     /api/tasks       (all)
 *               GET     /api/tasks/:id   (one)
 *   Update  ->  PUT     /api/tasks/:id
 *   Update  ->  PATCH   /api/tasks/:id
 *   Delete  ->  DELETE  /api/tasks/:id
 *
 * This is a REFERENCE. Copy this shape for your own resources,
 * then delete the Task example.
 */

const express = require('express');
const { Task } = require('../models');

const router = express.Router();

// Every handler is async because DB calls take time (we await them).
// If a call fails, catch hands the error to next(err) -> the error handler in
// app.js. That stops one bad request from crashing the whole server.

// READ ALL — GET /api/tasks
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.findAll({ order: [['createdAt', 'DESC']] }); // newest first
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// READ ONE — GET /api/tasks/:id
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id); // :id comes in on req.params
    if (!task) {
      return res.status(404).json({ error: 'Task not found' }); // always handle "not found"
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// CREATE — POST /api/tasks
router.post('/', async (req, res, next) => {
  try {
    const { title, description, completed } = req.body; // the new task's data
    const task = await Task.create({ title, description, completed });
    res.status(201).json(task); // 201 = Created
  } catch (err) {
    next(err);
  }
});

// UPDATE (full) — PUT /api/tasks/:id — client sends EVERY field
router.put('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const { title, description, completed } = req.body;
    await task.update({ title, description, completed });
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// UPDATE (partial) — PATCH /api/tasks/:id — change only the fields sent
router.patch('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    // Only copy over fields we allow, so nobody can change columns we didn't intend (like id).
    const allowed = ['title', 'description', 'completed'];
    const updates = {};
    for (const field of allowed) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }
    await task.update(updates);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// DELETE — DELETE /api/tasks/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await task.destroy();
    res.sendStatus(204); // 204 = No Content (nothing to send back)
  } catch (err) {
    next(err);
  }
});

module.exports = router;
