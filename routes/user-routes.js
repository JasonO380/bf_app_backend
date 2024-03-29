const express = require("express");
const userControllers = require("../controllers/user-controller");
const sessionControllers = require("../controllers/user-session-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/allusers", userControllers.getAllUsers);

router.get("/search/:query", userControllers.searchUsers);

router.get("/find/:username", userControllers.checkUsername);

router.get("/usersworkoutsweekly/:uid", sessionControllers.getUserSessionsInWeeklyFormat)

router.get("/:uid", sessionControllers.getUserSessions);

router.post(
    "/signup",
    [
        check("username").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({ min: 6 }),
    ],
    userControllers.createUser
);

router.post("/login", userControllers.loginUser);

router.post("/:uid", sessionControllers.createUserSession);

router.delete("/:uid", sessionControllers.deleteUserSession);

module.exports = router;
