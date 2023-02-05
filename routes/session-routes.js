const express = require("express");
const sessionControllers = require("../controllers/session-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/:sid", sessionControllers.getSessionByID);

router.post("/", sessionControllers.createSession);

router.patch("/:sid", sessionControllers.updateSession);

router.delete("/:sid", sessionControllers.deleteSession);

module.exports = router;
