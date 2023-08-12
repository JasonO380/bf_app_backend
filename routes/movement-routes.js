const express = require("express");
const movementControllers = require("../controllers/movement-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/", movementControllers.getAllMovements)

router.get("/search/:query", movementControllers.searchMovements);

router.get("/:mid", movementControllers.getMovementById);

router.post(
    "/",
    check("movement").isLength({ min: 3 }),
    movementControllers.addMovement
);

router.patch(
    "/:mid",
    check("movement").isLength({ min: 3 }),
    movementControllers.updateMovement
);

router.delete("/:mid", movementControllers.deleteMovement);

module.exports = router;
