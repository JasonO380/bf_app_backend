const express = require("express");
const macroControllers = require("../controllers/macros-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/:uid", macroControllers.getMacros);

router.post("/:uid", macroControllers.addMacros);

router.patch("/:mid", macroControllers.editMacros);

module.exports = router;