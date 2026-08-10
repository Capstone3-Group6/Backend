const express = require("express")
const router = express.Router();

const { User } = require("../models")
const { requireAuth } = require("../middleware/auth")

// Show the currently logged in user's profile
router.get("/me", requireAuth, async (req, res, next) => {
    try{
        const user = await User.findByPk(req.user.id);

        if(!user){
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json(user);
    }catch(error){
        next(error)
    }
});

//Update the currently logged-in user's profile
router.patch("/me", requireAuth, async (req, res, next) => {
    try{
        const user = await User.findByPk(req.user.id);

        if(!user){
            return res.status(404).json({
                error: "User not found",
            });
        }

        const { userName, bio, profileImage } = req.body

        await user.update({ userName, bio, profileImage});

        res.json(user);
    }catch(error){
        next(error);
    }
});

module.exports = router
