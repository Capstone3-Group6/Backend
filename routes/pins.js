const express = require("express");
const router = express.Router();

const { MoodPin } = require("../models");
const { requireAuth } = require("../middleware/auth");


// Get all pins
router.get("/", async (req, res, next) => {
  try {
    const pins = await MoodPin.findAll();
    res.json(pins);
  } catch (error) {
    next(error);
  }
});


// Get one pin
router.get("/:id", async (req, res, next) => {
  try {
    const pin = await MoodPin.findByPk(req.params.id);

    if (!pin) {
      return res.status(404).json({
        error: "Pin not found",
      });
    }

    res.json(pin);
  } catch (error) {
    next(error);
  }
});


// Create a pin
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      locationName,
      mood,
      description,
      latitude,
      longitude,
    } = req.body;

    const pin = await MoodPin.create({
      locationName,
      mood,
      description,
      latitude,
      longitude,
      userId: req.user.id,
    });

    res.status(201).json(pin);
  } catch (error) {
    console.error("PIN ERROR:", error);
    next(error);
  }
});


// Update your own pin
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const pin = await MoodPin.findByPk(req.params.id);
    console.log(pin);
    if (!pin) {
      return res.status(404).json({
        error: "Pin not found",
      });
    }

    if (pin.userId !== req.user.id) {
      return res.status(403).json({
        error: "You do not own this pin",
      });
    }

    await pin.update(req.body);

    res.json(pin);
  } catch (error) {
    next(error);
  }
});


// Delete your own pin
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const pin = await MoodPin.findByPk(req.params.id);

    if (!pin) {
      return res.status(404).json({
        error: "Pin not found",
      });
    }

    if (pin.userId !== req.user.id) {
      return res.status(403).json({
        error: "You do not own this pin",
      });
    }

    await pin.destroy();

    res.json({
      message: "Pin deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;