const express = require("express");
const programmingControllers = require("../controllers/programming-controller");
const create = require("../controllers/create-programming");
const userProgramming = require("../controllers/user-programming-controller");
const update = require("../controllers/update-programming");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/", programmingControllers.getAllProgramming);

router.get("/getuserprograms/:uid", userProgramming.getUsersProgramming);

router.get("/search/:query", programmingControllers.searchProgramming);

router.get("/:pid", programmingControllers.getProgramById);

router.post(
    "/",
    check("cycleName").isLength({ min: 3 }),
    create.createProgramming
);

router.post(
    "/addgooglesheets",
    check("cycleName").isLength({ min: 3 }),
    create.addGoogleSheets
);

router.patch(
    "/:pid",
    check("cycleName").isLength({ min: 3 }),
    update.updateProgramming
);

router.delete("/:pid", programmingControllers.deleteProgramming);

module.exports = router;
