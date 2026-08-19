const express = require("express");
const router = express.Router();

const { MoodPin, SavedPin, User } = require("../models");
const { requireAuth } = require("../middleware/auth");

// Get all pins
router.get("/", requireAuth, async (req, res, next) => {
  try { 
    const pins = await MoodPin.findAll({
      attributes: [
        "id",
        "latitude",
        "longitude",
        "locationName",
        // ["locationName", "placeName"],
        "mood",
        "description",
        "image",
      ],
      include: [
        {
          model: User,
          attributes: [
            ["userName", "username"],
            ["profileImage", "avatar"],
          ],
        },
        {
          model: SavedPin,
          where: {
            userId: req.user.id,
          },
          attributes: ["id"],
          required: false,
        },
      ],
    });

    const formattedPins = pins.map((pin) => {
      const data = pin.toJSON();

      return {
        id: data.id,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        mood: data.mood,
        description: data.description,
        image: data.image,
        username: data.user?.username,
        avatar: data.user?.avatar,
        isSaved: data.savedPins?.length > 0,
      };
    });

    res.json(formattedPins);
  } catch (error) {
    next(error);
  }
});

// Get all pins belonging to the currently logged-in user
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const pins = await MoodPin.findAll({
      where: {
        userId: req.user.id,
      },
      attributes: [
        "id",
        "latitude",
        "longitude",
        "locationName",
        // ["locationName", "placeName"],
        "mood",
        "description",
        "image",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(pins);
  } catch (error) {
    next(error);
  }
});

// Get pins saved by the currently logged-in user
router.get("/saved", requireAuth, async (req, res, next) => {
  try {
    const savedPins = await SavedPin.findAll({
      where: {
        userId: req.user.id,
      },
      include: [
        {
          model: MoodPin,
          include: [
            {
              model: User,
              attributes: [
                ["userName", "username"],
                ["profileImage", "avatar"],
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(
      savedPins
        .filter((savedPin) => savedPin.moodPin)
        .map((savedPin) => {
          const pin = savedPin.moodPin.toJSON();

          return {
            ...pin,
            savedId: savedPin.id,
            isSaved: true,
            username: pin.user?.username,
            avatar: pin.user?.avatar,
            user: undefined,
          };
        }),
    );
  } catch (error) {
    next(error);
  }
});

// Save a pin for the currently logged-in user
router.post("/:id/save", requireAuth, async (req, res, next) => {
  try {
    const pin = await MoodPin.findByPk(req.params.id);

    if (!pin) {
      return res.status(404).json({
        error: "Pin not found",
      });
    }

    await SavedPin.findOrCreate({
      where: {
        userId: req.user.id,
        moodPinId: pin.id,
      },
    });

    res.status(201).json({
      message: "Pin saved",
      pinId: pin.id,
    });
  } catch (error) {
    next(error);
  }
});

// Remove a saved pin for the currently logged-in user
router.delete("/:id/save", requireAuth, async (req, res, next) => {
  try {
    const deletedCount = await SavedPin.destroy({
      where: {
        userId: req.user.id,
        moodPinId: req.params.id,
      },
    });

    if (!deletedCount) {
      return res.status(404).json({
        error: "Saved pin not found",
      });
    }

    res.json({
      message: "Pin removed from saved",
    });
  } catch (error) {
    next(error);
  }
});

// Get one pin
router.get("/:id", requireAuth, async (req, res, next) => {
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
router.post("/", requireAuth, async(req, res, next) => {
  try{
    const {
      locationName,
      mood,
      description,
      latitude,
      longitude,
      image,
    } = req.body

    const pin = await MoodPin.create({
      locationName,
      mood,
      description,
      latitude,
      longitude,
      image,
      userId: req.user.id
    })

    res.status(201).json(pin);
  }catch(error){
    console.error("PIN ERROR:", error);
    next(error);
  }
})
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
