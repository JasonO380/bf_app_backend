const express = require("express");
const weekDayControllers = require("../controllers/week-day-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.patch("/:wid", weekDayControllers.addSessionToWeekDay);

module.exports = router;
