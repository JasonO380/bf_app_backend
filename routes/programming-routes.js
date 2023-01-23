const express = require("express");
const programmingControllers = require("../controllers/programming-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/search/:query", programmingControllers.searchProgramming);

router.get("/:pid", programmingControllers.getProgramById);

router.post(
    "/",
    check("cycleName").isLength({ min: 3 }),
    programmingControllers.createProgramming
);

module.exports = router;