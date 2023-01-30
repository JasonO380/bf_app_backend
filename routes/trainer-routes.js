const express = require("express");
const trainerControllers = require("../controllers/trainer-controllers");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/search/:query", trainerControllers.searchCoaches)

router.post("/signup",
[
    check('coachName').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min:6})
], trainerControllers.createCoach)

router.post("logincoach", trainerControllers.loginCoach)

module.exports = router;