const express = require("express");
const programmingControllers = require("../controllers/programming-controller");
const create = require("../controllers/create-programming");
const update = require("../controllers/update-programming");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/search/:query", programmingControllers.searchProgramming);

router.get("/:pid", programmingControllers.getProgramById);

router.get("/", programmingControllers.getAllProgramming);

router.post(
    "/",
    check("cycleName").isLength({ min: 3 }),
    create.createProgramming
);

router.patch(
    "/:pid",
    check("cycleName").isLength({ min: 3 }),
    update.updateProgramming
);

router.delete("/:pid", programmingControllers.deleteProgramming)

module.exports = router;