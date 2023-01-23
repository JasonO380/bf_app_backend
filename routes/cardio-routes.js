const express = require("express");
const cardioControllers = require("../controllers/cardio-controller");
const { check } = require("express-validator");
const mongoose = require("mongoose");
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.get("/search/:query", cardioControllers.searchCardio);

router.get("/:cid", (req, res, next) => {
    if (mongoose.Types.ObjectId.isValid(req.params.cid)) {
        cardioControllers.getCardioById(req, res, next);
    } else {
        cardioControllers.searchCardio(req, res, next);
    }
});

router.post(
    "/",
    check("type").isLength({ min: 3 }),
    cardioControllers.addCardio
);

router.patch(
    "/:cid",
    check("type").isLength({ min: 3 }),
    cardioControllers.addCardio
);

router.delete("/:cid", cardioControllers.deleteCardio);

module.exports = router;
