const express = require("express");
const userControllers = require("../controllers/user-controller");
const sessionControllers = require("../controllers/user-session-controller");
const { check } = require("express-validator");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/search/:query", userControllers.searchUsers);

router.get("/session/:uid", sessionControllers.getUserSessions);

router.post(
    "/signup",
    [
        check("username").not().isEmpty(),
        check("email").normalizeEmail().isEmail(),
        check("password").isLength({ min: 6 }),
    ],
    userControllers.createUser
);

router.post("/:uid", sessionControllers.createUserSession);

router.post("/login", userControllers.loginUser);

router.delete("/:uid", sessionControllers.deleteUserSession);

module.exports = router;
